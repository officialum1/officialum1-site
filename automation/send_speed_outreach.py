"""
OfficialUM1 WordPress Speed Optimization - Automated Email Dispatcher
Sends high-converting, audited WordPress & WooCommerce speed optimization pitches.
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
SPEED_LEADS_FILE = os.path.join(os.path.dirname(__file__), "leads_speed.json")
SENT_HISTORY_FILE = os.path.join(os.path.dirname(__file__), "sent_outreach_history.json")

def load_config():
    with open(CONFIG_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def load_leads():
    if not os.path.exists(SPEED_LEADS_FILE):
        return []
    with open(SPEED_LEADS_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def load_sent_history():
    if not os.path.exists(SENT_HISTORY_FILE):
        return []
    try:
        with open(SENT_HISTORY_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return []

def record_sent(lead, campaign_type="SPEED_INITIAL", status="DELIVERED"):
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
    sync_outreach_to_crm(lead, campaign_tag="Speed Outreach", status="In Progress", budget=299)

SPEED_INITIAL_PITCH = """Hi {client_name},

I was looking through {domain} and noticed great potential in your online store, but ran a quick diagnostic and saw the mobile loading speed and Core Web Vitals (LCP/TTFB) are currently testing around {score}.

Slow load times directly hurt mobile checkout conversion rates and drop your Google search rankings.

At OfficialUM1 LLC, we specialize in high-performance WordPress & WooCommerce speed optimization. We guarantee:
- 90+ Google PageSpeed Score on Mobile & Desktop
- Under 1.5s Total Load Time (database query cleanup, TTFB reduction, WebP conversion, JS/CSS delay, LiteSpeed edge caching)
- Zero downtime & 100% Risk-Free Guarantee (You only pay when you see the live 90+ verified score)

You can check our live client benchmarks and speed packages here:
https://officialum1.com/services/wordpress-speed-optimization

Would you be open to a free 2-minute diagnostic audit showing the top 3 bottlenecks slowing down {domain}?

Best regards,

Muhammad Umar Mumtaz
Founder & Managing Director | OfficialUM1 LLC
1001 South Main Street, Suite 600, Kalispell, MT 59901, USA
https://officialum1.com/services/wordpress-speed-optimization
hello@officialum1.com
"""

SPEED_FOLLOWUP_1 = """Hi {client_name},

Following up quickly on my note regarding {domain}'s mobile loading performance.

We recently optimized a similar WooCommerce store from 31/100 to 94/100 Google PageSpeed, cutting load time from 4.8s down to 1.1s — resulting in an immediate 22% lift in checkout completions.

Would you like me to send over the free 3-point diagnostic audit for {domain}?

Best regards,

Muhammad Umar Mumtaz
OfficialUM1 LLC | Web Performance Engineering
https://officialum1.com/services/wordpress-speed-optimization
"""

def send_email(smtp_cfg, lead, step="initial", dry_run=False):
    sender_email = smtp_cfg["email"]
    sender_password = smtp_cfg["password"]
    sender_name = smtp_cfg.get("sender_name", "Muhammad Umar | OfficialUM1 LLC")
    recipient_email = lead["emails"][0]
    client_name = lead.get("clientName", "Founder")
    domain = lead.get("domain", "")
    score = lead.get("pageSpeedScore", "30-35/100")

    if step == "followup":
        subject = f"Re: Quick performance note regarding {domain}'s loading speed"
        body = SPEED_FOLLOWUP_1.format(client_name=client_name, domain=domain, score=score)
    else:
        subject = f"Quick performance note regarding {domain}'s loading speed"
        body = SPEED_INITIAL_PITCH.format(client_name=client_name, domain=domain, score=score)

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
        if item.get("campaign") == f"SPEED_{step.upper()}" and item.get("status") == "DELIVERED"
    }

    pending_leads = [
        l for l in leads
        if l.get("emails") and l["emails"][0].lower() not in sent_emails
    ]

    print("=" * 70)
    print(" [OFFICIALUM1] - WORDPRESS SPEED OPTIMIZATION OUTREACH SENDER")
    print(f" Sender: {smtp_cfg.get('email')} via {smtp_cfg.get('host')}")
    print(f" Campaign Step: {step.upper()} | Pending Targets: {len(pending_leads)}")
    print(f" Mode: {'LIVE SENDING [LIVE]' if not dry_run else 'DRY RUN (Simulation) [PREVIEW]'}")
    print("=" * 70)

    if not pending_leads:
        print("All speed leads for this step have already been contacted!")
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
            print(f"  [OK] [{status}] Speed Optimization Outreach dispatched successfully!")
            sent_count += 1
            if not dry_run:
                record_sent(lead, campaign_type=f"SPEED_{step.upper()}", status="DELIVERED")
        else:
            print(f"  [FAIL] Could not send to {email}")

        if not dry_run and idx < len(pending_leads):
            delay = random.randint(15, 30)
            print(f"  Cooldown: waiting {delay}s...")
            time.sleep(delay)

    print("\n" + "=" * 70)
    print(f" Batch Complete! Processed {sent_count}/{len(pending_leads)} leads.")
    if dry_run:
        print(" Run with --live to send actual emails, e.g.: python send_speed_outreach.py --live")
    print("=" * 70)

if __name__ == "__main__":
    main()
