import requests
from bs4 import BeautifulSoup
import urllib.parse
import time
import re
from lead_validator import verify_lead_email
from lead_hunter import scrape_website_leads

HEADERS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"}

def find_live_agency_leads():
    queries = [
        'contact "digital agency" "new york"',
        'contact "seo agency" "california"',
        'contact "web design agency" "london"',
        'contact "ecommerce agency" "texas"',
        'contact "creative agency" "miami"'
    ]

    found_leads = []
    seen = set()

    for q in queries:
        print(f"\n--- Searching: {q} ---")
        try:
            res = requests.post('https://html.duckduckgo.com/html/', data={'q': q}, headers=HEADERS, timeout=8)
            soup = BeautifulSoup(res.text, 'html.parser')
            for a in soup.select('a.result__snippet, h2 a.result__url, a.result__url'):
                href = a.get('href', '')
                if 'uddg=' in href:
                    href = urllib.parse.parse_qs(urllib.parse.urlparse(href).query).get('uddg', [''])[0]
                
                if href and href.startswith('http'):
                    domain = urllib.parse.urlparse(href).netloc.replace('www.', '').lower()
                    if domain and domain not in seen and not any(x in domain for x in ['duckduckgo', 'google', 'wikipedia', 'youtube', 'facebook', 'linkedin', 'twitter', 'instagram', 'yelp', 'clutch', 'upwork', 'fiverr']):
                        seen.add(domain)
                        print(f"Auditing: {domain} ({href})")
                        try:
                            lead = scrape_website_leads(href)
                            if lead["emails"]:
                                print(f"  ==> 100% VERIFIED LEAD FOUND: {lead['clientName']} | {lead['emails']}")
                                found_leads.append(lead)
                        except Exception as e:
                            print(f"  Error: {e}")
                        time.sleep(1.0)
        except Exception as e:
            print(f"Search failed for {q}: {e}")

    print(f"\nTotal Real Leads Discovered: {len(found_leads)}")
    return found_leads

if __name__ == "__main__":
    find_live_agency_leads()
