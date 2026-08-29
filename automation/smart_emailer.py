"""
OfficialUM1 Cold Email Outreach Engine
High-converting personalized B2B outreach with anti-spam delays and professional formatting.
"""
import smtplib
import time
import random
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
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
    }
}

def send_outreach_email(
    smtp_config: Dict[str, Any],
    lead: Dict[str, Any],
    template_id: str = "1"
) -> bool:
    recipient_email = lead["emails"][0] if lead.get("emails") else lead.get("buyerEmail")
    if not recipient_email:
        return False

    template = TEMPLATES.get(template_id, TEMPLATES["1"])
    client_name = lead.get("clientName") or "Founder"
    domain = lead.get("domain") or lead.get("website", "your website")

    subject = template["subject"].format(client_name=client_name, website_domain=domain)
    body = template["body"].format(client_name=client_name, website_domain=domain)

    msg = MIMEMultipart()
    msg['From'] = f"{smtp_config.get('sender_name', 'OfficialUM1 LLC')} <{smtp_config['email']}>"
    msg['To'] = recipient_email
    msg['Subject'] = subject
    msg.attach(MIMEText(body, 'plain'))

    try:
        if smtp_config.get("use_ssl", True):
            server = smtplib.SMTP_SSL(smtp_config["host"], smtp_config.get("port", 465), timeout=12)
        else:
            server = smtplib.SMTP(smtp_config["host"], smtp_config.get("port", 587), timeout=12)
            server.starttls()

        server.login(smtp_config["email"], smtp_config["password"])
        server.send_message(msg)
        server.quit()
        return True
    except Exception as e:
        print(f"  ❌ SMTP Error sending to {recipient_email}: {e}")
        return False
