"use client";

import { useEffect, useState } from 'react';

export default function GlobalAnnouncement() {
    const [banner, setBanner] = useState<any>(null);

    useEffect(() => {
        fetch('/api/admin/settings?key=announcement_banner')
            .then(res => res.json())
            .then(data => {
                if (data.value) setBanner(JSON.parse(data.value));
            })
            .catch(() => { });
    }, []);

    if (!banner || !banner.enabled) return null;

    return (
        <div style={{
            background: banner.color || '#ff4d4d',
            color: 'white',
            textAlign: 'center',
            padding: '10px',
            fontSize: '1rem',
            fontWeight: 'bold',
            position: 'fixed',
            top: '0',
            width: '100%',
            zIndex: 10001, // Above Navbar
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '10px'
        }}>
            <span>{banner.text}</span>
            {banner.link && (
                <a href={banner.link} style={{ color: 'white', textDecoration: 'underline' }}>Click Here</a>
            )}
            <button
                onClick={() => setBanner(null)} // Dismiss for session
                style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.2rem', cursor: 'pointer', marginLeft: '20px' }}
            >
                ✕
            </button>
        </div>
    );
}
