'use strict';

// Rule table: maps monetisation_tag prefix → system_type + archetype.
// Primary input: monetisation_tag from the vault record.
// Rules are generic — they apply to any niche carrying that tag. No niche-specific logic.
// Order within the table matters only when prefixes could overlap; current set is non-overlapping.
// To add coverage: append a new row and document the corresponding rule in SKILL.md.
const RULES = [
  { prefix: 'lead-gen-',  system_type: 'website',  archetype: 'lead-gen'  },
  { prefix: 'affiliate-', system_type: 'website',  archetype: 'content'   },
  { prefix: 'ecommerce-', system_type: 'website',  archetype: 'commerce'  },
  { prefix: 'commerce-',  system_type: 'website',  archetype: 'commerce'  },
  { prefix: 'saas-',      system_type: 'web-app',  archetype: 'tool'      },
  { prefix: 'tool-',      system_type: 'web-app',  archetype: 'tool'      },
  { prefix: 'directory-', system_type: 'website',  archetype: 'directory' },
  { prefix: 'content-',   system_type: 'website',  archetype: 'content'   },
  { prefix: 'software-',  system_type: 'software', archetype: 'tool'      },
];

/**
 * Infer system_type and archetype from record.monetisation_tag.
 *
 * Match: returns { system_type, archetype, inference_basis, unmapped_tag: null }
 * No match: returns { system_type: null, archetype: null, inference_basis, unmapped_tag: tag }
 */
function infer(record) {
  const tag = record.monetisation_tag;

  for (const rule of RULES) {
    if (tag.startsWith(rule.prefix)) {
      return {
        system_type: rule.system_type,
        archetype: rule.archetype,
        inference_basis:
          `rule matched: monetisation_tag "${tag}" (prefix "${rule.prefix}") ` +
          `→ system_type "${rule.system_type}", archetype "${rule.archetype}"`,
        unmapped_tag: null,
      };
    }
  }

  return {
    system_type: null,
    archetype: null,
    inference_basis:
      `UNMAPPED: no rule for monetisation_tag "${tag}"; system_type and archetype remain TODO`,
    unmapped_tag: tag,
  };
}

module.exports = { infer };
