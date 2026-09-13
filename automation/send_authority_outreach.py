"""
OfficialUM1 Authority Link Building & Guest Posting - Cold Outreach Sender
Sends high-converting B2B outreach to agencies & brands for DA60+ Link Packs & Niche Edits.
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

CONFIG_FILE = os.path.join(os.path.dirname(__file__), "config.json")
VERIFIED_LEADS_FILE = os.path.join(os.path.dirname(__file__), "verified_leads.json")

def load_config():
    with open(CONFIG_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def load_leads():
    if not os.path.exists(VERIFIED_LEADS_FILE):
        return []
    with open(VERIFIED_LEADS_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

AUTHORITY_PITCH = """Hi {client_name} Team,

Hope you are having a great week.

I came across {domain} while analyzing top digital agencies and competitive search rankings in your space.

At OfficialUM1 LLC (US-registered digital marketing agency), we maintain direct editorial partnerships with over 65,000+ verified high-authority publications (DA 40 to DA 75+ with 5,000 to 50,000+ monthly Google organic visits).

If you are currently looking to push {domain} or your clients' money pages into Top 3 Google rankings, we have direct editorial slots available:
• 10x DA 60+ / DR 65+ High-Traffic Editorial Guest Posts
• In-Content Contextual Niche Edits (48-72h turnaround)
• 100% Permanent DoFollow & 365-Day Free Replacement Warranty
• Guaranteed Zero PBNs / Zero Footprint

You can view our live publisher tiers and instant package calculator here:
👉 https://officialum1.com/services/guest-posting

Would you like me to send over our curated publisher domain shortlist and sample live placement URLs for your review?

Best regards,

Muhammad Umar Mumtaz
Founder & Managing Director | OfficialUM1 LLC
📍 1001 South Main Street, Suite 600, Kalispell, MT 59901, USA
🌐 https://officialum1.com/services/guest-posting
✉️ hello@officialum1.com
"""

def send_email(smtp_cfg, lead, dry_run=False):
    sender_email = smtp_cfg["email"]
    sender_password = smtp_cfg["password"]
    sender_name = smtp_cfg.get("sender_name", "Muhammad Umar | OfficialUM1 LLC")
    recipient_email = lead["emails"][0]
    client_name = lead.get("clientName", "Founder")
    domain = lead.get("domain", "")

    subject = f"Editorial link placements & DA60+ authority outreach for {domain}"
    body = AUTHORITY_PITCH.format(client_name=client_name, domain=domain)

    if dry_run:
        print(f"  [DRY RUN PREVIEW] Subject: {subject}")
        print(f"  [DRY RUN PREVIEW] To: {recipient_email}")
        return True

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"{sender_name} <{sender_email}>"
    msg["To"] = recipient_email
    msg["Reply-To"] = smtp_cfg.get("reply_to", "hello@officialum1.com")
    msg["Date"] = formatdate(localtime=True)
    msg["Message-ID"] = make_msgid(domain="officialum1.com")

    msg.attach(MIMEText(body, "plain", "utf-8"))

    try:
        server = smtplib.SMTP_SSL(smtp_cfg["host"], smtp_cfg["port"], timeout=20)
        server.login(sender_email, sender_password)
        server.send_message(msg)
        server.quit()
        return True
    except Exception as e:
        print(f"  ❌ SMTP Error: {e}")
        return False

SENT_HISTORY_FILE = os.path.join(os.path.dirname(__file__), "sent_outreach_history.json")

def load_sent_history():
    if not os.path.exists(SENT_HISTORY_FILE):
        return []
    try:
        with open(SENT_HISTORY_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return []

def record_sent(lead, status="DELIVERED"):
    history = load_sent_history()
    email = lead["emails"][0] if lead.get("emails") else ""
    history.append({
        "clientName": lead.get("clientName", ""),
        "domain": lead.get("domain", ""),
        "email": email,
        "status": status,
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
    })
    try:
        with open(SENT_HISTORY_FILE, "w", encoding="utf-8") as f:
            json.dump(history, f, indent=2)
    except Exception as e:
        print(f"  ⚠️ Warning saving history: {e}")

def main():
    dry_run = "--live" not in sys.argv
    config = load_config()
    smtp_cfg = config.get("smtp", {})
    all_leads = load_leads()
    sent_history = load_sent_history()
    sent_emails = {item.get("email", "").lower() for item in sent_history if item.get("status") == "DELIVERED"}

    # Filter out already contacted leads
    pending_leads = [
        l for l in all_leads
        if l.get("emails") and l["emails"][0].lower() not in sent_emails
    ]

    print("=" * 70)
    print(" 🚀 OFFICIALUM1 - DA60+ AUTHORITY LINK COLD OUTREACH SENDER")
    print(f" 📧 Sender: {smtp_cfg.get('email')} via {smtp_cfg.get('host')}")
    print(f" 🎯 Total Leads: {len(all_leads)} | Already Contacted: {len(sent_emails)} | Pending: {len(pending_leads)}")
    print(f" ⚙️  Mode: {'LIVE SENDING 🔴' if not dry_run else 'DRY RUN (Simulation / Safety Preview) 🟢'}")
    print("=" * 70)

    if not pending_leads:
        print("🎉 All leads in verified_leads.json have already been contacted!")
        return

    sent_count = 0
    # Process up to 21 leads in this batch
    batch_leads = pending_leads[:21]

    for idx, lead in enumerate(batch_leads, 1):
        client = lead.get("clientName", "Founder")
        domain = lead.get("domain", "")
        email = lead["emails"][0]

        print(f"\n[{idx}/{len(batch_leads)}] Target: {client} ({domain})")
        print(f"  📫 Destination: {email}")

        success = send_email(smtp_cfg, lead, dry_run=dry_run)
        if success:
            status = "SIMULATED" if dry_run else "DELIVERED"
            print(f"  ✅ [{status}] Outreach email dispatched successfully!")
            sent_count += 1
            if not dry_run:
                record_sent(lead, status="DELIVERED")
        else:
            print(f"  ❌ [FAILED] Could not send to {email}")

        if not dry_run and idx < len(batch_leads):
            delay = random.randint(6, 12)
            print(f"  ⏳ Anti-spam cooldown: waiting {delay}s before next email...")
            time.sleep(delay)

    print("\n" + "=" * 70)
    print(f" 🎉 Outbound Campaign Batch Complete! Dispatched: {sent_count}/{len(batch_leads)} emails.")
    if dry_run:
        print(" 💡 To start LIVE sending to these remaining leads, run with: python send_authority_outreach.py --live")
    print("=" * 70)

if __name__ == "__main__":
    main()

