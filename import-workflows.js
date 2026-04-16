/**
 * Automatic n8n Workflow Importer
 * Pre-configured for: sanjarbrz.app.n8n.cloud
 *
 * HOW TO USE — just 2 steps:
 *   1. Download this folder to your computer
 *   2. Open Command Prompt in this folder and run:
 *        node import-workflows.js
 */

const fs   = require('fs');
const path = require('path');
const https = require('https');

// ─── Config (pre-configured for your n8n Cloud) ───────────────────────────────

const N8N_HOST = 'sanjarbrz.app.n8n.cloud';
const N8N_PORT = 443;
const API_KEY  = process.argv[2] || 'o_API8bg3';

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

    const req = https.request(options, (res) => {
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
  console.log('  n8n Cloud Workflow Importer');
  console.log(`  Target: https://${N8N_HOST}`);
  console.log('================================================\n');

  // Check n8n is reachable and API key works
  console.log('Connecting to your n8n Cloud...');
  try {
    const ping = await apiRequest('GET', '/workflows?limit=1', null);
    if (ping.status === 401) {
      console.error('❌  API key is invalid or expired.\n');
      console.error('Go to https://sanjarbrz.app.n8n.cloud/settings/api');
      console.error('Create a new key and run: node import-workflows.js YOUR_NEW_KEY\n');
      process.exit(1);
    }
    if (ping.status !== 200) {
      console.error(`❌  Unexpected response: ${ping.status}`);
      console.error(JSON.stringify(ping.body).slice(0, 200));
      process.exit(1);
    }
    console.log('✅  Connected. API key is valid.\n');
  } catch (err) {
    console.error('❌  Could not reach n8n Cloud:', err.message);
    console.error('Check your internet connection and try again.\n');
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

    if (!fs.existsSync(filepath)) {
      console.log(pad(filename, 42) + pad('MISSING', 12) + 'File not found');
      results.push({ filename, status: 'missing' });
      continue;
    }

    let workflow;
    try {
      workflow = JSON.parse(fs.readFileSync(filepath, 'utf8'));
    } catch (e) {
      console.log(pad(filename, 42) + pad('ERROR', 12) + 'Invalid JSON');
      results.push({ filename, status: 'error', reason: 'invalid json' });
      continue;
    }

    if (existingNames.has(workflow.name)) {
      console.log(pad(workflow.name, 42) + pad('SKIPPED', 12) + 'Already exists');
      results.push({ filename, status: 'skipped' });
      continue;
    }

    const { id, ...workflowToImport } = workflow;

    try {
      const result = await apiRequest('POST', '/workflows', workflowToImport);
      if (result.status === 200 || result.status === 201) {
        const newId = result.body.id || '?';
        console.log(pad(workflow.name, 42) + pad('IMPORTED ✅', 14) + `id: ${newId}`);
        results.push({ filename, status: 'imported', id: newId });
      } else {
        const msg = result.body.message || JSON.stringify(result.body).slice(0, 60);
        console.log(pad(workflow.name, 42) + pad('FAILED ❌', 12) + msg);
        results.push({ filename, status: 'failed', reason: msg });
      }
    } catch (err) {
      console.log(pad(workflow.name, 42) + pad('ERROR ❌', 12) + err.message);
      results.push({ filename, status: 'error', reason: err.message });
    }

    await new Promise(r => setTimeout(r, 400));
  }

  // Summary
  const imported = results.filter(r => r.status === 'imported').length;
  const skipped  = results.filter(r => r.status === 'skipped').length;
  const failed   = results.filter(r => r.status === 'failed' || r.status === 'error' || r.status === 'missing').length;

  console.log('\n' + '─'.repeat(70));
  console.log(`\nImported: ${imported}   Skipped (already exist): ${skipped}   Failed: ${failed}\n`);

  if (imported > 0) {
    console.log('🎉  All done! Open your n8n Cloud to see the workflows:');
    console.log('    https://sanjarbrz.app.n8n.cloud/workflows\n');
    console.log('Next steps inside n8n:');
    console.log('  1. Open each workflow');
    console.log('  2. Replace REPLACE_WITH_... values with your real API keys');
    console.log('  3. Connect credentials (Google Sheets, Gmail, Telegram)');
    console.log('  4. Activate workflows 2-7 using the toggle top-right\n');
  }

  if (failed > 0) {
    console.log('Some workflows failed to import. Check errors above.\n');
  }
}

main().catch(err => {
  console.error('\n❌  Unexpected error:', err.message);
  process.exit(1);
});
