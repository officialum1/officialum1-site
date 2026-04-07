import { useGetMe } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Copy, Gift, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

export function Refer() {
  const { data: user } = useGetMe();
  const { toast } = useToast();

  const handleCopy = () => {
    if (user?.referralCode) {
      navigator.clipboard.writeText(`https://officialum1.com/register?ref=${user.referralCode}`);
      toast({ title: "Copied!", description: "Referral link copied to clipboard." });
    }
  };

  return (
    <div className="container mx-auto py-16 px-4 max-w-4xl">
      <SEO
        title="Refer & Earn — OfficialUM1 Affiliate Program"
        description="Invite friends to OfficialUM1 and earn 10% commission on every purchase they make. Share your link and start earning today."
        keywords="officialum1 referral, affiliate program, earn commission, refer a friend"
        noindex={true}
      />
      <div className="text-center mb-16">
        <div className="w-16 h-16 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
          <Gift className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-bold mb-4">Refer & Earn</h1>
        <p className="text-xl text-muted-foreground">
          Invite friends to OfficialUM1 and earn 10% commission on their first purchase.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="bg-card/40 border border-border/50 rounded-xl p-6 text-center">
          <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-6 h-6 text-foreground" />
          </div>
          <h3 className="font-bold mb-2">1. Share Your Link</h3>
          <p className="text-sm text-muted-foreground">Send your unique referral link to friends and colleagues.</p>
        </div>
        <div className="bg-card/40 border border-border/50 rounded-xl p-6 text-center">
          <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-6 h-6 text-foreground" />
          </div>
          <h3 className="font-bold mb-2">2. They Register</h3>
          <p className="text-sm text-muted-foreground">They sign up and get an instant $5 bonus in their wallet.</p>
        </div>
        <div className="bg-card/40 border border-border/50 rounded-xl p-6 text-center">
          <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <DollarSign className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-bold mb-2">3. You Get Paid</h3>
          <p className="text-sm text-muted-foreground">You earn 10% of whatever they spend on their first order.</p>
        </div>
      </div>

      <Card className="bg-card/50 border-primary/30 shadow-[0_0_30px_-10px_rgba(0,255,136,0.1)]">
        <CardHeader className="text-center pb-4">
          <CardTitle>Your Referral Link</CardTitle>
          <CardDescription>Share this link to start earning</CardDescription>
        </CardHeader>
        <CardContent>
          {user ? (
            <div className="flex gap-2 max-w-lg mx-auto">
              <Input 
                readOnly 
                value={`https://officialum1.com/register?ref=${user.referralCode}`} 
                className="bg-background/50 font-mono text-sm"
              />
              <Button onClick={handleCopy} className="shrink-0">
                <Copy className="w-4 h-4 mr-2" /> Copy
              </Button>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="mb-4 text-muted-foreground">Please log in to view your referral link.</p>
              <Button asChild><Link href="/login">Log In</Link></Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Temporary icon component for this file
function ShieldCheck(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}