"""
OfficialUM1 B2B Lead Hunter
Crawls target websites, business directories, and contact endpoints to find real verified business leads.
"""
import re
import time
import urllib.parse
import sys
from typing import List, Dict, Any

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

import requests
from bs4 import BeautifulSoup
from lead_validator import verify_lead_email

USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
HEADERS = {"User-Agent": USER_AGENT, "Accept-Language": "en-US,en;q=0.9"}

EMAIL_EXTRACTION_REGEX = re.compile(r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+')
PHONE_REGEX = re.compile(r'(\+?[0-9]{1,3}[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}')

def extract_emails_from_text(text: str) -> List[str]:
    raw_emails = EMAIL_EXTRACTION_REGEX.findall(text)
    clean_emails = []
    for em in raw_emails:
        em_clean = em.strip().lower()
        if verify_lead_email(em_clean)[0]:
            clean_emails.append(em_clean)
    return list(set(clean_emails))

def scrape_website_leads(url: str, business_name: str = "") -> Dict[str, Any]:
    """
    Crawls website pages (home, contact, about) to find verified contact emails and details.
    """
    if not url.startswith("http"):
        url = "https://" + url

    parsed = urllib.parse.urlparse(url)
    base_domain = f"{parsed.scheme}://{parsed.netloc}"

    result = {
        "clientName": business_name or parsed.netloc.replace("www.", "").capitalize(),
        "website": url,
        "domain": parsed.netloc.replace("www.", ""),
        "emails": [],
        "phones": [],
        "contactPage": "",
        "notes": f"Scraped from direct website audit of {parsed.netloc}"
    }

    subpages = ["", "/contact", "/contact-us", "/about", "/about-us", "/team"]
    collected_emails = set()
    collected_phones = set()

    for path in subpages:
        target_url = urllib.parse.urljoin(base_domain, path)
        try:
            res = requests.get(target_url, headers=HEADERS, timeout=6)
            if res.status_code == 200:
                soup = BeautifulSoup(res.text, 'html.parser')
                
                # Check title if business name was empty
                if not result["clientName"] and soup.title and soup.title.string:
                    result["clientName"] = soup.title.string.split("|")[0].split("-")[0].strip()

                # Check mailto: links first (highest quality)
                for a in soup.find_all('a', href=True):
                    href = a['href']
                    if href.startswith('mailto:'):
                        raw = href.replace('mailto:', '').split('?')[0].strip()
                        is_valid, _ = verify_lead_email(raw)
                        if is_valid:
                            collected_emails.add(raw.lower())

                # Scan page text
                page_text = soup.get_text()
                found_emails = extract_emails_from_text(page_text)
                collected_emails.update(found_emails)

                # Scan phones
                found_phones = PHONE_REGEX.findall(page_text)
                for ph in found_phones:
                    if isinstance(ph, str) and len(ph.strip()) >= 10:
                        collected_phones.add(ph.strip())

                if collected_emails and path in ["/contact", "/contact-us"]:
                    result["contactPage"] = target_url

        except Exception:
            continue

    result["emails"] = list(collected_emails)
    result["phones"] = list(collected_phones)[:2]
    return result


def search_web_leads(query: str, max_results: int = 15) -> List[Dict[str, Any]]:
    """
    Finds business websites via DuckDuckGo and directory parsing without API limits.
    """
    search_url = "https://html.duckduckgo.com/html/"
    found_leads = []
    seen_domains = set()

    try:
        res = requests.post(search_url, data={"q": query}, headers=HEADERS, timeout=10)
        if res.status_code == 200:
            soup = BeautifulSoup(res.text, 'html.parser')
            links = soup.select('.result__snippet, .result__url, .result__title a')

            extracted_urls = []
            for tag in soup.select('a.result__url, a.result__snippet'):
                raw_href = tag.get('href', '').strip()
                if 'uddg=' in raw_href:
                    try:
                        parsed_uddg = urllib.parse.parse_qs(urllib.parse.urlparse(raw_href).query).get('uddg', [''])[0]
                        if parsed_uddg:
                            extracted_urls.append(parsed_uddg)
                    except Exception:
                        pass
                elif raw_href.startswith('http'):
                    extracted_urls.append(raw_href)

            for href in extracted_urls[:max_results]:
                try:
                    parsed_domain = urllib.parse.urlparse(href).netloc.replace('www.', '').lower()
                    if not parsed_domain or parsed_domain in seen_domains:
                        continue
                    
                    if any(ign in parsed_domain for ign in ['duckduckgo.', 'google.', 'wikipedia.org', 'youtube.com', 'facebook.com', 'twitter.com', 'linkedin.com']):
                        continue

                    seen_domains.add(parsed_domain)
                    print(f"  🔍 Auditing {parsed_domain}...")
                    
                    lead_data = scrape_website_leads(href)
                    if lead_data["emails"]:
                        found_leads.append(lead_data)
                        print(f"  ✅ [100% VERIFIED LEAD] {lead_data['clientName']} -> {', '.join(lead_data['emails'])}")
                    
                    time.sleep(1.0)
                except Exception:
                    continue

    except Exception as e:
        print(f"Error during search: {e}")

    return found_leads

# Alias for backwards compatibility
search_bing_leads = search_web_leads
