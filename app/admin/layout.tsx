import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function AdminRootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className={`admin-theme ${inter.className}`} style={{ minHeight: '100vh', background: '#F6F7F3' }}>
            {children}
        </div>
    );
}
