"""
OfficialUM1 B2B Lead Hunter
Crawls target websites, business directories, and contact endpoints to find real verified business leads.
"""
import re
import time
import urllib.parse
from typing import List, Dict, Any
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


def search_bing_leads(query: str, max_results: int = 15) -> List[Dict[str, Any]]:
    """
    Finds business websites via Bing search query without needing paid API keys.
    """
    encoded_q = urllib.parse.quote(query)
    search_url = f"https://www.bing.com/search?q={encoded_q}&count={max_results}"
    
    found_leads = []
    seen_domains = set()

    try:
        res = requests.get(search_url, headers=HEADERS, timeout=8)
        if res.status_code == 200:
            soup = BeautifulSoup(res.text, 'html.parser')
            results = soup.select('li.b_algo h2 a')

            for link in results:
                href = link.get('href', '')
                title = link.get_text().strip()
                if href and href.startswith('http'):
                    domain = urllib.parse.urlparse(href).netloc.replace('www.', '')
                    if domain and domain not in seen_domains and not any(ign in domain for ign in ['bing.', 'microsoft.', 'google.', 'wikipedia.org', 'youtube.com']):
                        seen_domains.add(domain)
                        print(f"  🔍 Auditing {domain}...")
                        lead_data = scrape_website_leads(href, business_name=title.split('|')[0].split('-')[0].strip())
                        if lead_data["emails"]:
                            found_leads.append(lead_data)
                            print(f"  ✅ Found 100% Verified Lead: {lead_data['clientName']} -> {', '.join(lead_data['emails'])}")
                        time.sleep(1.2)
    except Exception as e:
        print(f"Error during search: {e}")

    return found_leads
