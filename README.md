# Reputation Management Automation System
### Complete Setup Guide for Beginners

This system automates your entire UK reputation management business using n8n. Once set up, it runs itself — finding leads, sending outreach emails, monitoring reviews, and generating monthly client reports automatically.

---

## What You Have Built

| File | What it does | When it runs |
|------|-------------|-------------|
| `workflow-1-lead-finder.json` | Finds local UK businesses on Google | Manually (on demand) |
| `workflow-2-message-generator.json` | Writes 4 AI outreach messages per lead | Daily at 9am |
| `workflow-3-email-sender.json` | Sends cold emails, max 15/day | Mon-Fri at 10am |
| `workflow-4-review-monitor.json` | Checks for new reviews, writes AI responses | Every 6 hours |
| `workflow-5-report-generator.json` | Emails monthly HTML reports to clients | 1st of every month |
| `workflow-6-client-onboarding.json` | Welcomes new clients automatically | When you add a client |
| `workflow-7-dashboard.json` | Updates your business dashboard | Every hour |

---

## SECTION 1 — Install n8n on Windows (Free)

### Prerequisites

You need Node.js installed first.

1. Go to **nodejs.org**
2. Click the big green **LTS** button to download
3. Run the installer — click Next through all steps, accept defaults
4. When it finishes, open **Command Prompt** (press Windows key, type `cmd`, press Enter)
5. Type this and press Enter to confirm Node.js is installed:
   ```
   node --version
   ```
   You should see something like `v20.11.0`

### Install n8n

In Command Prompt, type this and press Enter:
```
npm install -g n8n
```

Wait for it to finish (this takes 2-5 minutes). You will see a lot of text scrolling — that is normal.

### Start n8n

Each time you want to use n8n, open Command Prompt and type:
```
n8n start
```

Wait about 30 seconds. Then open your web browser and go to:
```
http://localhost:5678
```

You will see the n8n interface. The first time it asks you to create a free account — fill in your email and a password.

> **Keep Command Prompt open** while using n8n. If you close it, n8n stops. To stop n8n, close the Command Prompt window or press Ctrl+C.

---

## SECTION 2 — Set Up Your Credentials

You need to connect n8n to your external services. Do this once — n8n remembers them.

### How to Add a Credential

1. In n8n, click **Settings** (gear icon, bottom left)
2. Click **Credentials**
3. Click **Add credential** (top right button)
4. Search for the service you want
5. Fill in the details
6. Click **Save**

---

### Credential 1 — Google Sheets + Google Drive (OAuth)

1. Click **Add credential**
2. Search for: `Google Sheets OAuth2 API`
3. Click it
4. Click **Sign in with Google**
5. A popup opens — sign in with your Google account
6. Click **Allow** on the permissions screen
7. Click **Save**

> This same credential works for both Google Sheets and Gmail.

---

### Credential 2 — Gmail (OAuth)

1. Click **Add credential**
2. Search for: `Gmail OAuth2 API`
3. Click it
4. Click **Sign in with Google**
5. Sign in — use the same Google account as above
6. Click **Allow**
7. Click **Save**

---

### Credential 3 — Telegram Bot

1. Click **Add credential**
2. Search for: `Telegram API`
3. Click it
4. In the **Access Token** field, paste your bot token (from the telegram-setup.md guide)
5. Click **Save**

> See `telegram-setup.md` for how to create your bot and get the token.

---

### Credential 4 — Google Places API

The Google Places API key goes directly into the workflow (not as an n8n credential). You will paste it into the workflow nodes. Here is how to get it:

1. Go to **console.cloud.google.com**
2. Create a new project (click the project dropdown at the top, then "New Project")
3. Name it: `Reputation Manager`
4. Click **Create**
5. In the left menu, go to **APIs & Services** → **Library**
6. Search for: `Places API`
7. Click it, then click **Enable**
8. In the left menu, go to **APIs & Services** → **Credentials**
9. Click **Create Credentials** → **API Key**
10. Copy the key that appears (it looks like `AIzaSy...`)
11. (Optional but recommended) Click **Edit API Key** and restrict it to "Places API" only

---

### Credential 5 — Anthropic (Claude AI)

The Claude API key also goes directly into the workflow nodes. To get it:

1. Go to **console.anthropic.com**
2. Create a free account if you don't have one
3. Click **API Keys** in the left menu
4. Click **Create Key**
5. Name it: `n8n Reputation Manager`
6. Copy the key (it looks like `sk-ant-...`)
7. Store it safely — you can only see it once

---

## SECTION 3 — Import the Workflows

Do this for each of the 7 workflow files.

### How to Import a Workflow

1. In n8n, click **Workflows** in the left sidebar
2. Click **Add workflow** (top right)
3. In the new empty workflow, click the three-dot menu (**...**) at the top right
4. Click **Import from file**
5. Browse to your workflow JSON file and select it
6. Click **Open**
7. The workflow loads with all its nodes

**Import all 7 workflows in this order:**
1. workflow-1-lead-finder.json
2. workflow-2-message-generator.json
3. workflow-3-email-sender.json
4. workflow-4-review-monitor.json
5. workflow-5-report-generator.json
6. workflow-6-client-onboarding.json
7. workflow-7-dashboard.json

---

## SECTION 4 — Configure Each Workflow

After importing, you must replace placeholder values in each workflow.

### Things to Replace in EVERY Workflow

Open each workflow and look for these values:

| Placeholder | Replace with |
|-------------|-------------|
| `REPLACE_WITH_YOUR_SPREADSHEET_ID` | Your Google Sheets ID (see google-sheets-setup.md) |
| `REPLACE_WITH_YOUR_TELEGRAM_CHAT_ID` | Your Telegram Chat ID number |
| `REPLACE_WITH_YOUR_ANTHROPIC_API_KEY` | Your Claude API key (sk-ant-...) |
| `REPLACE_WITH_YOUR_GOOGLE_PLACES_API_KEY` | Your Google Places API key (AIzaSy...) |

### How to Edit a Node in n8n

1. Open the workflow
2. Double-click any node
3. Find the field with the placeholder text
4. Click on it and replace the text
5. Click the **×** (close) button to save the node

### Set Credentials on Nodes

When you open a node that uses Google Sheets, Gmail, or Telegram, you will see a **Credentials** dropdown. Click it and select the credential you set up in Section 2.

Nodes that need credentials:
- All Google Sheets nodes → select your Google Sheets credential
- All Gmail nodes → select your Gmail credential
- All Telegram nodes → select your Telegram API credential

---

## SECTION 5 — Activate the Workflows

Activate workflows 2, 3, 4, 5, 6, and 7 so they run automatically.

**Do NOT activate workflow 1** — you run it manually each time you want to find leads.

### How to Activate a Workflow

1. Open the workflow
2. Look at the top right — there is a toggle switch
3. Click it so it turns **green** (active)
4. n8n shows a confirmation

**Workflows to activate:**
- ✅ Workflow 2 — Message Generator (runs 9am daily)
- ✅ Workflow 3 — Email Sender (runs Mon-Fri 10am)
- ✅ Workflow 4 — Review Monitor (runs every 6 hours)
- ✅ Workflow 5 — Monthly Report (runs 1st of month)
- ✅ Workflow 6 — Client Onboarding (trigger: always on)
- ✅ Workflow 7 — Dashboard (runs hourly)

---

## SECTION 6 — Test Your First Workflow (Lead Finder)

### Step-by-Step Test Run

**Goal:** Find dentist leads in Manchester.

1. Open **01 — Lead Finder** in n8n
2. Double-click the **Set Search Inputs** node
3. Change the `city` value from `Manchester` to whatever city you want
4. Change the `profession` value (options: `dentist`, `physio`, `solicitor`, `accountant`)
5. Make sure the `googlePlacesApiKey` field has your actual API key
6. Close the node
7. Click **Execute Workflow** (the play button, top right)
8. Watch the nodes light up green as they run
9. Check your Google Sheets LEADS tab — you should see new rows appear
10. Check Telegram on your phone — you should get a summary message

**If a node turns red**, click on it to see the error message. The most common issues are:
- Wrong API key — double-check you pasted it correctly
- Wrong Spreadsheet ID — check google-sheets-setup.md
- Google Sheets credential not connected — click the Credentials dropdown in the node

---

## SECTION 7 — Add Your First Paying Client

1. Open your Google Sheets spreadsheet
2. Click the **CLIENTS** tab
3. Add a new row with your client's details:

| Column | What to enter |
|--------|---------------|
| client_name | The owner's name, e.g. `Dr Sarah Jones` |
| business_name | Practice name, e.g. `Smile Dental Manchester` |
| google_place_id | Their Google Place ID (from LEADS tab or find manually) |
| email | Client's email address |
| fee | Monthly fee in numbers only, e.g. `250` |
| start_date | Today's date in YYYY-MM-DD format, e.g. `2024-01-15` |
| status | Type exactly: `active` |

4. As soon as you save the row, **Workflow 6** triggers automatically
5. Within about 30 seconds you get a Telegram message confirming the welcome email was sent
6. The client receives their welcome email

> **Finding a Google Place ID:** Run Workflow 1 for their city and profession. The `place_id` column in LEADS will show it. Copy it to CLIENTS.

---

## SECTION 8 — How to Find Emails for Leads

The Lead Finder workflow cannot automatically find email addresses (Google Places API does not provide them). Here is how to fill in the email column:

1. Open your LEADS tab in Google Sheets
2. For each business, visit their website (in the `website` column)
3. Find their contact email (usually on the Contact page)
4. Paste it into the `email` column

Once an email is filled in AND the `cold_email_message` column is filled (Workflow 2 does this automatically), Workflow 3 will send the email the next morning (Mon-Fri 10am).

---

## SECTION 9 — What Your Telegram Alerts Look Like

**Lead search complete:**
```
✅ Lead Finder Complete!
City: Birmingham
Profession: dentist
Total leads found: 22
High Priority (< 4.0 stars): 5
Urgent (< 20 reviews): 8
All leads saved to Google Sheets LEADS tab.
```

**New review detected:**
```
⭐⭐⭐
🏢 City Physio Leeds
👤 Michael Thompson · 3/5 stars

📝 Review:
Physiotherapy was okay but the waiting area needs updating.

💬 Suggested Response:
Thank you for your honest feedback, Michael. We're pleased the therapy was helpful and we've taken your note about our waiting area on board. Do give us a call if there's anything else we can do. The Team at City Physio Leeds

_Log in to Google Business to post this response._
```

---

## SECTION 10 — Your Daily Morning Checklist

Each morning, spend 3-5 minutes doing this:

### ✅ 3 Things to Check Every Morning

**1. Check Telegram**
Look at any overnight Telegram alerts. If there are new reviews, log into your clients' Google Business profiles and post the suggested responses.

**2. Check the LEADS tab in Google Sheets**
- Are there new leads with messages generated (columns Q-T filled)?
- Add email addresses for any new leads you want to contact

**3. Check the DASHBOARD tab**
- Total clients and monthly revenue are up to date?
- Any unusual drop in reviews responded?

---

## SECTION 11 — Troubleshooting

### n8n won't start
- Make sure Node.js is installed: open Command Prompt and type `node --version`
- Try restarting Command Prompt and running `n8n start` again
- Check if another program is using port 5678

### A workflow node shows red
- Click the red node to see the error
- Check credentials are connected (click the credentials dropdown in the node)
- Check placeholder values are replaced (search for "REPLACE_WITH" in the node parameters)

### Google Sheets not updating
- Make sure the Spreadsheet ID is correct (check the URL of your sheet)
- Make sure the tab names match exactly: `LEADS`, `CLIENTS`, `REVIEWS`, `DASHBOARD`
- Reconnect the Google Sheets credential

### Telegram messages not arriving
- Check your Chat ID is just a number (no spaces or letters)
- Make sure you clicked "Start" on your bot in Telegram
- Test by pasting this in your browser: `https://api.telegram.org/botYOUR_TOKEN/getMe`

### Claude AI messages look wrong
- Check your Anthropic API key is valid (log in to console.anthropic.com)
- Make sure there is credit on your Anthropic account

### Emails not sending
- Check your Gmail credential is connected
- Make sure the email column in LEADS has a valid email address
- Check Gmail hasn't flagged n8n as suspicious (check your Gmail sent folder)

---

## SECTION 12 — Pricing and Scaling

### Your pricing structure
- £150/month — starter package (review monitoring + monthly report)
- £250/month — growth package (above + email outreach setup)
- £400/month — premium package (above + LinkedIn outreach + phone follow-up)

### When you have 10+ clients
- Consider moving n8n from your local computer to a cloud server
- Recommended: DigitalOcean Droplet ($6/month) or n8n Cloud ($20/month)
- This means it runs 24/7 without your computer being on

### When you want to add more features
- LinkedIn automation: use PhantomBuster or Dripify (integrate via webhook)
- SMS alerts: add a Twilio node to any workflow
- CRM: connect to a free HubSpot account via their API

---

## Quick Start Checklist

Use this when setting up for the first time:

- [ ] Node.js installed
- [ ] n8n installed and running at localhost:5678
- [ ] Google Sheets spreadsheet created with all 4 tabs
- [ ] Spreadsheet ID copied
- [ ] Google Sheets OAuth credential added to n8n
- [ ] Gmail OAuth credential added to n8n
- [ ] Telegram bot created and token saved
- [ ] Telegram Chat ID found and saved
- [ ] Telegram credential added to n8n
- [ ] Google Places API key obtained
- [ ] Anthropic API key obtained
- [ ] All 7 workflows imported
- [ ] Placeholder values replaced in all workflows
- [ ] Credentials connected in all workflow nodes
- [ ] Workflows 2-7 activated
- [ ] Workflow 1 tested with one city/profession
- [ ] First client row added to CLIENTS tab
- [ ] Welcome email received in test inbox
