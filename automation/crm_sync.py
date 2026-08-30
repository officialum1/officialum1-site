"""
OfficialUM1 CRM Sync Module
Saves scraped and verified leads into the OfficialUM1 CRM Leads Database.
"""
import requests
from typing import Dict, Any

API_ENDPOINT = "http://localhost:3000/api/leads"

def sync_lead_to_crm(lead: Dict[str, Any], platform_tag: str = "B2B Outreach", base_url: str = "https://officialum1.com") -> bool:
    primary_email = lead["emails"][0] if lead.get("emails") else lead.get("buyerEmail", "")
    if not primary_email:
        return False

    client_name = lead.get("clientName") or lead.get("domain") or "Verified Lead"
    website = lead.get("website", "")
    phones = ", ".join(lead.get("phones", []))
    
    notes = f"Website: {website}\n"
    if phones:
        notes += f"Phone: {phones}\n"
    notes += f"Extracted via OfficialUM1 100% Lead Hunter Suite.\nDetails: {lead.get('notes', '')}"

    payload = {
        "action": "add",
        "clientName": client_name,
        "buyerEmail": primary_email,
        "platform": platform_tag,
        "budget": 500,
        "notes": notes
    }

    # Try live domain first, fallback to localhost
    for url_root in [base_url, "http://localhost:3000"]:
        try:
            target_url = f"{url_root.rstrip('/')}/api/leads"
            res = requests.post(target_url, json=payload, timeout=6)
            if res.status_code in [200, 201]:
                return True
        except Exception:
            continue

    return False
