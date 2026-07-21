'use strict';

// Build-target selection rules.
// Keys: system_type + archetype (from S2-011 inference output).
// Values: build_target (one of claude-code / replit / lovable).
// To add coverage: append a row here — no other file changes needed.
//
// Rationale per target:
//   claude-code — Next.js + Supabase full stack; use when the build needs
//     page-level control, a real data layer, or payment/form wiring.
//   lovable    — browser-based, UI-first, GitHub sync; use when the build
//     is a static or near-static marketing site with no backend logic.
//   replit     — cloud IDE + Agent, hosted environment; use for interactive
//     tools and fast prototypes where iteration speed beats stack control.
const RULES = [
  // website archetypes
  { system_type: 'website',  archetype: 'lead-gen',   build_target: 'claude-code',
    rationale: 'lead-gen sites need Next.js page control and form-backend wiring; Lovable\'s template-first pace cannot provide this and Replit is prototype-grade' },
  { system_type: 'website',  archetype: 'content',    build_target: 'lovable',
    rationale: 'content sites are UI-first with no backend; Lovable exports fast static pages and syncs via GitHub; Claude Code\'s full stack is not justified' },
  { system_type: 'website',  archetype: 'commerce',   build_target: 'claude-code',
    rationale: 'commerce needs payment integration and a product data layer; Next.js + Supabase handles checkout and API routes; Lovable cannot wire a payment provider' },
  { system_type: 'website',  archetype: 'directory',  build_target: 'claude-code',
    rationale: 'directory builds need database-backed filterable listings; Supabase + Next.js handles the data model and page scale; Lovable has no data layer' },
  { system_type: 'website',  archetype: 'hybrid',     build_target: 'claude-code',
    rationale: 'hybrid archetypes have mixed concerns requiring full-stack control; Lovable and Replit are too constrained for undetermined hybrid requirements' },
  // web-app archetypes
  { system_type: 'web-app',  archetype: 'tool',       build_target: 'claude-code',
    rationale: 'web-app signals production accounts and backend; Next.js + Supabase is the correct stack; Replit is prototype-grade and Lovable has no backend depth' },
  // software archetypes
  { system_type: 'software', archetype: 'tool',       build_target: 'claude-code',
    rationale: 'software builds require local toolchain and terminal access; only Claude Code supports build and packaging workflows' },
];

const TODO_PREFIX = 'TODO:';

function selectTarget(system_type, archetype) {
  const systemTodo = typeof system_type === 'string' && system_type.startsWith(TODO_PREFIX);
  const archetypeTodo = typeof archetype === 'string' && archetype.startsWith(TODO_PREFIX);

  if (systemTodo || archetypeTodo) {
    const missing = [
      systemTodo && 'system_type',
      archetypeTodo && 'archetype',
    ].filter(Boolean).join(' and ');
    return {
      build_target: null,
      build_target_reason:
        `TODO: [upstream ${missing} unresolved — build_target cannot be selected until SCOPE resolves the inference step]`,
    };
  }

  for (const rule of RULES) {
    if (rule.system_type === system_type && rule.archetype === archetype) {
      return {
        build_target: rule.build_target,
        build_target_reason:
          `rule matched: ${system_type}/${archetype} → ${rule.build_target}; ${rule.rationale}.`,
      };
    }
  }

  return {
    build_target: null,
    build_target_reason:
      `TODO: [UNMAPPED combination ${system_type}/${archetype} — no rule; human decision required before BUILD proceeds]`,
  };
}

module.exports = { selectTarget };
