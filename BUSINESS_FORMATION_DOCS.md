# OfficialUM1 — US Business Formation & Northwest Registered Agent API Documentation

Single source of truth for the US Business Formation & LLC Hub, Corporate Tools (Northwest Registered Agent) integration, pricing architecture, and Admin LLC Operations.

---

## 1. Overview & Architecture

OfficialUM1 provides full-service US company formations (LLCs, C-Corps, Nonprofits) and statutory compliance in all 50 US states for domestic and international non-resident clients.

* **API Partner**: Northwest Registered Agent via **Corporate Tools API** (`https://api.corporatetools.com`).
* **Authentication**: HMAC-SHA256 JWT signatures (`alg: HS256`, path + body/query content sha256 hash) signed with `corptools_secret_key` and identified with `corptools_access_key`.
* **Database Settings**: Keys stored in `settings` table (`corptools_access_key`, `corptools_secret_key`, `corptools_account_id`), managed directly in Admin Settings (`components/admin/tabs/SettingsTab.tsx`).

---

## 2. Pricing & Fee Structure

| Component | Amount | Description |
| :--- | :--- | :--- |
| **OfficialUM1 Service Fee** | **$50.00** | Our professional handling & compliance fee. |
| **Registered Agent Service** | **$125.00** | Northwest Registered Agent statutory address & mail delivery (Included). |
| **State Government Fee** | Dynamic per State | Exact official state filing cost (e.g. Montana $35, Wyoming $100, Delaware $90, Texas $300). |
| **Speed Upgrades** | Dynamic per State | Standard (Free / 5-7 days) or Expedited (+fees / 1-2 days). |
| **EIN Tax ID Addon** | +$50.00 | Federal IRS Tax ID registration. |
| **Operating Agreement Addon** | +$40.00 | Custom legal operating agreement. |
| **Annual Compliance Addon** | +$100.00 | Annual report compliance & corporate veil defense. |
| **Virtual Office Addon** | +$29.00 | Mail forwarding & digital scan. |

### Example Base Formation Cost (Wyoming):
`$50 (Service) + $125 (Registered Agent) + $100 (State Fee) = $275.00 Total`

---

## 3. Public User Flow (`/services/form-business`)

* **Step 0 (Service Choice)**:
  * Start New Business (LLC / Corp)
  * Change Registered Agent
  * Get EIN Tax ID
  * Annual Reports & Compliance
* **Step 1 (Basic Details)**:
  * Desired Legal Business Name
  * US State Jurisdiction selection (shows live estimated state fees)
  * Entity Type (LLC, Corporation, Nonprofit, LP, LLP, PLLC)
  * Generates Draft Company on Corporate Tools API (`POST /companies`)
* **Step 1.5 (Package Selection)**:
  * Dynamic offerings retrieved from API (`GET /filing-products/offerings`)
* **Step 2 (Filing Specifics & Speed Selection)**:
  * Filing Speed: Standard vs Expedited
  * Contact & notification email
  * Dynamic State Schema: Automatically renders state-specific questions returned by Corporate Tools API (`GET /filing-methods/schemas/:id`)
  * Auto-filled Registered Agent: Northwest commercial street address attached automatically
  * Transparent price breakdown with real-time add-on calculators
* **Step 3 (Confirmation)**:
  * Saves case to CRM (`/api/leads`) with complete JSON payload of all custom fields, speed, add-ons, and pricing.

---

## 4. Admin Panel LLC Operations Hub (`/admin/business`)

Accessible via the Admin Sidebar under **STORE & CLIENT ORDERS ➡️ US LLC Formations**.

### Key Capabilities:
1. **Intake & Submissions Pipeline**:
   * Displays all inbound formation cases from the CRM (`leads` table) with Client Name, Email, Desired Company, State, Budget, Add-ons, and Status.
2. **Missing Information & Client Outreach**:
   * If client left any required details or documents missing, staff can set status to **`⚠️ Missing Information / Action Required`**.
   * **1-Click "Email Client"**: Opens pre-filled email template with client's email, company name, and request for missing documents.
3. **Application Detail Drawer**:
   * Shows every single answer submitted (Principal Address, Mailing Address, Member/Manager Names, CorpTools ID, Speed, Addons).
   * **1-Click "Copy All"**: Formats entire case to clipboard for instant state filing.
4. **Status Management**:
   * Update status directly (New, Under Review, Missing Information, Submitted to State, Registered Agent Active, Completed).

---

## 5. Key Code Files

| Feature | Path |
| :--- | :--- |
| **Public Formation Page** | `app/services/form-business/page.tsx` |
| **Homepage Pricing Cards** | `components/BusinessSection.tsx` |
| **Admin LLC Tab** | `components/admin/tabs/BusinessTab.tsx` |
| **Admin Shell Navigation** | `components/admin/AdminShell.tsx` |
| **Corporate Tools Helper** | `lib/corptools.ts` |
| **Corporate Tools API Proxy** | `app/api/admin/corptools/route.ts` |
| **CRM Leads API Route** | `app/api/leads/route.ts` |
