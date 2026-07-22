'use strict';
const fs = require('fs');
const path = require('path');
const { infer } = require('./infer');
const { selectTarget } = require('./select-target');
const { derivePageMap } = require('./page-map');

function _planConfidence(record, competitorNotesManual) {
  if (competitorNotesManual === null) return 'LOW';
  if (record.revenue_confidence === 'low') return 'LOW';
  return 'MED';
}

function _buildSpec(record, flags) {
  const competitorNotesManual = null; // no decision logic in this skeleton
  const confidence = _planConfidence(record, competitorNotesManual);
  const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD in local time

  const inferResult = infer(record);
  const system_type = inferResult.system_type !== null
    ? inferResult.system_type
    : 'TODO: [SCOPE decision required — website / web-app / software]';
  const archetype = inferResult.archetype !== null
    ? inferResult.archetype
    : 'TODO: [SCOPE decision required — lead-gen / commerce / content / directory / tool / hybrid]';

  const targetResult = selectTarget(system_type, archetype);
  const build_target = targetResult.build_target !== null
    ? targetResult.build_target
    : 'TODO: [SCOPE decision required — claude-code / replit / lovable]';
  const build_target_reason = targetResult.build_target_reason;

  const pageResult = derivePageMap(record, archetype);
  const pages = pageResult.pages !== null
    ? pageResult.pages
    : [
        {
          slug: 'TODO: [URL slug — e.g. / or /cost or /about]',
          page_type: 'TODO: [landing / content / tool / listing / contact / about / legal]',
          source: `TODO: [page map not derived — ${pageResult.cascade_reason}]`,
          search_intent: 'TODO: [mandatory — what the searcher is trying to find or get answered, as a specific user goal, not a category label]',
          layout_intent: 'TODO: [structural logic of this page: what occupies the hero, how the page converts or progresses, key sections in order]',
          content_requirements: [
            'TODO: [H1 direction, key claims to make, trust signals needed, CTAs, any mandatory inclusions]',
          ],
        },
      ];
  const pages_flagged_for_review = pageResult.pages_flagged_for_review;

  return {
    // --- Identity and provenance ---
    schema_version: '2.3',
    scoped_at: today,
    plan_confidence: confidence,
    // --- S1 fields carried forward verbatim ---
    niche_id: record.niche_id,
    niche_label: record.niche_label,
    head_keyword: record.head_keyword,
    cluster_keywords: record.cluster_keywords,
    cluster_volume: record.cluster_volume,
    volume_confidence: record.volume_confidence,
    competition_tier: record.competition_tier,
    opportunity_tier: record.opportunity_tier,
    monetisation_tag: record.monetisation_tag,
    rpv_low: record.rpv_low,
    rpv_high: record.rpv_high,
    monthly_revenue_low: record.monthly_revenue_low,
    monthly_revenue_high: record.monthly_revenue_high,
    revenue_confidence: record.revenue_confidence,
    s1_notes: record.notes !== undefined ? record.notes : null,
    // --- S2 decisions ---
    system_type,
    archetype,
    inference_basis: inferResult.inference_basis,
    build_target,
    build_target_reason,
    domain_proposed: 'TODO: [proposed domain name, e.g. niche-hub.co.uk — a recommendation, not a purchase instruction]',
    hosting_decision: "TODO: [hosting approach including platform, tier, and reason — e.g. 'Vercel — free tier, suits Next.js static export']",
    monetisation_hypothesis: 'TODO: [sketch of revenue mechanism, visitor action, and value capture — depth capped here; MONETISE skill owns implementation]',
    differentiation: "TODO: [one to three specific edges where this build wins — must name at least one meaningful edge; 'good design' alone fails]",
    competitor_notes_manual: null,
    skills_required: [
      {
        skill: 'TODO: [skill name as it appears in a /skill-name invocation]',
        step: 0,
        phase: 'TODO: [phase label — design / scaffold / content / test / review]',
        purpose: 'TODO: [one sentence: what decision or output this skill produces at this step]',
      },
    ],
    pages,
    pages_flagged_for_review,
  };
}

function _buildPlan(record, flags, spec) {
  const lines = [];

  lines.push(
    `# Build Plan — ${record.niche_label}`,
    '',
    `niche_id:         ${spec.niche_id}`,
    `scoped_at:        ${spec.scoped_at}`,
    `plan_confidence:  ${spec.plan_confidence}`,
    `build_target:     ${spec.build_target}`,
    `opportunity_tier: ${spec.opportunity_tier}`,
    ''
  );

  if (flags.validate_before_build || flags.revenue_confidence_low) {
    lines.push(
      '⚠ VALIDATE BEFORE BUILD — revenue_confidence is low. ' +
      'Verify volume and RPV before committing build time.',
      ''
    );
  }

  lines.push('---', '');

  // 1. Niche summary
  lines.push(
    '## 1. Niche summary',
    '',
    'TODO: [two to four sentences — what the niche is, who the searcher is, ' +
    'and why the revenue opportunity exists; enough for a cold reader without FIND output]',
    '',
    '---',
    ''
  );

  // 2. Build decision
  lines.push(
    '## 2. Build decision',
    '',
    `- **System type and archetype:** ${spec.system_type} / ${spec.archetype}`,
    `  - Basis: ${spec.inference_basis}`,
    `- **Build target:** ${spec.build_target}`,
    `  - Reason: ${spec.build_target_reason}`,
    `- **Domain:** ${spec.domain_proposed}`,
    `- **Hosting:** ${spec.hosting_decision}`,
    '',
    '---',
    ''
  );

  // 3. Monetisation hypothesis
  lines.push(
    '## 3. Monetisation hypothesis',
    '',
    spec.monetisation_hypothesis,
    ''
  );
  if (spec.plan_confidence === 'LOW') {
    lines.push(
      '**Confidence note:** plan_confidence is LOW — competitor data is absent. ' +
      'Monetisation sketch must be validated before committing build time.',
      ''
    );
  }
  lines.push('---', '');

  // 4. Differentiation
  lines.push(
    '## 4. Differentiation',
    '',
    spec.differentiation,
    '',
    '> **ADAPT, DON\'T CLONE:** competitor patterns may inform this spec but must be ' +
    'reinterpreted — own design, own copy, own structure. ' +
    'The test: side-by-side, neither site looks derived from the other.',
    '',
    '---',
    ''
  );

  // 5. Page inventory
  lines.push('## 5. Page inventory', '');
  for (const page of spec.pages) {
    lines.push(
      `### ${page.slug} — ${page.page_type}`,
      '',
      `**Source:** ${page.source}`,
      '',
      `**Search intent:** ${page.search_intent}`,
      '',
      `**Layout intent:** ${page.layout_intent}`,
      '',
      '**Content requirements:**'
    );
    for (const req of page.content_requirements) {
      lines.push(`- ${req}`);
    }
    lines.push('');
  }
  lines.push('---', '');

  // 6. Skills to invoke
  lines.push('## 6. Skills to invoke', '');
  for (const skill of spec.skills_required) {
    lines.push(
      `**Step ${skill.step} — ${skill.skill}** (${skill.phase})`,
      `Purpose: ${skill.purpose}`,
      ''
    );
  }
  lines.push('---', '');

  // 7. Open questions
  lines.push(
    '## 7. Open questions',
    '',
    'TODO: [list named, bounded questions requiring human input before BUILD starts — ' +
    'delete this section if the spec is complete and no questions remain]',
    '',
    '---',
    ''
  );

  // 8. Competitor notes
  lines.push('## 8. Competitor notes', '');
  if (spec.competitor_notes_manual) {
    lines.push(
      '**Confidence:** human-observed. Automated enrichment pending.',
      '',
      spec.competitor_notes_manual,
      ''
    );
  } else {
    lines.push('None present — plan_confidence is LOW as a result.', '');
  }

  return lines.join('\n');
}

function emit(record, flags, outputDir = 'data') {
  const nicheId = record.niche_id;
  const specsDir = path.join(outputDir, 'specs');
  const plansDir = path.join(outputDir, 'plans');
  fs.mkdirSync(specsDir, { recursive: true });
  fs.mkdirSync(plansDir, { recursive: true });

  const spec = _buildSpec(record, flags);
  const plan = _buildPlan(record, flags, spec);

  const specPath = path.join(specsDir, `${nicheId}.json`);
  const planPath = path.join(plansDir, `${nicheId}.md`);

  fs.writeFileSync(specPath, JSON.stringify(spec, null, 2), 'utf8');
  fs.writeFileSync(planPath, plan, 'utf8');

  return { specPath, planPath };
}

module.exports = { emit };
