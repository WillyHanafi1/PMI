// Email service placeholder
// This will be implemented with a proper email service (e.g., SendGrid, Mailgun)
// or Firebase Cloud Functions with Nodemailer

export interface EmailNotification {
    to: string;
    subject: string;
    html: string;
}

export const sendPaymentConfirmation = async (
    email: string,
    schoolName: string,
    orderId: string,
    totalAmount: number,
    teams: string[]
): Promise<void> => {
    // TODO: Implement actual email sending
    console.log('=====================================');
    console.log('PAYMENT CONFIRMATION EMAIL');
    console.log('=====================================');
    console.log('To:', email);
    console.log('School:', schoolName);
    console.log('Order ID:', orderId);
    console.log('Total Amount:', new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
    }).format(totalAmount));
    console.log('Teams:', teams.join(', '));
    console.log('=====================================');

    // Placeholder for future implementation
    // Example with SendGrid:
    /*
    const msg: EmailNotification = {
      to: email,
      subject: `Konfirmasi Pembayaran - PMI Competition ${orderId}`,
      html: `
        <h1>Pembayaran Berhasil!</h1>
        <p>Terima kasih ${schoolName},</p>
        <p>Pembayaran Anda telah berhasil dikonfirmasi.</p>
        <h3>Detail Pembayaran:</h3>
        <ul>
          <li>Order ID: ${orderId}</li>
          <li>Total: ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(totalAmount)}</li>
          <li>Tim: ${teams.join(', ')}</li>
        </ul>
        <p>Silakan cek dashboard Anda untuk informasi lebih lanjut.</p>
      `,
    };
  
    await sendgrid.send(msg);
    */
};

export const sendPaymentReminder = async (
    email: string,
    schoolName: string,
    pendingTeamsCount: number
): Promise<void> => {
    console.log('=====================================');
    console.log('PAYMENT REMINDER EMAIL');
    console.log('=====================================');
    console.log('To:', email);
    console.log('School:', schoolName);
    console.log('Pending Teams:', pendingTeamsCount);
    console.log('=====================================');
};
