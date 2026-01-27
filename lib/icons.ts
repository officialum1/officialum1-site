export const getPlatformIcon = (platform: string, customImage?: string): string => {
    if (customImage && customImage.length > 10) return customImage;

    const p = (platform || '').toLowerCase();

    // Social Media Icons
    if (p.includes('discord')) return 'https://cdn-icons-png.flaticon.com/512/5968/5968756.png';
    if (p.includes('reddit')) return 'https://cdn-icons-png.flaticon.com/512/52/52178.png';
    if (p.includes('telegram')) return 'https://cdn-icons-png.flaticon.com/512/2111/2111646.png';
    if (p.includes('snapchat')) return 'https://cdn-icons-png.flaticon.com/512/3670/3670151.png';
    if (p.includes('instagram')) return 'https://cdn-icons-png.flaticon.com/512/174/174855.png';
    if (p.includes('facebook')) return 'https://cdn-icons-png.flaticon.com/512/174/174848.png';
    if (p.includes('twitter') || p === 'x' || p.includes(' x ')) return 'https://cdn-icons-png.flaticon.com/512/5969/5969020.png';
    if (p.includes('tiktok')) return 'https://cdn-icons-png.flaticon.com/512/3046/3046121.png';
    if (p.includes('youtube')) return 'https://cdn-icons-png.flaticon.com/512/174/174883.png';
    if (p.includes('google') || p.includes('gmail')) return 'https://cdn-icons-png.flaticon.com/512/281/281769.png';
    if (p.includes('viber')) return 'https://cdn-icons-png.flaticon.com/512/3670/3670059.png';
    if (p.includes('whatsapp')) return 'https://cdn-icons-png.flaticon.com/512/733/733585.png';
    if (p.includes('linkedin')) return 'https://cdn-icons-png.flaticon.com/512/174/174857.png';

    // Better fallback icon (Box/Account)
    return 'https://cdn-icons-png.flaticon.com/512/747/747376.png';
};
