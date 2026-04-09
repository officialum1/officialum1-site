"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

interface WishlistContextType {
    wishlist: any[];
    addToWishlist: (product: any) => void;
    removeFromWishlist: (productId: number) => void;
    isInWishlist: (productId: number) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
    const [wishlist, setWishlist] = useState<any[]>([]);
    const [userId, setUserId] = useState<string>('');

    // 1. Initialize User & Load Wishlist
    useEffect(() => {
        // Prefer Logged In User
        if (typeof window !== 'undefined') {
            const userStr = localStorage.getItem('buyer_user');
            if (userStr) {
                const u = JSON.parse(userStr);
                setUserId(u.email); // Use Email or ID
            } else {
                // Fallback to Guest Cart ID
                let guestId = localStorage.getItem('officialum1_cart_id');
                if (!guestId) {
                    guestId = 'guest_' + Date.now();
                    localStorage.setItem('officialum1_cart_id', guestId);
                }
                setUserId(guestId);
            }
        }
    }, []);

    // 2. Fetch from API when userId is set
    useEffect(() => {
        if (!userId) return;

        fetch(`/api/wishlist?userId=${userId}`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setWishlist(data);
                } else {
                    // Fallback to local if DB is empty but Local has data (Migration)
                    const local = localStorage.getItem('officialum1_wishlist');
                    if (local) {
                        const localItems = JSON.parse(local);
                        if (localItems.length > 0) {
                            setWishlist(localItems);
                            // Lazy Sync Local -> DB
                            fetch('/api/wishlist', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ userId, action: 'sync', items: localItems })
                            });
                        }
                    }
                }
            })
            .catch(e => console.error("Wishlist Load Error", e));
    }, [userId]);

    const addToWishlist = async (product: any) => {
        if (wishlist.some(p => p.id === product.id)) {
            toast.info("Already in wishlist");
            return;
        }

        // Optimistic Update
        setWishlist(prev => [...prev, product]);
        toast.success("Added to wishlist ❤️");

        // DB Sync
        if (userId) {
            try {
                await fetch('/api/wishlist', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId, productId: product.id, action: 'add' })
                });
            } catch (e) { console.error("Wishlist Add Error", e); }
        }
    };

    const removeFromWishlist = async (productId: number) => {
        setWishlist(prev => prev.filter(p => p.id !== productId));
        toast.info("Removed from wishlist");

        if (userId) {
            try {
                await fetch('/api/wishlist', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId, productId, action: 'remove' })
                });
            } catch (e) { console.error("Wishlist Remove Error", e); }
        }
    };

    const isInWishlist = (productId: number) => {
        return wishlist.some(p => p.id === productId);
    };

    return (
        <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, isInWishlist }}>
            {children}
        </WishlistContext.Provider>
    );
}

export function useWishlist() {
    const context = useContext(WishlistContext);
    if (!context) throw new Error("useWishlist must be used within a WishlistProvider");
    return context;
}
