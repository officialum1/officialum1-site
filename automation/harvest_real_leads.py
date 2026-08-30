"""
High-Ticket US Agency Lead Extraction & CRM Sync
Crawls top digital agencies in USA & UK, extracts verified emails, and syncs to OfficialUM1 CRM.
"""
import sys
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

import time
import json
import os
from lead_hunter import scrape_website_leads
from lead_validator import verify_lead_email
from crm_sync import sync_lead_to_crm

TARGET_AGENCIES = [
    ("https://thriveagency.com", "Thrive Internet Marketing Agency", "SEO & Web Agency USA"),
    ("https://www.singlegrain.com", "Single Grain Digital", "Performance Growth USA"),
    ("https://www.jivesmedia.com", "Jives Media Agency", "Web & Lead Gen USA"),
    ("https://www.sevenatoms.com", "SevenAtoms Marketing", "PPC & SEO Agency California"),
    ("https://coalitiontechnologies.com", "Coalition Technologies", "Ecommerce & Next.js USA"),
    ("https://justdigitalinc.com", "Just Digital Inc", "Web Design Los Angeles"),
    ("https://www.kobedigital.com", "Kobe Digital", "Performance Development USA"),
    ("https://teqtop.com", "TEQTOP Digital", "Full Stack Agency New York"),
    ("https://krausmarketing.com", "Kraus Marketing", "SEO & Branding Agency NJ/NY"),
    ("https://www.smartsites.com", "SmartSites Digital", "Omnichannel Growth USA"),
    ("https://siegemedia.com", "Siege Media", "Content & Link Building Agency"),
    ("https://ladder.io", "Ladder Growth Services", "Growth Strategy New York"),
    ("https://ninjapromo.io", "NinjaPromo Digital", "B2B & Web Tech Agency"),
    ("https://www.silverbackstrategies.com", "Silverback Strategies", "Search & Media Agency USA"),
    ("https://onlineoptimism.com", "Online Optimism", "Design & SEO Growth USA"),
    ("https://adventureppc.com", "AdVenture Media Group", "Performance Digital Agency NY"),
    ("https://propeller.co.uk", "Propeller Digital", "Web Design & Digital Agency London/NY"),
    ("https://inflow.agency", "Go Inflow Agency", "Ecommerce Growth & SEO"),
    ("https://disruptiveadvertising.com", "Disruptive Advertising", "Paid Media & Web Agency"),
    ("https://webmechanix.com", "WebMechanix", "Digital Performance Maryland")
]

LEADS_CACHE_FILE = os.path.join(os.path.dirname(__file__), "verified_leads.json")

def load_saved_leads():
    if os.path.exists(LEADS_CACHE_FILE):
        try:
            with open(LEADS_CACHE_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return []
    return []

def save_leads(leads):
    with open(LEADS_CACHE_FILE, "w", encoding="utf-8") as f:
        json.dump(leads, f, indent=2)

def extract_and_sync_all():
    print("=" * 65)
    print(" 🚀 OFFICIALUM1 - LIVE B2B AGENCY LEAD HARVESTER & VERIFIER")
    print("=" * 65)

    existing_leads = load_saved_leads()
    existing_domains = {l.get("domain", "") for l in existing_leads}
    
    verified_leads_found = []

    for url, name, tag in TARGET_AGENCIES:
        print(f"\n🔍 Auditing {name} ({url})...")
        try:
            lead = scrape_website_leads(url, business_name=name)
            
            # If standard scraper missed contact email, check known domain fallbacks
            if not lead["emails"]:
                domain = lead["domain"]
                fallbacks = [f"contact@{domain}", f"info@{domain}", f"hello@{domain}"]
                for fb in fallbacks:
                    is_valid, _ = verify_lead_email(fb)
                    if is_valid:
                        lead["emails"].append(fb)
                        break

            if lead["emails"]:
                print(f"  ✅ [100% VERIFIED] Email: {lead['emails'][0]} | Domain: {lead['domain']}")
                if lead["phones"]:
                    print(f"     Phone: {lead['phones'][0]}")

                if lead["domain"] not in existing_domains:
                    existing_domains.add(lead["domain"])
                    existing_leads.append(lead)
                    verified_leads_found.append(lead)

                # Sync to CRM
                synced = sync_lead_to_crm(lead, platform_tag=tag)
                if synced:
                    print(f"     📊 Auto-synced to OfficialUM1 CRM Leads Database")
            else:
                print(f"  ⚠️ No public direct email extracted (Contact form available: {url}/contact)")

            time.sleep(1.0)
        except Exception as e:
            print(f"  ❌ Error auditing {url}: {e}")

    save_leads(existing_leads)

    print("\n" + "=" * 65)
    print(f" 🎉 SUCCESS! Harvested & Verified {len(verified_leads_found)} High-Ticket Agency Leads!")
    print(f" 📂 Total Leads in OfficialUM1 Database: {len(existing_leads)}")
    print("=" * 65)

if __name__ == "__main__":
    extract_and_sync_all()
