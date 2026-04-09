import { query } from './db';

export async function sendDiscordNotification(message: string, embed: any = null) {
    try {
        const settingsRes: any = await query("SELECT setting_value FROM settings WHERE setting_key = 'discord_webhook_url'");
        const webhookUrl = settingsRes[0]?.setting_value;

        if (!webhookUrl) return;

        const body: any = { content: message };
        if (embed) body.embeds = [embed];

        await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
    } catch (e) {
        console.error("Discord Notification Error:", e);
    }
}
