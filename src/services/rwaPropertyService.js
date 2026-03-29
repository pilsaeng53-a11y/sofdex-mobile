/**
 * rwaPropertyService.js
 * Service layer for RWA property ingestion, review, and publishing.
 * Future-ready: swap seeded data with API/scraping results.
 */
import { base44 } from '@/api/base44Client';

// ─── Seeded static assets ──────────────────────────────────────
export const SEEDED_PROPERTIES = [
  {
    id: 'seed-001',
    sourcePlatform: 'redswan',
    sourceUrl: 'https://marketplace.redswan.io/',
    sourcePropertyId: 'RS-CARMEN-001',
    title: 'The Carmen Hotel',
    location: 'Playa del Carmen, Quintana Roo, Mexico',
    country: 'Mexico',
    city: 'Playa del Carmen',
    category: 'hospitality',
    subcategory: 'Boutique Hotel',
    shortDescription: 'Luxury boutique hotel in the heart of Playa del Carmen, offering tokenized fractional ownership with stable hospitality income.',
    longDescription: 'The Carmen Hotel is a premium boutique property situated on one of Mexico\'s most visited coastal resort corridors. The property features 48 luxury suites, a rooftop pool, spa, and three dining outlets. The hotel benefits from consistent high-season occupancy driven by international tourism, with proven NOI performance over multiple cycles. Tokenized via RedSwan, investors access fractional ownership with quarterly distribution rights.',
    featuredImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80',
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80',
    ],
    minimumInvestment: 5000,
    currency: 'USD',
    targetIRR: '14–18%',
    targetCashYield: '8–10%',
    targetEquityMultiple: '1.8x',
    holdingPeriod: '5 years',
    tokenPrice: 1000,
    occupancyNotes: 'Average 78% occupancy in high season (Nov–Apr). Off-season supported by domestic tourism.',
    managementNotes: 'Professional hotel management group with 12+ properties under management in the Riviera Maya.',
    riskNotes: 'Currency risk (MXN/USD), tourism demand cycles, regulatory risk for foreign-owned hospitality assets.',
    status: 'published',
    importedAt: '2025-11-01T10:00:00Z',
    reviewedAt: '2025-11-05T10:00:00Z',
    publishedAt: '2025-11-10T10:00:00Z',
  },
  {
    id: 'seed-002',
    sourcePlatform: 'stake',
    sourceUrl: 'https://getstake.com/',
    sourcePropertyId: 'STK-DXB-002',
    title: 'Dubai Marina Premium Residential',
    location: 'Dubai Marina, Dubai, UAE',
    country: 'UAE',
    city: 'Dubai',
    category: 'residential',
    subcategory: 'Premium Apartment',
    shortDescription: 'High-yield Dubai Marina apartment offering tokenized fractional investment with strong rental demand from expatriates and professionals.',
    longDescription: 'A premium 2-bedroom apartment located in Dubai Marina, one of the most in-demand rental districts in the UAE. The property benefits from Dubai\'s zero personal income tax environment, strong expatriate rental demand, and Stake\'s professional property management. Investors receive monthly rental distributions and benefit from potential capital appreciation in one of the world\'s fastest-growing real estate markets.',
    featuredImage: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
    ],
    minimumInvestment: 500,
    currency: 'USD',
    targetIRR: '10–14%',
    targetCashYield: '6–9%',
    targetEquityMultiple: '1.5x',
    holdingPeriod: '3–5 years',
    tokenPrice: 500,
    occupancyNotes: '92% historical occupancy rate. Primarily rented to professionals and expatriates on 12-month leases.',
    managementNotes: 'Stake manages all tenant relations, maintenance, and distributions on behalf of token holders.',
    riskNotes: 'Property market fluctuations, regulatory changes in UAE real estate law, currency (AED/USD) stability.',
    status: 'published',
    importedAt: '2025-11-15T10:00:00Z',
    reviewedAt: '2025-11-18T10:00:00Z',
    publishedAt: '2025-11-20T10:00:00Z',
  },
  {
    id: 'seed-003',
    sourcePlatform: 'redswan',
    sourceUrl: 'https://marketplace.redswan.io/',
    sourcePropertyId: 'RS-CORP-003',
    title: 'Austin Tech District Office Tower',
    location: 'Austin, Texas, USA',
    country: 'USA',
    city: 'Austin',
    category: 'commercial',
    subcategory: 'Class A Office',
    shortDescription: 'Class A office building in Austin\'s booming tech corridor, anchored by long-term technology tenant leases.',
    longDescription: 'A 12-story Class A commercial office tower located in Austin\'s rapidly expanding technology district. The building is 94% leased to two anchor tenants in the technology sector with 7-year NNN lease structures. Austin continues to attract major technology relocations from Silicon Valley, supporting long-term demand fundamentals. The asset offers stable, contractual cash flows with upside from future rent escalations.',
    featuredImage: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
    ],
    minimumInvestment: 10000,
    currency: 'USD',
    targetIRR: '12–16%',
    targetCashYield: '7–9%',
    targetEquityMultiple: '1.7x',
    holdingPeriod: '7 years',
    tokenPrice: 2000,
    occupancyNotes: '94% leased. Two anchor tech tenants with 7-year NNN leases. 3% annual rent escalation clauses.',
    managementNotes: 'Third-party institutional property manager. Monthly reporting to token holders.',
    riskNotes: 'Office market softness in post-COVID environment. Concentration risk in tech sector tenants.',
    status: 'review',
    importedAt: '2025-12-01T10:00:00Z',
    reviewedAt: null,
    publishedAt: null,
  },
];

// ─── Service functions (future: replace with API/DB calls) ─────

export async function getPropertyList(status = null) {
  try {
    const dbProps = status
      ? await base44.entities.RWAProperty.filter({ status })
      : await base44.entities.RWAProperty.list('-created_date', 100);
    // Merge with seeded data — seeded shown only if not overridden in DB
    const dbIds = new Set(dbProps.map(p => p.sourcePropertyId).filter(Boolean));
    const seedFiltered = SEEDED_PROPERTIES.filter(s =>
      !dbIds.has(s.sourcePropertyId) && (!status || s.status === status)
    );
    return [...dbProps, ...seedFiltered];
  } catch {
    return status ? SEEDED_PROPERTIES.filter(s => s.status === status) : SEEDED_PROPERTIES;
  }
}

export async function getPropertyDetail(id) {
  const seeded = SEEDED_PROPERTIES.find(s => s.id === id || s.sourcePropertyId === id);
  if (seeded) return seeded;
  try {
    const results = await base44.entities.RWAProperty.filter({ id });
    return results[0] || null;
  } catch {
    return null;
  }
}

export function getMissingFields(property) {
  const required = ['title', 'location', 'shortDescription', 'featuredImage', 'minimumInvestment', 'targetIRR'];
  return required.filter(f => !property[f]);
}

export async function importExternalProperty(data) {
  const missing = getMissingFields(data);
  return base44.entities.RWAProperty.create({
    ...data,
    status: 'imported',
    missingFields: missing,
    importedAt: new Date().toISOString(),
  });
}

export async function reviewImportedProperty(id) {
  return base44.entities.RWAProperty.update(id, {
    status: 'review',
    reviewedAt: new Date().toISOString(),
  });
}

export async function publishProperty(id) {
  return base44.entities.RWAProperty.update(id, {
    status: 'published',
    publishedAt: new Date().toISOString(),
  });
}

export async function archiveProperty(id) {
  return base44.entities.RWAProperty.update(id, { status: 'archived' });
}

export const PLATFORM_CONFIG = {
  redswan: { label: 'RedSwan', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
  stake:   { label: 'Stake',   color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
  manual:  { label: 'Manual',  color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
  other:   { label: 'Other',   color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' },
};

export const CATEGORY_CONFIG = {
  hospitality: { label: 'Hospitality', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  residential: { label: 'Residential', color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
  commercial:  { label: 'Commercial',  color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
  'mixed-use': { label: 'Mixed-Use',   color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
  land:        { label: 'Land',        color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' },
};

export const STATUS_CONFIG = {
  imported: { label: '가져옴',   color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' },
  review:   { label: '검수 중',  color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  approved: { label: '승인됨',   color: '#00d4aa', bg: 'rgba(0,212,170,0.1)' },
  published:{ label: '게시됨',   color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
  archived: { label: '보관됨',   color: '#64748b', bg: 'rgba(100,116,139,0.1)' },
};