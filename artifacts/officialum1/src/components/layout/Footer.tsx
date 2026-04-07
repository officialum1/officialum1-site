import { Link } from "wouter";
import { useSubscribeNewsletter } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Twitter, Instagram, MessageCircle, ArrowRight } from "lucide-react";

const FOOTER_LINKS = {
  Marketplace: [
    { label: "Browse All Accounts", href: "/shop" },
    { label: "Bundle Builder", href: "/bundles" },
    { label: "Account Builder (VIP)", href: "/builder" },
    { label: "Wishlist", href: "/wishlist" },
    { label: "Membership Plans", href: "/membership" },
  ],
  Services: [
    { label: "Digital Services", href: "/services" },
    { label: "Our Work & Case Studies", href: "/work" },
    { label: "SEO & Link Building", href: "/services" },
    { label: "Web Development", href: "/services" },
    { label: "Get a Quote", href: "/contact" },
  ],
  Company: [
    { label: "About OfficialUM1", href: "/about" },
    { label: "Blog & Insights", href: "/blog" },
    { label: "Client Reviews", href: "/reviews" },
    { label: "Share Your Experience", href: "/share-experience" },
    { label: "Referral Program", href: "/refer" },
  ],
  Support: [
    { label: "Help Center", href: "/support" },
    { label: "FAQ", href: "/faq" },
    { label: "Knowledge Base", href: "/kb" },
    { label: "Contact Us", href: "/contact" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy" },
  ],
};

export function Footer() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const subscribe = useSubscribeNewsletter();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    subscribe.mutate({ data: { email } }, {
      onSuccess: () => {
        toast({ title: "Subscribed!", description: "Welcome to OfficialUM1 — you'll be the first to know about new deals." });
        setEmail("");
      },
      onError: () => {
        toast({ title: "Error", description: "Could not subscribe. Please try again.", variant: "destructive" });
      }
    });
  };

  return (
    <footer className="bg-card/50 border-t border-border/40 mt-auto">
      {/* Newsletter banner */}
      <div className="border-b border-border/30 bg-primary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-foreground">Stay in the loop</h3>
              <p className="text-muted-foreground text-sm mt-1">Get exclusive deals, new account drops, and digital growth tips.</p>
            </div>
            <form onSubmit={handleSubscribe} className="flex gap-2 w-full md:w-auto md:min-w-[340px]">
              <Input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="flex-1 bg-background border-border/60 focus:border-primary/50 h-10"
                required
              />
              <Button type="submit" disabled={subscribe.isPending} className="h-10 px-4 shrink-0 gap-1 font-semibold">
                Subscribe <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Main footer grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">

          {/* Brand col */}
          <div className="sm:col-span-2 lg:col-span-1 space-y-4">
            <Link href="/" className="flex items-center gap-2 group w-fit">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-black text-xs">
                U1
              </div>
              <span className="font-bold text-base"><span className="text-primary">Official</span>UM1</span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Pakistan's trusted digital account marketplace and agency. Premium accounts, expert services, guaranteed results.
            </p>
            <div className="flex items-center gap-2">
              <a href="https://twitter.com/officialum1" target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg border border-border/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 transition-all">
                <Twitter className="w-3.5 h-3.5" />
              </a>
              <a href="https://instagram.com/officialum1" target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg border border-border/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 transition-all">
                <Instagram className="w-3.5 h-3.5" />
              </a>
              <a href="https://discord.gg/officialum1" target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg border border-border/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 transition-all">
                <MessageCircle className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading} className="space-y-3">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-widest">{heading}</h4>
              <ul className="space-y-2">
                {links.map((link, idx) => (
                  <li key={`${heading}-${idx}`}>
                    <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border/30 mt-10 sm:mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} OfficialUM1. All rights reserved. Made in Pakistan 🇵🇰
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
            <Link href="/contact" className="hover:text-primary transition-colors">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
