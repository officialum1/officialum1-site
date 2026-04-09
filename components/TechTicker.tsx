"use client";

import { useEffect, useRef } from "react";

const techs = [
    { name: "Next.js", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg" },
    { name: "React", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" },
    { name: "TypeScript", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" },
    { name: "Node.js", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" },
    { name: "Google Ads", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg" },
    { name: "Canva", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/canva/canva-original.svg" },
    { name: "Figma", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg" },
    { name: "WordPress", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/wordpress/wordpress-plain.svg" },
];

export default function TechTicker() {
    return (
        <div style={{ background: '#050505', padding: '2rem 0', overflow: 'hidden', borderBottom: '1px solid var(--glass-border)' }}>
            <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#666', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Powered By Modern Tech</p>
            <div className="ticker-wrap">
                <div className="ticker">
                    {[...techs, ...techs].map((item, i) => ( // Duplicate for seamless loop
                        <div key={i} className="ticker-item">
                            <img src={item.icon} alt={item.name} style={{ width: '40px', height: '40px', filter: 'grayscale(100%)', opacity: 0.5, transition: 'all 0.3s' }} />
                        </div>
                    ))}
                </div>
            </div>
            <style jsx>{`
                .ticker-wrap {
                    width: 100%;
                    overflow: hidden;
                    white-space: nowrap;
                    position: relative;
                }
                .ticker {
                    display: inline-block;
                    animation: ticker 30s linear infinite;
                }
                .ticker-item {
                    display: inline-block;
                    padding: 0 3rem;
                }
                .ticker-item img:hover {
                    filter: grayscale(0%) !important;
                    opacity: 1 !important;
                    transform: scale(1.1);
                }
                @keyframes ticker {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
            `}</style>
        </div>
    );
}
