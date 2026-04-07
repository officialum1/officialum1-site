import { SEO } from "@/components/SEO";
import { makeSimpleBreadcrumbs } from "@/lib/seo";

export function Privacy() {
  return (
    <div className="container mx-auto py-16 px-4 max-w-3xl prose prose-invert prose-primary">
      <SEO
        title="Privacy Policy — OfficialUM1"
        description="OfficialUM1 Privacy Policy — how we collect, use, and protect your personal data when you use our digital marketplace and agency services."
        noindex={true}
        breadcrumbs={makeSimpleBreadcrumbs({ name: "Privacy Policy", href: "/privacy" })}
      />
      <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
      <p className="text-muted-foreground mb-8">Last updated: October 2023</p>
      
      <h2>1. Information We Collect</h2>
      <p>We collect information you provide directly to us when you register for an account, make a purchase, or contact our support team. This includes your name, email address, and payment information.</p>
      
      <h2>2. How We Use Your Information</h2>
      <p>We use the information we collect to provide, maintain, and improve our services, to process transactions, and to communicate with you about your account and our products.</p>
      
      <h2>3. Information Sharing</h2>
      <p>We do not share your personal information with third parties except as necessary to provide our services (such as payment processing) or as required by law.</p>
      
      <h2>4. Data Security</h2>
      <p>We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
    </div>
  );
}

export function Terms() {
  return (
    <div className="container mx-auto py-16 px-4 max-w-3xl prose prose-invert prose-primary">
      <SEO
        title="Terms of Service — OfficialUM1"
        description="OfficialUM1 Terms of Service — rules and policies governing use of our digital marketplace and agency services."
        noindex={true}
        breadcrumbs={makeSimpleBreadcrumbs({ name: "Terms of Service", href: "/terms" })}
      />
      <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
      <p className="text-muted-foreground mb-8">Last updated: October 2023</p>
      
      <h2>1. Acceptance of Terms</h2>
      <p>By accessing or using OfficialUM1's services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.</p>
      
      <h2>2. Account Responsibilities</h2>
      <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. Digital accounts purchased through our platform are subject to the respective platform's terms of service.</p>
      
      <h2>3. Purchases and Refunds</h2>
      <p>All sales of digital products and accounts are final. Refunds are only issued in cases where the delivered product substantially differs from its description, subject to our verification.</p>
      
      <h2>4. Service Delivery</h2>
      <p>We strive to deliver digital services within the specified timeframes. However, delivery times for services like SEO and social media management may vary based on project complexity.</p>
    </div>
  );
}
