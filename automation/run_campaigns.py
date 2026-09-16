"""
OfficialUM1 - Master Cold Outreach Campaign Manager
Unified CLI control center to run & simulate Campaigns 1, 2, and 3.
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
    print(" [OFFICIALUM1 LLC] - MULTI-CAMPAIGN OUTREACH CONTROL CENTER")
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

    speed_sent = sum(1 for h in history if "SPEED" in h.get("campaign", ""))
    pr_sent = sum(1 for h in history if "PR" in h.get("campaign", ""))
    auth_sent = sum(1 for h in history if "AUTHORITY" in h.get("campaign", "") or h.get("campaign") is None)

    print(f" CAMPAIGN STATS:")
    print(f"    - Total Delivered in History: {len(history)}")
    print(f"    - [1] WordPress Speed Sent: {speed_sent}")
    print(f"    - [2] Press Release Sent: {pr_sent}")
    print(f"    - [3] Authority Links Sent: {auth_sent}")
    print("=" * 72)

def main():
    show_banner()
    show_stats()
    
    print("\nSelect an action to execute:")
    print("  [1] [SPEED] Run WordPress Speed Campaign (Dry Run Simulation)")
    print("  [2] [SPEED] Run WordPress Speed Campaign (LIVE SEND)")
    print("  [3] [SPEED] Run WordPress Speed FOLLOW-UP (LIVE SEND)")
    print("  ---")
    print("  [4] [PR] Run Press Release Campaign (Dry Run Simulation)")
    print("  [5] [PR] Run Press Release Campaign (LIVE SEND)")
    print("  [6] [PR] Run Press Release FOLLOW-UP (LIVE SEND)")
    print("  ---")
    print("  [7] [AUTHORITY] Run Authority Links Campaign (Dry Run Simulation)")
    print("  [8] [AUTHORITY] Run Authority Links Campaign (LIVE SEND)")
    print("  [9] [AUTHORITY] Run Authority Links FOLLOW-UP (LIVE SEND)")
    print("  ---")
    print("  [0] Exit\n")

    if len(sys.argv) > 1:
        choice = sys.argv[1]
    else:
        choice = input("Enter choice (0-9): ").strip()

    script_dir = os.path.dirname(os.path.abspath(__file__))

    actions = {
        "1": ["python", os.path.join(script_dir, "send_speed_outreach.py")],
        "2": ["python", os.path.join(script_dir, "send_speed_outreach.py"), "--live"],
        "3": ["python", os.path.join(script_dir, "send_speed_outreach.py"), "--live", "--followup"],
        "4": ["python", os.path.join(script_dir, "send_pr_outreach.py")],
        "5": ["python", os.path.join(script_dir, "send_pr_outreach.py"), "--live"],
        "6": ["python", os.path.join(script_dir, "send_pr_outreach.py"), "--live", "--followup"],
        "7": ["python", os.path.join(script_dir, "send_authority_outreach.py")],
        "8": ["python", os.path.join(script_dir, "send_authority_outreach.py"), "--live"],
        "9": ["python", os.path.join(script_dir, "send_authority_outreach.py"), "--live", "--followup"],
    }

    if choice in actions:
        print("\n" + ">" * 25 + f" EXECUTING CHOICE [{choice}] " + "<" * 25 + "\n")
        subprocess.run(actions[choice])
    elif choice == "0":
        print("Goodbye!")
    else:
        print("Invalid option selected.")

if __name__ == "__main__":
    main()
