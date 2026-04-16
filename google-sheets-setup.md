# Google Sheets Setup Guide

This guide tells you exactly how to create your Google Sheets spreadsheet so all 7 workflows work correctly.

---

## STEP 1 — Create the Spreadsheet

1. Go to **sheets.google.com**
2. Click the big **+** (Blank spreadsheet)
3. Click "Untitled spreadsheet" at the top and rename it: **Reputation Management System**
4. You will now create 4 tabs (sheets) inside this one spreadsheet

---

## STEP 2 — Get Your Spreadsheet ID

Look at the URL in your browser. It looks like this:

```
https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms/edit
```

The long string between `/d/` and `/edit` is your **Spreadsheet ID**.

Copy it and save it — you will paste it into every workflow.

---

## STEP 3 — Create the LEADS Tab

This is the default "Sheet1" tab. Just rename it:

1. Right-click the "Sheet1" tab at the bottom
2. Click **Rename**
3. Type: `LEADS`
4. Press Enter

Now set up the column headers. Click on cell **A1** and type each header across row 1:

| Column | Header |
|--------|--------|
| A | business_name |
| B | address |
| C | phone |
| D | website |
| E | rating |
| F | total_reviews |
| G | priority |
| H | place_id |
| I | city |
| J | profession |
| K | email |
| L | email_sent |
| M | email_replied |
| N | followup_sent |
| O | linkedin_url |
| P | instagram_url |
| Q | cold_email_message |
| R | linkedin_message |
| S | instagram_message |
| T | facebook_message |
| U | found_date |

**How to enter these quickly:**
1. Click cell A1
2. Type `business_name` then press **Tab** to move to B1
3. Type `address` then press **Tab**
4. Continue across the row

**Make the headers bold:**
1. Click the row number **1** to select the whole row
2. Press **Ctrl+B** (Windows) or **Cmd+B** (Mac)

---

## STEP 4 — Create the CLIENTS Tab

1. Click the **+** icon at the bottom left of the screen (next to the LEADS tab)
2. A new sheet called "Sheet2" appears — right-click it and rename it: `CLIENTS`

Set up column headers in row 1:

| Column | Header |
|--------|--------|
| A | client_name |
| B | business_name |
| C | google_place_id |
| D | email |
| E | fee |
| F | start_date |
| G | status |
| H | onboarded_at |

> **Important:** The `status` column must say exactly `active` (lowercase) for a client to be monitored. When you add a new client, type `active` in that column.

---

## STEP 5 — Create the REVIEWS Tab

1. Click **+** to add another sheet
2. Rename it: `REVIEWS`

Set up column headers in row 1:

| Column | Header |
|--------|--------|
| A | client_name |
| B | review_date |
| C | star_rating |
| D | review_text |
| E | suggested_response |
| F | response_posted |
| G | platform |
| H | reviewer_name |
| I | review_fingerprint |

---

## STEP 6 — Create the DASHBOARD Tab

1. Click **+** to add another sheet
2. Rename it: `DASHBOARD`

Set up column headers in row 1:

| Column | Header |
|--------|--------|
| A | metric |
| B | total_leads |
| C | emails_sent_this_week |
| D | total_clients |
| E | monthly_revenue |
| F | reviews_responded_this_week |
| G | new_reviews_this_week |
| H | last_updated |

Then add one data row in row 2:

- Cell A2: type `CURRENT`

The Dashboard workflow will update all the other cells in row 2 every hour automatically.

---

## STEP 7 — Add Your First Client (Example)

In the CLIENTS tab, add a row in row 2 with a real or test client:

| Field | Example Value |
|-------|---------------|
| client_name | Dr Sarah Jones |
| business_name | Smile Dental Manchester |
| google_place_id | ChIJ... (from Google Places API) |
| email | sarah@smiledentalmanchester.co.uk |
| fee | 250 |
| start_date | 2024-01-01 |
| status | active |

> **How to find a Google Place ID:** Go to workflow-1-lead-finder.json and run it. It saves the `place_id` column in the LEADS tab. Copy the place_id from there into your CLIENTS tab.

---

## STEP 8 — Format Tips

**Freeze the header row** so it stays visible when you scroll:
1. Click on row **1**
2. Click **View** in the menu
3. Click **Freeze** → **1 row**

Do this for all 4 tabs.

**Column widths** — drag the column borders to make them wider, especially for `cold_email_message` and `suggested_response` columns.

---

## STEP 9 — Share with n8n (Google OAuth)

When you connect Google Sheets in n8n, it will open a Google sign-in popup. Sign in with the same Google account that owns this spreadsheet. n8n will automatically get access to it.

---

## Quick Reference: Tab Summary

| Tab | Purpose | Filled by |
|-----|---------|-----------|
| LEADS | All prospect businesses found | Workflow 1 (auto), you (email column) |
| CLIENTS | Your paying customers | You (manually) |
| REVIEWS | All reviews + AI responses | Workflow 4 (auto) |
| DASHBOARD | Live business metrics | Workflow 7 (auto, hourly) |
