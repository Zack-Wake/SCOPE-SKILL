'use strict';

// Baseline page sets per archetype.
// Each entry: { slug, page_type } for every structural page in that archetype.
// The primary page (/) is always the first entry — its page_type is archetype-specific.
// clusterType: page_type assigned to every cluster-keyword-derived page.
// To amend: update this object AND the corresponding table in SKILL.md.
const BASELINE = {
  'lead-gen': {
    pages: [
      { slug: '/',        page_type: 'landing' },
      { slug: '/about',   page_type: 'about'   },
      { slug: '/contact', page_type: 'contact' },
    ],
    clusterType: 'content',
  },
  'content': {
    pages: [
      { slug: '/',      page_type: 'landing' },
      { slug: '/about', page_type: 'about'   },
    ],
    clusterType: 'content',
  },
  'commerce': {
    pages: [
      { slug: '/',        page_type: 'landing' },
      { slug: '/about',   page_type: 'about'   },
      { slug: '/contact', page_type: 'contact' },
    ],
    clusterType: 'listing',
  },
  'directory': {
    pages: [
      { slug: '/',        page_type: 'listing' },
      { slug: '/about',   page_type: 'about'   },
      { slug: '/contact', page_type: 'contact' },
    ],
    clusterType: 'listing',
  },
  'tool': {
    pages: [
      { slug: '/',      page_type: 'tool'  },
      { slug: '/about', page_type: 'about' },
    ],
    clusterType: 'content',
  },
  'hybrid': {
    pages: [
      { slug: '/',      page_type: 'landing' },
      { slug: '/about', page_type: 'about'   },
    ],
    clusterType: 'content',
  },
};

const TODO_PREFIX = 'TODO:';

function _slugify(keyword) {
  return '/' + keyword
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/, '');
}

function derivePageMap(record, archetype) {
  if (typeof archetype === 'string' && archetype.startsWith(TODO_PREFIX)) {
    return {
      pages: null,
      cascade_reason: `archetype unresolved — page map cannot be derived until archetype is decided`,
    };
  }

  const baseline = BASELINE[archetype];
  if (!baseline) {
    return {
      pages: null,
      cascade_reason: `UNMAPPED archetype "${archetype}" — no baseline page set defined; human decision required`,
    };
  }

  const head = record.head_keyword;
  const clusters = Array.isArray(record.cluster_keywords) ? record.cluster_keywords : [];
  const pages = [];

  // Baseline structural pages (primary page always first)
  for (const p of baseline.pages) {
    const isPrimary = p.slug === '/';
    pages.push({
      slug: p.slug,
      page_type: p.page_type,
      source: `archetype baseline: ${archetype} → ${p.page_type}`,
      search_intent: isPrimary
        ? `TODO: [search_intent — source: head_keyword "${head}"]`
        : `TODO: [search_intent — source: archetype baseline ${archetype} → ${p.page_type}]`,
      layout_intent: 'TODO: [structural logic of this page: what occupies the hero, how the page converts or progresses, key sections in order]',
      content_requirements: ['TODO: [H1 direction, key claims to make, trust signals needed, CTAs, any mandatory inclusions]'],
    });
  }

  // One content page per cluster keyword
  for (const kw of clusters) {
    pages.push({
      slug: _slugify(kw),
      page_type: baseline.clusterType,
      source: `cluster_keyword: "${kw}"`,
      search_intent: `TODO: [search_intent — source: cluster_keyword "${kw}"]`,
      layout_intent: 'TODO: [structural logic of this page: what occupies the hero, how the page converts or progresses, key sections in order]',
      content_requirements: ['TODO: [H1 direction, key claims to make, trust signals needed, CTAs, any mandatory inclusions]'],
    });
  }

  return { pages, cascade_reason: null };
}

module.exports = { derivePageMap };
