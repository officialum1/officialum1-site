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

    useEffect(() => {
        const saved = localStorage.getItem('officialum1_wishlist');
        if (saved) {
            try { setWishlist(JSON.parse(saved)); } catch (e) { }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('officialum1_wishlist', JSON.stringify(wishlist));
    }, [wishlist]);

    const addToWishlist = (product: any) => {
        if (wishlist.some(p => p.id === product.id)) {
            toast.info("Already in wishlist");
            return;
        }
        setWishlist(prev => [...prev, product]);
        toast.success("Added to wishlist ❤️");
    };

    const removeFromWishlist = (productId: number) => {
        setWishlist(prev => prev.filter(p => p.id !== productId));
        toast.info("Removed from wishlist");
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
