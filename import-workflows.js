/**
 * Automatic n8n Workflow Importer
 *
 * Imports all 7 workflows into your running n8n instance in one go.
 *
 * HOW TO USE:
 *   1. Make sure n8n is running (run: n8n start)
 *   2. Get your n8n API key (see instructions below)
 *   3. Run: node import-workflows.js YOUR_API_KEY
 *
 * HOW TO GET YOUR N8N API KEY:
 *   - Open http://localhost:5678 in your browser
 *   - Click your user icon (bottom left)
 *   - Click "Settings"
 *   - Click "API" in the left menu
 *   - Click "Create an API Key"
 *   - Copy the key and paste it into the command above
 */

const fs   = require('fs');
const path = require('path');
const http = require('http');

// ─── Config ──────────────────────────────────────────────────────────────────

const N8N_HOST = 'localhost';
const N8N_PORT = 5678;
const API_KEY  = process.argv[2];

const WORKFLOWS = [
  'workflow-1-lead-finder.json',
  'workflow-2-message-generator.json',
  'workflow-3-email-sender.json',
  'workflow-4-review-monitor.json',
  'workflow-5-report-generator.json',
  'workflow-6-client-onboarding.json',
  'workflow-7-dashboard.json',
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function apiRequest(method, endpoint, body) {
  return new Promise((resolve, reject) => {
    const bodyStr = body ? JSON.stringify(body) : '';
    const options = {
      hostname: N8N_HOST,
      port: N8N_PORT,
      path: `/api/v1${endpoint}`,
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-N8N-API-KEY': API_KEY,
        'Content-Length': Buffer.byteLength(bodyStr),
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

function pad(str, len) {
  return String(str).padEnd(len, ' ');
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n================================================');
  console.log('  n8n Workflow Auto-Importer');
  console.log('================================================\n');

  // Check API key was provided
  if (!API_KEY) {
    console.error('❌  No API key provided.\n');
    console.error('Usage:  node import-workflows.js YOUR_API_KEY\n');
    console.error('How to get your API key:');
    console.error('  1. Open http://localhost:5678');
    console.error('  2. Click your user icon (bottom left)');
    console.error('  3. Click Settings → API');
    console.error('  4. Click "Create an API Key"\n');
    process.exit(1);
  }

  // Check n8n is reachable
  console.log('Checking n8n is running...');
  try {
    const ping = await apiRequest('GET', '/workflows?limit=1', null);
    if (ping.status === 401) {
      console.error('❌  API key is invalid or expired.\n');
      console.error('Please create a new API key in n8n Settings → API\n');
      process.exit(1);
    }
    if (ping.status !== 200) {
      throw new Error(`Unexpected status ${ping.status}`);
    }
    console.log('✅  n8n is running and API key is valid.\n');
  } catch (err) {
    if (err.code === 'ECONNREFUSED') {
      console.error('❌  Cannot connect to n8n at localhost:5678\n');
      console.error('Make sure n8n is running:');
      console.error('  Open a new Command Prompt and run:  n8n start\n');
    } else {
      console.error('❌  Error connecting to n8n:', err.message);
    }
    process.exit(1);
  }

  // Get existing workflows so we can skip duplicates
  const existing = await apiRequest('GET', '/workflows?limit=100', null);
  const existingNames = new Set(
    (existing.body.data || []).map(w => w.name)
  );

  // Import each workflow
  console.log(`Importing ${WORKFLOWS.length} workflows...\n`);
  console.log(pad('Workflow', 42) + pad('Status', 12) + 'ID');
  console.log('─'.repeat(70));

  const results = [];

  for (const filename of WORKFLOWS) {
    const filepath = path.join(__dirname, filename);

    // Check file exists
    if (!fs.existsSync(filepath)) {
      console.log(pad(filename, 42) + pad('MISSING', 12) + 'File not found');
      results.push({ filename, status: 'missing' });
      continue;
    }

    // Read and parse the workflow JSON
    let workflow;
    try {
      workflow = JSON.parse(fs.readFileSync(filepath, 'utf8'));
    } catch (e) {
      console.log(pad(filename, 42) + pad('ERROR', 12) + 'Invalid JSON');
      results.push({ filename, status: 'error', reason: 'invalid json' });
      continue;
    }

    // Skip if already imported (by name)
    if (existingNames.has(workflow.name)) {
      console.log(pad(workflow.name, 42) + pad('SKIPPED', 12) + 'Already exists');
      results.push({ filename, status: 'skipped' });
      continue;
    }

    // Remove id so n8n assigns a fresh one
    const { id, ...workflowToImport } = workflow;

    // Create the workflow via API
    try {
      const result = await apiRequest('POST', '/workflows', workflowToImport);
      if (result.status === 200 || result.status === 201) {
        const newId = result.body.id || '?';
        console.log(pad(workflow.name, 42) + pad('IMPORTED', 12) + `id: ${newId}`);
        results.push({ filename, status: 'imported', id: newId });
      } else {
        const msg = result.body.message || JSON.stringify(result.body).slice(0, 60);
        console.log(pad(workflow.name, 42) + pad('FAILED', 12) + msg);
        results.push({ filename, status: 'failed', reason: msg });
      }
    } catch (err) {
      console.log(pad(workflow.name, 42) + pad('ERROR', 12) + err.message);
      results.push({ filename, status: 'error', reason: err.message });
    }

    // Small delay between requests
    await new Promise(r => setTimeout(r, 300));
  }

  // Summary
  const imported = results.filter(r => r.status === 'imported').length;
  const skipped  = results.filter(r => r.status === 'skipped').length;
  const failed   = results.filter(r => r.status === 'failed' || r.status === 'error' || r.status === 'missing').length;

  console.log('\n' + '─'.repeat(70));
  console.log(`\n✅  Imported: ${imported}   ⏭  Skipped (already exist): ${skipped}   ❌  Failed: ${failed}\n`);

  if (imported > 0) {
    console.log('🎉  Done! Open http://localhost:5678/workflows to see your workflows.\n');
    console.log('Next steps:');
    console.log('  1. Open each workflow and replace the REPLACE_WITH_... placeholder values');
    console.log('  2. Connect credentials (Google Sheets, Gmail, Telegram) in each node');
    console.log('  3. Activate workflows 2-7 using the toggle at the top right\n');
  }

  if (failed > 0) {
    console.log('Some workflows failed. Check the errors above.');
    console.log('Most common fix: make sure n8n is fully started before running this script.\n');
  }
}

main().catch(err => {
  console.error('\n❌  Unexpected error:', err.message);
  process.exit(1);
});
