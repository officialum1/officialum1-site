import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Crown, Shield, Star } from "lucide-react";
import { SEO } from "@/components/SEO";
import { makeSimpleBreadcrumbs } from "@/lib/seo";

export function Membership() {
  return (
    <div className="container mx-auto py-16 px-4 max-w-5xl">
      <SEO
        title="Membership Plans — OfficialUM1 VIP & Elite"
        description="Unlock premium benefits with OfficialUM1 membership. VIP and Elite tiers give you priority support, exclusive discounts, early access to new accounts, and more."
        keywords="officialum1 membership, VIP plan, elite plan, digital marketplace membership, premium benefits"
        breadcrumbs={makeSimpleBreadcrumbs({ name: "Membership", href: "/membership" })}
        type="website"
      />
      <div className="text-center mb-16 space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Premium Memberships</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Unlock exclusive discounts, priority support, and early access to premium accounts.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Silver Plan */}
        <Card className="bg-card/40 border-border/50 flex flex-col relative overflow-hidden">
          <CardHeader className="text-center pb-8 pt-10">
            <div className="mx-auto w-16 h-16 bg-slate-400/20 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-slate-300" />
            </div>
            <CardTitle className="text-2xl mb-2">Silver</CardTitle>
            <div className="text-4xl font-bold text-foreground">
              $29<span className="text-lg text-muted-foreground font-normal">/month</span>
            </div>
          </CardHeader>
          <CardContent className="flex-1 px-8">
            <ul className="space-y-4">
              {[
                "10% discount on all accounts",
                "Standard support (24hr response)",
                "Access to private community",
                "Monthly SEO audit report"
              ].map((feature, i) => (
                <li key={i} className="flex items-center text-muted-foreground">
                  <CheckCircle className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter className="p-8 pt-4">
            <Button className="w-full bg-slate-200 hover:bg-slate-300 text-slate-900" size="lg">
              Get Silver
            </Button>
          </CardFooter>
        </Card>

        {/* Gold Plan */}
        <Card className="bg-card/60 border-primary/50 relative overflow-hidden flex flex-col shadow-[0_0_30px_-5px_rgba(0,255,136,0.15)]">
          <div className="absolute top-0 inset-x-0 h-1 bg-primary"></div>
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 blur-[50px] rounded-full pointer-events-none" />
          
          <div className="absolute top-4 right-4">
            <span className="bg-primary/20 text-primary text-xs font-bold px-3 py-1 rounded-full border border-primary/30">
              POPULAR
            </span>
          </div>
          
          <CardHeader className="text-center pb-8 pt-10 relative z-10">
            <div className="mx-auto w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
              <Crown className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl mb-2">Gold Elite</CardTitle>
            <div className="text-4xl font-bold text-foreground">
              $79<span className="text-lg text-muted-foreground font-normal">/month</span>
            </div>
          </CardHeader>
          <CardContent className="flex-1 px-8 relative z-10">
            <ul className="space-y-4">
              {[
                "25% discount on all accounts",
                "Priority 1-hour support",
                "Early access to premium drops",
                "Weekly advanced SEO audits",
                "Dedicated account manager",
                "Free monthly basic service"
              ].map((feature, i) => (
                <li key={i} className="flex items-center text-foreground font-medium">
                  <CheckCircle className="w-5 h-5 text-primary mr-3 shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter className="p-8 pt-4 relative z-10">
            <Button className="w-full" size="lg">
              Upgrade to Gold
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
