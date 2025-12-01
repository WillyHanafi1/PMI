// Midtrans configuration - PLACEHOLDER

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
        if ((window as any).snap) {
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

// Open Midtrans payment popup
export const openMidtransPayment = (snapToken: string, onSuccess: () => void, onPending: () => void, onError: () => void) => {
    if ((window as any).snap) {
        (window as any).snap.pay(snapToken, {
            onSuccess: () => {
                console.log('Payment success');
                onSuccess();
            },
            onPending: () => {
                console.log('Payment pending');
                onPending();
            },
            onError: () => {
                console.log('Payment error');
                onError();
            },
            onClose: () => {
                console.log('Payment popup closed');
            },
        });
    }
};
