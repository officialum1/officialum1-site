"""
Sendport Cold Outreach Integration Test
Tests domain deliverability, Sendport API key validation, and sends a test outreach email.
"""
import sys
import os

_current_dir = os.path.dirname(os.path.abspath(__file__))
if _current_dir not in sys.path:
    sys.path.insert(0, _current_dir)

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

from sendport_client import send_via_sendport, _get_api_key

def test_sendport():
    api_key = _get_api_key()
    recipient = sys.argv[1] if len(sys.argv) > 1 else "hello@officialum1.com"
    print("=" * 60)
    print(" 🚀 SENDPORT COLD OUTREACH INTEGRATION TEST")
    print(f" API Key: {api_key[:12]}...{api_key[-4:] if len(api_key) > 16 else ''}")
    print(f" Target Recipient: {recipient}")
    print("=" * 60)

    subject = "⚡ Sendport 2048-bit DKIM Outreach Integration Verified"
    body = """Hi Muhammad Umar,

This is a live test from your Sendport Cold Outreach Engine for OfficialUM1 LLC.

- Platform: Sendport REST API & SMTP Engine
- Domain: officialum1.com
- Tracking: Opens & Clicks enabled
- Deliverability: 2048-bit RSA DKIM & SPF authenticated

Your cold email outreach system is now connected to Sendport!

Best regards,
Muhammad Umar Mumtaz
OfficialUM1 LLC
https://officialum1.com
"""

    print("\nDispatching email via Sendport API...")
    res = send_via_sendport(
        to=recipient,
        subject=subject,
        text=body,
        from_email="Muhammad Umar <hello@officialum1.com>",
        reply_to="hello@officialum1.com",
        track_opens=True,
        track_clicks=True
    )

    if res.get("success"):
        print(f"✅ Success! Delivered via Sendport.")
        print(f"   Response: {res.get('data')}")
    else:
        print(f"❌ Delivery Note: {res.get('error')}")
        print("\nNext step: Ensure DNS records (DKIM, SPF, DMARC) for officialum1.com have propagated in Sendport dashboard.")

if __name__ == "__main__":
    test_sendport()
