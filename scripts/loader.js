'use strict';
const fs = require('fs');

function loadRecord(filePath) {
  const record = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  // Strip SCOPE-internal provenance wrapper if present — not part of vault schema
  delete record._provenance;
  return record;
}

module.exports = { loadRecord };
