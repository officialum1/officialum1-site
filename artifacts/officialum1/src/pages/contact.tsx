import { useState } from "react";
import { useSubmitContact } from "@workspace/api-client-react";
import { SEO } from "@/components/SEO";
import { makeSimpleBreadcrumbs } from "@/lib/seo";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Mail, MessageCircle, MapPin, Send, ExternalLink } from "lucide-react";

const SERVICE_OPTIONS = [
  "Web Development",
  "SEO & Backlinks",
  "Social Media Marketing",
  "Rent a Pre-Ranked Site",
  "Start a Support Ticket",
  "Other",
];

export function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [service, setService] = useState("");
  const [message, setMessage] = useState("");

  const submitContact = useSubmitContact();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitContact.mutate({ data: { name, email, subject: service || "General Inquiry", message } }, {
      onSuccess: () => {
        toast({ title: "Inquiry Sent", description: "We'll get back to you with a clear plan and next steps." });
        setName("");
        setEmail("");
        setService("");
        setMessage("");
      },
      onError: () => {
        toast({ title: "Error", description: "Failed to send message. Please try again.", variant: "destructive" });
      }
    });
  };

  return (
    <div className="min-h-screen">
      <SEO
        title="Contact OfficialUM1 — Get in Touch"
        description="Contact OfficialUM1 via email, WhatsApp, or our contact form. We respond within 24 hours. hello@officialum1.com | +92 323 7102924"
        keywords="contact officialum1, support, help, email, whatsapp"
        breadcrumbs={makeSimpleBreadcrumbs({ name: "Contact", href: "/contact" })}
        type="website"
      />
      {/* Hero */}
      <div className="pt-24 pb-10 border-b border-border/30 bg-card/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <p className="text-primary text-xs sm:text-sm font-semibold uppercase tracking-wider mb-2">Contact</p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground mb-3">Let's build something that wins</h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-xl">
            Tell us what you're trying to achieve. We'll reply fast with a clear plan and next steps.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">

          {/* Contact info */}
          <div className="space-y-4">
            <Card className="bg-card/40 border-border/50 hover:border-primary/40 transition-all">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">Email</h3>
                  <a href="mailto:hello@officialum1.com" className="text-primary hover:underline text-sm">hello@officialum1.com</a>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/40 border-border/50 hover:border-primary/40 transition-all">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">WhatsApp</h3>
                  <a href="https://wa.me/923237102924" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm">
                    +92 323 7102924
                  </a>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/40 border-border/50 hover:border-primary/40 transition-all">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">HQ</h3>
                  <p className="text-muted-foreground text-sm">Sahiwal, Punjab, Pakistan</p>
                  <a
                    href="https://maps.app.goo.gl/vq49Dk3RSGwaizaBF"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline text-xs flex items-center gap-1 mt-1"
                  >
                    View Map Location <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact form */}
          <div className="lg:col-span-2">
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle>Send a Message</CardTitle>
                <CardDescription>Fill out the form below and we'll respond within 24 hours.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        placeholder="Your full name"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        required
                        className="bg-background/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        className="bg-background/50"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="service">Service Inquiry</Label>
                    <Select value={service} onValueChange={setService}>
                      <SelectTrigger className="h-11 bg-background/50 border-border/60">
                        <SelectValue placeholder="Select a service..." />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        {SERVICE_OPTIONS.map(opt => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Tell us what you're trying to achieve..."
                      rows={5}
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      required
                      className="bg-background/50 resize-none"
                    />
                  </div>

                  <Button type="submit" className="w-full mt-2 h-11" disabled={submitContact.isPending}>
                    <Send className="w-4 h-4 mr-2" />
                    {submitContact.isPending ? "Sending..." : "Submit inquiry"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
