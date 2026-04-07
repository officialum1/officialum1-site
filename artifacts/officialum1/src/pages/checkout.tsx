import { useState, useEffect } from "react";
import { useGetCart } from "@workspace/api-client-react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ShieldCheck, CreditCard, Bitcoin, Wallet, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

const API_BASE = "/api";

interface PaymentGateways {
  stripe: boolean;
  crypto: boolean;
  wallet: boolean;
  binance?: boolean;
}

export function Checkout() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("stripe");
  const [couponCode, setCouponCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [gateways, setGateways] = useState<PaymentGateways>({ stripe: true, crypto: true, wallet: true });
  const [gatewaysLoaded, setGatewaysLoaded] = useState(false);

  const { data: cart, isLoading } = useGetCart();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Load enabled payment gateways from backend (reads your external DB settings)
  useEffect(() => {
    fetch(`${API_BASE}/payment/config`)
      .then(r => r.json())
      .then(data => {
        if (data.gateways) {
          setGateways(data.gateways);
          // Auto-select first enabled method
          if (data.gateways.stripe) setPaymentMethod("stripe");
          else if (data.gateways.crypto) setPaymentMethod("crypto");
          else if (data.gateways.wallet) setPaymentMethod("wallet");
        }
      })
      .catch(() => {/* keep defaults */})
      .finally(() => setGatewaysLoaded(true));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cart || cart.items.length === 0) return;
    setSubmitting(true);
    setError("");

    const origin = window.location.origin;
    const successUrl = `${origin}/order-success`;
    const cancelUrl = `${origin}/checkout`;

    const items = cart.items.map(item => ({
      productId: item.productId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
    }));

    try {
      if (paymentMethod === "stripe") {
        // ── Stripe Checkout ──────────────────────────────────────────────────
        const res = await fetch(`${API_BASE}/payment/stripe/session`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, name, items, successUrl, cancelUrl }),
        });
        const data = await res.json() as { url?: string; error?: string; orderId?: number };

        if (!res.ok || !data.url) {
          throw new Error(data.error ?? "Failed to create Stripe payment session");
        }

        // Redirect to Stripe's hosted payment page
        window.location.href = data.url;

      } else if (paymentMethod === "crypto") {
        // ── Cryptomus Checkout ───────────────────────────────────────────────
        const res = await fetch(`${API_BASE}/payment/cryptomus/create`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, name, items, successUrl }),
        });
        const data = await res.json() as { url?: string; error?: string; orderId?: number };

        if (!res.ok || !data.url) {
          throw new Error(data.error ?? "Failed to create crypto payment");
        }

        // Redirect to Cryptomus payment page
        window.location.href = data.url;

      } else {
        // ── UM1 Wallet / direct order ────────────────────────────────────────
        const auth = localStorage.getItem("um1_token") ?? "";
        const res = await fetch(`${API_BASE}/orders/checkout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(auth ? { Authorization: `Bearer ${auth}` } : {}),
          },
          body: JSON.stringify({ name, email, paymentMethod: "wallet", couponCode: couponCode || null }),
        });
        const data = await res.json() as { orderId?: number; message?: string; error?: string };

        if (!res.ok) throw new Error(data.error ?? "Checkout failed");
        toast({ title: "Order Confirmed", description: data.message });
        setLocation(`/order-success?orderId=${data.orderId}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Payment failed";
      setError(msg);
      toast({ title: "Payment Failed", description: msg, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="container mx-auto py-12 px-4"><Skeleton className="h-[600px] w-full max-w-4xl mx-auto" /></div>;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto py-24 px-4 text-center">
        <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
        <Button asChild><Link href="/shop">Browse Marketplace</Link></Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} id="checkout-form" className="space-y-6">

            {/* Contact Info */}
            <Card>
              <CardHeader><CardTitle>Contact Information</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" required value={name} onChange={e => setName(e.target.value)} placeholder="John Smith" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="john@example.com" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader><CardTitle>Payment Method</CardTitle></CardHeader>
              <CardContent>
                {!gatewaysLoaded ? (
                  <div className="flex gap-4">
                    {[1,2,3].map(i => <Skeleton key={i} className="h-24 flex-1 rounded-lg" />)}
                  </div>
                ) : (
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="grid grid-cols-1 md:grid-cols-3 gap-4">

                    {gateways.stripe && (
                      <div>
                        <RadioGroupItem value="stripe" id="stripe" className="peer sr-only" />
                        <Label htmlFor="stripe" className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-background p-4 hover:bg-muted cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 transition-colors">
                          <CreditCard className="mb-3 h-6 w-6" />
                          <span className="font-semibold">Credit / Debit Card</span>
                          <span className="text-[10px] text-muted-foreground mt-1">Visa · Mastercard · Amex</span>
                        </Label>
                      </div>
                    )}

                    {gateways.crypto && (
                      <div>
                        <RadioGroupItem value="crypto" id="crypto" className="peer sr-only" />
                        <Label htmlFor="crypto" className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-background p-4 hover:bg-muted cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 transition-colors">
                          <Bitcoin className="mb-3 h-6 w-6" />
                          <span className="font-semibold">Cryptocurrency</span>
                          <span className="text-[10px] text-muted-foreground mt-1">BTC · ETH · USDT · 100+ coins</span>
                        </Label>
                      </div>
                    )}

                    {gateways.wallet && (
                      <div>
                        <RadioGroupItem value="wallet" id="wallet" className="peer sr-only" />
                        <Label htmlFor="wallet" className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-background p-4 hover:bg-muted cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 transition-colors">
                          <Wallet className="mb-3 h-6 w-6" />
                          <span className="font-semibold">UM1 Wallet</span>
                          <span className="text-[10px] text-muted-foreground mt-1">Instant · No fees</span>
                        </Label>
                      </div>
                    )}

                  </RadioGroup>
                )}

                {/* Method description */}
                {paymentMethod === "stripe" && (
                  <p className="text-sm text-muted-foreground mt-4 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                    You will be redirected to Stripe's secure payment page. All major cards accepted.
                  </p>
                )}
                {paymentMethod === "crypto" && (
                  <p className="text-sm text-muted-foreground mt-4 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                    You will be redirected to Cryptomus to pay in BTC, ETH, USDT, or 100+ other cryptocurrencies.
                  </p>
                )}
                {paymentMethod === "wallet" && (
                  <p className="text-sm text-muted-foreground mt-4 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                    Your UM1 Wallet balance will be used instantly. No extra fees.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </form>
        </div>

        {/* Order Summary */}
        <div>
          <Card className="sticky top-24 border-primary/20">
            <CardHeader><CardTitle>Order Summary</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="max-h-64 overflow-y-auto space-y-3 pr-1">
                {cart.items.map(item => (
                  <div key={item.productId} className="flex justify-between items-start text-sm">
                    <div className="flex-1 pr-4">
                      <span className="font-medium block">{item.name}</span>
                      <span className="text-muted-foreground text-xs">Qty: {item.quantity}</span>
                    </div>
                    <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {paymentMethod === "wallet" && (
                <div className="pt-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Coupon code"
                      value={couponCode}
                      onChange={e => setCouponCode(e.target.value)}
                      className="h-9 text-sm"
                    />
                    <Button variant="secondary" size="sm" className="shrink-0" type="button">Apply</Button>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t space-y-2">
                <div className="flex justify-between text-muted-foreground text-sm">
                  <span>Subtotal</span>
                  <span>${cart.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-xl pt-2">
                  <span>Total</span>
                  <span className="text-primary">${cart.total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-3">
              <Button
                type="submit"
                form="checkout-form"
                className="w-full h-12 text-base font-bold"
                disabled={submitting || !gatewaysLoaded}
              >
                {submitting ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing…</>
                ) : paymentMethod === "stripe" ? (
                  <><CreditCard className="w-4 h-4 mr-2" /> Pay ${cart.total.toFixed(2)} with Card</>
                ) : paymentMethod === "crypto" ? (
                  <><Bitcoin className="w-4 h-4 mr-2" /> Pay ${cart.total.toFixed(2)} with Crypto</>
                ) : (
                  <><Wallet className="w-4 h-4 mr-2" /> Pay ${cart.total.toFixed(2)} from Wallet</>
                )}
              </Button>
              <div className="flex items-center justify-center text-xs text-muted-foreground gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                Secure · Encrypted · Escrow Protected
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
