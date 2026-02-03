"use client";

import { createContext, useContext, useState, useEffect } from 'react';

// Define the cart item structure
export interface CartItem {
    uniqueId: string;
    id: number;
    name: string;
    price: string;
    image: string;
    platform: string;
    stock: number;
    inventoryStock: number;
}

interface CartContextType {
    cart: CartItem[];
    addToCart: (product: any) => void;
    removeFromCart: (uniqueId: string) => void;
    clearCart: () => void;
    cartTotal: number;
    cartCount: number;
    isCartOpen: boolean;
    toggleCart: () => void;
    updateEmail: (email: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [sessionId, setSessionId] = useState<string>('');

    // 1. Init Session & Load Cart
    useEffect(() => {
        let storedId = localStorage.getItem('officialum1_cart_id');
        if (!storedId) {
            storedId = 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('officialum1_cart_id', storedId);
        }
        setSessionId(storedId);

        const savedCart = localStorage.getItem('officialum1_cart');
        if (savedCart) {
            try { setCart(JSON.parse(savedCart)); } catch (e) { }
        }
    }, []);

    // 2. Sync to Server (Debounced)
    useEffect(() => {
        if (!sessionId) return;
        localStorage.setItem('officialum1_cart', JSON.stringify(cart));

        const syncTimeout = setTimeout(() => {
            fetch('/api/cart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cartId: sessionId,
                    items: cart.map(i => ({ id: i.id, quantity: 1 })),
                    email: localStorage.getItem('officialum1_guest_email')
                })
            }).catch(e => console.error("Cart Sync Error:", e));
        }, 2000);

        return () => clearTimeout(syncTimeout);
    }, [cart, sessionId]);

    const addToCart = (product: any) => {
        const newItem: CartItem = {
            uniqueId: Date.now() + Math.random().toString(),
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            platform: product.platform,
            stock: product.stock,
            inventoryStock: product.inventoryStock || 0
        };
        setCart(prev => [...prev, newItem]);
        setIsCartOpen(true);
    };

    const removeFromCart = (uniqueId: string) => {
        setCart(prev => prev.filter(item => item.uniqueId !== uniqueId));
    };

    const clearCart = () => {
        setCart([]);
        localStorage.removeItem('officialum1_cart');
    };

    const toggleCart = () => setIsCartOpen(!isCartOpen);

    const updateEmail = (email: string) => {
        localStorage.setItem('officialum1_guest_email', email);
        if (sessionId) {
            fetch('/api/cart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cartId: sessionId, items: cart.map(i => ({ id: i.id, quantity: 1 })), email })
            });
        }
    };

    const cartTotal = cart.reduce((acc, item) => acc + parseFloat(item.price), 0);
    const cartCount = cart.length;

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, cartTotal, cartCount, isCartOpen, toggleCart, updateEmail }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) throw new Error("useCart must be used within a CartProvider");
    return context;
}
