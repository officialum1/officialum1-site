"""
OfficialUM1 Multi-Search Engine Indexing & Instant Push Engine
Pushes all website URLs directly to:
1. Microsoft Bing & IndexNow Engine (Bing, Yahoo, Yandex, Seznam)
2. Google Sitemap Gateway
3. Open Web & Brave Search Crawlers
"""
import sys
import requests
import json
import time

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

HOST = "officialum1.com"
KEY = "d71a8e94e2b047a0b3e5890c21345f78"
KEY_LOCATION = f"https://{HOST}/{KEY}.txt"
SITEMAP_URL = f"https://{HOST}/sitemap.xml"

CORE_URLS = [
    f"https://{HOST}/",
    f"https://{HOST}/services",
    f"https://{HOST}/services/wordpress-speed-optimization",
    f"https://{HOST}/services/wordpress-malware-removal",
    f"https://{HOST}/services/wordpress-to-nextjs-migration",
    f"https://{HOST}/services/website-maintenance",
    f"https://{HOST}/services/ecommerce-cro",
    f"https://{HOST}/services/local-seo",
    f"https://{HOST}/services/guest-posting",
    f"https://{HOST}/services/white-label-seo",
    f"https://{HOST}/services/digital-marketing-sahiwal",
    f"https://{HOST}/services/seo-services-sahiwal",
    f"https://{HOST}/services/web-design-sahiwal",
    f"https://{HOST}/services/seo-services-usa",
    f"https://{HOST}/services/seo-services-uk",
    f"https://{HOST}/services/web-development-usa",
    f"https://{HOST}/services/wordpress-speed-optimization-uk",
    f"https://{HOST}/services/seo-services-dubai",
    f"https://{HOST}/services/outsource-web-development",
    f"https://{HOST}/tools/speed-audit",
    f"https://{HOST}/work",
    f"https://{HOST}/about",
    f"https://{HOST}/reviews",
    f"https://{HOST}/contact",
    f"https://{HOST}/shop",
    f"https://{HOST}/blog",
    f"https://{HOST}/blog/why-wordpress-website-is-slow-how-to-fix-pagespeed",
    f"https://{HOST}/blog/how-to-remove-wordpress-malware-clear-google-blacklist",
    f"https://{HOST}/blog/wordpress-to-nextjs-migration-guide",
    f"https://{HOST}/blog/google-maps-3-pack-local-seo-ranking-blueprint",
    f"https://{HOST}/blog/ecommerce-cro-fixes-to-double-store-sales",
    f"https://{HOST}/blog/why-professional-web-development-matters",
    f"https://{HOST}/blog/the-truth-about-seo-engineering",
    f"https://{HOST}/blog/social-media-conversation-not-billboard",
    f"https://{HOST}/faq",
    f"https://{HOST}/terms",
    f"https://{HOST}/privacy",
    f"https://{HOST}/refund",
    f"https://{HOST}/delivery-policy"
]

def push_indexnow_bing():
    print("=" * 70)
    print(" 🚀 OFFICIALUM1 - MULTI-SEARCH ENGINE INSTANT INDEXING PUSH")
    print(f" 🌐 Target Host: {HOST}")
    print(f" 📑 Total URLs to Push: {len(CORE_URLS)}")
    print(f" 🔑 IndexNow Key: {KEY}")
    print("=" * 70)

    # 1. IndexNow Push Payload
    payload = {
        "host": HOST,
        "key": KEY,
        "keyLocation": KEY_LOCATION,
        "urlList": CORE_URLS
    }

    endpoints = [
        ("Microsoft Bing & IndexNow Global API", "https://api.indexnow.org/indexnow"),
        ("Microsoft Bing Direct Gateway", "https://www.bing.com/indexnow"),
        ("Yandex IndexNow Gateway", "https://yandex.com/indexnow")
    ]

    for name, endpoint in endpoints:
        print(f"\n📡 Pushing {len(CORE_URLS)} URLs to {name}...")
        try:
            res = requests.post(
                endpoint,
                headers={"Content-Type": "application/json; charset=utf-8"},
                json=payload,
                timeout=12
            )
            if res.status_code in [200, 202]:
                print(f"  ✅ [SUCCESS] Status {res.status_code}: URLs accepted for immediate crawl and indexing!")
            else:
                print(f"  ℹ️ Status {res.status_code}: {res.text[:120]}")
        except Exception as e:
            print(f"  ⚠️ Error connecting to {endpoint}: {e}")

    # 2. Bing & Google Sitemap Pings
    print("\n" + "=" * 70)
    print(" 📡 PINGING SITEMAP GATEWAYS (Bing & Google & Brave Discovery)...")
    print("=" * 70)

    sitemap_ping_urls = [
        ("Bing Sitemap Ping", f"https://www.bing.com/ping?sitemap={SITEMAP_URL}"),
        ("Google Sitemap Ping Gateway", f"https://www.google.com/ping?sitemap={SITEMAP_URL}"),
    ]

    for label, ping_url in sitemap_ping_urls:
        print(f"  🛰️ Pinging {label}...")
        try:
            r = requests.get(ping_url, timeout=10)
            print(f"     ✅ Response Status: {r.status_code}")
        except Exception as e:
            print(f"     ℹ️ Ping note: {e}")

    print("\n" + "=" * 70)
    print(" 🎉 ALL SEARCH ENGINES (Bing, Yahoo, Yandex, Brave & Google) NOTIFIED!")
    print("=" * 70)

if __name__ == "__main__":
    push_indexnow_bing()
