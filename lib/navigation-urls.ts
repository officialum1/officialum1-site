export function getDomainUrls() {
    const isClient = typeof window !== 'undefined';
    const isDev = process.env.NODE_ENV !== 'production';

    const isShopHost = isClient 
        ? (window.location.hostname.startsWith('shop.') || window.location.hostname.startsWith('shop.localhost'))
        : false;

    const mainBase = isDev ? 'http://localhost:3000' : 'https://officialum1.com';
    const shopBase = isDev ? 'http://shop.localhost:3000' : 'https://shop.officialum1.com';

    return {
        isShopHost,
        mainUrl: (path: string) => {
            const cleanPath = path.startsWith('/') ? path : `/${path}`;
            return isShopHost ? `${mainBase}${cleanPath}` : cleanPath;
        },
        shopUrl: () => (isShopHost ? '/' : shopBase),
        mainBase,
        shopBase
    };
}
