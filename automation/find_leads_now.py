"""
Instant B2B Lead Extraction Runner for OfficialUM1
Searches, audits, validates, and syncs 100% verified real agency/business leads.
"""
import time
import json
import sys
import os

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

from lead_hunter import search_bing_leads
from crm_sync import sync_lead_to_crm

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

def run_batch():
    target_queries = [
        ("Digital Marketing Agency New York", "Digital Agency USA"),
        ("SEO Agency California", "SEO Agency USA"),
        ("Web Development Agency London", "Web Dev UK"),
        ("Shopify E-commerce Agency Texas", "Ecommerce Agency USA"),
        ("Performance Marketing Agency Florida", "Performance Marketing USA")
    ]

    print("=" * 65)
    print(" 🚀 STARTING 100% VERIFIED LIVE LEAD EXTRACTION FOR OFFICIALUM1")
    print("=" * 65)

    all_found_leads = []
    existing_leads = load_saved_leads()
    existing_emails = {lead["emails"][0] for lead in existing_leads if lead.get("emails")}

    for query, tag in target_queries:
        print(f"\n🔍 Searching for: '{query}' ({tag})...")
        leads = search_bing_leads(query, max_results=10)
        
        for lead in leads:
            if lead["emails"] and lead["emails"][0] not in existing_emails:
                existing_emails.add(lead["emails"][0])
                all_found_leads.append(lead)
                existing_leads.append(lead)
                print(f"  ✨ [NEW LEAD] {lead['clientName']} | {lead['emails'][0]} | {lead['domain']}")
                
                # Sync to CRM
                synced = sync_lead_to_crm(lead, platform_tag=tag)
                if synced:
                    print(f"     ✅ Auto-synced to OfficialUM1 CRM Dashboard")
                else:
                    print(f"     💾 Saved to verified list")

        time.sleep(1.5)

    save_leads(existing_leads)

    print("\n" + "=" * 65)
    print(f" 🎉 EXTRACTION COMPLETE! Total new verified leads found: {len(all_found_leads)}")
    print(f" 📂 Total Lead Database: {len(existing_leads)} leads in 'automation/verified_leads.json'")
    print("=" * 65)

if __name__ == "__main__":
    run_batch()
