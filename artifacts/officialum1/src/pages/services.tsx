import { useListServices } from "@workspace/api-client-react";
import { SEO } from "@/components/SEO";
import { makeSimpleBreadcrumbs, makeServiceSchema, makeFAQSchema, SITE_URL } from "@/lib/seo";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowRight } from "lucide-react";
import { Link } from "wouter";

export function Services() {
  const { data: services, isLoading } = useListServices();

  return (
    <div className="min-h-screen py-16">
      <SEO
        title="Digital Services — SEO, Web Development & Social Media Management"
        description="Grow your brand with OfficialUM1's expert digital services: SEO, web development, US company formation, social media management, and more. Trusted by 1700+ clients."
        keywords="SEO services, web development agency, social media management, US company formation, digital marketing services"
        breadcrumbs={makeSimpleBreadcrumbs({ name: "Services", href: "/services" })}
        type="website"
      />
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="outline" className="mb-4 border-primary/50 text-primary">Digital Agency</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Premium Digital Services</h1>
          <p className="text-xl text-muted-foreground">
            Scale your brand with our expert SEO, web development, and social media management services.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-96 bg-card/50 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services?.map(service => (
              <Card key={service.id} className={`bg-card/40 backdrop-blur-sm border-border/50 flex flex-col relative overflow-hidden transition-all duration-300 hover:border-primary/50 ${service.popular ? 'ring-1 ring-primary/50' : ''}`}>
                {service.popular && (
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg z-10">
                    Most Popular
                  </div>
                )}
                
                {/* Neon glow effect for popular */}
                {service.popular && (
                  <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 blur-[50px] rounded-full pointer-events-none" />
                )}
                
                <CardHeader className="pb-4 relative z-10">
                  <div className="text-4xl mb-4 opacity-80">{service.icon}</div>
                  <CardTitle className="text-2xl">{service.title}</CardTitle>
                  <CardDescription className="text-base">{service.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 relative z-10">
                  <div className="mb-6">
                    <span className="text-3xl font-bold text-foreground">
                      {service.price ? `$${service.price}` : "Custom"}
                    </span>
                    <span className="text-muted-foreground ml-2 text-sm">{service.priceLabel}</span>
                  </div>
                  <ul className="space-y-3">
                    {service.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <Check className="w-5 h-5 text-primary shrink-0 mr-3" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="pt-4 relative z-10 border-t border-border/30 mt-4">
                  <Button className="w-full" variant={service.popular ? "default" : "outline"} asChild>
                    <Link href={`/contact?service=${encodeURIComponent(service.title)}`}>
                      Get Started <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
