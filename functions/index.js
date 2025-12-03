const functions = require('firebase-functions');
const admin = require('firebase-admin');
const midtransClient = require('midtrans-client');
const cors = require('cors')({ origin: true });

admin.initializeApp();

// Midtrans Configuration
const snap = new midtransClient.Snap({
    isProduction: false, // Sandbox mode
    serverKey: functions.config().midtrans.server_key,
    clientKey: functions.config().midtrans.client_key
});

/**
 * Generate Snap Token for Payment
 * Called from frontend when user clicks "Pay Now"
 */
exports.createTransaction = functions.https.onCall(async (data, context) => {
    // Verify authentication
    if (!context.auth) {
        throw new functions.https.HttpsError(
            'unauthenticated',
            'User must be authenticated'
        );
    }

    try {
        const { teamIds } = data;
        const userId = context.auth.uid;

        // Fetch teams from Firestore
        const teamsSnapshot = await admin.firestore()
            .collection('teams')
            .where(admin.firestore.FieldPath.documentId(), 'in', teamIds)
            .where('userId', '==', userId)
            .where('paymentStatus', '==', 'PENDING')
            .get();

        if (teamsSnapshot.empty) {
            throw new functions.https.HttpsError(
                'not-found',
                'No valid teams found for payment'
            );
        }

        // Calculate total amount
        let totalAmount = 0;
        const itemDetails = [];
        const teams = [];

        teamsSnapshot.forEach(doc => {
            const team = doc.data();
            teams.push({ id: doc.id, ...team });
            totalAmount += team.price;

            itemDetails.push({
                id: doc.id,
                price: team.price,
                quantity: 1,
                name: `${team.competitionType} - ${team.teamName}`
            });
        });

        // Generate unique order ID
        const orderId = `PMI-${Date.now()}-${userId.substring(0, 8)}`;

        // Get user profile
        const userDoc = await admin.firestore()
            .collection('users')
            .doc(userId)
            .get();

        const userProfile = userDoc.data();

        // Midtrans transaction parameters
        const parameter = {
            transaction_details: {
                order_id: orderId,
                gross_amount: totalAmount
            },
            item_details: itemDetails,
            customer_details: {
                first_name: userProfile.picName,
                email: userProfile.email,
                phone: userProfile.phone,
                billing_address: {
                    first_name: userProfile.picName,
                    email: userProfile.email,
                    phone: userProfile.phone,
                    address: userProfile.schoolName
                }
            },
            callbacks: {
                finish: `${functions.config().app.url}/payment/success`,
                error: `${functions.config().app.url}/payment/error`,
                pending: `${functions.config().app.url}/payment/pending`
            }
        };

        // Create transaction in Midtrans
        const transaction = await snap.createTransaction(parameter);

        // Save transaction to Firestore
        await admin.firestore().collection('transactions').doc(orderId).set({
            orderId,
            userId,
            schoolName: userProfile.schoolName,
            totalAmount,
            items: teamIds,
            status: 'PENDING',
            snapToken: transaction.token,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        // Update teams with orderId
        const batch = admin.firestore().batch();
        teams.forEach(team => {
            const teamRef = admin.firestore().collection('teams').doc(team.id);
            batch.update(teamRef, {
                orderId,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
        });
        await batch.commit();

        return {
            snapToken: transaction.token,
            orderId,
            redirectUrl: transaction.redirect_url
        };

    } catch (error) {
        console.error('Error creating transaction:', error);
        throw new functions.https.HttpsError(
            'internal',
            'Failed to create transaction',
            error.message
        );
    }
});

/**
 * Webhook Handler for Midtrans Notifications
 * Called by Midtrans when payment status changes
 */
exports.midtransWebhook = functions.https.onRequest(async (req, res) => {
    return cors(req, res, async () => {
        try {
            // Verify notification from Midtrans
            const notification = req.body;

            const statusResponse = await snap.transaction.notification(notification);
            const orderId = statusResponse.order_id;
            const transactionStatus = statusResponse.transaction_status;
            const fraudStatus = statusResponse.fraud_status;

            console.log(`Transaction notification received. Order ID: ${orderId}. Transaction status: ${transactionStatus}. Fraud status: ${fraudStatus}`);

            // Determine payment status
            let paymentStatus = 'PENDING';

            if (transactionStatus === 'capture') {
                paymentStatus = fraudStatus === 'accept' ? 'PAID' : 'FAILED';
            } else if (transactionStatus === 'settlement') {
                paymentStatus = 'PAID';
            } else if (transactionStatus === 'cancel' || transactionStatus === 'deny' || transactionStatus === 'expire') {
                paymentStatus = transactionStatus === 'expire' ? 'EXPIRED' : 'FAILED';
            } else if (transactionStatus === 'pending') {
                paymentStatus = 'PENDING';
            }

            // Update transaction in Firestore
            const transactionRef = admin.firestore().collection('transactions').doc(orderId);
            const transactionDoc = await transactionRef.get();

            if (!transactionDoc.exists) {
                console.error(`Transaction ${orderId} not found`);
                return res.status(404).json({ error: 'Transaction not found' });
            }

            const transactionData = transactionDoc.data();

            await transactionRef.update({
                status: paymentStatus,
                paymentMethod: statusResponse.payment_type,
                transactionTime: statusResponse.transaction_time,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                midtransResponse: statusResponse
            });

            // Update teams payment status
            const batch = admin.firestore().batch();
            for (const teamId of transactionData.items) {
                const teamRef = admin.firestore().collection('teams').doc(teamId);
                batch.update(teamRef, {
                    paymentStatus,
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                });
            }
            await batch.commit();

            // TODO: Send email notification
            console.log(`Payment status updated to ${paymentStatus} for order ${orderId}`);

            res.status(200).json({
                success: true,
                message: 'Notification processed successfully'
            });

        } catch (error) {
            console.error('Webhook error:', error);
            res.status(500).json({ error: error.message });
        }
    });
});

/**
 * Check Transaction Status
 * Manually check payment status from Midtrans
 */
exports.checkPaymentStatus = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    try {
        const { orderId } = data;

        // Verify order belongs to user
        const transactionDoc = await admin.firestore()
            .collection('transactions')
            .doc(orderId)
            .get();

        if (!transactionDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Transaction not found');
        }

        const transaction = transactionDoc.data();

        if (transaction.userId !== context.auth.uid) {
            throw new functions.https.HttpsError('permission-denied', 'Access denied');
        }

        // Check status from Midtrans
        const statusResponse = await snap.transaction.status(orderId);

        return {
            orderId,
            status: statusResponse.transaction_status,
            paymentType: statusResponse.payment_type,
            grossAmount: statusResponse.gross_amount,
            transactionTime: statusResponse.transaction_time
        };

    } catch (error) {
        console.error('Error checking status:', error);
        throw new functions.https.HttpsError('internal', 'Failed to check status', error.message);
    }
});

/**
 * n8n Webhook for Score Upload
 * Receives OCR-processed scoring data from n8n
 */
exports.scoreWebhook = functions.https.onRequest(async (req, res) => {
    return cors(req, res, async () => {
        try {
            // Validate request method
            if (req.method !== 'POST') {
                return res.status(405).json({ error: 'Method not allowed' });
            }

            // Extract data from n8n
            const { teamId, scores, attachmentUrl, scoredBy, notes } = req.body;

            // Validate required fields
            if (!teamId || !scores) {
                return res.status(400).json({
                    success: false,
                    error: 'teamId and scores are required'
                });
            }

            // Get team details
            const teamDoc = await admin.firestore()
                .collection('teams')
                .doc(teamId)
                .get();

            if (!teamDoc.exists) {
                return res.status(404).json({
                    success: false,
                    error: 'Team not found'
                });
            }

            const team = teamDoc.data();

            // Calculate total score (average)
            const scoreValues = Object.values(scores);
            const totalScore = scoreValues.reduce((sum, score) => sum + score, 0) / scoreValues.length;

            // Save score to Firestore
            const scoreData = {
                teamId,
                teamName: team.teamName,
                competitionType: team.competitionType,
                schoolName: team.schoolName,
                scores,
                totalScore,
                scoredBy: scoredBy || 'ocr_system',
                scoredByName: 'OCR System',
                scoredAt: admin.firestore.FieldValue.serverTimestamp(),
                method: 'OCR_UPLOAD',
                status: 'PENDING_APPROVAL', // Needs admin approval
                attachments: attachmentUrl ? [attachmentUrl] : [],
                notes: notes || 'Uploaded via OCR',
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            };

            const scoreRef = await admin.firestore().collection('scores').add(scoreData);

            console.log(`Score saved from n8n: ${scoreRef.id} for team ${teamId}`);

            return res.status(200).json({
                success: true,
                scoreId: scoreRef.id,
                totalScore: parseFloat(totalScore.toFixed(2)),
                message: 'Score saved successfully, pending admin approval'
            });

        } catch (error) {
            console.error('n8n webhook error:', error);
            return res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });
});
