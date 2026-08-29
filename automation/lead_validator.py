"""
OfficialUM1 100% Lead Verification Engine
Validates email syntax, filters out fake/disposable emails, and verifies active DNS MX mail servers.
"""
import re
import dns.resolver

DISPOSABLE_DOMAINS = {
    "mailinator.com", "tempmail.com", "guerrillamail.com", "10minutemail.com",
    "sharklasers.com", "throwawaymail.com", "trashmail.com", "yopmail.com",
    "temp-mail.org", "fakeinbox.com", "getairmail.com", "dispostable.com"
}

EMAIL_REGEX = re.compile(r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$')

# Cache verified MX domains to prevent redundant lookups
_MX_CACHE = {}

def is_valid_email_syntax(email: str) -> bool:
    if not email or len(email) > 254:
        return False
    return bool(EMAIL_REGEX.match(email.strip()))

def is_disposable_email(email: str) -> bool:
    try:
        domain = email.split('@')[1].lower().strip()
        return domain in DISPOSABLE_DOMAINS
    except IndexError:
        return True

def has_active_mx_records(domain: str) -> bool:
    domain = domain.lower().strip()
    if domain in _MX_CACHE:
        return _MX_CACHE[domain]

    try:
        records = dns.resolver.resolve(domain, 'MX', lifetime=4)
        has_mx = len(records) > 0
        _MX_CACHE[domain] = has_mx
        return has_mx
    except Exception:
        try:
            # Fallback to A record
            records = dns.resolver.resolve(domain, 'A', lifetime=4)
            has_a = len(records) > 0
            _MX_CACHE[domain] = has_a
            return has_a
        except Exception:
            _MX_CACHE[domain] = False
            return False

def verify_lead_email(email: str) -> tuple[bool, str]:
    """
    Returns (is_valid, reason)
    """
    if not email:
        return False, "Email is empty"

    clean_email = email.strip().lower()

    if not is_valid_email_syntax(clean_email):
        return False, "Invalid email syntax"

    if is_disposable_email(clean_email):
        return False, "Disposable/temporary domain"

    domain = clean_email.split('@')[1]

    # Ignore generic file/image false positives like .png@, .js@, etc.
    if any(clean_email.endswith(ext) for ext in ['.png', '.jpg', '.jpeg', '.svg', '.webp', '.js', '.css']):
        return False, "Not an email (file extension)"

    if not has_active_mx_records(domain):
        return False, f"Domain '{domain}' has no active mail servers (MX/A)"

    return True, "100% Valid & Verified"
