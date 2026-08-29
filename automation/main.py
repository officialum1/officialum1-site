"""
OfficialUM1 100% Lead Hunter & Cold Outreach Suite - Master Controller
"""
import os
import json
import time
import random
from lead_hunter import search_bing_leads, scrape_website_leads
from lead_validator import verify_lead_email
from smart_emailer import send_outreach_email, TEMPLATES
from crm_sync import sync_lead_to_crm

CONFIG_FILE = os.path.join(os.path.dirname(__file__), "config.json")
LEADS_CACHE_FILE = os.path.join(os.path.dirname(__file__), "verified_leads.json")

def load_config():
    if os.path.exists(CONFIG_FILE):
        with open(CONFIG_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}

def load_saved_leads():
    if os.path.exists(LEADS_CACHE_FILE):
        with open(LEADS_CACHE_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return []

def save_leads(leads):
    with open(LEADS_CACHE_FILE, "w", encoding="utf-8") as f:
        json.dump(leads, f, indent=2)

def print_header():
    print("=" * 65)
    print(" 🚀 OFFICIALUM1 LLC - 100% VERIFIED LEAD HUNTER & OUTREACH SUITE")
    print("=" * 65)

def main():
    config = load_config()
    print_header()

    while True:
        print("\nChoose an option:")
        print("  1. 🎯 Find 100% Verified Leads (Search & Audit Businesses)")
        print("  2. 🔍 Audit a Single Website for Verified Emails")
        print("  3. ✉️  Launch Automated Cold Email Outreach Campaign")
        print("  4. 📊 Sync All Saved Leads to OfficialUM1 CRM Dashboard")
        print("  5. ⚙️  View / Edit Config")
        print("  6. ❌ Exit")

        choice = input("\nEnter choice [1-6]: ").strip()

        if choice == "1":
            niche = input(f"Enter target niche/industry [{config.get('search_defaults', {}).get('default_niche', 'Digital Agency')}]: ").strip() or config.get('search_defaults', {}).get('default_niche', 'Digital Agency')
            location = input(f"Enter target location [{config.get('search_defaults', {}).get('default_location', 'USA')}]: ").strip() or config.get('search_defaults', {}).get('default_location', 'USA')
            limit_str = input("How many websites to inspect? [10]: ").strip()
            limit = int(limit_str) if limit_str.isdigit() else 10

            query = f"{niche} {location}"
            print(f"\n🔎 Searching for '{query}'...")
            found_leads = search_bing_leads(query, max_results=limit)

            print(f"\n🎉 Search Completed! Found {len(found_leads)} 100% Verified Leads with real emails.")
            
            # Save to leads cache
            existing = load_saved_leads()
            all_leads = existing + [l for l in found_leads if l not in existing]
            save_leads(all_leads)
            print(f"💾 Saved to 'automation/verified_leads.json' (Total database: {len(all_leads)} leads)")

            if config.get("outreach", {}).get("auto_sync_crm", True):
                print("🔄 Auto-syncing to OfficialUM1 CRM Leads Database...")
                synced_count = sum(1 for lead in found_leads if sync_lead_to_crm(lead, platform_tag=niche))
                print(f"✅ {synced_count} leads successfully synced to your Admin Dashboard!")

        elif choice == "2":
            url = input("Enter website URL to audit (e.g. exampleagency.com): ").strip()
            if url:
                print(f"\nAuditing {url}...")
                lead = scrape_website_leads(url)
                print("\nAudit Results:")
                print(f"  Company: {lead['clientName']}")
                print(f"  Domain:  {lead['domain']}")
                print(f"  Emails:  {', '.join(lead['emails']) if lead['emails'] else 'No emails found'}")
                print(f"  Phones:  {', '.join(lead['phones']) if lead['phones'] else 'None'}")
                
                if lead["emails"]:
                    save_q = input("\nSave to verified leads list? (y/n): ").strip().lower()
                    if save_q == 'y':
                        existing = load_saved_leads()
                        existing.append(lead)
                        save_leads(existing)
                        sync_lead_to_crm(lead, platform_tag="Manual Audit")
                        print("✅ Saved and synced to CRM!")

        elif choice == "3":
            leads = load_saved_leads()
            if not leads:
                print("⚠️ No leads found in database. Run Option 1 first to collect leads!")
                continue

            print(f"\nFound {len(leads)} leads in database.")
            print("\nSelect Pitch Template:")
            for k, v in TEMPLATES.items():
                print(f"  {k}. {v['name']}")

            tmpl_choice = input("Enter template [1-3]: ").strip() or "1"
            
            smtp_cfg = config.get("smtp", {})
            if smtp_cfg.get("password") == "YOUR_EMAIL_PASSWORD_HERE":
                print("\n⚠️ WARNING: Please update your SMTP email password in 'automation/config.json' before sending real emails!")
                continue

            confirm = input(f"\nStart sending cold emails to {len(leads)} leads? (y/n): ").strip().lower()
            if confirm == 'y':
                print("\n🚀 Starting outreach campaign...")
                sent = 0
                for idx, lead in enumerate(leads, 1):
                    print(f"[{idx}/{len(leads)}] Sending email to {lead['clientName']} ({lead['emails'][0]})...")
                    success = send_outreach_email(smtp_cfg, lead, template_id=tmpl_choice)
                    if success:
                        print(f"  ✅ Sent successfully!")
                        sent += 1
                    else:
                        print(f"  ❌ Delivery failed.")

                    # Anti-spam delay
                    if idx < len(leads):
                        delay = random.randint(
                            config.get("outreach", {}).get("min_delay_seconds", 30),
                            config.get("outreach", {}).get("max_delay_seconds", 60)
                        )
                        print(f"  ⏳ Waiting {delay}s anti-spam cooldown before next email...")
                        time.sleep(delay)

                print(f"\n🎉 Campaign Finished! Successfully sent {sent}/{len(leads)} emails.")

        elif choice == "4":
            leads = load_saved_leads()
            if not leads:
                print("⚠️ No leads found to sync.")
                continue
            print(f"🔄 Syncing {len(leads)} leads to OfficialUM1 CRM Dashboard...")
            success_count = sum(1 for lead in leads if sync_lead_to_crm(lead))
            print(f"✅ Sync complete! {success_count} leads added to Admin Leads Tab.")

        elif choice == "5":
            print("\n--- Current Configuration ---")
            print(json.dumps(config, indent=2))

        elif choice == "6":
            print("\nExiting OfficialUM1 Lead Hunter. Goodbye!")
            break

if __name__ == "__main__":
    main()
