"use client";

import { createContext, useContext, useState, useEffect } from 'react';

// Define the cart item structure
export interface CartItem {
    uniqueId: string; // generated to distinguish same product added multiple times if needed, or just standard ID
    id: number;
    name: string;
    price: string; // Keep as string to match product.price usually
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
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);

    // Load from local storage
    useEffect(() => {
        const savedCart = localStorage.getItem('officialum1_cart');
        if (savedCart) {
            try {
                setCart(JSON.parse(savedCart));
            } catch (e) { console.error("Failed to parse cart", e); }
        }
    }, []);

    // Save to local storage
    useEffect(() => {
        localStorage.setItem('officialum1_cart', JSON.stringify(cart));
    }, [cart]);

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

    const cartTotal = cart.reduce((acc, item) => acc + parseFloat(item.price), 0);
    const cartCount = cart.length;

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, cartTotal, cartCount, isCartOpen, toggleCart }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) throw new Error("useCart must be used within a CartProvider");
    return context;
}
