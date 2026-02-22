import os
import time
import requests
import json
from datetime import datetime
from supabase import create_client, Client

# Environment Variables
WAZUH_API_URL = os.environ.get("WAZUH_API_URL", "https://localhost:55000")
WAZUH_USER = os.environ.get("WAZUH_USER", "wazuh-wui")
WAZUH_PASSWORD = os.environ.get("WAZUH_PASSWORD", "wazuh-wui")

SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")

# Initialize Supabase
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def get_wazuh_token():
    auth_url = f"{WAZUH_API_URL}/security/user/authenticate"
    response = requests.get(auth_url, auth=(WAZUH_USER, WAZUH_PASSWORD), verify=False)
    if response.status_code == 200:
        return response.json()['data']['token']
    else:
        raise Exception(f"Failed to authenticate Wazuh Api: {response.text}")

def fetch_agents(token):
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{WAZUH_API_URL}/agents?status=active", headers=headers, verify=False)
    if response.status_code == 200:
        return response.json()['data']['affected_items']
    return []

def main():
    print(f"[{datetime.now()}] Starting Wazuh Poller...")
    try:
        # NOTE: Ideally we would use Wazuh Webhooks sending directly to the Supabase Edge Function.
        # This script simulates a legacy polling mechanism or a scheduled sync job.
        
        token = get_wazuh_token()
        agents = fetch_agents(token)
        
        print(f"Syncing {len(agents)} active agents to Supabase...")
        
        # Example sync to a hypothetical `agents` database table
        for agent in agents:
             # Look up tenant by looking at agent.group or custom tags
             # Upsert into supabase
             pass
             
    except Exception as e:
        print(f"Error during Wazuh polling: {e}")

if __name__ == "__main__":
    import urllib3
    urllib3.disable_warnings() # Disable self-signed cert warnings for demo
    
    while True:
        main()
        # Sleep for 1 hour before polling again
        time.sleep(3600)
