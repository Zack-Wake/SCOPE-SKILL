'use strict';

// Fields SCOPE requires from the incoming vault record.
// s1_notes maps from 'notes' and is nullable — not included here.
const REQUIRED_S1_FIELDS = [
  'niche_id',
  'niche_label',
  'head_keyword',
  'cluster_keywords',
  'cluster_volume',
  'volume_confidence',
  'competition_tier',
  'opportunity_tier',
  'monetisation_tag',
  'rpv_low',
  'rpv_high',
  'monthly_revenue_low',
  'monthly_revenue_high',
  'revenue_confidence',
  'schema_version',
  'band',
];

function validate(record) {
  const errors = [];

  if (record.schema_version !== '1.2') {
    errors.push(
      `unsupported schema_version: expected '1.2', got ${JSON.stringify(record.schema_version)}`
    );
  }

  if (record.band !== 'vault') {
    errors.push(
      `invalid band: expected 'vault', got ${JSON.stringify(record.band)} — ` +
      'watchlist and excluded niches do not reach SCOPE'
    );
  }

  for (const field of REQUIRED_S1_FIELDS) {
    if (!(field in record)) {
      errors.push(`missing required field: '${field}'`);
    }
  }

  if (errors.length > 0) {
    throw new Error(
      'Validation failed — halting:\n' +
      errors.map(e => `  - ${e}`).join('\n')
    );
  }

  const flags = {};
  if (record.revenue_confidence === 'low') {
    flags.revenue_confidence_low = true;
  }
  const notes = record.notes || '';
  if (notes.toLowerCase().includes('validate before build')) {
    flags.validate_before_build = true;
  }

  return flags;
}

module.exports = { validate };
