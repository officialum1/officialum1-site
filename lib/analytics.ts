export const trackEvent = (eventName: string, params: any = {}) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', eventName, params);
    }
};

export const trackPageView = (url: string) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('config', 'G-G5WV453K9J', {
            page_path: url,
        });
    }
};
