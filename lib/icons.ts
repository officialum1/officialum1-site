export const getPlatformIcon = (platform: string, customImage?: string) => {
    if (customImage && customImage.length > 10) return customImage;

    const p = platform.toLowerCase();
    if (p.includes('discord')) return 'https://cdn-icons-png.flaticon.com/512/5968/5968756.png';
    if (p.includes('reddit')) return 'https://cdn-icons-png.flaticon.com/512/52/52178.png';
    if (p.includes('telegram')) return 'https://cdn-icons-png.flaticon.com/512/2111/2111646.png';
    if (p.includes('snapchat')) return 'https://cdn-icons-png.flaticon.com/512/179/179339.png';
    if (p.includes('instagram')) return 'https://cdn-icons-png.flaticon.com/512/174/174855.png';
    if (p.includes('facebook')) return 'https://cdn-icons-png.flaticon.com/512/174/174848.png';
    if (p.includes('twitter') || p === 'x') return 'https://cdn-icons-png.flaticon.com/512/5969/5969020.png';
    if (p.includes('tiktok')) return 'https://cdn-icons-png.flaticon.com/512/3046/3046121.png';
    if (p.includes('youtube')) return 'https://cdn-icons-png.flaticon.com/512/174/174883.png';
    if (p.includes('google')) return 'https://cdn-icons-png.flaticon.com/512/2991/2991148.png';

    return 'https://cdn-icons-png.flaticon.com/512/1232/1232728.png'; // Default Box
};
