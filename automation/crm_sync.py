"""
OfficialUM1 CRM Sync Module
Saves scraped and verified leads into the OfficialUM1 CRM Leads Database (JSON + API).
"""
import os
import json
import time
import requests
from typing import Dict, Any

CRM_JSON_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "leads.json")

def sync_lead_to_crm(lead: Dict[str, Any], platform_tag: str = "B2B Outreach", base_url: str = "https://officialum1.com") -> bool:
    primary_email = lead["emails"][0] if lead.get("emails") else lead.get("buyerEmail", "")
    if not primary_email:
        return False

    client_name = lead.get("clientName") or lead.get("domain") or "Verified Lead"
    website = lead.get("website", "")
    phones = ", ".join(lead.get("phones", []))
    load_time = lead.get("load_time_seconds", "")
    
    notes_lines = [f"Website: {website}"]
    if phones:
        notes_lines.append(f"Phone: {phones}")
    if load_time:
        notes_lines.append(f"Load Time / Speed: {load_time}s")
    notes_lines.append("Extracted via OfficialUM1 100% Lead Hunter Suite.")

    # 1. Local JSON fallback persistence
    try:
        leads_list = []
        if os.path.exists(CRM_JSON_PATH):
            with open(CRM_JSON_PATH, "r", encoding="utf-8") as f:
                leads_list = json.load(f)

        existing_contacts = {l.get("contact", "") for l in leads_list}
        if primary_email not in existing_contacts:
            new_lead_entry = {
                "id": f"lead_{int(time.time() * 1000)}",
                "name": client_name,
                "contact": primary_email,
                "source": platform_tag,
                "status": "New",
                "notes": "\n".join(notes_lines),
                "value": "350",
                "createdBy": "LeadHunterBot",
                "createdAt": time.strftime("%Y-%m-%dT%H:%M:%S.000Z", time.gmtime())
            }
            leads_list.insert(0, new_lead_entry)
            with open(CRM_JSON_PATH, "w", encoding="utf-8") as f:
                json.dump(leads_list, f, indent=2)
    except Exception as e:
        print(f"  ⚠️ Warning saving to local CRM JSON: {e}")

    # 2. Try live API sync
    payload = {
        "action": "add",
        "clientName": client_name,
        "buyerEmail": primary_email,
        "platform": platform_tag,
        "budget": 350,
        "notes": "\n".join(notes_lines)
    }

    for url_root in [base_url, "http://localhost:3000"]:
        try:
            target_url = f"{url_root.rstrip('/')}/api/leads"
            res = requests.post(target_url, json=payload, timeout=4)
            if res.status_code in [200, 201]:
                return True
        except Exception:
            continue

    return True
