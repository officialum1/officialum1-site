"""
OfficialUM1 Press Release Syndication & Media Wire - Cold Outreach Sender
Sends high-converting B2B outreach to startups, founders & marketing directors for AP News, Yahoo Finance & 350+ Media Syndication.
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
PR_LEADS_FILE = os.path.join(os.path.dirname(__file__), "leads_pr.json")
SENT_HISTORY_FILE = os.path.join(os.path.dirname(__file__), "sent_outreach_history.json")

def load_config():
    with open(CONFIG_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def load_leads():
    if not os.path.exists(PR_LEADS_FILE):
        return []
    with open(PR_LEADS_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def load_sent_history():
    if not os.path.exists(SENT_HISTORY_FILE):
        return []
    try:
        with open(SENT_HISTORY_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return []

def record_sent(lead, campaign_type="PR_INITIAL", status="DELIVERED"):
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
    sync_outreach_to_crm(lead, campaign_tag="PR Wire Outreach", status="In Progress", budget=799)

PR_INITIAL_PITCH = """Hi {client_name},

Saw what you are building with {company} ({domain}) -- congratulations on the recent momentum!

Wanted to reach out directly because we help growing tech brands and startups get syndicated across 250+ to 400+ major media outlets (including AP News, Yahoo Finance, MarketWatch, and Google News) in about 48 hours.

Most founders we work with use this to get official "As Seen On FOX, NBC & CBS" trust badges on their landing page and secure high-trust Google News brand backlinks.

Would it be helpful if I shared a sample live media report from our last client campaign so you can see how the live placements look?

Best,

Muhammad Umar
Founder, OfficialUM1 LLC
https://officialum1.com/services/press-release-distribution
Direct: hello@officialum1.com
"""

PR_FOLLOWUP_1 = """Hi {client_name},

Following up quickly on my note from earlier this week regarding media wire syndication for {company}.

We just completed a 350+ outlet release that placed our client onto AP News, Yahoo Finance, and Google News in under 36 hours.

Mind if I send over a 1-page sample coverage dossier to see if this fits your current launch plans?

Best,

Muhammad Umar
OfficialUM1 LLC | Media & PR Syndication
https://officialum1.com/services/press-release-distribution
"""

def send_email(smtp_cfg, lead, step="initial", dry_run=False):
    sender_email = smtp_cfg["email"]
    sender_password = smtp_cfg["password"]
    sender_name = smtp_cfg.get("sender_name", "Muhammad Umar | OfficialUM1 LLC")
    recipient_email = lead["emails"][0]
    client_name = lead.get("clientName", "Founder")
    domain = lead.get("domain", "")
    company = lead.get("company", domain)

    if step == "followup":
        subject = f"Re: Guaranteed Yahoo Finance & Google News syndication for {domain}"
        body = PR_FOLLOWUP_1.format(client_name=client_name, domain=domain, company=company)
    else:
        subject = f"Guaranteed Yahoo Finance & Google News syndication for {domain}"
        body = PR_INITIAL_PITCH.format(client_name=client_name, domain=domain, company=company)

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
        if item.get("campaign") == f"PR_{step.upper()}" and item.get("status") == "DELIVERED"
    }

    pending_leads = [
        l for l in leads
        if l.get("emails") and l["emails"][0].lower() not in sent_emails
    ]

    print("=" * 70)
    print(" [OFFICIALUM1] - PRESS RELEASE & MEDIA WIRE OUTREACH SENDER")
    print(f" Sender: {smtp_cfg.get('email')} via {smtp_cfg.get('host')}")
    print(f" Campaign Step: {step.upper()} | Pending Targets: {len(pending_leads)}")
    print(f" Mode: {'LIVE SENDING [LIVE]' if not dry_run else 'DRY RUN (Simulation) [PREVIEW]'}")
    print("=" * 70)

    if not pending_leads:
        print("All leads for this step have already been contacted!")
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
            print(f"  [OK] [{status}] PR Outreach email dispatched successfully!")
            sent_count += 1
            if not dry_run:
                record_sent(lead, campaign_type=f"PR_{step.upper()}", status="DELIVERED")
        else:
            print(f"  [FAIL] Could not send to {email}")

        if not dry_run and idx < len(pending_leads):
            delay = random.randint(15, 30)
            print(f"  Cooldown: waiting {delay}s...")
            time.sleep(delay)

    print("\n" + "=" * 70)
    print(f" Batch Complete! Processed {sent_count}/{len(pending_leads)} leads.")
    if dry_run:
        print(" Run with --live to send actual emails, e.g.: python send_pr_outreach.py --live")
    print("=" * 70)

if __name__ == "__main__":
    main()
