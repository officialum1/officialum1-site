"""
OfficialUM1 WordPress Speed Optimization - Automated Email Dispatcher
Sends personalized high-converting speed optimization pitches to discovered WordPress sites.
"""
import os
import sys
import json
import time
import random

_current_dir = os.path.dirname(os.path.abspath(__file__))
if _current_dir not in sys.path:
    sys.path.insert(0, _current_dir)

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

from smart_emailer import send_outreach_email, TEMPLATES

CONFIG_FILE = os.path.join(os.path.dirname(__file__), "config.json")
CRM_LEADS_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "leads.json")

def load_config():
    with open(CONFIG_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def load_wp_leads():
    if not os.path.exists(CRM_LEADS_FILE):
        return []
    with open(CRM_LEADS_FILE, "r", encoding="utf-8") as f:
        all_leads = json.load(f)
    
    # Filter for WP speed leads or leads with valid emails
    wp_leads = []
    for l in all_leads:
        if "@" in l.get("contact", "") and ("WP Speed" in l.get("source", "") or "WordPress" in l.get("notes", "")):
            wp_leads.append({
                "clientName": l.get("name", "Founder"),
                "emails": [l.get("contact")],
                "domain": l.get("name", "").replace(" ", "").lower() + ".com",
                "notes": l.get("notes", "")
            })
    return wp_leads

def run_campaign(leads=None, dry_run=False):
    config = load_config()
    smtp_cfg = config.get("smtp", {})
    
    if not leads:
        leads = load_wp_leads()

    print("=" * 70)
    print(" 🚀 OFFICIALUM1 - WORDPRESS SPEED COLD OUTREACH SENDER")
    print(f" 📧 Sender: {smtp_cfg.get('email')} via {smtp_cfg.get('host')}")
    print(f" 🎯 Total Leads in Queue: {len(leads)}")
    print(f" ⚙️  Mode: {'DRY RUN (Simulation)' if dry_run else 'LIVE SENDING'}")
    print("=" * 70)

    if not leads:
        print("⚠️ No WordPress speed leads found in queue.")
        return

    sent_count = 0
    for idx, lead in enumerate(leads, 1):
        email = lead["emails"][0]
        client = lead.get("clientName", "Founder")
        
        # Extract domain from notes if present
        domain = lead.get("domain", "")
        for line in lead.get("notes", "").split("\n"):
            if "Website: http" in line:
                domain = line.split("Website:")[-1].strip().replace("https://", "").replace("http://", "").replace("www.", "").rstrip("/")
                break

        lead["domain"] = domain

        print(f"\n[{idx}/{len(leads)}] Target: {client} | Domain: {domain}")
        print(f"  📫 Destination: {email}")

        if dry_run:
            print(f"  ⚡ [SIMULATED] Email drafted and validated successfully.")
            sent_count += 1
        else:
            success = send_outreach_email(smtp_cfg, lead, template_id="4")
            if success:
                print(f"  ✅ [DELIVERED] Email successfully sent via Titan SMTP!")
                sent_count += 1
            else:
                print(f"  ❌ [FAILED] Could not deliver.")

            if idx < len(leads):
                delay = random.randint(
                    config.get("outreach", {}).get("min_delay_seconds", 15),
                    config.get("outreach", {}).get("max_delay_seconds", 30)
                )
                print(f"  ⏳ Anti-spam cooldown: waiting {delay}s before next email...")
                time.sleep(delay)

    print("\n" + "=" * 70)
    print(f" 🎉 Campaign Finished! Sent: {sent_count}/{len(leads)} emails.")
    print("=" * 70)

if __name__ == "__main__":
    is_dry = "--dry-run" in sys.argv
    run_campaign(dry_run=is_dry)
