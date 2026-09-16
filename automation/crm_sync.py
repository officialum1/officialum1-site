"""
OfficialUM1 CRM Sync Module
Saves outreach campaign emails & leads into the OfficialUM1 CRM Leads Database (data/leads.json + DB).
"""
import os
import json
import time

CRM_JSON_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "leads.json")

def sync_outreach_to_crm(lead: dict, campaign_tag: str = "B2B Outreach", status: str = "In Progress", budget: int = 399):
    primary_email = lead["emails"][0] if lead.get("emails") else lead.get("buyerEmail", "")
    if not primary_email:
        return

    client_name = lead.get("clientName") or lead.get("company") or lead.get("domain") or "Verified Target"
    domain = lead.get("domain", "")
    notes = lead.get("notes", "")

    note_text = f"Domain: {domain}\nCampaign: {campaign_tag}\nStatus: {status}\nOutreach Time: {time.strftime('%Y-%m-%d %H:%M:%S')}"
    if notes:
        note_text += f"\nDetails: {notes}"

    try:
        leads_list = []
        if os.path.exists(CRM_JSON_PATH):
            with open(CRM_JSON_PATH, "r", encoding="utf-8") as f:
                leads_list = json.load(f)

        # Check if already exists in CRM by email
        existing = next((l for l in leads_list if l.get("contact", "").lower() == primary_email.lower()), None)
        if existing:
            existing["status"] = status
            existing["notes"] = note_text
            existing["source"] = campaign_tag
        else:
            new_entry = {
                "id": f"lead_{int(time.time() * 1000)}",
                "name": client_name,
                "contact": primary_email,
                "source": campaign_tag,
                "status": status,
                "notes": note_text,
                "value": str(budget),
                "createdBy": "OutreachAutomation",
                "createdAt": time.strftime("%Y-%m-%dT%H:%M:%S.000Z", time.gmtime())
            }
            leads_list.insert(0, new_entry)

        with open(CRM_JSON_PATH, "w", encoding="utf-8") as f:
            json.dump(leads_list, f, indent=2)

    except Exception as e:
        print(f"  [CRM Sync Warning]: {e}")
