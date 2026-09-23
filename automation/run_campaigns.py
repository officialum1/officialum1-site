"""
OfficialUM1 - Master High-Ticket Outreach Campaign Manager
Unified CLI control center to run & simulate targeted client acquisition campaigns.
"""
import os
import sys
import json
import subprocess

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

def show_banner():
    print("=" * 72)
    print(" 🚀 [OFFICIALUM1 LLC] - HIGH-TICKET CLIENT ACQUISITION CONTROL CENTER")
    print("=" * 72)

def show_stats():
    history_file = os.path.join(os.path.dirname(__file__), "sent_outreach_history.json")
    history = []
    if os.path.exists(history_file):
        try:
            with open(history_file, "r", encoding="utf-8") as f:
                history = json.load(f)
        except Exception:
            pass

    new_brand_sent = sum(1 for h in history if "NEW_BRAND" in h.get("campaign", ""))
    tourism_sent = sum(1 for h in history if "TOURISM" in h.get("campaign", ""))
    speed_sent = sum(1 for h in history if "SPEED" in h.get("campaign", ""))
    auth_sent = sum(1 for h in history if "AUTHORITY" in h.get("campaign", "") or h.get("campaign") is None)

    print(f" CAMPAIGN PERFORMANCE & CRM SYNC:")
    print(f"    - Total Delivered Leads in History: {len(history)}")
    print(f"    - [🔥] New Brands 0-to-1 Growth: {new_brand_sent}")
    print(f"    - [🇦🇪] Boutique Dubai Tourism: {tourism_sent}")
    print(f"    - [⚡] WordPress Speed & Next.js: {speed_sent}")
    print(f"    - [🔗] Agency Authority Backlinks: {auth_sent}")
    print("=" * 72)

def main():
    show_banner()
    show_stats()
    
    print("\nSelect High-Converting Campaign to Execute:")
    print("  [1] 🌟 [NEW BRANDS] Run 0-to-1 Launch & Growth Outreach (New UAE/US/UK Brands)")
    print("  [2] 🇦🇪 [DUBAI BOUTIQUE] Run Boutique Tourism & Yacht Charters Outreach")
    print("  [3] 🔗 [AGENCY LINKS] Run White-Label Authority Link Building (US/UK Agencies)")
    print("  [4] ⚡ [SPEED & CRO] Run WordPress Speed Optimization & Conversion Outreach")
    print("  [5] 📊 [ALL] Run Multi-Channel Growth Sprint (Batch Send)")
    print("  ---")
    print("  [0] Exit\n")

    if len(sys.argv) > 1:
        choice = sys.argv[1]
    else:
        choice = input("Enter choice (0-5): ").strip()

    script_dir = os.path.dirname(os.path.abspath(__file__))

    actions = {
        "1": ["python", "-u", os.path.join(script_dir, "send_new_brand_growth_outreach.py"), "25"],
        "2": ["python", "-u", os.path.join(script_dir, "send_dubai_tourism_outreach.py"), "25"],
        "3": ["python", "-u", os.path.join(script_dir, "send_authority_outreach.py"), "--live"],
        "4": ["python", "-u", os.path.join(script_dir, "send_speed_outreach.py"), "--live"],
    }

    if choice in actions:
        print("\n" + ">" * 25 + f" EXECUTING CAMPAIGN [{choice}] " + "<" * 25 + "\n")
        subprocess.run(actions[choice])
    elif choice == "5":
        print("\n" + ">" * 20 + " EXECUTING MULTI-CHANNEL GROWTH SPRINT " + "<" * 20 + "\n")
        print("1. Running New Brands Sprint...")
        subprocess.run(actions["1"])
        print("\n2. Running Boutique Dubai Tourism Sprint...")
        subprocess.run(actions["2"])
    elif choice == "0":
        print("Goodbye!")
    else:
        print("Invalid option selected.")

if __name__ == "__main__":
    main()
