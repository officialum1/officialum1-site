"""
OfficialUM1 WordPress Speed Optimization - Targeted Lead Hunter & Cold Email Engine
Audits high-potential WordPress & WooCommerce businesses, measures live latency/TTFB,
extracts verified contact emails, and drafts customized high-converting speed pitches.
"""
import os
import sys
import time
import json
import urllib.parse
import requests
from bs4 import BeautifulSoup

_current_dir = os.path.dirname(os.path.abspath(__file__))
if _current_dir not in sys.path:
    sys.path.insert(0, _current_dir)

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

from lead_validator import verify_lead_email
from lead_hunter import scrape_website_leads
from crm_sync import sync_lead_to_crm
from smart_emailer import TEMPLATES

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9"
}

# Curated list of verified commercial WordPress & WooCommerce business targets
WORDPRESS_TARGET_CANDIDATES = [
    ("https://wpbuffs.com", "WP Buffs Maintenance & Speed", "WordPress Agency"),
    ("https://mintwp.com", "MintWP WordPress Support", "WordPress Agency"),
    ("https://fixrunner.com", "FixRunner WP Services", "WordPress Agency"),
    ("https://www.wpsitecare.com", "WP Site Care", "WordPress Support"),
    ("https://themetrust.com", "ThemeTrust Themes", "WordPress WooCommerce"),
    ("https://organicthemes.com", "Organic Themes", "WordPress WooCommerce"),
    ("https://cyberchimps.com", "CyberChimps WP", "WordPress Themes"),
    ("https://cssigniter.com", "CSSIgniter Themes", "WordPress Agency"),
    ("https://studiopress.com", "StudioPress WP", "WordPress Agency"),
    ("https://superbthemes.com", "Superb Themes", "WordPress Themes"),
    ("https://wpmudev.com", "WPMU DEV Services", "WordPress Services"),
    ("https://generatepress.com", "GeneratePress Performance", "WordPress Theme"),
    ("https://themeisle.com", "ThemeIsle WP", "WordPress Publisher"),
    ("https://machothemes.com", "MachoThemes Digital", "WordPress Themes"),
    ("https://solopianoradio.com", "Whisperings Solo Piano", "WooCommerce Store"),
    ("https://rootspdx.com", "Roots Coffeehouse", "WordPress Local Business"),
    ("https://www.flothemes.com", "FloThemes Creative", "WordPress Creative Agency"),
    ("https://www.modernrebels.co", "Modern Rebels Event Planning", "WordPress Business"),
    ("https://nordicpoint.co.uk", "Nordic Point Design", "WordPress Agency UK"),
    ("https://www.vanillafrosting.co.uk", "Vanilla Frosting Cakes", "WordPress WooCommerce UK")
]

def audit_wordpress_target(url: str, business_name: str = ""):
    start_time = time.time()
    try:
        res = requests.get(url, headers=HEADERS, timeout=8, allow_redirects=True)
        load_time = round(time.time() - start_time, 2)
        html = res.text
    except Exception as e:
        return {"url": url, "error": str(e), "is_wp": False}

    wp_indicators = ["wp-content", "wp-includes", "wp-json", "wordpress", "woocommerce", "elementor", "yoast"]
    is_wp = any(ind in html.lower() for ind in wp_indicators)

    lead_data = scrape_website_leads(url, business_name=business_name)
    lead_data["load_time_seconds"] = load_time
    lead_data["is_wordpress"] = is_wp
    lead_data["status_code"] = res.status_code

    # Fallbacks if email not in obvious places
    if not lead_data["emails"]:
        domain = lead_data["domain"]
        for prefix in ["info", "contact", "support", "hello", "team"]:
            fb = f"{prefix}@{domain}"
            valid, _ = verify_lead_email(fb)
            if valid:
                lead_data["emails"].append(fb)
                break

    return lead_data

def run_wp_speed_hunt():
    print("=" * 70)
    print(" ⚡ OFFICIALUM1 - LIVE WORDPRESS SPEED OPTIMIZATION LEAD HUNTER")
    print("=" * 70)

    verified_leads = []

    for url, name, niche in WORDPRESS_TARGET_CANDIDATES:
        print(f"\n🔍 Auditing: {name} ({url})...")
        audit = audit_wordpress_target(url, business_name=name)
        
        if audit.get("is_wordpress") and audit.get("emails"):
            email = audit["emails"][0]
            latency = audit.get("load_time_seconds", 1.5)
            print(f"  ✅ [100% VERIFIED WP LEAD FOUND]")
            print(f"     🏢 Company: {audit['clientName']}")
            print(f"     🌐 Website: {audit['website']} ({audit['domain']})")
            print(f"     📧 Email:   {email}")
            print(f"     ⚡ Load Time: {latency}s (Target optimization: < 1.0s)")
            
            # Auto sync to CRM
            sync_lead_to_crm(audit, platform_tag=f"WP Speed ({niche})")
            verified_leads.append(audit)
        elif audit.get("is_wordpress"):
            print(f"     ℹ️ Confirmed WordPress site ({audit.get('load_time_seconds')}s), but direct contact email hidden behind contact form.")
        else:
            print(f"     ⏩ Skipped.")

        time.sleep(0.5)

    print("\n" + "=" * 70)
    print(f" 🎉 Successfully Discovered & Verified {len(verified_leads)} WordPress Speed Leads!")
    print(f" 📊 All synced to OfficialUM1 Admin Dashboard -> Leads!")
    print("=" * 70)

    if verified_leads:
        print("\n" + "=" * 70)
        print(" ✉️  SAMPLE COLD OUTREACH EMAIL READY TO SEND:")
        print("=" * 70)
        sample = verified_leads[0]
        tmpl = TEMPLATES["4"]
        domain = sample.get("domain", "your website")
        client_name = sample.get("clientName", "Team")
        
        subject = tmpl["subject"].format(client_name=client_name, website_domain=domain)
        body = tmpl["body"].format(client_name=client_name, website_domain=domain)
        
        print(f"TO: {sample['emails'][0]}")
        print(f"SUBJECT: {subject}\n")
        print(body)
        print("=" * 70)

    return verified_leads

if __name__ == "__main__":
    run_wp_speed_hunt()
