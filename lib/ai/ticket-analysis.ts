import type { TicketNlp } from './schemas';

export interface TicketAnalysisInput {
  title?: string;
  description: string;
  location: string;
  imageName?: string | null;
}

const CATEGORY_RULES = [
  {
    category: 'plumbing',
    technicianType: 'plumber',
    keywords: [
      'leak',
      'leaking',
      'pipe',
      'faucet',
      'tap',
      'sink',
      'toilet',
      'drain',
      'drainage',
      'flush',
      'sewage',
      'water',
      'clog',
      'overflow',
    ],
    fixSteps: ['Shut off the nearby water supply if possible.', 'Keep the affected area clear and dry.'],
  },
  {
    category: 'electrical',
    technicianType: 'electrician',
    keywords: [
      'power',
      'outlet',
      'socket',
      'breaker',
      'switch',
      'sparking',
      'spark',
      'fuse',
      'wiring',
      'wire',
      'short',
      'light',
      'bulb',
      'voltage',
    ],
    fixSteps: ['Do not touch exposed wires or damaged switches.', 'Turn off the affected circuit if it is safe to do so.'],
  },
  {
    category: 'hvac',
    technicianType: 'hvac',
    keywords: [
      'ac',
      'air conditioner',
      'cooling',
      'heater',
      'heating',
      'thermostat',
      'ventilation',
      'vent',
      'fan',
      'temperature',
      'hvac',
    ],
    fixSteps: ['Keep vents unobstructed until inspection.', 'Avoid repeatedly restarting the unit.'],
  },
  {
    category: 'network',
    technicianType: 'network technician',
    keywords: [
      'wifi',
      'wi-fi',
      'internet',
      'router',
      'network',
      'lan',
      'ethernet',
      'signal',
      'connectivity',
      'offline',
      'printer network',
    ],
    fixSteps: ['Check whether nearby users are seeing the same issue.', 'Restart only the local device unless instructed otherwise.'],
  },
  {
    category: 'security',
    technicianType: 'security technician',
    keywords: [
      'door lock',
      'lock',
      'access card',
      'badge',
      'cctv',
      'camera',
      'security',
      'alarm',
      'unauthorized',
      'intrusion',
    ],
    fixSteps: ['Limit access to the affected area.', 'Escalate immediately if safety or access control is compromised.'],
  },
  {
    category: 'carpentry',
    technicianType: 'facilities technician',
    keywords: [
      'door',
      'window',
      'hinge',
      'frame',
      'cabinet',
      'desk',
      'chair',
      'furniture',
      'shelf',
      'table',
      'handle',
    ],
    fixSteps: ['Avoid using unstable furniture or fixtures.', 'Mark the damaged item to prevent further use.'],
  },
  {
    category: 'appliance',
    technicianType: 'maintenance technician',
    keywords: [
      'fridge',
      'refrigerator',
      'microwave',
      'oven',
      'washing machine',
      'dryer',
      'printer',
      'projector',
      'machine',
      'device',
      'equipment',
    ],
    fixSteps: ['Power down the device if it is malfunctioning.', 'Do not continue operating noisy or overheating equipment.'],
  },
  {
    category: 'cleaning',
    technicianType: 'housekeeping',
    keywords: [
      'spill',
      'dirty',
      'cleaning',
      'odor',
      'smell',
      'mold',
      'pest',
      'garbage',
      'trash',
      'stain',
    ],
    fixSteps: ['Isolate the affected area if needed.', 'Report any recurring hygiene issues to facilities.'],
  },
];

const CRITICAL_KEYWORDS = [
  'fire',
  'smoke',
  'sparking',
  'spark',
  'exposed wire',
  'gas leak',
  'flood',
  'burst pipe',
  'overflowing',
  'sewage',
  'unsafe',
];

const HIGH_KEYWORDS = [
  'no power',
  'power outage',
  'internet down',
  'no internet',
  'water leak',
  'locked out',
  'not cooling',
  'not working',
  'broken',
  'urgent',
];

const LOW_KEYWORDS = ['minor', 'small', 'cosmetic', 'slow', 'intermittent'];

function normalize(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9\s.-]/g, ' ');
}

function compact(text: string) {
  return text.replace(/\s+/g, ' ').trim();
}

function includesPhrase(haystack: string, needle: string) {
  return haystack.includes(needle);
}

function pickCategory(text: string) {
  let best = CATEGORY_RULES[0];
  let bestScore = 0;

  for (const rule of CATEGORY_RULES) {
    const score = rule.keywords.reduce((sum, keyword) => {
      return sum + (includesPhrase(text, keyword) ? (keyword.includes(' ') ? 3 : 2) : 0);
    }, 0);

    if (score > bestScore) {
      best = rule;
      bestScore = score;
    }
  }

  if (bestScore === 0) {
    return {
      category: 'general',
      technicianType: 'maintenance technician',
      fixSteps: ['We have logged your issue and routed it for manual review.'],
    };
  }

  return {
    category: best.category,
    technicianType: best.technicianType,
    fixSteps: best.fixSteps,
  };
}

function pickPriority(text: string) {
  if (CRITICAL_KEYWORDS.some((keyword) => includesPhrase(text, keyword))) {
    return 'CRITICAL' as const;
  }

  if (HIGH_KEYWORDS.some((keyword) => includesPhrase(text, keyword))) {
    return 'HIGH' as const;
  }

  if (LOW_KEYWORDS.some((keyword) => includesPhrase(text, keyword))) {
    return 'LOW' as const;
  }

  return 'MEDIUM' as const;
}

function estimateResolutionHours(category: string, priority: TicketNlp['priority']) {
  const priorityHours: Record<TicketNlp['priority'], number> = {
    CRITICAL: 2,
    HIGH: 8,
    MEDIUM: 24,
    LOW: 48,
  };

  const categoryMultiplier: Record<string, number> = {
    electrical: 0.75,
    plumbing: 1,
    hvac: 1,
    network: 0.5,
    security: 0.75,
    carpentry: 1.5,
    appliance: 1.25,
    cleaning: 0.5,
    general: 1,
  };

  return Math.max(1, Math.round(priorityHours[priority] * (categoryMultiplier[category] ?? 1)));
}

function extractKeywords(text: string) {
  const hits = new Set<string>();

  for (const rule of CATEGORY_RULES) {
    for (const keyword of rule.keywords) {
      if (includesPhrase(text, keyword)) {
        hits.add(keyword);
      }
    }
  }

  for (const keyword of [...CRITICAL_KEYWORDS, ...HIGH_KEYWORDS]) {
    if (includesPhrase(text, keyword)) {
      hits.add(keyword);
    }
  }

  return Array.from(hits).slice(0, 6);
}

function buildSummary(title: string | undefined, description: string) {
  const normalizedTitle = compact(title ?? '');
  if (normalizedTitle.length >= 4) {
    return normalizedTitle.slice(0, 140);
  }

  const firstSentence = compact(description).split(/[.!?]/)[0] ?? description;
  return firstSentence.slice(0, 140);
}

export function buildTicketAnalysisFallback(input: TicketAnalysisInput): TicketNlp {
  const title = compact(input.title ?? '');
  const description = compact(input.description);
  const location = compact(input.location);
  const imageName = compact(input.imageName ?? '');
  const combinedText = normalize([title, description, location, imageName].filter(Boolean).join(' '));

  const categoryInfo = pickCategory(combinedText);
  const priority = pickPriority(combinedText);

  return {
    category: categoryInfo.category,
    priority,
    summary: buildSummary(title, description),
    keywords: extractKeywords(combinedText),
    fixSteps: categoryInfo.fixSteps,
    technicianType: categoryInfo.technicianType,
    predictedResolutionHours: estimateResolutionHours(categoryInfo.category, priority),
  };
}

export function mergeWithFallback(aiResult: TicketNlp, fallback: TicketNlp): TicketNlp {
  const category = aiResult.category.trim().toLowerCase();
  const summary = compact(aiResult.summary);

  const shouldUseFallbackCategory =
    !category ||
    category === 'general' ||
    category === 'other' ||
    category === 'miscellaneous';

  const shouldUseFallbackPriority =
    aiResult.priority === 'MEDIUM' &&
    fallback.priority !== 'MEDIUM' &&
    shouldUseFallbackCategory;

  return {
    ...aiResult,
    category: shouldUseFallbackCategory ? fallback.category : aiResult.category,
    priority: shouldUseFallbackPriority ? fallback.priority : aiResult.priority,
    summary: summary || fallback.summary,
    keywords:
      aiResult.keywords.length > 0 && !shouldUseFallbackCategory
        ? aiResult.keywords
        : fallback.keywords,
    fixSteps:
      aiResult.fixSteps.length > 0 && !shouldUseFallbackCategory
        ? aiResult.fixSteps
        : fallback.fixSteps,
    technicianType:
      compact(aiResult.technicianType) && !shouldUseFallbackCategory
        ? aiResult.technicianType
        : fallback.technicianType,
    predictedResolutionHours:
      aiResult.predictedResolutionHours > 0 && !shouldUseFallbackCategory
        ? aiResult.predictedResolutionHours
        : fallback.predictedResolutionHours,
  };
}
