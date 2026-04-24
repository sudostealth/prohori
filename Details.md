# PROHORI (প্রহরী) - Complete Project Report

## 1. Project Overview
**Name:** PROHORI (প্রহরী)
**Description:** PROHORI is a modern, AI-powered compliance, security logging, and auditing platform. It simplifies the tedious, manual process of security analysis and compliance reporting by combining real-time log ingestion (via Wazuh) and offline log parsing with advanced AI models. It features a sleek user portal, multi-tenant isolation, and a robust architecture.

## 2. Motivation
Traditional compliance reporting, security auditing, and log analysis are slow, manual, and highly error-prone processes. Organizations struggle to make sense of massive volumes of log data, and generating compliant security reports often takes teams weeks of dedicated effort.

The motivation behind PROHORI is to abstract away the complexity of raw log analysis by introducing an automated, multi-tenant platform. By leveraging the power of Large Language Models (LLMs) to interpret logs and generate human-readable insights, PROHORI reduces analysis time from weeks to minutes, helping organizations stay secure and compliant effortlessly.

## 3. Objectives
* **Automate Security Analysis:** Process large volumes of log data (from direct uploads or integrated Wazuh agents) and generate AI-driven threat insights.
* **Streamline Compliance Reporting:** Allow users to instantly generate fully branded compliance reports (HTML, PDF, DOCX) based on analyzed data.
* **Provide Unified Visibility:** Offer a multi-tenant dashboard where companies can view their active endpoint agents, threat metrics, and historical logs in one centralized place.
* **Ensure Robust Security:** Enforce strict data isolation between companies using Supabase Row Level Security (RLS) and securely integrate with security backends like Wazuh.

## 4. Problem Domain
* **Data Silos:** Security logs are often scattered across various endpoints and formats (CSV, Excel, raw text).
* **Alert Fatigue:** Security tools generate thousands of alerts, making it difficult for human analysts to identify actual threats.
* **Manual Compliance:** Preparing documents that adhere to compliance standards is a significant administrative burden.
* **Cost of Tooling:** Enterprise SIEM and compliance tools are often too expensive and complex for small to medium-sized businesses.

## 5. Structure & Architecture
PROHORI is structured as a full-stack web application with distinct separation of concerns:

### Frontend Layer
* **Framework:** Next.js (App Router)
* **Styling:** Tailwind CSS, Framer Motion (for animations), Shadcn UI, and Lucide React (for icons).
* **Role:** Delivers a highly responsive, animated, and user-friendly interface. Manages state via React Hooks and `use-server` actions. Includes customized branding and data visualizations (Recharts).

### Backend & API Layer
* **Framework:** Next.js API Routes & Server Actions.
* **Role:** Handles business logic securely on the server. Includes atomic operations (like user/company sign-ups via Supabase Admin Client bypassing RLS), file parsing (`papaparse`, `xlsx`), and orchestration between external APIs.
* **Subdomain Routing:** Next.js Middleware routes `hq.prohori.app` to a dedicated Admin panel.

### Database & Authentication (Supabase)
* **Auth:** Secure user registration, login, and session management.
* **Database:** PostgreSQL database storing users, companies, agents, logs, and compliance records.
* **Row Level Security (RLS):** Ensures strict multi-tenant isolation. A company can only view and manage its own data and logs.

### Security Engine (Wazuh)
* **Integration:** Prohori connects to a Wazuh manager via a custom API client. Since Wazuh uses self-signed certificates by default, the server bypasses strict SSL via `node-fetch` and custom agents.

### AI Engine (OpenRouter)
* **Integration:** Utilizes the Groq SDK configured for OpenRouter to fetch AI models. This engine reads summarized log data and user prompts to provide security insights and report summaries.

## 6. Detailed Workflow

### Flow A: Wazuh Server Connection & Agent Deployment
1. **Agent Registration:** From the Prohori user portal (Endpoints page), a user requests to deploy a new agent.
2. **Key Generation:** Prohori’s backend makes an API call to the configured Wazuh Manager to generate a unique Agent Key. To prevent naming collisions, the agent name is prefixed with the sanitized company name.
3. **Deployment Instructions:** The backend returns the Agent Key and an OS-specific installation script (Linux or Windows). The user runs this script on their target machine.
4. **Data Collection:** Once installed, the Wazuh agent continuously monitors the host (analyzing logs, file integrity, configuration weaknesses) and streams this data back to the Wazuh Manager.
5. **Data Integration:** Prohori fetches alerts and agent status from Wazuh via API routes, synchronizing the active/disconnected status into the Supabase database.
6. **AI Handoff:** Security alerts fetched from Wazuh are parsed, summarized in the database, and passed to the AI Analyst feature when requested by the user.

### Flow B: Log Upload & AI Analysis
1. **File Upload:** A user uploads a raw log file, CSV, or Excel file via the Prohori Dashboard.
2. **Parsing:** The Next.js frontend uses `papaparse` or `xlsx` to parse the file in the browser or on the server.
3. **Storage & Summarization:** The parsed data is saved to Supabase. To avoid hitting LLM token limits, a concise summary of the log file is generated and stored in the database.
4. **AI Analyst Query:** The user opens the AI Analyst chat interface and asks a question about the uploaded logs (e.g., "Are there any brute force attempts?").
5. **Contextual Analysis:** The backend retrieves the log `summary` from the database and sends it alongside the user's prompt to the OpenRouter AI model.
6. **Response:** The AI analyzes the context and streams a detailed, human-readable security assessment back to the user's chat interface.

## 7. Core Features
* **Multi-tenant User Portal:** Secure dashboards with isolated data views for different companies.
* **Endpoint Management:** Native UI to register and generate deployment scripts for Wazuh agents across Linux and Windows servers.
* **AI Security Analyst:** A conversational interface powered by OpenRouter LLMs that analyzes server logs and Wazuh security alerts contextually without exceeding token limits.
* **Log Ingestion & Parsing:** Built-in support for uploading and parsing raw logs, CSVs, and Excel files.
* **Compliance Reporting Engine:** Generates highly customizable compliance and security reports. Supports downloading in HTML, PDF (via `jspdf`), and DOCX formats, complete with PROHORI branding and watermarks.
* **Audit Logging:** Administrative feature where any system changes made by team members are recorded for the company owner.
* **Admin Subdomain:** Dedicated portal (`hq.prohori.app`) for super-admins to manage the platform system-wide.

## 8. Users & Roles
* **Company Owner/Admin:** Can manage endpoint agents, view team audit logs, upload data, and generate compliance reports.
* **Company User:** Can view dashboard metrics, chat with the AI Analyst, and view reports (restricted by RLS to their specific company).
* **Super Admin (`admin@prohori.app`):** Accesses the `hq.prohori.app` subdomain to manage global settings, platform content, and all tenant instances. Admin actions bypass RLS via the Supabase Service Role.

## 9. Tools & Technology Stack
* **Frontend:** Next.js 14 (App Router), React 18, Tailwind CSS, Shadcn UI, Framer Motion, Lucide React, Recharts.
* **Backend:** Node.js, Next.js API Routes, `node-fetch` (with custom HTTPS proxy/agents for Wazuh SSL bypass).
* **Database & Auth:** Supabase (`@supabase/supabase-js`, `@supabase/ssr`), PostgreSQL.
* **AI & Machine Learning:** OpenRouter API, `groq-sdk`.
* **File Processing:** `papaparse` (CSV), `xlsx` (Excel), `jspdf` & `jspdf-autotable` (PDF Reports), `docx` (Word Reports).
* **Deployment:** Vercel (Frontend & Serverless Functions).
* **Security & SIEM:** Wazuh API.

## 10. How to Run / Setup Instructions
1. **Clone the repository.**
2. **Install dependencies:** `npm install`
3. **Environment Setup:**
   Copy the example environment file:
   `cp .env.local.example .env.local`
   Fill in the required variables, particularly:
   - `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `OPENROUTER_API_KEY`
   - Wazuh credentials and URL
4. **Run Development Server:** `npm run dev`
5. **Build for Production:** `npm run build` then `npm start`.

*Note on Wazuh Integration: Ensure your Wazuh manager is accessible. The application is configured to bypass self-signed SSL errors when communicating with the Wazuh API internally.*