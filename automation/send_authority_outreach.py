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

from crm_sync import sync_outreach_to_crm

CONFIG_FILE = os.path.join(os.path.dirname(__file__), "config.json")
AUTHORITY_LEADS_FILE = os.path.join(os.path.dirname(__file__), "leads_authority.json")
SENT_HISTORY_FILE = os.path.join(os.path.dirname(__file__), "sent_outreach_history.json")

def load_config():
    with open(CONFIG_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def load_leads():
    if os.path.exists(AUTHORITY_LEADS_FILE):
        with open(AUTHORITY_LEADS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    v_file = os.path.join(os.path.dirname(__file__), "verified_leads.json")
    if os.path.exists(v_file):
        with open(v_file, "r", encoding="utf-8") as f:
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

def record_sent(lead, campaign_type="AUTHORITY_INITIAL", status="DELIVERED"):
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

    # Automatically sync with Website Admin CRM
    sync_outreach_to_crm(lead, campaign_tag="Authority Link Outreach", status="In Progress", budget=1499)

AUTHORITY_INITIAL_PITCH = """Hi {client_name},

Hope your week is going well.

Reaching out because I saw the SEO work you are doing with {domain}. At OfficialUM1, we work directly with publishers across 65,000+ vetted websites (DA50 to DA75+ with real monthly Google organic traffic).

We help agency partners and brands secure permanent in-content editorial backlinks and niche edits with zero PBNs and 365-day replacement protection.

Are you currently taking on new guest post placements or looking for direct wholesale rates for your client campaigns?

Happy to send over our curated domain shortlist and 2-3 live sample placements if you would like to take a look.

Best,

Muhammad Umar
Founder, OfficialUM1 LLC
https://officialum1.com/services/guest-posting
Direct: hello@officialum1.com
"""

AUTHORITY_FOLLOWUP_1 = """Hi {client_name},

Following up quickly on my note regarding white-label DA60+ editorial placements for {domain}.

We recently secured a 5-link niche pack for an agency partner that drove an immediate 40% organic traffic lift across their top 3 target keywords in 60 days.

Would you like me to send over 3 sample publisher domains in your niche along with wholesale agency pricing?

Best,

Muhammad Umar
OfficialUM1 LLC | Authority Link Building
https://officialum1.com/services/guest-posting
"""

def send_email(smtp_cfg, lead, step="initial", dry_run=False):
    sender_email = smtp_cfg["email"]
    sender_password = smtp_cfg["password"]
    sender_name = smtp_cfg.get("sender_name", "Muhammad Umar | OfficialUM1 LLC")
    recipient_email = lead["emails"][0]
    client_name = lead.get("clientName", "Founder")
    domain = lead.get("domain", "")

    if step == "followup":
        subject = f"Re: Editorial link placements & DA60+ authority outreach for {domain}"
        body = AUTHORITY_FOLLOWUP_1.format(client_name=client_name, domain=domain)
    else:
        subject = f"Editorial link placements & DA60+ authority outreach for {domain}"
        body = AUTHORITY_INITIAL_PITCH.format(client_name=client_name, domain=domain)

    if dry_run:
        print(f"  [DRY RUN PREVIEW] Step: {step.upper()} | Subject: {subject}")
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
        print(f"  [SMTP Error]: {e}")
        return False

def main():
    dry_run = "--live" not in sys.argv
    step = "followup" if "--followup" in sys.argv else "initial"
    config = load_config()
    smtp_cfg = config.get("smtp", {})
    leads = load_leads()
    history = load_sent_history()

    sent_emails = {
        item.get("email", "").lower()
        for item in history
        if item.get("campaign") == f"AUTHORITY_{step.upper()}" and item.get("status") == "DELIVERED"
    }

    pending_leads = [
        l for l in leads
        if l.get("emails") and l["emails"][0].lower() not in sent_emails
    ]

    print("=" * 70)
    print(" [OFFICIALUM1] - DA60+ AUTHORITY LINK COLD OUTREACH SENDER")
    print(f" Sender: {smtp_cfg.get('email')} via {smtp_cfg.get('host')}")
    print(f" Campaign Step: {step.upper()} | Pending Targets: {len(pending_leads)}")
    print(f" Mode: {'LIVE SENDING [LIVE]' if not dry_run else 'DRY RUN (Simulation) [PREVIEW]'}")
    print("=" * 70)

    if not pending_leads:
        print("All authority leads for this step have already been contacted!")
        return

    sent_count = 0
    for idx, lead in enumerate(pending_leads, 1):
        client = lead.get("clientName", "Founder")
        domain = lead.get("domain", "")
        email = lead["emails"][0]

        print(f"\n[{idx}/{len(pending_leads)}] Target: {client} ({domain})")
        print(f"  Destination: {email}")

        success = send_email(smtp_cfg, lead, step=step, dry_run=dry_run)
        if success:
            status = "SIMULATED" if dry_run else "DELIVERED"
            print(f"  [OK] [{status}] Authority Outreach dispatched successfully!")
            sent_count += 1
            if not dry_run:
                record_sent(lead, campaign_type=f"AUTHORITY_{step.upper()}", status="DELIVERED")
        else:
            print(f"  [FAIL] Could not send to {email}")

        if not dry_run and idx < len(pending_leads):
            delay = random.randint(15, 30)
            print(f"  Cooldown: waiting {delay}s...")
            time.sleep(delay)

    print("\n" + "=" * 70)
    print(f" Batch Complete! Processed {sent_count}/{len(pending_leads)} leads.")
    if dry_run:
        print(" Run with --live to send actual emails, e.g.: python send_authority_outreach.py --live")
    print("=" * 70)

if __name__ == "__main__":
    main()
