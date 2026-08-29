"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

interface CompareContextType {
    compareList: any[];
    addToCompare: (product: any) => void;
    removeFromCompare: (productId: number) => void;
    clearCompare: () => void;
    isInCompare: (productId: number) => boolean;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export function CompareProvider({ children }: { children: React.ReactNode }) {
    const [compareList, setCompareList] = useState<any[]>([]);

    useEffect(() => {
        const saved = localStorage.getItem('officialum1_compare');
        if (saved) {
            try { setCompareList(JSON.parse(saved)); } catch (e) { }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('officialum1_compare', JSON.stringify(compareList));
    }, [compareList]);

    const addToCompare = (product: any) => {
        if (compareList.length >= 4) {
            toast.error("Maximum 4 products can be compared at once.");
            return;
        }
        if (compareList.some(p => p.id === product.id)) {
            removeFromCompare(product.id);
            return;
        }
        setCompareList(prev => [...prev, product]);
        toast.success(`Added ${product.name} to comparison! ⚖️`);
    };

    const removeFromCompare = (productId: number) => {
        setCompareList(prev => prev.filter(p => p.id !== productId));
    };

    const clearCompare = () => setCompareList([]);

    const isInCompare = (productId: number) => compareList.some(p => p.id === productId);

    return (
        <CompareContext.Provider value={{ compareList, addToCompare, removeFromCompare, clearCompare, isInCompare }}>
            {children}
        </CompareContext.Provider>
    );
}

export function useCompare() {
    const context = useContext(CompareContext);
    if (!context) throw new Error("useCompare must be used within a CompareProvider");
    return context;
}
