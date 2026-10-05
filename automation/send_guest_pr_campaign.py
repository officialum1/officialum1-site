"""
OfficialUM1 Guest Posting & Digital PR Specialized Outreach Engine
Targets verified Small/Boutique Business Owners, SEO Consultants & Startup Founders
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

CONFIG_FILE = os.path.join(_current_dir, "config.json")
LEADS_FILE = os.path.join(_current_dir, "leads_fresh_guest_pr.json")
SENT_HISTORY_FILE = os.path.join(_current_dir, "sent_outreach_history.json")

def load_config():
    with open(CONFIG_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def load_leads():
    if not os.path.exists(LEADS_FILE):
        return []
    with open(LEADS_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def load_sent_history():
    if not os.path.exists(SENT_HISTORY_FILE):
        return []
    try:
        with open(SENT_HISTORY_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return []

def record_sent(lead, campaign_type="GUEST_POSTING", status="DELIVERED"):
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

GUEST_POST_PITCH = """Hi {client_name},

Loved what you are building with {company} ({domain}).

Reaching out directly because we manage direct editorial access and permanent do-follow guest post placements across 500+ high-traffic, DR 50-85 authority publications in your industry.

Unlike typical link brokers, all our placements are on 100% genuine traffic websites with zero PBN footprints—perfect for scaling organic rankings and domain authority safely.

If you are currently acquiring backlinks for {company} or your clients, I can share a tailored spreadsheet of our available publications, traffic metrics, and sample live URLs.

Would you like me to send over our publisher list?

Best regards,

Muhammad Umar Mumtaz
OfficialUM1 LLC | SEO & Media Outreach
Website: https://officialum1.com/services/guest-posting
Email: hello@officialum1.com
"""

PR_WIRE_PITCH = """Hi {client_name},

Saw what you are building with {company} ({domain}) -- congratulations on your recent progress!

Wanted to reach out directly because we help high-growth brands and startups get syndicated across 250+ to 400+ major media outlets (including AP News, Yahoo Finance, MarketWatch, Bloomberg, and Google News) within 48 hours.

Most founders use this to secure official "As Seen On FOX, NBC, CBS & Yahoo" trust badges on their landing page and gain high-authority brand credibility.

Would it be helpful if I shared a 1-page sample coverage dossier and live links from our recent client distribution?

Best regards,

Muhammad Umar Mumtaz
OfficialUM1 LLC | Digital PR & Press Wire
Website: https://officialum1.com/services/press-release-distribution
Email: hello@officialum1.com
"""

def send_guest_pr_campaign(dry_run=False, max_sends=25):
    print("=" * 75)
    print(" 🚀 OFFICIALUM1 - SPECIALIZED GUEST POSTING & DIGITAL PR OUTREACH")
    print(" 🎯 Target Audience: Boutique SEO Agencies, Affiliate Owners & Startup Founders")
    print("=" * 75)

    config = load_config()
    smtp_cfg = config["smtp"]
    leads = load_leads()
    history = load_sent_history()

    sent_emails = {h["email"].lower() for h in history if h.get("email")}
    sent_domains = {h["domain"].lower() for h in history if h.get("domain")}

    unsent_leads = [
        l for l in leads
        if l["emails"][0].lower() not in sent_emails
        and l["domain"].lower() not in sent_domains
    ]

    print(f"\n📊 Total Leads Loaded: {len(leads)}")
    print(f"🔒 Already Sent / Duplicates Filtered: {len(leads) - len(unsent_leads)}")
    print(f"📬 Fresh Leads Ready to Send: {len(unsent_leads)}")
    print(f"⚙️ Mode: {'DRY RUN (Preview Only)' if dry_run else 'LIVE SMTP OUTREACH'}\n")

    if not unsent_leads:
        print("🎉 All leads have already been sent! No duplicates to send.")
        return

    to_process = unsent_leads[:max_sends]
    sent_count = 0

    server = None
    if not dry_run:
        try:
            print(f"🔌 Connecting to Titan SMTP ({smtp_cfg['host']}:{smtp_cfg['port']})...")
            if smtp_cfg.get("use_ssl"):
                server = smtplib.SMTP_SSL(smtp_cfg["host"], smtp_cfg["port"], timeout=20)
            else:
                server = smtplib.SMTP(smtp_cfg["host"], smtp_cfg["port"], timeout=20)
                server.starttls()
            server.login(smtp_cfg["email"], smtp_cfg["password"])
            print("✅ SMTP Authentication Successful!\n")
        except Exception as e:
            print(f"❌ SMTP Connection Failed: {e}")
            return

    for idx, lead in enumerate(to_process, 1):
        target_email = lead["emails"][0]
        client_name = lead.get("clientName", "Founder")
        company = lead.get("company", lead.get("domain"))
        domain = lead.get("domain")
        category = lead.get("category", "GUEST_POSTING")

        if category == "GUEST_POSTING":
            subject = f"Guest post & editorial collaboration for {domain}"
            body_content = GUEST_POST_PITCH.format(
                client_name=client_name,
                company=company,
                domain=domain
            )
            campaign_tag = "GUEST_POST_INITIAL"
        else:
            subject = f"Press release & media wire syndication for {company}"
            body_content = PR_WIRE_PITCH.format(
                client_name=client_name,
                company=company,
                domain=domain
            )
            campaign_tag = "PR_WIRE_INITIAL"

        print(f"[{idx}/{len(to_process)}] 📤 Sending to: {client_name} <{target_email}> ({company})")
        print(f"    🏷️ Type: {category} | 📌 Subject: '{subject}'")

        if dry_run:
            print(f"    [DRY RUN] Previewing message successfully.")
            sent_count += 1
            continue

        # Build RFC-Compliant Email Message
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"{smtp_cfg['sender_name']} <{smtp_cfg['from_email']}>"
        msg["To"] = target_email
        msg["Date"] = formatdate(localtime=True)
        msg["Message-ID"] = make_msgid(domain="officialum1.com")
        msg["Reply-To"] = smtp_cfg["reply_to"]
        msg["X-Mailer"] = "OfficialUM1 Enterprise Outreach Engine"

        msg.attach(MIMEText(body_content, "plain", "utf-8"))

        try:
            server.sendmail(smtp_cfg["from_email"], [target_email], msg.as_string())
            record_sent(lead, campaign_type=campaign_tag, status="DELIVERED")
            print(f"    ✅ [DELIVERED] Email accepted by recipient mail server!")
            sent_count += 1

            # Natural anti-spam sleep delay (15-25 seconds between sends)
            if idx < len(to_process):
                delay = random.randint(15, 25)
                print(f"    ⏳ Waiting {delay}s anti-spam natural delay before next email...")
                time.sleep(delay)

        except Exception as e:
            print(f"    ⚠️ [FAILED]: {e}")

    if server:
        try:
            server.quit()
        except Exception:
            pass

    print("\n" + "=" * 75)
    print(f" 🎉 CAMPAIGN COMPLETED: {sent_count} Fresh Targeted Emails Successfully Sent!")
    print("=" * 75)

if __name__ == "__main__":
    dry_run_mode = "--dry-run" in sys.argv
    send_guest_pr_campaign(dry_run=dry_run_mode, max_sends=25)
