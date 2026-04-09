export async function sendTelegramMessage(chatId: string, message: string, customToken?: string) {
    try {
        let token = customToken;

        if (!token) {
            // Fetch admin settings if no token provided
            const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/settings`);
            const settings = await res.json();
            token = settings.telegramToken;
        }

        if (!token || !chatId || token === '...' || chatId === '...') {
            console.log("Telegram Token or Chat ID missing.");
            return;
        }

        const url = `https://api.telegram.org/bot${token}/sendMessage`;
        await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: 'HTML'
            })
        });
    } catch (e) {
        console.error("Telegram Error:", e);
    }
}

/**
 * Specifically for Admin Alerts using global settings
 */
export async function sendTelegramAdminAlert(message: string) {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/settings`);
        const settings = await res.json();

        if (settings.telegramChatId && settings.telegramToken) {
            await sendTelegramMessage(settings.telegramChatId, message, settings.telegramToken);
        }
    } catch (e) {
        console.error("Admin Alert Error:", e);
    }
}
