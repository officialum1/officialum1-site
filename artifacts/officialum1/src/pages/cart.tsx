import { useGetCart, useAddToCart, useRemoveFromCart, useClearCart } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function Cart() {
  const { data: cart, isLoading } = useGetCart();
  const addToCart = useAddToCart();
  const removeFromCart = useRemoveFromCart();
  const clearCart = useClearCart();

  const handleUpdateQuantity = (productId: number, currentQuantity: number, change: number) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity <= 0) {
      removeFromCart.mutate({ productId });
    } else {
      addToCart.mutate({ data: { productId, quantity: change } });
    }
  };

  const handleRemove = (productId: number) => {
    removeFromCart.mutate({ productId });
  };

  const handleClear = () => {
    clearCart.mutate();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full" />)}
          </div>
          <div><Skeleton className="h-64 w-full" /></div>
        </div>
      </div>
    );
  }

  const isEmpty = !cart || cart.items.length === 0;

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8 flex items-center">
        <ShoppingCart className="w-8 h-8 mr-3 text-primary" /> Shopping Cart
      </h1>

      {isEmpty ? (
        <div className="text-center py-24 bg-card/30 border border-border/50 rounded-xl">
          <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-30" />
          <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-8">Looks like you haven't added anything to your cart yet.</p>
          <Button size="lg" asChild>
            <Link href="/shop">Start Shopping</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-muted-foreground">{cart.itemCount} items</span>
              <Button variant="ghost" size="sm" onClick={handleClear} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                Clear Cart
              </Button>
            </div>
            
            {cart.items.map(item => (
              <Card key={item.productId} className="bg-card/50 border-border/50">
                <CardContent className="p-4 flex flex-col sm:flex-row items-center gap-4">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="w-20 h-20 rounded-md object-cover bg-muted" />
                  ) : (
                    <div className="w-20 h-20 rounded-md bg-muted flex items-center justify-center shrink-0">
                      <ShoppingCart className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                  
                  <div className="flex-1 text-center sm:text-left">
                    <Link href={`/shop/${item.productId}`}>
                      <h3 className="font-bold text-foreground hover:text-primary transition-colors">{item.name}</h3>
                    </Link>
                    <p className="text-primary font-bold mt-1">${item.price.toFixed(2)}</p>
                  </div>
                  
                  <div className="flex items-center gap-3 bg-background border border-border rounded-lg p-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleUpdateQuantity(item.productId, item.quantity, -1)}>
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleUpdateQuantity(item.productId, item.quantity, 1)}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="text-right ml-auto hidden sm:block w-24">
                    <p className="font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                  
                  <Button variant="ghost" size="icon" onClick={() => handleRemove(item.productId)} className="text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div>
            <Card className="bg-card border-primary/20 sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>${cart.subtotal.toFixed(2)}</span>
                </div>
                <div className="border-t border-border/50 pt-4 flex justify-between font-bold text-xl text-foreground">
                  <span>Total</span>
                  <span className="text-primary">${cart.total.toFixed(2)}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full h-12 text-lg font-bold" asChild>
                  <Link href="/checkout">
                    Proceed to Checkout <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
