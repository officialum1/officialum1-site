"""
Sendport REST API Client for OfficialUM1 Cold Outreach
Supports 2048-bit RSA DKIM deliverability, open & click tracking, and JSON error handling.
"""
import os
import json
import urllib.request
import urllib.error
from typing import Dict, Any, List, Optional

def _get_api_key():
    key = os.getenv("SENDPORT_API_KEY")
    if key:
        return key
    env_path = os.path.join(os.path.dirname(__file__), ".env")
    if os.path.exists(env_path):
        try:
            with open(env_path, "r", encoding="utf-8") as f:
                for line in f:
                    if line.startswith("SENDPORT_API_KEY="):
                        return line.split("=", 1)[1].strip()
        except Exception:
            pass
    # Fallback to local config
    return os.getenv("SENDPORT_API_KEY", "")

DEFAULT_ENDPOINTS = [
    "https://getsendport.com/api/v1/emails/send",
    "https://api.getsendport.com/v1/emails"
]

def send_via_sendport(
    to: List[str] | str,
    subject: str,
    html: Optional[str] = None,
    text: Optional[str] = None,
    from_email: str = "Muhammad Umar <hello@officialum1.com>",
    reply_to: str = "hello@officialum1.com",
    api_key: Optional[str] = None,
    track_opens: bool = True,
    track_clicks: bool = True
) -> Dict[str, Any]:
    """
    Sends transactional or cold outreach email via Sendport API.
    """
    if not api_key:
        api_key = _get_api_key()
    if isinstance(to, str):
        to = [to]

    payload = {
        "from": from_email,
        "to": to,
        "subject": subject,
        "reply_to": reply_to,
        "trackOpens": track_opens,
        "trackClicks": track_clicks
    }
    if html:
        payload["html"] = html
    if text:
        payload["text"] = text
    if not html and not text:
        raise ValueError("Either 'html' or 'text' must be provided.")

    data = json.dumps(payload).encode("utf-8")
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "User-Agent": "OfficialUM1-Sendport-Client/1.0"
    }

    last_error = None
    for endpoint in DEFAULT_ENDPOINTS:
        try:
            req = urllib.request.Request(endpoint, data=data, headers=headers, method="POST")
            with urllib.request.urlopen(req, timeout=20) as response:
                body = response.read().decode("utf-8")
                try:
                    res_json = json.loads(body)
                except Exception:
                    res_json = {"status": response.status, "raw": body}
                return {"success": True, "data": res_json, "endpoint": endpoint}
        except urllib.error.HTTPError as e:
            err_body = e.read().decode("utf-8", errors="ignore")
            last_error = f"HTTP {e.code}: {err_body}"
            if e.code in (400, 401, 403, 422):
                return {"success": False, "error": last_error, "status_code": e.code}
        except Exception as e:
            last_error = str(e)

    return {"success": False, "error": last_error}
