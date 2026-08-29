import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Refund Policy | OfficialUM1",
  description: "Read our 7-day refund and cancellation policy.",
  alternates: {
    canonical: `${SITE_URL}/refund`,
  },
};

export default function RefundPage() {
  return (
    <main className="inner-page" style={{ position: "relative", paddingTop: "80px" }}>
      <Navbar />

      <section className="section-padding bg-white" style={{ minHeight: "60vh" }}>
        <div className="container" style={{ maxWidth: "800px" }}>
          <h1
            className="mb-8 text-4xl font-black"
            style={{ fontFamily: "var(--font-space-grotesk)", color: "var(--text-primary)" }}
          >
            Refund & Cancellation Policy
          </h1>
          <p className="mb-4 text-sm text-gray-500">Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
          
          <div className="prose max-w-none" style={{ color: "var(--text-muted)", lineHeight: "1.8" }}>
            <p className="mb-6">
              At <strong>OfficialUM1 LLC</strong>, we strive to ensure our customers are fully satisfied with our digital marketing services, web development, and digital assets. We understand that sometimes things don't work out as expected.
            </p>

            <h2 className="mt-8 mb-4 text-2xl font-bold" style={{ color: "var(--text-primary)" }}>1. 7-Day Refund Policy</h2>
            <p className="mb-6">
              We offer a strict <strong>7-Day Money-Back Guarantee</strong> on our eligible services and digital products. If you are not completely satisfied with your purchase, you may request a full refund within 7 days of the original transaction date.
            </p>

            <h2 className="mt-8 mb-4 text-2xl font-bold" style={{ color: "var(--text-primary)" }}>2. Eligibility for Refunds</h2>
            <p className="mb-4">
              To be eligible for a refund, your request must meet the following criteria:
            </p>
            <ul className="list-disc pl-6 mb-6">
              <li className="mb-2">The refund request is submitted within 7 calendar days of the purchase date.</li>
              <li className="mb-2">For digital products, you have encountered a technical issue that our support team is unable to resolve.</li>
              <li className="mb-2">For service retainers (e.g., SEO, Social Media Management), a refund can only be issued for the unrendered portion of the service within the first 7 days.</li>
              <li className="mb-2">Setup fees and administrative costs (if any) are non-refundable.</li>
            </ul>

            <h2 className="mt-8 mb-4 text-2xl font-bold" style={{ color: "var(--text-primary)" }}>3. Non-Refundable Items</h2>
            <p className="mb-6">
              Certain services and assets are non-refundable after delivery, including:
            </p>
            <ul className="list-disc pl-6 mb-6">
              <li className="mb-2">Guest Posts and Backlink insertions once published.</li>
              <li className="mb-2">Custom web development projects after the final delivery and approval.</li>
              <li className="mb-2">Digital assets that have already been accessed, downloaded, or transferred successfully without technical defects.</li>
            </ul>

            <h2 className="mt-8 mb-4 text-2xl font-bold" style={{ color: "var(--text-primary)" }}>4. How to Request a Refund</h2>
            <p className="mb-6">
              To request a refund, please contact our support team at <strong>hello@officialum1.com</strong>. Include your order ID, the email address used for the purchase, and a brief explanation of why you are requesting a refund. Our team will review your request and respond within 24-48 business hours.
            </p>

            <h2 className="mt-8 mb-4 text-2xl font-bold" style={{ color: "var(--text-primary)" }}>5. Processing Time</h2>
            <p className="mb-6">
              If your refund is approved, it will be processed, and a credit will automatically be applied to your original method of payment (e.g., your credit card via Stripe). Please allow 5-10 business days for the refund to reflect on your bank statement.
            </p>

            <h2 className="mt-8 mb-4 text-2xl font-bold" style={{ color: "var(--text-primary)" }}>6. Cancellations</h2>
            <p className="mb-6">
              If you have an ongoing monthly subscription with us, you can cancel it at any time. Cancellations will take effect at the end of the current billing cycle. You will not be charged for the following month, but no partial refunds are provided for the remainder of the current month.
            </p>

            <h2 className="mt-8 mb-4 text-2xl font-bold" style={{ color: "var(--text-primary)" }}>7. Contact Information</h2>
            <p className="mb-2">
              If you have any questions about our Refund Policy, please contact us at:
            </p>
            <p className="mb-1"><strong>OfficialUM1 LLC</strong></p>
            <p className="mb-1">1001 South Main Street, Suite 600</p>
            <p className="mb-1">Kalispell, MT 59901, USA</p>
            <p className="mb-1">Email: hello@officialum1.com</p>
            <p className="mb-6">Phone: +92 323 7102924</p>

          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
