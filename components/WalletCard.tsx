export default function WalletCard({ balance, onDeposit }: any) {
    return (
        <div style={{
            position: 'relative',
            width: '100%',
            height: '220px',
            borderRadius: '24px',
            padding: '1.5rem',
            background: 'linear-gradient(135deg, #111 0%, #000 100%)',
            border: '1px solid rgba(255,255,255,0.1)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
        }}>
            {/* Background Decor */}
            <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', background: 'var(--primary)', filter: 'blur(80px)', opacity: 0.2, borderRadius: '50%' }}></div>
            <div style={{ position: 'absolute', bottom: '-20px', left: '-20px', width: '100px', height: '100px', background: 'var(--accent)', filter: 'blur(60px)', opacity: 0.15, borderRadius: '50%' }}></div>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
                <span style={{ color: '#888', fontWeight: '500', fontSize: '0.9rem' }}>Total Balance</span>
                <span style={{ background: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '6px', fontSize: '0.8rem' }}>USD</span>
            </div>

            {/* Balance */}
            <div style={{ position: 'relative', zIndex: 1 }}>
                <h2 style={{ fontSize: '3rem', fontWeight: '800', fontFamily: 'var(--font-heading)', color: '#fff', letterSpacing: '-1px' }}>
                    ${Number(balance).toFixed(2)}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#00ff88', fontSize: '0.9rem', marginTop: '5px' }}>
                    <span style={{ display: 'inline-block', width: '8px', height: '8px', background: '#00ff88', borderRadius: '50%', boxShadow: '0 0 10px #00ff88' }}></span>
                    Active
                </div>
            </div>

            {/* Actions */}
            <div style={{ position: 'relative', zIndex: 1 }}>
                <button
                    onClick={onDeposit}
                    style={{
                        width: '100%',
                        padding: '0.8rem',
                        borderRadius: '12px',
                        background: '#fff',
                        color: '#000',
                        border: 'none',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '0.5rem',
                        transition: 'transform 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                    <span style={{ fontSize: '1.2rem' }}>+</span> Add Funds
                </button>
            </div>
        </div>
    );
}
