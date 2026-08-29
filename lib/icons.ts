export const getPlatformIcon = (platform: string, customImage?: string): string => {
    // 1. Priority: Custom Image (URL, Path, or Base64)
    if (customImage && (
        customImage.startsWith('http') ||
        customImage.startsWith('/') ||
        customImage.startsWith('.') ||
        customImage.startsWith('data:')
    )) {
        return customImage;
    }

    const p = (platform || '').toLowerCase();

    // 2. Social Media & Communication
    if (p.includes('discord')) return 'https://cdn-icons-png.flaticon.com/512/5968/5968756.png';
    if (p.includes('reddit')) return '/icons/reddit.png';
    if (p.includes('telegram')) return 'https://cdn-icons-png.flaticon.com/512/2111/2111646.png';
    if (p.includes('snapchat')) return '/icons/snapchat.png';
    if (p.includes('instagram')) return 'https://cdn-icons-png.flaticon.com/512/174/174855.png';
    if (p.includes('facebook')) return 'https://cdn-icons-png.flaticon.com/512/174/174848.png';
    if (p.includes('twitter') || p === 'x' || p.includes(' x ')) return 'https://cdn-icons-png.flaticon.com/512/5969/5969020.png';
    if (p.includes('tiktok')) return 'https://cdn-icons-png.flaticon.com/512/3046/3046121.png';
    if (p.includes('youtube')) return 'https://cdn-icons-png.flaticon.com/512/174/174883.png';
    if (p.includes('linkedin')) return 'https://cdn-icons-png.flaticon.com/512/174/174857.png';
    if (p.includes('viber')) return 'https://cdn-icons-png.flaticon.com/512/3670/3670059.png';
    if (p.includes('signal')) return 'https://cdn-icons-png.flaticon.com/512/5968/5968940.png';
    if (p.includes('line')) return 'https://cdn-icons-png.flaticon.com/512/124/124027.png';
    if (p.includes('wechat') || p.includes('weixin')) return 'https://cdn-icons-png.flaticon.com/512/3670/3670267.png';

    // 3. Streaming (Video/Audio)
    if (p.includes('netflix')) return 'https://cdn-icons-png.flaticon.com/512/732/732220.png';
    if (p.includes('spotify')) return 'https://cdn-icons-png.flaticon.com/512/2111/2111628.png';
    if (p.includes('twitch')) return 'https://cdn-icons-png.flaticon.com/512/2111/2111654.png';
    if (p.includes('kick')) return 'https://cdn-icons-png.flaticon.com/512/11625/11625075.png'; // Kick
    if (p.includes('crunchyroll')) return 'https://cdn-icons-png.flaticon.com/512/3669/3669704.png';
    if (p.includes('disney')) return 'https://cdn-icons-png.flaticon.com/512/5977/5977583.png';
    if (p.includes('hulu')) return 'https://cdn-icons-png.flaticon.com/512/5977/5977590.png';
    if (p.includes('amazon') || p.includes('prime')) return 'https://cdn-icons-png.flaticon.com/512/5968/5968214.png';
    if (p.includes('hbo')) return 'https://cdn-icons-png.flaticon.com/512/5977/5977593.png';
    if (p.includes('apple music')) return 'https://cdn-icons-png.flaticon.com/512/5968/5968411.png';

    // 4. Gaming
    if (p.includes('steam')) return 'https://cdn-icons-png.flaticon.com/512/806/806626.png';
    if (p.includes('epic')) return 'https://cdn-icons-png.flaticon.com/512/5969/5969032.png';
    if (p.includes('xbox')) return 'https://cdn-icons-png.flaticon.com/512/174/174880.png';
    if (p.includes('playstation') || p === 'psn' || p === 'ps4' || p === 'ps5') return 'https://cdn-icons-png.flaticon.com/512/1167/1167732.png';
    if (p.includes('nintendo') || p.includes('switch')) return 'https://cdn-icons-png.flaticon.com/512/10014/10014080.png';
    if (p.includes('roblox')) return 'https://cdn-icons-png.flaticon.com/512/3018/3018425.png';
    if (p.includes('fortnite')) return 'https://cdn-icons-png.flaticon.com/512/5969/5969123.png';
    if (p.includes('minecraft')) return 'https://cdn-icons-png.flaticon.com/512/5969/5969135.png';
    if (p.includes('league') || p.includes('lol')) return 'https://cdn-icons-png.flaticon.com/512/5969/5969129.png';
    if (p.includes('valorant')) return 'https://cdn-icons-png.flaticon.com/512/5969/5969131.png';
    if (p.includes('genshin')) return 'https://cdn-icons-png.flaticon.com/512/5969/5969133.png';

    // 5. Tech & Tools
    if (p.includes('google') || p.includes('gmail') || p.includes('drive')) return 'https://cdn-icons-png.flaticon.com/512/281/281769.png';
    if (p.includes('apple') || p.includes('icloud')) return 'https://cdn-icons-png.flaticon.com/512/174/174837.png';
    if (p.includes('microsoft') || p.includes('office') || p.includes('windows') || p.includes('outlook')) return 'https://cdn-icons-png.flaticon.com/512/732/732221.png';
    if (p.includes('chatgpt') || p.includes('openai') || p.includes('ai')) return 'https://cdn-icons-png.flaticon.com/512/12222/12222588.png';
    if (p.includes('canva')) return 'https://cdn-icons-png.flaticon.com/512/10091/10091763.png';
    if (p.includes('adobe') || p.includes('photoshop')) return 'https://cdn-icons-png.flaticon.com/512/5968/5968397.png';
    if (p.includes('github')) return 'https://cdn-icons-png.flaticon.com/512/25/25231.png';
    if (p.includes('vpn')) return 'https://cdn-icons-png.flaticon.com/512/3596/3596327.png';
    if (p.includes('dropbox')) return 'https://cdn-icons-png.flaticon.com/512/174/174845.png';


    // 7. Adult / Others
    if (p.includes('onlyfans')) return 'https://cdn-icons-png.flaticon.com/512/10543/10543265.png';
    if (p.includes('fansly')) return 'https://cdn-icons-png.flaticon.com/512/825/825590.png'; // Generic star/fan
    if (p.includes('pornhub')) return 'https://cdn-icons-png.flaticon.com/512/5968/5968944.png';

    // Better fallback icon (Box/Account)
    return 'https://cdn-icons-png.flaticon.com/512/747/747376.png';
};
