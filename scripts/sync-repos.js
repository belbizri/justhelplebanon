#!/usr/bin/env node

/**
 * Bidirectional Repository Sync Script
 * Syncs branches between:
 * - Basselbi/justhelplebanon (origin)
 * - belbizri/lebanese-red-cross (mirror)
 * 
 * Usage:
 *   node scripts/sync-repos.js              (sync dev branch)
 *   node scripts/sync-repos.js --branch main (sync specific branch)
 *   node scripts/sync-repos.js --all        (sync all branches)
 */

import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const ORIGIN_REPO = 'origin';
const MIRROR_REMOTE = 'belbizri';
const DEFAULT_BRANCH = 'dev';
const LOG_FILE = path.join(__dirname, '.sync-log.txt');

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
};

function log(message, color = 'reset') {
  const timestamp = new Date().toISOString();
  const colorCode = colors[color] || colors.reset;
  const output = `${colorCode}[${timestamp}] ${message}${colors.reset}`;
  console.log(output);
  
  // Also write to log file
  fs.appendFileSync(LOG_FILE, `[${timestamp}] ${message}\n`);
}

function run(command, silent = false) {
  try {
    if (!silent) {
      log(`$ ${command}`, 'blue');
    }
    const output = execSync(command, { encoding: 'utf-8', stdio: silent ? 'pipe' : 'inherit' });
    return { success: true, output };
  } catch (error) {
    log(`Error executing: ${command}`, 'red');
    log(error.message, 'red');
    return { success: false, output: error.message };
  }
}

function checkRemotes() {
  log('Checking remotes...', 'yellow');
  const result = run('git remote -v', true);
  
  if (!result.output.includes(ORIGIN_REPO)) {
    log(`Origin remote '${ORIGIN_REPO}' not found!`, 'red');
    return false;
  }
  
  if (!result.output.includes(MIRROR_REMOTE)) {
    log(`Mirror remote '${MIRROR_REMOTE}' not found!`, 'red');
    log(`Adding mirror remote: ${MIRROR_REMOTE}...`, 'yellow');
    run(`git remote add ${MIRROR_REMOTE} https://github.com/belbizri/justhelplebanon.git`);
  }
  
  return true;
}

function fetchRemotes() {
  log('Fetching from both remotes...', 'yellow');
  run(`git fetch ${ORIGIN_REPO}`);
  run(`git fetch ${MIRROR_REMOTE}`);
}

function syncBranch(branch) {
  log(`Syncing branch: ${branch}`, 'yellow');
  
  // Check if branch exists on origin
  const originCheck = run(`git rev-parse refs/remotes/${ORIGIN_REPO}/${branch}`, true);
  if (!originCheck.success) {
    log(`Branch '${branch}' not found on ${ORIGIN_REPO}`, 'red');
    return false;
  }
  
  // Check if branch exists on mirror
  const mirrorCheck = run(`git rev-parse refs/remotes/${MIRROR_REMOTE}/${branch}`, true);
  
  // Compare last commits
  let originHead, mirrorHead;
  
  const originHeadResult = run(`git rev-parse ${ORIGIN_REPO}/${branch}`, true);
  const mirrorHeadResult = run(`git rev-parse ${MIRROR_REMOTE}/${branch}`, true);
  
  if (originHeadResult.success) {
    originHead = originHeadResult.output.trim();
  }
  
  if (mirrorHeadResult.success && mirrorCheck.success) {
    mirrorHead = mirrorHeadResult.output.trim();
  }
  
  if (originHead === mirrorHead) {
    log(`✓ Branch '${branch}' is already in sync`, 'green');
    return true;
  }
  
  // Perform sync: push from origin to mirror
  log(`Syncing '${branch}' from ${ORIGIN_REPO} → ${MIRROR_REMOTE}...`, 'blue');
  const pushResult = run(`git push ${MIRROR_REMOTE} ${ORIGIN_REPO}/${branch}:${branch}`);
  
  if (!pushResult.success) {
    log(`Failed to push '${branch}' to ${MIRROR_REMOTE}`, 'red');
    return false;
  }
  
  log(`✓ Successfully synced '${branch}'`, 'green');
  return true;
}

function syncAllBranches() {
  log('Syncing all branches...', 'yellow');
  
  const result = run('git branch -r', true);
  const branches = result.output
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.startsWith(`${ORIGIN_REPO}/`))
    .map(line => line.replace(`${ORIGIN_REPO}/`, ''))
    .filter(branch => branch && !branch.includes('HEAD'));
  
  if (branches.length === 0) {
    log('No branches found to sync', 'yellow');
    return false;
  }
  
  log(`Found ${branches.length} branches to sync`, 'blue');
  
  let syncedCount = 0;
  branches.forEach(branch => {
    if (syncBranch(branch)) {
      syncedCount++;
    }
  });
  
  log(`Synced ${syncedCount}/${branches.length} branches`, syncedCount === branches.length ? 'green' : 'yellow');
  return syncedCount === branches.length;
}

function main() {
  log('='.repeat(60), 'blue');
  log('Repository Sync Script Started', 'blue');
  log('='.repeat(60), 'blue');
  
  // Parse arguments
  const args = process.argv.slice(2);
  let syncAll = false;
  let branch = DEFAULT_BRANCH;
  
  if (args.includes('--all')) {
    syncAll = true;
  } else if (args.includes('--branch') && args.length > args.indexOf('--branch') + 1) {
    branch = args[args.indexOf('--branch') + 1];
  }
  
  // Check git is available
  const gitCheck = run('git --version', true);
  if (!gitCheck.success) {
    log('Git is not installed or not in PATH', 'red');
    process.exit(1);
  }
  
  // Validate remotes
  if (!checkRemotes()) {
    log('Failed to validate remotes', 'red');
    process.exit(1);
  }
  
  // Fetch latest changes
  fetchRemotes();
  
  // Perform sync
  let success = false;
  if (syncAll) {
    success = syncAllBranches();
  } else {
    success = syncBranch(branch);
  }
  
  log('='.repeat(60), 'blue');
  if (success) {
    log('✓ Sync completed successfully', 'green');
    log(`Log saved to: ${LOG_FILE}`, 'green');
  } else {
    log('✗ Sync completed with errors', 'red');
    log(`Log saved to: ${LOG_FILE}`, 'red');
    process.exit(1);
  }
  log('='.repeat(60), 'blue');
}

main();
