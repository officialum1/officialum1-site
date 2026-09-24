"""
OfficialUM1 LLC - Master Unified Worldwide Client Acquisition & Outreach Engine
All-In-One script: Hunts, validates, pitches, and syncs high-ticket deals globally on autopilot.
"""
import os
import sys
import json
import time
import random
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.utils import formatdate, make_msgid

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

_current_dir = os.path.dirname(os.path.abspath(__file__))
if _current_dir not in sys.path:
    sys.path.insert(0, _current_dir)

from crm_sync import sync_outreach_to_crm
from lead_validator import verify_lead_email

CONFIG_FILE = os.path.join(_current_dir, "config.json")
SENT_HISTORY_FILE = os.path.join(_current_dir, "sent_outreach_history.json")

# All Worldwide Datasets
DATASETS = {
    "NEW_BRANDS": os.path.join(_current_dir, "leads_new_growing_brands.json"),
    "DUBAI_BOUTIQUE": os.path.join(_current_dir, "leads_dubai_boutique_tourism.json"),
    "DUBAI_ALL": os.path.join(_current_dir, "leads_dubai_tourism.json"),
    "AFRICA_SAFARI": os.path.join(_current_dir, "leads_africa_safari_luxury.json"),
    "EUROPE_LUXURY": os.path.join(_current_dir, "leads_europe_high_ticket.json"),
    "AGENCY_AUTHORITY": os.path.join(_current_dir, "leads_authority.json"),
    "WORDPRESS_SPEED": os.path.join(_current_dir, "leads_speed.json"),
}

# High-Converting Niche Pitch Templates
PITCH_TEMPLATES = {
    "NEW_BRANDS": {
        "subject": "Growth roadmap & direct bookings for {company} ({domain})",
        "budget": 1800,
        "tag": "New Brand 0-to-1 Growth",
        "body": """Hi {client_name},

Congratulations on the recent launch of {company} ({domain})!

Building momentum for a newly launched {niche} brand in {location} can be challenging when established legacy companies dominate search results.

Most new operators either pay heavy 20%-30% commission cuts to third-party booking platforms (Viator/Tripadvisor) or lose money on ads due to slow mobile sites that convert under 2%.

At OfficialUM1 LLC, we engineer 0-to-1 growth acceleration for new brands:
- Custom, sub-500ms direct booking pages with 1-click Apple Pay & Card checkout (0% commission).
- Fast-track Google Local 3-Pack and organic rankings to start capturing purchase-ready clients within 30 days.
- End-to-end digital & brand infrastructure so you can focus 100% on operations.

Would you be open to a complimentary 30-Day Growth Roadmap for {domain} showing how to outrank local competitors this month?

Best regards,

Muhammad Umar
Founder & Principal Engineer | OfficialUM1 LLC
Direct: hello@officialum1.com
Website: https://officialum1.com/services/tourism-seo-dubai
"""
    },
    "TOURISM": {
        "subject": "Quick question regarding {company}'s direct booking engine ({domain})",
        "budget": 2500,
        "tag": "Dubai & Global Tourism Direct Booking",
        "body": """Hi {client_name},

Hope you are having a productive week.

I came across {company} while researching top {niche} operators in {location}.

Most tourism and charter companies we speak with lose 20% to 30% of every booking to third-party OTAs (Viator, GetYourGuide, Tripadvisor) simply because their website direct booking engine is too slow or lacks a seamless 1-click mobile checkout for international tourists.

At OfficialUM1 LLC, we engineer custom, ultra-fast direct booking platforms (Next.js & WordPress) and Local 3-Pack SEO that:
1. Allow tourists to book in under 30 seconds with Apple Pay, Google Pay, and Stripe with 0% OTA commission fees.
2. Rank your brand #1 on Google for high-intent search queries.
3. Guarantee sub-500ms mobile page load speeds for travelers browsing on mobile.

Would you be open to a quick 5-minute complimentary review of {domain}'s mobile booking funnel and 3 specific tweaks to boost your direct bookings this season?

Best regards,

Muhammad Umar
Founder & Principal Engineer | OfficialUM1 LLC
Direct: hello@officialum1.com
Website: https://officialum1.com/services/tourism-seo-dubai
"""
    },
    "AFRICA_SAFARI": {
        "subject": "Direct international bookings & lodge SEO for {company} ({domain})",
        "budget": 3500,
        "tag": "Africa Luxury Safari Direct Bookings",
        "body": """Hi {client_name},

Hope you are doing well in {location}.

Reaching out because {company} offers an incredible guest experience in {niche}.

Many luxury safari lodges and tour operators lose thousands of dollars each month paying 20%-25% commission fees to intermediary booking platforms and overseas agents.

At OfficialUM1 LLC, we build bespoke, lightning-fast direct booking engines and international Google SEO tailored for African luxury lodges:
- Direct, multi-currency credit card & wire checkout with 0% platform commissions.
- High-authority Google rankings targeting wealthy travelers in the US, UK, and Europe.
- Multilingual, photo-optimized Next.js websites that load in under 500ms worldwide.

Would you be open to a quick 5-minute review of {domain} and how we can help increase your direct, commission-free international bookings this season?

Best regards,

Muhammad Umar
Founder & Principal Engineer | OfficialUM1 LLC
Direct: hello@officialum1.com
Website: https://officialum1.com/services/tourism-seo-dubai
"""
    },
    "EUROPE_LUXURY": {
        "subject": "VIP direct booking funnel & performance for {company} ({domain})",
        "budget": 3000,
        "tag": "Europe Luxury Tourism & Yachting",
        "body": """Hi {client_name},

Hope your season is going well in {location}.

I came across {company} while auditing top-tier {niche} providers across Europe.

High-net-worth clients booking luxury experiences expect an instant, frictionless mobile booking experience. High bounce rates on mobile and heavy OTA commissions can cost thousands in lost revenue every week.

At OfficialUM1 LLC, we engineer high-performance web platforms and digital acquisition funnels for European boutique luxury brands:
- Sub-500ms mobile speed with Apple Pay, Stripe, and multilingual support.
- Top-ranking SEO across Google.de, Google.co.uk, Google.fr, and Google.it.
- Complete white-glove technical handling with 0% platform commission cuts.

Would you be open to a quick 5-minute teardown of {domain}'s mobile funnel and 3 immediate opportunities to increase direct VIP bookings?

Best regards,

Muhammad Umar
Founder & Principal Engineer | OfficialUM1 LLC
Direct: hello@officialum1.com
Website: https://officialum1.com/services
"""
    },
    "AUTHORITY": {
        "subject": "Wholesale DA60+ editorial placements & niche edits for {domain}",
        "budget": 1499,
        "tag": "Agency Authority Link Building",
        "body": """Hi {client_name},

Hope your week is going well.

Reaching out because I saw the SEO work you are doing with {domain}. At OfficialUM1, we work directly with publishers across 65,000+ vetted websites (DA50 to DA75+ with real monthly Google organic traffic).

We help agency partners and brands secure permanent in-content editorial backlinks and niche edits with zero PBNs and 365-day replacement protection.

Are you currently taking on new guest post placements or looking for direct wholesale rates for your client campaigns?

Happy to send over our curated domain shortlist and 2-3 live sample placements if you would like to take a look.

Best regards,

Muhammad Umar
Founder & Principal Engineer | OfficialUM1 LLC
Direct: hello@officialum1.com
Website: https://officialum1.com/services/guest-posting
"""
    },
    "SPEED": {
        "subject": "Mobile speed & Core Web Vitals audit for {domain}",
        "budget": 899,
        "tag": "WordPress Speed & Next.js CRO",
        "body": """Hi {client_name},

I ran a performance scan on {domain} today and noticed mobile visitors are experiencing 3.8s+ load delays on initial paint.

According to Google, each 1-second delay drops conversion rates by up to 20% on mobile checkouts.

At OfficialUM1 LLC, we specialize in high-performance web engineering:
- Guarantee 90+ Mobile PageSpeed on Google PageSpeed Insights.
- Fix Core Web Vitals (LCP, INP, CLS) and database bottlenecks without breaking UI.
- Headless WordPress to Next.js 15 migration for sub-500ms global load times.

Would you like a free 3-minute video breakdown showing the exact 3 scripts slowing down {domain}?

Best regards,

Muhammad Umar
Founder & Principal Engineer | OfficialUM1 LLC
Direct: hello@officialum1.com
Website: https://officialum1.com/services/wordpress-speed-optimization
"""
    }
}

def load_config():
    cfg = {}
    if os.path.exists(CONFIG_FILE):
        with open(CONFIG_FILE, "r", encoding="utf-8") as f:
            cfg = json.load(f)
    
    env_file = os.path.join(_current_dir, ".env")
    if os.path.exists(env_file):
        try:
            with open(env_file, "r", encoding="utf-8") as ef:
                for line in ef:
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        k, v = line.split("=", 1)
                        os.environ.setdefault(k.strip(), v.strip())
        except Exception:
            pass

    env_pass = os.getenv("RESEND_API_KEY") or os.getenv("SMTP_PASSWORD")
    if env_pass and "smtp" in cfg:
        cfg["smtp"]["password"] = env_pass
    return cfg

def load_sent_history():
    if not os.path.exists(SENT_HISTORY_FILE):
        return []
    try:
        with open(SENT_HISTORY_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return []

def record_sent(lead, campaign_type, status, budget, tag):
    history = load_sent_history()
    email = lead["emails"][0] if lead.get("emails") else ""
    history.append({
        "clientName": lead.get("clientName", ""),
        "company": lead.get("company", ""),
        "domain": lead.get("domain", ""),
        "email": email,
        "campaign": campaign_type,
        "status": status,
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
    })
    try:
        with open(SENT_HISTORY_FILE, "w", encoding="utf-8") as f:
            json.dump(history, f, indent=2)
    except Exception as e:
        print(f"  [Warning saving history]: {e}")

    # Live sync to Admin CRM
    sync_outreach_to_crm(lead, campaign_tag=tag, status="In Progress", budget=budget)

def load_all_worldwide_leads():
    all_leads = []
    for key, path in DATASETS.items():
        if os.path.exists(path):
            try:
                with open(path, "r", encoding="utf-8") as f:
                    leads = json.load(f)
                    for l in leads:
                        l["_dataset_key"] = key
                    all_leads.extend(leads)
            except Exception as e:
                print(f"  [Error loading {key}]: {e}")
    return all_leads

def send_email(smtp_cfg, to_email, subject, body_text):
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    from_email = smtp_cfg.get("from_email", smtp_cfg.get("reply_to", "hello@officialum1.com"))
    msg["From"] = f"{smtp_cfg.get('sender_name', 'Muhammad Umar')} <{from_email}>"
    msg["To"] = to_email
    msg["Reply-To"] = smtp_cfg.get("reply_to", "hello@officialum1.com")
    msg["Date"] = formatdate(localtime=True)
    msg["Message-ID"] = make_msgid(domain="officialum1.com")

    msg.attach(MIMEText(body_text, "plain", "utf-8"))

    envelope_from = smtp_cfg.get("email", from_email)
    if smtp_cfg.get("use_ssl", True):
        with smtplib.SMTP_SSL(smtp_cfg["host"], smtp_cfg["port"], timeout=20) as server:
            server.login(smtp_cfg["email"], smtp_cfg["password"])
            server.sendmail(envelope_from, [to_email], msg.as_string())
    else:
        with smtplib.SMTP(smtp_cfg["host"], smtp_cfg["port"], timeout=20) as server:
            server.starttls()
            server.login(smtp_cfg["email"], smtp_cfg["password"])
            server.sendmail(envelope_from, [to_email], msg.as_string())

def execute_outreach_batch(leads, max_count=30, delay_range=(15, 25)):
    cfg = load_config()
    smtp_cfg = cfg.get("smtp", {})
    sent_history = load_sent_history()
    already_sent = {h["email"].lower() for h in sent_history if "email" in h}

    print("=" * 75)
    print(f" 🚀 OFFICIALUM1 LLC - UNIFIED WORLDWIDE OUTREACH RUNNER")
    print(f" Target Batch Size: {max_count} | Available Leads: {len(leads)}")
    print("=" * 75)

    sent_count = 0
    for idx, lead in enumerate(leads, 1):
        if sent_count >= max_count:
            print(f"\n[OK] Reached batch limit of {max_count} emails.")
            break

        emails = lead.get("emails", [])
        if not emails:
            continue

        target_email = emails[0].strip()
        if target_email.lower() in already_sent:
            continue

        # 100% Real Email & DNS MX Verification (Zero-Mistake Protocol)
        is_valid, reason = verify_lead_email(target_email)
        if not is_valid:
            print(f"  [Skipped Invalid Email] {target_email}: {reason}")
            continue

        dataset_key = lead.get("_dataset_key", "NEW_BRANDS")
        template_key = (
            "NEW_BRANDS" if "NEW" in dataset_key else
            "AFRICA_SAFARI" if "AFRICA" in dataset_key else
            "EUROPE_LUXURY" if "EUROPE" in dataset_key else
            "AUTHORITY" if "AUTHORITY" in dataset_key else
            "SPEED" if "SPEED" in dataset_key else
            "TOURISM"
        )
        tmpl = PITCH_TEMPLATES.get(template_key, PITCH_TEMPLATES["NEW_BRANDS"])

        # Natural formatting for client & company names
        raw_name = lead.get("clientName", "Founder")
        client_name = raw_name.strip() if raw_name and raw_name.lower() != "team" else "Founder"
        company = lead.get("company", lead.get("domain", "your brand")).replace(" LLC", "").replace(" Ltd", "").replace(" Inc", "").strip()
        domain = lead.get("domain", "your website").replace("https://", "").replace("http://", "").strip("/")
        location = lead.get("city", lead.get("country", "your market"))
        niche = lead.get("niche", lead.get("industry", "tourism & hospitality"))

        subject = tmpl["subject"].format(company=company, domain=domain, niche=niche, location=location)
        body = tmpl["body"].format(
            client_name=client_name,
            company=company,
            domain=domain,
            location=location,
            niche=niche
        )

        print(f"\n[{sent_count+1}/{max_count}] Pitching ({template_key}): {company} ({target_email})...")
        try:
            send_email(smtp_cfg, target_email, subject, body)
            record_sent(lead, campaign_type=template_key, status="DELIVERED", budget=tmpl["budget"], tag=tmpl["tag"])
            already_sent.add(target_email.lower())
            sent_count += 1
            print(f"  ✅ Sent successfully | Synced to CRM (${tmpl['budget']} deal)")

            if sent_count < max_count:
                wait_time = random.randint(delay_range[0], delay_range[1])
                print(f"  ⏳ Waiting {wait_time}s human anti-spam delay...")
                time.sleep(wait_time)

        except Exception as e:
            print(f"  ❌ Error sending to {target_email}: {e}")
            record_sent(lead, campaign_type=template_key, status=f"FAILED: {str(e)[:40]}", budget=tmpl["budget"], tag=tmpl["tag"])

    print("\n" + "=" * 75)
    print(f"🎉 OUTREACH SPRINT FINISHED: {sent_count} emails delivered and synced to CRM!")
    print("=" * 75)

def main():
    print("=" * 75)
    print(" 🌍 OFFICIALUM1 LLC - UNIFIED GLOBAL CLIENT ACQUISITION SUITE")
    print("=" * 75)

    all_leads = load_all_worldwide_leads()
    history = load_sent_history()

    print(f"\n📊 SYSTEM STATUS:")
    print(f"  - Total Worldwide Leads in Database: {len(all_leads)}")
    print(f"  - Total Delivered Leads in History:  {len(history)}")
    print(f"  - Active SMTP Account:               {load_config().get('smtp', {}).get('email')}")

    print("\nSelect an Action:")
    print("  [1] 🚀 1-CLICK ALL-WORLDWIDE AUTOPILOT SPRINT (Rotates New Brands, Dubai, Africa, Europe, US)")
    print("  [2] 🌟 Run ONLY New Brands & Startups Campaign")
    print("  [3] 🇦🇪 Run ONLY Boutique Dubai Tourism Campaign")
    print("  [4] 🦁 Run ONLY African Safari & Luxury Lodges Campaign")
    print("  [5] 🏰 Run ONLY European Luxury Chalets & Charters Campaign")
    print("  [6] 🔗 Run ONLY US/UK Agency Authority Links Campaign")
    print("  [7] ⚡ Run ONLY WordPress Speed & Next.js Campaign")
    print("  [0] ❌ Exit\n")

    if len(sys.argv) > 1 and sys.argv[1] == "--autopilot":
        choice = "1"
    elif len(sys.argv) > 1:
        choice = sys.argv[1]
    else:
        choice = input("Enter Choice [0-7]: ").strip()

    if choice == "1":
        execute_outreach_batch(all_leads, max_count=35)
    elif choice == "2":
        leads = [l for l in all_leads if "NEW" in l.get("_dataset_key", "")]
        execute_outreach_batch(leads, max_count=20)
    elif choice == "3":
        leads = [l for l in all_leads if "DUBAI" in l.get("_dataset_key", "")]
        execute_outreach_batch(leads, max_count=20)
    elif choice == "4":
        leads = [l for l in all_leads if "AFRICA" in l.get("_dataset_key", "")]
        execute_outreach_batch(leads, max_count=20)
    elif choice == "5":
        leads = [l for l in all_leads if "EUROPE" in l.get("_dataset_key", "")]
        execute_outreach_batch(leads, max_count=20)
    elif choice == "6":
        leads = [l for l in all_leads if "AGENCY" in l.get("_dataset_key", "")]
        execute_outreach_batch(leads, max_count=20)
    elif choice == "7":
        leads = [l for l in all_leads if "SPEED" in l.get("_dataset_key", "")]
        execute_outreach_batch(leads, max_count=20)
    elif choice == "0":
        print("Goodbye!")
    else:
        print("Invalid choice.")

if __name__ == "__main__":
    main()
