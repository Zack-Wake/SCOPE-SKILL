#!/usr/bin/env node
'use strict';
/**
 * SCOPE skeleton runner — load, validate, emit.
 * Usage: node scripts/run.js <path-to-handoff-record> [output-dir]
 */
const path = require('path');
const { loadRecord } = require('./loader');
const { validate } = require('./validator');
const { emit } = require('./emitter');

function main() {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    process.stderr.write('Usage: node scripts/run.js <path-to-handoff-record> [output-dir]\n');
    process.exit(1);
  }

  const inputPath = args[0];
  const outputDir = args[1] || 'data';

  console.log(`Loading:    ${inputPath}`);
  const record = loadRecord(inputPath);
  console.log(`Record:     ${record.niche_id || '<unknown>'} (schema_version ${record.schema_version})`);

  console.log('Validating...');
  let flags;
  try {
    flags = validate(record);
  } catch (err) {
    process.stderr.write(`\n${err.message}\n`);
    process.exit(1);
  }

  for (const flag of Object.keys(flags)) {
    console.log(`  Flag: ${flag}`);
  }

  console.log(`Emitting to ${outputDir}/`);
  const { specPath, planPath } = emit(record, flags, outputDir);
  console.log(`  Spec:  ${specPath}`);
  console.log(`  Plan:  ${planPath}`);
  console.log('Done.');
}

main();
