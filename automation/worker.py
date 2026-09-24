"""
OfficialUM1 LLC - 24/7 Global Client Acquisition Cloud Daemon (Render.com)
Runs continuous automated background outreach sprints + provides live HTTP monitoring & manual triggers.
Equipped with strict zero-bounce safety guard and pause/resume controls.
"""
import os
import sys
import json
import time
import random
import threading
from datetime import datetime
from fastapi import FastAPI, BackgroundTasks
from fastapi.responses import JSONResponse
import uvicorn

_current_dir = os.path.dirname(os.path.abspath(__file__))
if _current_dir not in sys.path:
    sys.path.insert(0, _current_dir)

from main import (
    load_all_worldwide_leads,
    load_sent_history,
    load_config,
    execute_outreach_batch,
    DATASETS
)

app = FastAPI(
    title="OfficialUM1 24/7 Global Outreach Engine",
    description="Automated high-ticket client acquisition engine for Dubai, Africa, Europe, US & UK."
)

# Global Worker State - Defaults to SAFETY_PAUSE to protect Titan mailbox limit
STATE = {
    "status": "SAFETY_PAUSED",
    "is_paused": True, # Paused to allow Titan bounceback counter to reset
    "started_at": datetime.utcnow().isoformat(),
    "last_batch_time": None,
    "next_batch_scheduled": None,
    "total_delivered": 0,
    "active_batch_running": False,
    "last_batch_result": None,
    "safety_message": "Outreach safely paused to let Titan 24-hour bounceback limit counter reset."
}

def background_autopilot_loop():
    """
    Continuous 24/7 Autopilot Daemon.
    Sends smart batches of 15 verified leads every 2 hours, rotating across all continents.
    Respects safety pause state.
    """
    time.sleep(5)
    print("🚀 [Render Cloud Worker] Global Outreach Daemon Loaded.")

    while True:
        try:
            if STATE["is_paused"]:
                print(f"[Safety Guard] Autopilot is PAUSED. Sleeping 60s... ({datetime.utcnow().strftime('%H:%M:%S UTC')})")
                time.sleep(60)
                continue

            leads = load_all_worldwide_leads()
            history = load_sent_history()
            STATE["total_delivered"] = len(history)

            print(f"\n[Autopilot Trigger - {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}]")
            print(f"Available Global Leads: {len(leads)} | Total Delivered: {len(history)}")

            STATE["active_batch_running"] = True
            STATE["last_batch_time"] = datetime.utcnow().isoformat()

            # Execute batch of 15 leads with anti-spam delays (15-25s)
            execute_outreach_batch(leads, max_count=15, delay_range=(15, 25))

            history_after = load_sent_history()
            STATE["total_delivered"] = len(history_after)
            STATE["active_batch_running"] = False
            STATE["last_batch_result"] = f"Delivered at {datetime.utcnow().isoformat()}"

            # Cooldown for 2 hours (7200 seconds) before next global batch
            cooldown_seconds = 7200
            STATE["next_batch_scheduled"] = (datetime.utcnow().timestamp() + cooldown_seconds)
            print(f"\n⏳ [Autopilot Cooldown] Sleeping for 2 hours before next worldwide batch...")
            time.sleep(cooldown_seconds)

        except Exception as e:
            print(f"❌ [Autopilot Error in Loop]: {e}")
            STATE["active_batch_running"] = False
            time.sleep(300)

@app.on_event("startup")
def start_worker_thread():
    t = threading.Thread(target=background_autopilot_loop, daemon=True)
    t.start()

@app.get("/")
@app.get("/status")
def health_check():
    history = load_sent_history()
    return {
        "service": "OfficialUM1 24/7 Global Client Acquisition Worker",
        "status": STATE["status"],
        "is_paused": STATE["is_paused"],
        "safety_message": STATE["safety_message"],
        "active_batch_running": STATE["active_batch_running"],
        "total_leads_delivered": len(history),
        "started_at": STATE["started_at"],
        "last_batch_time": STATE["last_batch_time"],
        "next_batch_timestamp": STATE["next_batch_scheduled"],
        "active_continents": ["Dubai / UAE", "Africa (Kenya, Tanzania, SA)", "Europe (Italy, Switzerland, Spain)", "USA & UK"]
    }

@app.post("/pause")
def pause_outreach():
    STATE["is_paused"] = True
    STATE["status"] = "SAFETY_PAUSED"
    return {"message": "Outreach safely PAUSED. Titan bounce counter is resting.", "is_paused": True}

@app.post("/resume")
def resume_outreach():
    STATE["is_paused"] = False
    STATE["status"] = "AUTOPILOT_ACTIVE"
    return {"message": "Outreach RESUMED. Autopilot will run scheduled batches.", "is_paused": False}

@app.post("/trigger")
def trigger_instant_sprint(background_tasks: BackgroundTasks, count: int = 10):
    if STATE["active_batch_running"]:
        return JSONResponse(status_code=400, content={"error": "A batch is already running. Please wait."})

    def run_sprint():
        STATE["active_batch_running"] = True
        leads = load_all_worldwide_leads()
        execute_outreach_batch(leads, max_count=count, delay_range=(12, 20))
        STATE["active_batch_running"] = False

    background_tasks.add_task(run_sprint)
    return {"message": f"Manual sprint of {count} leads triggered successfully in background!"}

@app.get("/test-email")
def test_email_endpoint(to: str = "hello@officialum1.com"):
    cfg = load_config()
    smtp_cfg = cfg.get("smtp", {})
    from main import send_email
    subject = "OfficialUM1 Cloud Worker - Heartbeat Check"
    body = """Hi Muhammad Umar,\n\nYour 24/7 Render Cloud Worker is connected and verified natively via hello@officialum1.com.\n\nBest regards,\nOfficialUM1 Team"""
    try:
        send_email(smtp_cfg, to, subject, body)
        return {"status": "SUCCESS", "message": f"Test email sent to {to}", "from": "hello@officialum1.com"}
    except Exception as e:
        return {"status": "FAILED", "error": str(e)}

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    uvicorn.run("worker:app", host="0.0.0.0", port=port, reload=False)
