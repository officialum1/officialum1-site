"use client";

import { useEffect, useState } from 'react';

export default function LoyaltyBanner() {
    const [points, setPoints] = useState(0);

    useEffect(() => {
        const stored = localStorage.getItem('buyer_user');
        if (stored) {
            const user = JSON.parse(stored);
            setPoints(user.loyalty_points || 0); // Need to sync this with backend realistically
        }
    }, []);

    if (points === 0) return null;

    return (
        <div style={{
            background: 'linear-gradient(90deg, #ffd700, #ffaa00)',
            color: 'black',
            textAlign: 'center',
            padding: '8px',
            fontSize: '0.9rem',
            fontWeight: 'bold',
            position: 'fixed',
            top: '80px', // Below Navbar
            width: '100%',
            zIndex: 99
        }}>
            🌟 You have {points} loyalty points! Redeem them for discounts at checkout.
        </div>
    );
}
