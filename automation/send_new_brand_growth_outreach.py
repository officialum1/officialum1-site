"""
OfficialUM1 New Brand Growth & Launch Acceleration - Cold Outreach Sender
Targets newly launched & growing brands in Dubai/UAE, US, and UK to help them scale fast.
"""
import os
import sys
import json
import time
import random
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.utils import formatdate, make_msgid

_current_dir = os.path.dirname(os.path.abspath(__file__))
if _current_dir not in sys.path:
    sys.path.insert(0, _current_dir)

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

from crm_sync import sync_outreach_to_crm

CONFIG_FILE = os.path.join(os.path.dirname(__file__), "config.json")
NEW_BRANDS_LEADS_FILE = os.path.join(os.path.dirname(__file__), "leads_new_growing_brands.json")
SENT_HISTORY_FILE = os.path.join(os.path.dirname(__file__), "sent_outreach_history.json")

def load_config():
    with open(CONFIG_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def load_leads():
    if os.path.exists(NEW_BRANDS_LEADS_FILE):
        with open(NEW_BRANDS_LEADS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return []

def load_sent_history():
    if not os.path.exists(SENT_HISTORY_FILE):
        return []
    try:
        with open(SENT_HISTORY_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return []

def record_sent(lead, campaign_type="NEW_BRAND_GROWTH", status="DELIVERED"):
    history = load_sent_history()
    email = lead["emails"][0] if lead.get("emails") else ""
    history.append({
        "clientName": lead.get("clientName", ""),
        "company": lead.get("company", ""),
        "domain": lead.get("domain", ""),
        "email": email,
        "campaign": campaign_type,
        "status": status,
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
    })
    try:
        with open(SENT_HISTORY_FILE, "w", encoding="utf-8") as f:
            json.dump(history, f, indent=2)
    except Exception as e:
        print(f"  [Warning saving history]: {e}")

    # Automatically sync with OfficialUM1 Admin CRM
    sync_outreach_to_crm(lead, campaign_tag="New Brand Growth Acceleration", status="In Progress", budget=1800)

NEW_BRAND_GROWTH_PITCH = """Hi {client_name},

Congratulations on the recent launch of {company} ({domain})!

Building momentum for a newly launched {industry} brand in {city} can be tough when older legacy companies dominate the search results.

Most new operators either:
1. Pay heavy 20%-30% commission cuts to third-party booking platforms (Viator/Tripadvisor), or
2. Run expensive ads to slow websites that convert less than 2% of mobile visitors.

At OfficialUM1 LLC, we specialize in 0-to-1 growth acceleration for new brands:
- We engineer custom, sub-500ms direct booking pages with 1-click Apple Pay & Card checkout (0% commission).
- We fast-track your Google.ae Local 3-Pack and organic rankings to start capturing ready-to-book tourists within 30 days.
- We handle your end-to-end digital infrastructure so you can focus 100% on delivering great customer experiences.

Would you be open to a complimentary "30-Day New Brand Growth Roadmap" for {domain} showing how to outrank local competitors this month?

Happy to send over a quick 2-minute breakdown if you're interested.

Best regards,

Muhammad Umar
Founder & Principal Engineer | OfficialUM1 LLC
New Brand Growth & Web Engineering
Direct: hello@officialum1.com
Website: https://officialum1.com/services/tourism-seo-dubai
"""

def send_email(smtp_cfg, to_email, subject, body_text):
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"{smtp_cfg['sender_name']} <{smtp_cfg['email']}>"
    msg["To"] = to_email
    msg["Reply-To"] = smtp_cfg["reply_to"]
    msg["Date"] = formatdate(localtime=True)
    msg["Message-ID"] = make_msgid(domain="officialum1.com")

    msg.attach(MIMEText(body_text, "plain", "utf-8"))

    if smtp_cfg.get("use_ssl", True):
        with smtplib.SMTP_SSL(smtp_cfg["host"], smtp_cfg["port"], timeout=20) as server:
            server.login(smtp_cfg["email"], smtp_cfg["password"])
            server.sendmail(smtp_cfg["email"], [to_email], msg.as_string())
    else:
        with smtplib.SMTP(smtp_cfg["host"], smtp_cfg["port"], timeout=20) as server:
            server.starttls()
            server.login(smtp_cfg["email"], smtp_cfg["password"])
            server.sendmail(smtp_cfg["email"], [to_email], msg.as_string())

def run_new_brand_campaign(max_emails=25, delay_range=(15, 30)):
    cfg = load_config()
    smtp_cfg = cfg["smtp"]
    leads = load_leads()
    sent_history = load_sent_history()
    already_sent_emails = {h["email"].lower() for h in sent_history if "email" in h}

    print("=" * 70)
    print(" 🚀 OFFICIALUM1 LLC - NEW BRAND GROWTH & ACCELERATION OUTREACH")
    print(f" Target: New & Fast-Growing Brands in UAE / US / UK")
    print(f" Total Leads Available: {len(leads)}")
    print(f" Batch Limit: {max_emails}")
    print("=" * 70)

    sent_count = 0
    for idx, lead in enumerate(leads, 1):
        if sent_count >= max_emails:
            print(f"\n[OK] Reached target limit of {max_emails} emails sent.")
            break

        emails = lead.get("emails", [])
        if not emails:
            continue

        target_email = emails[0].strip()
        if target_email.lower() in already_sent_emails:
            print(f"[{idx}/{len(leads)}] Skipping {target_email} (Already in history)")
            continue

        client_name = lead.get("clientName", "Founder")
        company = lead.get("company", "your brand")
        domain = lead.get("domain", "your website")
        city = lead.get("city", "Dubai")
        industry = lead.get("industry", "Tourism & Safari")

        subject = f"Growth roadmap & direct bookings for {company} ({domain})"
        body = NEW_BRAND_GROWTH_PITCH.format(
            client_name=client_name,
            company=company,
            domain=domain,
            city=city,
            industry=industry
        )

        print(f"\n[{idx}/{len(leads)}] Pitching New Brand Growth to: {company} ({target_email})...")
        try:
            send_email(smtp_cfg, target_email, subject, body)
            record_sent(lead, campaign_type="NEW_BRAND_GROWTH", status="DELIVERED")
            already_sent_emails.add(target_email.lower())
            sent_count += 1
            print(f"  ✅ Sent successfully to {target_email} | Synced to CRM ($1,800 deal)")

            if sent_count < max_emails:
                wait_time = random.randint(delay_range[0], delay_range[1])
                print(f"  ⏳ Waiting {wait_time}s before next send...")
                time.sleep(wait_time)

        except Exception as e:
            print(f"  ❌ Error sending to {target_email}: {e}")
            record_sent(lead, campaign_type="NEW_BRAND_GROWTH", status=f"FAILED: {str(e)[:50]}")

    print("\n" + "=" * 70)
    print(f"🎉 NEW BRAND GROWTH CAMPAIGN COMPLETED: {sent_count} emails delivered!")
    print("=" * 70)

if __name__ == "__main__":
    count = 25
    if len(sys.argv) > 1:
        try:
            count = int(sys.argv[1])
        except ValueError:
            pass
    run_new_brand_campaign(max_emails=count, delay_range=(15, 25))
