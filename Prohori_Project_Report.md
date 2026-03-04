# Project Report: Prohori (প্রহরী)
**Digital Resilience Suite for Smart Bangladesh**

## Abstract / Executive Summary
"Prohori" (প্রহরী) is a comprehensive, multi-tenant Software-as-a-Service (SaaS) platform offering "Security-as-a-Service" (SECaaS) tailored specifically for small-to-medium enterprises (SMEs) in Bangladesh. This project addresses the critical gap in affordable cybersecurity infrastructure for businesses that lack dedicated IT security teams but are mandated to comply with national regulations such as the Cyber Security Act (CSA) 2023.

By combining an enterprise-grade open-source Security Information and Event Management (SIEM) core (Wazuh) with a modern web frontend (Next.js) and an AI-driven Reasoning Layer (Groq/Gemini), Prohori translates complex technical logs into actionable, plain-language insights (in English and Bangla). The suite offers a Unified Security Dashboard, automated compliance report generation via LaTeX, localized payment integrations (bKash/Nagad), and a democratized Bug Bounty Marketplace. Prohori’s hybrid cloud architecture leverages "Zero-Cost" tier resources (Oracle Cloud Infrastructure and Azure for Students) alongside serverless computing (Supabase/Vercel) to deliver high-end security at a localized, accessible price point.

---

## 1. Introduction

### 1.1 Background
As digitalization accelerates across Bangladesh, small and medium enterprises face an escalating landscape of cyber threats, ranging from brute-force attacks to ransomware. Simultaneously, the regulatory environment has tightened, notably with the introduction of the Cyber Security Act (CSA) 2023 and guidelines from Bangladesh Bank, requiring businesses to maintain active monitoring and vulnerability management systems.

### 1.2 Problem Statement
Traditional cybersecurity solutions (like commercial SIEMs) are prohibitively expensive for local SMEs, requiring costly enterprise licenses and highly paid, specialized personnel to interpret the technical data. Furthermore, global platforms lack integration with local compliance frameworks and local payment gateways, creating friction for Bangladeshi business owners.

### 1.3 Objectives
Prohori aims to solve these challenges by providing a cost-effective, automated, and localized digital resilience suite. The primary objectives are to:
1. Provide real-time server monitoring and threat mitigation without requiring deep technical expertise from the user.
2. Automate the generation of legal compliance documents (CSA 2023).
3. Utilize Large Language Models (LLMs) to demystify technical alerts.
4. Establish a localized ecosystem for ethical hacking (Bug Bounty).
5. Ensure seamless onboarding and billing via local mobile financial services (MFS) like bKash and Nagad.

---

## 2. Project Overview & Core Features

Prohori operates as a centralized web application where business owners manage their organization’s security posture.

### 2.1 Unified Security Dashboard
A "Control Room" providing real-time visibility into server security.
*   **Live Threat Feed:** Displays blocked attacks (e.g., brute-force attempts, malware detection) with severity indicators and geolocation.
*   **Server Health Metrics:** Real-time CPU, RAM, and Disk usage charts pulled from the connected agents.
*   **Status Indicators:** Simple Green/Yellow/Red health statuses for immediate situational awareness.

### 2.2 AI Security Analyst (Reasoning Layer)
A conversational interface powered by Large Language Models (LLMs) designed to bridge the technical gap.
*   Users click "Ask AI" next to an alert to receive instant, non-technical explanations in plain language (or Bangla).
*   Provides the "Why" (why it's a threat) and actionable "Next Steps" (e.g., "Enable 2FA") instead of just raw log output.

### 2.3 Localized Compliance Engine (CSA 2023)
An automated reporting tool critical for regulatory adherence.
*   Aggregates a month’s worth of security data.
*   Uses AI to summarize the events into an executive summary.
*   Injects the data into a professional LaTeX template to generate a downloadable "Certificate of Compliance" PDF required by local banks and laws.

### 2.4 SME Bug Bounty Marketplace
A democratized platform for vulnerability disclosure.
*   Allows companies to set a budget and scope for ethical hackers to find vulnerabilities before malicious actors do.
*   Manages submissions, reviews, and automated reward payouts via bKash.

### 2.5 Integrated Local Billing & HRM
*   **Billing:** Automated subscription lifecycle management via bKash/Nagad Tokenized Checkout.
*   **HRM & Access Control:** Role-based access control (Owner, Admin, User, Viewer, Researcher) to manage employee access and maintain granular audit logs of all actions.

---

## 3. System Architecture & Design

Prohori utilizes a modern, hybrid-cloud microservices architecture, separating the heavy security processing from the user-facing application logic.

### 3.1 High-Level Architecture Diagram

```text
[ User's Browser / Device ]
           |
           | (HTTPS / REST)
           v
+---------------------------------------------------+
|               VERCEL (Frontend)                   |
| - Next.js 14 App Router (React, Tailwind CSS)     |
| - Unified Dashboard, AI Chat UI, Report UI        |
+---------------------------------------------------+
           |                                ^
           | (API Calls / Webhooks)         | (Real-time data / SSE)
           v                                |
+---------------------------------------------------+
|             SUPABASE (Backend Services)           |
| - Auth (JWT, Role Management)                     |
| - PostgreSQL DB (Users, Configs, Billing, Logs)   |
| - Edge Functions (AI Routing, Notifications)      |
| - Storage (PDF Reports)                           |
+---------------------------------------------------+
           |                                ^
           | (Webhooks)                     | (API Polling / Webhooks)
           v                                |
+---------------------------------------------------+
|         ORACLE CLOUD / AZURE (Security Core)      |
| - Wazuh Manager (SIEM Core)                       |
| - Wazuh Indexer (Log Storage)                     |
| - Python Automation & Polling Scripts             |
+---------------------------------------------------+
           ^
           | (Encrypted Log Streaming)
           v
[ Client's Server / Website ]
- Wazuh Agent (Lightweight Monitor)
```

### 3.2 Component Breakdown

1.  **Presentation Layer (Frontend):** Built with Next.js 14, Tailwind CSS, and shadcn/ui. Hosted on Vercel. It acts as the "Face" of the platform, fetching summarized data to display via secure API middleware.
2.  **Data & Auth Layer (Backend):** Powered by Supabase. Handles authentication, stores relational data (users, companies, subscriptions, alert summaries), and utilizes Row Level Security (RLS) to guarantee multi-tenant data isolation.
3.  **Security Core Layer:** Hosted on Oracle Cloud Infrastructure (OCI) ARM instances. Runs the Wazuh Manager, which acts as the "Eyes", collecting and analyzing raw logs from client agents against threat intelligence rules.
4.  **AI & Logic Layer:**
    *   **Groq (Llama 3.3 70B):** Used for real-time, low-latency tasks like the "Ask AI" chat feature.
    *   **Google Gemini 2.5 Flash:** Used for batch processing large datasets, such as summarizing thousands of logs for the monthly compliance report.
5.  **Integration Layer:** Handles external communications via Resend (Emails), Twilio (WhatsApp alerts), bKash/Nagad (Payments), and LaTeX (`node-latex` for PDF generation).

---

## 4. Workflows & Working Procedure

### 4.1 Onboarding & Agent Installation
1.  **Registration & Payment:** The business owner signs up, selects a plan, and pays via the bKash tokenized gateway.
2.  **Deployment:** Upon successful payment, the user is provided a single-line command to run on their server.
3.  **Connection:** The command installs the Wazuh Agent, which securely registers with the Prohori Core Engine. The dashboard status updates to "Connected".

### 4.2 Real-Time Threat Monitoring & AI Consultation
1.  **Detection:** A Wazuh Agent detects anomalous activity (e.g., multiple failed logins) and transmits the log to the Wazuh Manager.
2.  **Alerting:** The Manager generates a High/Critical alert. A Python script polls the API and triggers a Supabase Edge Function via webhook.
3.  **Notification:** The Edge Function saves the alert to the database and dispatches a WhatsApp/Email notification to the user.
4.  **AI Analysis:** The user clicks "Ask AI" in the dashboard. The frontend triggers an API route that fetches the raw log and sends it to Groq. Groq processes the log against a system prompt and streams a plain-language explanation and recommended actions back to the UI.

### 4.3 Automated Compliance Generation
1.  **Trigger:** A scheduled cron job runs monthly.
2.  **Data Aggregation:** A script queries the Wazuh Indexer for all events pertaining to a specific company for the past month.
3.  **Summarization:** The batch data is sent to the Gemini API to generate an executive summary.
4.  **Document Assembly:** The summary, along with database metrics (threats blocked, uptime), is injected into a pre-designed LaTeX template.
5.  **Delivery:** The system compiles the `.tex` file into a PDF, uploads it to Supabase storage, and notifies the user that their CSA 2023 report is ready.

---

## 5. Implementation Technologies

The platform mandates a strict, modern technology stack to ensure performance, type safety, and scalability.

*   **Framework:** Next.js 14 (App Router) with TypeScript in strict mode.
*   **Styling & UI:** Tailwind CSS v3, shadcn/ui primitives, Framer Motion for fluid animations.
*   **State Management:** Zustand for global state, React Hook Form + Zod for robust form validation.
*   **Backend / Database:** Supabase (PostgreSQL, Auth, Edge Functions, Storage, Row Level Security).
*   **SIEM Core:** Wazuh REST API.
*   **Artificial Intelligence:** Groq API (real-time chat) and Google Gemini API (batch reporting).
*   **Document Generation:** LaTeX via the `node-latex` NPM package.
*   **Communications:** Resend API for transactional emails, Twilio for WhatsApp messaging.
*   **Payments:** bKash Tokenized Checkout API v1.2.0 and Nagad API.

---

## 6. Administrator Management (Prohori HQ)

To manage the SaaS platform effectively, Prohori includes a highly secure, segregated Admin Portal (HQ) accessible only via a secret URL segment defined by environment variables.

### 6.1 Admin Architecture
*   **Access Control:** Requires a separate login flow. Access is strictly gated by an `ADMIN_AUTHORIZED_EMAILS` environment variable list.
*   **Dashboard:** Provides platform-wide KPIs: Total Organizations, Monthly Recurring Revenue (MRR), Active Subscriptions, and Global Critical Alerts.

### 6.2 Key Admin Capabilities
*   **User & Company Management:** Deep inspection of company profiles, agent health, and user activity. Admins can suspend accounts, force password resets, or mandate plan downgrades.
*   **Subscription & Revenue Control:** Full visibility into billing cycles, failed payments, and MRR charts. Admins can issue refunds, pause subscriptions, or grant free promotional access.
*   **Global Security Oversight:** View system-wide alerts across all tenants to identify macro-trends or zero-day attacks targeting the platform's user base. Admins can isolate a company's server in emergencies.
*   **Communications & Content:** A built-in Email Center (via Resend) for broadcasting announcements, an in-app Announcement banner manager, and a Content Manager to dynamically update pricing plans and notification templates without code redeploys.

---

## 7. Business Model & Value Proposition

### 7.1 "Security-as-a-Service" (SECaaS)
Prohori operates on a subscription-based recurring revenue model. By packaging complex infrastructure into tiered monthly plans (e.g., Basic, Pro, Enterprise), it shifts cybersecurity from a massive Capital Expenditure (CapEx) to an affordable Operating Expenditure (OpEx) for SMEs.

### 7.2 The "Zero-Cost" Build Advantage
The foundational infrastructure relies on highly generous student/developer tiers:
*   **Oracle Cloud (OCI):** "Always Free" ARM instances provide the substantial RAM (24GB) needed to run the Wazuh SIEM core for free.
*   **Azure for Students:** Provides supplemental compute, dynamic IPs, and database storage without requiring credit card commitments.
*   **Supabase / Vercel:** Generous free tiers handle up to 50k users and complex serverless edge functions.
This architecture allows the platform to maintain incredibly high profit margins while offering subscription prices that local SMEs can easily afford.

### 7.3 Unique Market Fit
Unlike global competitors (e.g., Datadog, Splunk), Prohori is explicitly engineered for the Bangladeshi market. It solves localized problems by automating CSA 2023 compliance, providing AI analysis in Bangla, and integrating exclusively with local MFS providers (bKash/Nagad) rather than requiring USD credit cards.

---

## 8. Conclusion

Prohori is a paradigm shift for cybersecurity in Bangladesh. By leveraging cutting-edge open-source SIEM technologies, advanced AI reasoning models, and a localized Go-To-Market strategy, it democratizes enterprise-grade security. It empowers small business owners to defend their digital assets, achieve strict regulatory compliance effortlessly, and operate with resilience in an increasingly hostile digital landscape, truly embodying the vision of a "Smart Bangladesh."