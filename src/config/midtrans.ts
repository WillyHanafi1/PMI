// Midtrans configuration

// Declare global window type for Midtrans Snap
declare global {
    interface Window {
        snap?: {
            pay: (snapToken: string, callbacks: {
                onSuccess?: (result: any) => void;
                onPending?: (result: any) => void;
                onError?: (result: any) => void;
                onClose?: () => void;
            }) => void;
        };
    }
}

export const midtransConfig = {
    clientKey: import.meta.env.VITE_MIDTRANS_CLIENT_KEY || 'SB-Mid-client-PLACEHOLDER_KEY',
    serverKey: import.meta.env.VITE_MIDTRANS_SERVER_KEY || 'SB-Mid-server-PLACEHOLDER_KEY',
    isProduction: import.meta.env.VITE_MIDTRANS_IS_PRODUCTION === 'true',
};

// Midtrans Snap URL
export const getSnapUrl = () => {
    return midtransConfig.isProduction
        ? 'https://app.midtrans.com/snap/snap.js'
        : 'https://app.sandbox.midtrans.com/snap/snap.js';
};

// Load Midtrans Snap script
export const loadMidtransScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (window.snap) {
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.src = getSnapUrl();
        script.setAttribute('data-client-key', midtransConfig.clientKey);
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Midtrans script'));
        document.head.appendChild(script);
    });
};

/**
 * Open Midtrans Snap payment popup
 * @param snapToken - Token from createTransaction
 * @param callbacks - Payment callbacks
 */
export const openMidtransSnap = (
    snapToken: string,
    callbacks: {
        onSuccess?: (result: any) => void;
        onPending?: (result: any) => void;
        onError?: (result: any) => void;
        onClose?: () => void;
    }
) => {
    if (!window.snap) {
        console.error('Midtrans Snap script not loaded');
        return;
    }

    window.snap.pay(snapToken, {
        onSuccess: (result: any) => {
            console.log('Payment success:', result);
            if (callbacks.onSuccess) callbacks.onSuccess(result);
        },
        onPending: (result: any) => {
            console.log('Payment pending:', result);
            if (callbacks.onPending) callbacks.onPending(result);
        },
        onError: (result: any) => {
            console.error('Payment error:', result);
            if (callbacks.onError) callbacks.onError(result);
        },
        onClose: () => {
            console.log('Payment popup closed');
            if (callbacks.onClose) callbacks.onClose();
        }
    });
};
