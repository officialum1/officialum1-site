import { useListOrders, useGetOrder } from "@workspace/api-client-react";
import { Link, useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, Download, ExternalLink, CheckCircle, Clock } from "lucide-react";

export function MyOrders() {
  const { data: orders, isLoading } = useListOrders();

  if (isLoading) {
    return (
      <div className="container mx-auto py-12 px-4 space-y-4">
        <h1 className="text-3xl font-bold mb-8">Order History</h1>
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full" />)}
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
          <Package className="w-5 h-5" />
        </div>
        <h1 className="text-3xl font-bold">Order History</h1>
      </div>

      {orders && orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map(order => (
            <Card key={order.id} className="bg-card/50 border-border/50 hover:border-border transition-colors">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-bold text-lg text-foreground">Order #{order.id}</span>
                      <Badge variant="outline" className={
                        order.status === 'completed' ? 'border-primary text-primary bg-primary/10' : 
                        order.status === 'pending' ? 'border-yellow-500 text-yellow-500 bg-yellow-500/10' : 
                        ''
                      }>
                        {order.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {new Date(order.createdAt).toLocaleDateString()} • {order.items.length} item(s) • ${order.total.toFixed(2)}
                    </p>
                    <div className="text-sm text-foreground">
                      {order.items.map(item => item.name).join(", ")}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {order.deliveryToken && (
                      <Button variant="outline" size="sm" className="border-primary/50 text-primary hover:bg-primary/10" asChild>
                        <a href={`/delivery/${order.deliveryToken}`} target="_blank" rel="noreferrer">
                          <Download className="w-4 h-4 mr-2" /> Access Delivery
                        </a>
                      </Button>
                    )}
                    <Button variant="secondary" size="sm" asChild>
                      <Link href={`/orders/${order.id}`}>View Details</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-card/30 border border-border/50 rounded-xl">
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h2 className="text-xl font-bold mb-2">No orders yet</h2>
          <p className="text-muted-foreground mb-6">Looks like you haven't made any purchases.</p>
          <Button asChild><Link href="/shop">Browse Marketplace</Link></Button>
        </div>
      )}
    </div>
  );
}

export function OrderDetail() {
  const { id } = useParams();
  const orderId = parseInt(id || "0", 10);
  
  const { data: order, isLoading } = useGetOrder(orderId, {
    query: { enabled: !!orderId }
  });

  if (isLoading) {
    return <div className="container mx-auto py-12 px-4"><Skeleton className="h-[400px] w-full" /></div>;
  }

  if (!order) return <div className="container py-12 text-center text-muted-foreground">Order not found</div>;

  const isCompleted = order.status === 'completed';

  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl">
      <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/my-orders" className="hover:text-primary transition-colors">Orders</Link>
        <span>/</span>
        <span className="text-foreground">#{order.id}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-4 border-b border-border/30">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl">Order #{order.id}</CardTitle>
                <Badge variant="outline" className={
                  isCompleted ? 'border-primary text-primary bg-primary/10' : 
                  'border-yellow-500 text-yellow-500 bg-yellow-500/10'
                }>
                  {order.status}
                </Badge>
              </div>
              <CardDescription>Placed on {new Date(order.createdAt).toLocaleString()}</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4 text-foreground">Items</h3>
              <div className="space-y-4">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex gap-4">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="w-16 h-16 rounded-md object-cover bg-muted" />
                    ) : (
                      <div className="w-16 h-16 rounded-md bg-muted flex items-center justify-center">
                        <Package className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground">{item.name}</h4>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <div className="font-semibold">${(item.price * item.quantity).toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Payment Method</span>
                <span className="capitalize">{order.paymentMethod}</span>
              </div>
              <div className="pt-4 border-t border-border/50 flex justify-between font-bold text-lg text-foreground">
                <span>Total</span>
                <span className="text-primary">${order.total.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-6 text-center">
              {isCompleted ? (
                <>
                  <CheckCircle className="w-10 h-10 text-primary mx-auto mb-3" />
                  <h3 className="font-bold text-foreground mb-2">Order Delivered</h3>
                  <p className="text-sm text-muted-foreground mb-4">Your digital products are ready to use.</p>
                  {order.deliveryToken && (
                    <Button className="w-full" asChild>
                      <a href={`/delivery/${order.deliveryToken}`} target="_blank" rel="noreferrer">
                        Access Delivery <ExternalLink className="w-4 h-4 ml-2" />
                      </a>
                    </Button>
                  )}
                </>
              ) : (
                <>
                  <Clock className="w-10 h-10 text-yellow-500 mx-auto mb-3" />
                  <h3 className="font-bold text-foreground mb-2">Processing Order</h3>
                  <p className="text-sm text-muted-foreground">We are verifying your payment and preparing your digital delivery. This usually takes 5-15 minutes.</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
