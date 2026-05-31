import requests
import sys

def check_backend():
    try:
        response = requests.get("http://localhost:8000/health")
        if response.status_code == 200:
            print("✅ Backend API is running.")
            return True
        else:
            print(f"❌ Backend API returned status code {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Backend API is not reachable: {e}")
        return False

if __name__ == "__main__":
    if check_backend():
        sys.exit(0)
    else:
        sys.exit(1)
