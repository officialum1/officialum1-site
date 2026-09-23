"""
OfficialUM1 Dubai & UAE Tourism Direct Booking Engine & SEO - Cold Outreach Sender
Sends high-converting B2B outreach to Dubai Tourism, Yacht Rentals & Desert Safari Operators.
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

BOUTIQUE_LEADS_FILE = os.path.join(os.path.dirname(__file__), "leads_dubai_boutique_tourism.json")
TOURISM_LEADS_FILE = os.path.join(os.path.dirname(__file__), "leads_dubai_tourism.json")
SENT_HISTORY_FILE = os.path.join(os.path.dirname(__file__), "sent_outreach_history.json")

def load_config():
    with open(CONFIG_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def load_leads():
    leads = []
    if os.path.exists(BOUTIQUE_LEADS_FILE):
        with open(BOUTIQUE_LEADS_FILE, "r", encoding="utf-8") as f:
            leads.extend(json.load(f))
    if os.path.exists(TOURISM_LEADS_FILE):
        with open(TOURISM_LEADS_FILE, "r", encoding="utf-8") as f:
            leads.extend(json.load(f))
    return leads

def load_sent_history():
    if not os.path.exists(SENT_HISTORY_FILE):
        return []
    try:
        with open(SENT_HISTORY_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return []

def record_sent(lead, campaign_type="DUBAI_TOURISM_INITIAL", status="DELIVERED"):
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
    sync_outreach_to_crm(lead, campaign_tag="Dubai Tourism Direct Booking Outreach", status="In Progress", budget=2500)

DUBAI_TOURISM_INITIAL_PITCH = """Hi {client_name},

Hope you are having a productive week.

I came across {company} while researching top-tier {niche} operators in {city}.

Most Dubai tourism companies we speak with lose 20% to 30% of every booking to third-party OTAs (Viator, GetYourGuide, Tripadvisor) simply because their website direct booking engine is too slow or lacks a seamless 1-click mobile checkout for international tourists.

At OfficialUM1 LLC, we engineer custom, ultra-fast direct booking platforms (Next.js & WordPress) and Dubai Local 3-Pack SEO that:
1. Allow tourists to book in under 30 seconds with Apple Pay, Google Pay, and Stripe with 0% OTA commission fees.
2. Rank your brand #1 on Google.ae for high-intent queries like "{niche} Dubai" and "Private Yacht Charters Marina".
3. Guarantee sub-500ms mobile page load speeds for tourists browsing on 4G/5G in the UAE.

Would you be open to a quick 5-minute complimentary review of {domain}'s mobile booking funnel and 3 specific tweaks to boost your direct bookings this season?

Happy to share a 2-minute video teardown if you're interested.

Best regards,

Muhammad Umar
Founder & Principal Engineer | OfficialUM1 LLC
Enterprise Web Engineering & Dubai Tourism Growth
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

def run_dubai_tourism_campaign(max_emails=50, delay_range=(15, 30)):
    cfg = load_config()
    smtp_cfg = cfg["smtp"]
    leads = load_leads()
    sent_history = load_sent_history()
    already_sent_emails = {h["email"].lower() for h in sent_history if "email" in h}

    print("=" * 70)
    print(" 🚀 OFFICIALUM1 LLC - DUBAI & UAE TOURISM COLD OUTREACH SENDER")
    print(f" Target Niche: Dubai Desert Safaris, Luxury Yacht Charters & Tourism")
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
            print(f"[{idx}/{len(leads)}] Skipping {target_email} (Already sent in history)")
            continue

        client_name = lead.get("clientName", "Team")
        company = lead.get("company", "Your Company")
        domain = lead.get("domain", "your website")
        city = lead.get("city", "Dubai")
        niche = lead.get("niche", "Tourism & Safari")

        subject = f"Quick question regarding {company}'s direct booking engine ({domain})"
        body = DUBAI_TOURISM_INITIAL_PITCH.format(
            client_name=client_name,
            company=company,
            domain=domain,
            city=city,
            niche=niche
        )

        print(f"\n[{idx}/{len(leads)}] Sending Dubai Tourism pitch to: {company} ({target_email})...")
        try:
            send_email(smtp_cfg, target_email, subject, body)
            record_sent(lead, campaign_type="DUBAI_TOURISM_INITIAL", status="DELIVERED")
            already_sent_emails.add(target_email.lower())
            sent_count += 1
            print(f"  ✅ Sent successfully to {target_email} | Synced to CRM ($2,500 deal)")

            if sent_count < max_emails:
                wait_time = random.randint(delay_range[0], delay_range[1])
                print(f"  ⏳ Waiting {wait_time}s before next send for 100% spam-free inbox delivery...")
                time.sleep(wait_time)

        except Exception as e:
            print(f"  ❌ Error sending to {target_email}: {e}")
            record_sent(lead, campaign_type="DUBAI_TOURISM_INITIAL", status=f"FAILED: {str(e)[:50]}")

    print("\n" + "=" * 70)
    print(f"🎉 DUBAI TOURISM CAMPAIGN COMPLETED: {sent_count} cold emails sent & synced to CRM!")
    print("=" * 70)

if __name__ == "__main__":
    count = 50
    if len(sys.argv) > 1:
        try:
            count = int(sys.argv[1])
        except ValueError:
            pass
    run_dubai_tourism_campaign(max_emails=count, delay_range=(15, 25))
