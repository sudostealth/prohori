import os
import subprocess
from datetime import datetime
from supabase import create_client, Client

SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def generate_pdf_for_tenant(tenant_id, tenant_name):
    # This simulates filling a tex template and generating a PDF using pdflatex
    latex_template_path = "templates/compliance_report.tex"
    output_dir = f"output/{tenant_id}"
    os.makedirs(output_dir, exist_ok=True)
    
    try:
        # In practically, we'd read the template, substitute vars like {{TENANT_NAME}}, and write to a new .tex file
        # with open(latex_template_path, 'r') as f: config = f.read()
        # config = config.replace('{{TENANT_NAME}}', tenant_name)
        
        print(f"Generating LaTeX PDF for {tenant_name}...")
        # subprocess.run(["pdflatex", f"-output-directory={output_dir}", latex_template_path], check=True)
        
        # Simulate upload to supabase storage
        # with open(f"{output_dir}/compliance_report.pdf", "rb") as f:
        #    supabase.storage.from_("reports").upload(f"{tenant_id}/report-{datetime.now().strftime('%Y-%m')}.pdf", f)
            
        print(f"Successfully generated and uploaded report for {tenant_name}")
    except Exception as e:
        print(f"Failed to generate report for {tenant_name}: {e}")

def main():
    print(f"[{datetime.now()}] Running Monthly Compliance Generator...")
    
    # 1. Fetch all active tenants
    # response = supabase.table("companies").select("id", "name").eq("status", "Active").execute()
    # tenants = response.data
    tenants = [{"id": "123", "name": "TechStartup BD"}] # Mock Data
    
    for tenant in tenants:
        generate_pdf_for_tenant(tenant['id'], tenant['name'])

if __name__ == "__main__":
    main()
