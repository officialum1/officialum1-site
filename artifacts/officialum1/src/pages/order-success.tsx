import { Link, useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Package, ArrowRight } from "lucide-react";

export function OrderSuccess() {
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const orderId = params.get("orderId");

  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center p-4">
      <Card className="w-full max-w-lg bg-card/50 backdrop-blur-xl border-primary/20 shadow-[0_0_50px_-12px_rgba(0,255,136,0.1)] text-center">
        <CardContent className="pt-12 pb-12 px-6 flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center text-primary mb-6 animate-in zoom-in duration-500">
            <CheckCircle className="w-10 h-10" />
          </div>
          
          <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
          <p className="text-muted-foreground mb-8 max-w-sm">
            Thank you for your purchase. We've received your order and are processing it now.
          </p>
          
          {orderId && (
            <div className="bg-background/50 border border-border rounded-lg p-4 mb-8 w-full">
              <p className="text-sm text-muted-foreground mb-1">Order Number</p>
              <p className="text-xl font-mono font-bold text-primary">#{orderId}</p>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
            <Button asChild variant="outline" className="border-primary/50 text-primary">
              <Link href={`/orders/${orderId}`}>
                <Package className="w-4 h-4 mr-2" /> View Order
              </Link>
            </Button>
            <Button asChild>
              <Link href="/shop">
                Continue Shopping <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
