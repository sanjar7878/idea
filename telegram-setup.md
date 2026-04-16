# Telegram Bot Setup Guide

This guide shows you how to create a free Telegram bot and connect it to n8n so you get instant alerts on your phone.

**Time needed:** 5 minutes  
**Cost:** Free

---

## PART 1 — Create Your Telegram Bot

### Step 1 — Open Telegram

Open Telegram on your phone or go to **web.telegram.org** on your computer.

### Step 2 — Find BotFather

1. In the Telegram search bar, type: `@BotFather`
2. Click on the result that shows a blue tick — this is the official bot
3. Click **Start**

### Step 3 — Create Your Bot

1. Type this command and send it:
   ```
   /newbot
   ```

2. BotFather will ask: **"Alright, a new bot. How are we going to call it? Please choose a name for your bot."**

3. Type a name for your bot. Example:
   ```
   My Reputation Manager
   ```

4. BotFather will ask: **"Good. Now let's choose a username for your bot."**
   - The username must end in `bot`
   - It must be unique
   - Example: `reputationmanager2024bot`

5. Type your chosen username and send it.

6. BotFather will reply with something like:
   ```
   Done! Congratulations on your new bot. You will find it at t.me/reputationmanager2024bot.

   Use this token to access the HTTP API:
   7412563890:AAHdqTfS5ZlRKmYg8eXample_Token_Here

   Keep your token secure and store it safely, it can be used by anyone to control your bot.
   ```

7. **Copy the token** (the long string after "Use this token to access the HTTP API:"). It looks like:
   ```
   7412563890:AAHdqTfS5ZlRKmYg8eXample_Token_Here
   ```
   Save this — you need it in n8n.

---

## PART 2 — Get Your Chat ID

The Chat ID tells the bot where to send your messages (to YOU specifically).

### Step 1 — Start Your Bot

1. In Telegram, search for your bot username (e.g. `@reputationmanager2024bot`)
2. Click on it
3. Click **Start** or type `/start`

### Step 2 — Get Your Chat ID

**Option A — Using a helper bot (easiest):**
1. In Telegram, search for `@userinfobot`
2. Click **Start**
3. It will immediately reply with your info including your **ID number**
4. Copy that number — that is your Chat ID

**Option B — Using the Telegram API:**
1. Open your web browser
2. Go to this URL (replace `YOUR_BOT_TOKEN` with your actual token):
   ```
   https://api.telegram.org/botYOUR_BOT_TOKEN/getUpdates
   ```
   Example:
   ```
   https://api.telegram.org/bot7412563890:AAHdqTfS5ZlRKmYg8eXample/getUpdates
   ```
3. Send a message to your bot first (e.g. say "hello")
4. Refresh the page
5. Look for `"chat":{"id":` in the response
6. The number after `"id":` is your Chat ID
   Example: `"id": 123456789`

---

## PART 3 — Add the Bot Token to n8n

### Step 1 — Open n8n Credentials

1. Open n8n in your browser (usually at `http://localhost:5678`)
2. Click **Settings** (gear icon) in the left sidebar
3. Click **Credentials**
4. Click **Add Credential** (top right)

### Step 2 — Search for Telegram

1. In the search box type: `Telegram`
2. Click **Telegram API**

### Step 3 — Enter Your Token

1. In the **Access Token** field, paste your bot token
2. Click **Save**
3. n8n will test the connection and show a green tick if it works

---

## PART 4 — Set Your Chat ID in Workflows

In each workflow, the Telegram nodes have a `chatId` field. You need to replace `REPLACE_WITH_YOUR_TELEGRAM_CHAT_ID` with your actual Chat ID number.

**How to do this:**
1. Open a workflow in n8n
2. Click on any Telegram node
3. Find the **Chat ID** field
4. Replace the placeholder text with your Chat ID number (just the number, no spaces)
   Example: `123456789`

Do this for every Telegram node in every workflow (there is usually 1-2 per workflow).

---

## PART 5 — Test Your Bot

### Quick Test in n8n

1. Open **workflow-1-lead-finder** in n8n
2. Click the **Telegram - Send Summary** node
3. Click **Execute Node**
4. Check Telegram on your phone — you should receive a message within seconds

### Manual Test (without n8n)

Open your browser and go to:
```
https://api.telegram.org/botYOUR_BOT_TOKEN/sendMessage?chat_id=YOUR_CHAT_ID&text=Hello+from+n8n!
```

Replace `YOUR_BOT_TOKEN` and `YOUR_CHAT_ID` with your values. If you see `{"ok":true}` in the browser, it worked.

---

## PART 6 — What Alerts You Will Receive

Here is a preview of each Telegram alert you will get:

### Lead Finder Complete
```
✅ Lead Finder Complete!

City: Manchester
Profession: dentist

Total leads found: 18
High Priority (< 4.0 stars): 4
Urgent (< 20 reviews): 6

All leads saved to Google Sheets LEADS tab.
```

### New Review Alert
```
⭐⭐

🏢 Smile Dental Manchester
👤 John Smith · 2/5 stars

📝 Review:
Waited 45 minutes past my appointment time with no explanation.

💬 Suggested Response (copy & paste):
Thank you for taking the time to share your experience, John. We're truly sorry to hear about the wait — this falls short of the standard we aim to provide. We'd love the opportunity to put this right. Please call us on [phone] at your convenience. The Team at Smile Dental Manchester

Log in to Google Business to post this response.
```

### Monthly Report Sent
```
📊 Monthly report sent!

🏢 Smile Dental Manchester
📧 Sent to: sarah@smiledentalmanchester.co.uk
📅 Period: January 2025

📈 Stats:
• New reviews: 8
• Avg rating: 4.6★
• Trend: Improving
• Responded to: 8
```

### New Client Onboarded
```
🎉 New client onboarded!

👤 Dr Sarah Jones
🏢 Smile Dental Manchester
📧 sarah@smiledentalmanchester.co.uk
💰 £250/month
📅 Started: 2024-01-01

Welcome email sent ✅
First report scheduled: 1 February 2025
```

---

## Troubleshooting

**"Bot not found" error:**
- Make sure you copied the full token including the number before the colon
- Try creating a new bot with BotFather

**Messages not arriving:**
- Make sure you sent at least one message TO the bot first (click Start)
- Double-check your Chat ID is correct (no spaces, just numbers)

**"Forbidden: bot was blocked by the user":**
- You blocked the bot by accident. Search for your bot in Telegram and click **Unblock**

---

## Security Note

Keep your bot token private. Anyone with your token can send messages through your bot. Do not share it or post it publicly. If it gets leaked, go to BotFather and type `/revoke` to generate a new one.
