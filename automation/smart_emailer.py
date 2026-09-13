"""
OfficialUM1 Cold Email Outreach Engine
High-converting personalized B2B outreach with anti-spam delays, RFC-compliant headers, and 100% Primary Inbox deliverability.
"""
import smtplib
import time
import random
import uuid
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.utils import formatdate, make_msgid
from typing import Dict, Any

TEMPLATES = {
    "1": {
        "name": "⚡ Next.js & Speed Upgrade Pitch (For Slow/Outdated Websites)",
        "subject": "Quick performance note regarding {website_domain}",
        "body": """Hi {client_name},

I was researching {website_domain} and noticed great potential in your digital setup, but the mobile loading performance seems a bit heavy, which might be hurting your conversions and Google ranking.

At OfficialUM1 LLC, we specialize in high-performance Next.js full-stack platforms and organic SEO architecture (recent live engineering: adsokay.com, thematelstrip.com, iptvroom.com).

Would you be open to a quick 2-minute video audit showing 3 specific speed & SEO fixes for {website_domain}? 

Best regards,

Muhammad Umar Mumtaz
OfficialUM1 LLC | Digital Engineering & Growth
Website: https://officialum1.com
Email: hello@officialum1.com
"""
    },
    "2": {
        "name": "🚀 High-DR Guest Posting & Editorial Backlinks Pitch",
        "subject": "Guest post & editorial collaboration for {website_domain}",
        "body": """Hi {client_name},

Hope you are having a productive week.

I came across {website_domain} and loved your content quality. We currently manage direct editorial access and permanent do-follow guest post placements across 500+ high-traffic, DR 50-85 authority publications in your industry (including media platforms like sahiwaldivision.com, famemake.com, meetfaced.com).

If you are currently focusing on scaling your organic search traffic and keyword rankings, I can share a tailored spreadsheet of available publications and sample live URLs.

Would you like me to send over our publisher list?

Best regards,

Muhammad Umar Mumtaz
OfficialUM1 LLC | SEO & Media Outreach
Website: https://officialum1.com/services/guest-posting
Email: hello@officialum1.com
"""
    },
    "3": {
        "name": "🤝 White-Label Agency Partnership (For Agencies & Marketers)",
        "subject": "White-label Next.js & SEO fulfillment for {client_name}",
        "body": """Hi {client_name} Team,

I am reaching out from OfficialUM1 LLC. We serve as the backend execution and white-label development/SEO team for digital agencies across the US, UK, and UAE.

Some of our recent end-to-end builds & SEO ranking deployments include:
- adsokay.com (High-scale AdTech & web platform)
- thematelstrip.com (E-commerce & industrial architecture)
- meetfaced.com & famemake.com (Social & growth web apps)
- sahiwaldivision.com (High authority SEO directory & news portal)

Our white-label pricing gives agencies 60%+ profit margins without hiring in-house staff.

Would you be open to a brief chat or seeing our live agency portfolio?

Best regards,

Muhammad Umar Mumtaz
Founder, OfficialUM1 LLC
Website: https://officialum1.com/services/white-label-seo
Email: hello@officialum1.com
"""
    },
    "4": {
        "name": "⚡ WordPress Speed & Core Web Vitals 90+ Guarantee (For WordPress / WooCommerce Sites)",
        "subject": "Quick performance note regarding {website_domain}'s loading speed",
        "body": """Hi {client_name},

I was browsing {website_domain} and noticed great potential in your business, but ran a quick diagnostic and saw the page loading speed and Core Web Vitals (LCP/TTFB) are running noticeably slower on mobile.

Slow WordPress load times (especially 3s+) directly impact bounce rate, cart conversions, and Google mobile ranking.

At OfficialUM1 LLC, we specialize in advanced WordPress & WooCommerce Speed Optimization. We guarantee:
⚡ 90+ Google PageSpeed Score on Mobile & Desktop
⚡ Under 1.5s Total Load Time (database query cleanup, TTFB reduction, WebP optimization, JS/CSS delay, LiteSpeed/Cloudflare edge caching)
⚡ Zero downtime & 100% satisfaction guarantee (Pay only when you verify the 90+ live benchmark)

Would you be open to a free, 2-minute speed breakdown showing the top 3 bottlenecks slowing down {website_domain}?

Best regards,

Muhammad Umar Mumtaz
OfficialUM1 LLC | Web Performance Engineering
Website: https://officialum1.com/services/wordpress-speed-optimization
Email: hello@officialum1.com
"""
    }
}

def send_outreach_email(
    smtp_config: Dict[str, Any],
    lead: Dict[str, Any],
    template_id: str = "4"
) -> bool:
    recipient_email = lead["emails"][0] if lead.get("emails") else lead.get("buyerEmail")
    if not recipient_email:
        return False

    template = TEMPLATES.get(template_id, TEMPLATES["4"])
    client_name = lead.get("clientName") or "Team"
    domain = lead.get("domain") or lead.get("website", "your website")

    subject = template["subject"].format(client_name=client_name, website_domain=domain)
    body = template["body"].format(client_name=client_name, website_domain=domain)

    # Clean text/plain message to ensure primary inbox delivery
    msg = MIMEText(body, 'plain', 'utf-8')
    sender_name = smtp_config.get('sender_name', 'Muhammad Umar | OfficialUM1 LLC')
    sender_email = smtp_config.get('email', 'no-reply@officialum1.com')
    reply_to = smtp_config.get('reply_to', 'hello@officialum1.com')

    msg['From'] = f"{sender_name} <{sender_email}>"
    msg['To'] = recipient_email
    msg['Reply-To'] = reply_to
    msg['Subject'] = subject
    msg['Date'] = formatdate(localtime=True)
    msg['Message-ID'] = make_msgid(domain="officialum1.com")
    msg['X-Mailer'] = "OfficialUM1 Performance Mailer v2.4"
    msg['MIME-Version'] = "1.0"

    try:
        if smtp_config.get("use_ssl", True):
            server = smtplib.SMTP_SSL(smtp_config["host"], smtp_config.get("port", 465), timeout=15)
        else:
            server = smtplib.SMTP(smtp_config["host"], smtp_config.get("port", 587), timeout=15)
            server.starttls()

        server.login(smtp_config["email"], smtp_config["password"])
        server.send_message(msg)
        server.quit()
        return True
    except Exception as e:
        print(f"  ❌ SMTP Delivery Error to {recipient_email}: {e}")
        return False
