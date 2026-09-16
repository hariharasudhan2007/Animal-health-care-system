"""
VetCare - Animal Health Care Management System
Single-command launcher: python run.py
"""
import subprocess
import sys
import time
import webbrowser
import threading
import os

PORT = 8000
HOST = "127.0.0.1"
URL = f"http://{HOST}:{PORT}"

def open_browser():
    """Open the browser after giving the server 1.5 seconds to start."""
    time.sleep(1.5)
    webbrowser.open(URL)
    print(f"\n✅ VetCare opened at: {URL}\n")

def main():
    print("=" * 60)
    print("  🐾  VetCare — Animal Health Care Management System")
    print("=" * 60)
    print(f"\n🚀 Starting FastAPI server on {URL} ...")
    print("   Press Ctrl+C to stop.\n")

    # Open browser in background thread
    thread = threading.Thread(target=open_browser, daemon=True)
    thread.start()

    # Start uvicorn server
    try:
        subprocess.run(
            [sys.executable, "-m", "uvicorn", "main:app", "--host", HOST, "--port", str(PORT), "--reload"],
            cwd=os.path.dirname(os.path.abspath(__file__))
        )
    except KeyboardInterrupt:
        print("\n\n🛑 VetCare server stopped.")

if __name__ == "__main__":
    main()
