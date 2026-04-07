import { useState, useEffect, createContext, useContext } from "react";

type WishlistItem = {
  id: number;
  title: string;
  price: string;
  platform?: string;
  image?: string;
};

type WishlistCtx = {
  items: WishlistItem[];
  add: (item: WishlistItem) => void;
  remove: (id: number) => void;
  toggle: (item: WishlistItem) => void;
  has: (id: number) => boolean;
  count: number;
};

const WishlistContext = createContext<WishlistCtx>({
  items: [], add: () => {}, remove: () => {}, toggle: () => {}, has: () => false, count: 0,
});

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>(() => {
    try { return JSON.parse(localStorage.getItem("um1_wishlist") || "[]"); }
    catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem("um1_wishlist", JSON.stringify(items));
  }, [items]);

  const add = (item: WishlistItem) => setItems(prev => prev.some(i => i.id === item.id) ? prev : [...prev, item]);
  const remove = (id: number) => setItems(prev => prev.filter(i => i.id !== id));
  const toggle = (item: WishlistItem) => items.some(i => i.id === item.id) ? remove(item.id) : add(item);
  const has = (id: number) => items.some(i => i.id === id);

  return (
    <WishlistContext.Provider value={{ items, add, remove, toggle, has, count: items.length }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => useContext(WishlistContext);
