/**
 * Make (Integromat) Scenario Deployer
 * Pre-configured for eu1.make.com
 *
 * HOW TO USE — 2 steps:
 *   1. Download this folder to your computer
 *   2. Open Command Prompt in this folder and run:
 *        node deploy-to-make.js
 */

const fs    = require('fs');
const path  = require('path');
const https = require('https');

// ─── Config ───────────────────────────────────────────────────────────────────

const MAKE_HOST  = 'eu1.make.com';
const API_TOKEN  = process.argv[2] || '4b6b5093-c462-46b1-8217-d1e3c7549266';

const SCENARIOS = [
  'make-1-lead-finder.json',
  'make-2-message-generator.json',
  'make-3-email-sender.json',
  'make-4-review-monitor.json',
  'make-5-report-generator.json',
  'make-6-client-onboarding.json',
  'make-7-dashboard.json',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function apiRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    const bodyStr = body ? JSON.stringify(body) : '';
    const options = {
      hostname: MAKE_HOST,
      port: 443,
      path: `/api/v2${path}`,
      method,
      headers: {
        'Authorization': `Token ${API_TOKEN}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(bodyStr),
      },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

function pad(str, len) { return String(str).padEnd(len, ' '); }

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n================================================');
  console.log('  Make Scenario Deployer');
  console.log(`  Target: https://${MAKE_HOST}`);
  console.log('================================================\n');

  // Step 1: Verify token + get user info
  console.log('Connecting to Make...');
  const me = await apiRequest('GET', '/users/me', null);
  if (me.status !== 200) {
    console.error(`❌  Auth failed (${me.status}). Check your API token.\n`);
    console.error('Get a token at: https://eu1.make.com/user/api\n');
    process.exit(1);
  }
  console.log(`✅  Connected as: ${me.body.user?.name || me.body.user?.email}\n`);

  // Step 2: Get team ID
  const teams = await apiRequest('GET', '/teams', null);
  if (!teams.body.teams || teams.body.teams.length === 0) {
    console.error('❌  No teams found on this account.\n');
    process.exit(1);
  }
  const teamId = teams.body.teams[0].id;
  console.log(`Using team: ${teams.body.teams[0].name} (id: ${teamId})\n`);

  // Step 3: Get existing scenarios to skip duplicates
  const existing = await apiRequest('GET', `/scenarios?teamId=${teamId}&pg[limit]=100`, null);
  const existingNames = new Set((existing.body.scenarios || []).map(s => s.name));

  // Step 4: Deploy each scenario
  console.log(`Deploying ${SCENARIOS.length} scenarios...\n`);
  console.log(pad('Scenario', 40) + pad('Status', 14) + 'ID');
  console.log('─'.repeat(70));

  const results = [];
  const scriptDir = path.join(__dirname);

  for (const filename of SCENARIOS) {
    const filepath = path.join(scriptDir, filename);

    if (!fs.existsSync(filepath)) {
      console.log(pad(filename, 40) + pad('MISSING ❌', 14));
      results.push({ filename, status: 'missing' });
      continue;
    }

    let scenario;
    try {
      scenario = JSON.parse(fs.readFileSync(filepath, 'utf8'));
    } catch {
      console.log(pad(filename, 40) + pad('BAD JSON ❌', 14));
      results.push({ filename, status: 'error' });
      continue;
    }

    if (existingNames.has(scenario.name)) {
      console.log(pad(scenario.name, 40) + pad('SKIPPED ⏭', 14) + 'Already exists');
      results.push({ filename, status: 'skipped' });
      continue;
    }

    try {
      const res = await apiRequest('POST', '/scenarios', {
        blueprint: JSON.stringify(scenario.blueprint),
        scheduling: scenario.scheduling,
        teamId,
        name: scenario.name,
      });

      if (res.status === 200 || res.status === 201) {
        const id = res.body.scenario?.id || '?';
        console.log(pad(scenario.name, 40) + pad('CREATED ✅', 14) + `id: ${id}`);
        results.push({ filename, status: 'created', id });
      } else {
        const msg = res.body.message || res.body.detail || JSON.stringify(res.body).slice(0, 80);
        console.log(pad(scenario.name, 40) + pad('FAILED ❌', 14) + msg);
        results.push({ filename, status: 'failed', reason: msg });
      }
    } catch (err) {
      console.log(pad(filename, 40) + pad('ERROR ❌', 14) + err.message);
      results.push({ filename, status: 'error' });
    }

    await new Promise(r => setTimeout(r, 500));
  }

  // Summary
  const created = results.filter(r => r.status === 'created').length;
  const skipped = results.filter(r => r.status === 'skipped').length;
  const failed  = results.filter(r => ['failed','error','missing'].includes(r.status)).length;

  console.log('\n' + '─'.repeat(70));
  console.log(`\nCreated: ${created}   Skipped: ${skipped}   Failed: ${failed}\n`);

  if (created > 0) {
    console.log(`🎉  Done! Open Make to see your scenarios:`);
    console.log(`    https://eu1.make.com/\n`);
    console.log('Next steps in Make:');
    console.log('  1. Open each scenario');
    console.log('  2. Add your connections (Google Sheets, Gmail, Telegram, HTTP)');
    console.log('  3. Replace REPLACE_YOUR_... values with real API keys');
    console.log('  4. Activate scenarios using the ON/OFF toggle\n');
  }

  if (failed > 0) {
    console.log('Some scenarios failed. The most common fix:');
    console.log('  - Make sure your API token is valid');
    console.log('  - Try running again (sometimes Make API times out)\n');
  }
}

main().catch(err => {
  console.error('\n❌  Unexpected error:', err.message);
  process.exit(1);
});
