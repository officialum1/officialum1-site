import Link from "next/link";

export default function NotFound() {
    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            background: '#050505',
            color: 'white'
        }}>
            <h1 style={{ fontSize: '6rem', fontWeight: 'bold', margin: 0, textShadow: '0 0 20px var(--primary)' }} className="text-gradient">404</h1>
            <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Lost in Cyberspace?</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>The page you are looking for has been moved or doesn't exist.</p>
            <Link href="/" className="btn btn-primary">
                Return Home
            </Link>
        </div>
    );
}
