// ============================================================
// ShaadiOS — Budget Profiles & AI Budget Allocation System
// ============================================================
//
// FILE 2 OF 2
// Contains:
//   BUDGET_PROFILES  — per-culture recommended % splits
//   AI_BUDGET_PROMPT — the Claude API prompt for dynamic allocation
//   buildBudgetPrompt() — constructs the prompt from wedding data
//   parseBudgetResponse() — parses Claude's JSON response
//   FALLBACK_BUDGET  — if AI call fails, use these defaults
// ============================================================

import type { CultureId, BudgetCategory } from './weddingCultures'
import { BUDGET_CATEGORIES, CULTURE_MAP } from './weddingCultures'

// ── TYPES ─────────────────────────────────────────────────────

export interface BudgetAllocation {
  categoryId: string
  label: string
  emoji: string
  percentage: number        // 0–100, all must sum to 100
  estimatedAmount: number   // in paise
  rationale: string         // one-line explanation shown to planner
}

export interface BudgetAllocationResult {
  allocations: BudgetAllocation[]
  totalBudget: number        // in paise
  aiSummary: string          // 2–3 sentence explanation of the split
  culturalNotes: string[]    // bullet points of cultural spending drivers
  warnings: string[]         // e.g. "Catering budget may be tight for 300 guests"
  suggestedGuestRange?: string // e.g. "This budget supports 150–250 guests"
}

export interface WeddingBudgetInput {
  totalBudgetPaise: number   // ALWAYS in paise
  cultures: CultureId[]
  weddingCity: string
  estimatedGuestCount?: number
  numberOfEvents: number
  numberOfDays: number       // 1 = single day, 2–5 = multi-day
  includeDecor: boolean      // some couples do minimal decor
  includePhotography: boolean
  isDestinationWedding: boolean
  venueTier?: 'budget' | 'mid' | 'premium' | 'luxury'
}

// ── BUDGET PROFILES (fallback + reference) ───────────────────
// Used as context in the AI prompt and as fallback if AI fails.
// All percentages sum to 100.

export const BUDGET_PROFILES: Record<CultureId, {
  rationale: string
  keyDrivers: string[]
  categories: Record<string, number>
}> = {

  'punjabi': {
    rationale: 'Punjabi weddings are known for their exuberance and scale. Entertainment (dhol, DJ, live music) and catering are the two biggest spends. The Baraat and Sangeet rival the main ceremony in investment. Multiple events over 3–5 days mean higher overall spend.',
    keyDrivers: ['Large guest lists (300–1500+)', 'Multi-day events (4–5 functions)', 'Live entertainment — dhol, DJ, anchor for every event', 'Elaborate Baraat with horse/car and band', 'Lavish catering with multiple cuisines', 'Grand venue for Sangeet and wedding'],
    categories: { venue:24, catering:26, decor:14, photo:10, outfits:10, music:8, mehendi:3, priests:1, transport:2, invites:1, misc:1 }
  },

  'hindu-hindi': {
    rationale: 'Hindi-belt weddings balance venue grandeur with catering and decor. Religious ceremonies (pandit, havan, muhurat) are non-negotiable. Photography has become a major spend in urban families. Trousseau (bride\'s outfits and jewellery) is traditionally a significant family investment.',
    keyDrivers: ['Venue is a prestige statement', 'Full-day catering spread — breakfast to dinner', 'Pandit and ritual items are required', 'Bridal trousseau is a major family expense', 'Photography has become premium in metros'],
    categories: { venue:26, catering:24, decor:14, photo:10, outfits:12, music:5, mehendi:3, priests:2, transport:2, invites:1, misc:1 }
  },

  'rajasthani': {
    rationale: 'Rajasthani weddings are the most visually spectacular in India. Decor is the defining spend — elaborate florals, royal tent setups, and heritage venue hire. Outfits are elaborate and costly (lehengas, pagri). The Tilak ceremony involves significant gift-giving.',
    keyDrivers: ['Heritage venue or tent palace setup', 'Decor is a key expression of family status', 'Elaborate outfits — intricate mirror work and embroidery', 'Large scale catering with Rajasthani Marwari cuisine', 'Multi-day celebrations with distinct events'],
    categories: { venue:20, catering:22, decor:20, photo:10, outfits:14, music:5, mehendi:3, priests:2, transport:2, invites:1, misc:1 }
  },

  'kashmiri': {
    rationale: 'Kashmiri Pandit weddings are intimate and ritual-focused. The Wazwan feast (traditional multi-course mutton meal) is the single biggest expense — prepared by professional Wazas (cooks). Venue is typically the family home or a community hall. Outfits include the distinctive Kashmiri pheran.',
    keyDrivers: ['Wazwan feast is the defining spend — skilled Wazas charge premium', 'Smaller, more intimate events than other North Indian traditions', 'Ritual specialists (Batuk, pandit) required for multiple ceremonies', 'Traditional Kashmiri jewellery (dej-hor, aath) is a major family investment'],
    categories: { venue:16, catering:32, decor:10, photo:8, outfits:14, music:4, mehendi:3, priests:5, transport:3, invites:2, misc:3 }
  },

  'sindhi': {
    rationale: 'Sindhi weddings combine North Indian opulence with specific Sindhi customs. The Sindhi community places great emphasis on food and hospitality — catering is elaborate. As a merchant community with global diaspora, Sindhi families often spend significantly on outfits and jewellery.',
    keyDrivers: ['Elaborate catering — Sindhi cuisine and multi-cuisine spread', 'Significant investment in bridal jewellery and outfits', 'Multiple ceremonies over 2–3 days', 'DJ and entertainment are high priority'],
    categories: { venue:22, catering:26, decor:12, photo:10, outfits:14, music:7, mehendi:3, priests:2, transport:2, invites:1, misc:1 }
  },

  'up-bihari': {
    rationale: 'UP and Bihar weddings are deeply ritual-centric with multiple ceremonies. Catering is lavish — the family\'s reputation is tied to how well guests are fed. Venue is important but often secondary to food. Pandit and ritual costs are higher due to the complexity of ceremonies.',
    keyDrivers: ['Food is a family honour metric — elaborate multi-day catering', 'Multiple ceremonies with dedicated pandit requirements', 'Large guest lists are cultural expectation', 'Bridal outfits (Banarasi sarees, jewellery) are a major family investment'],
    categories: { venue:20, catering:28, decor:12, photo:9, outfits:14, music:5, mehendi:3, priests:4, transport:3, invites:1, misc:1 }
  },

  'tamil': {
    rationale: 'Tamil weddings prioritise the muhurat — the entire wedding is scheduled around an auspicious window, often early morning. Specialist requirements (Vadhyar, Nadhaswaram musicians, Oonjal decorator) drive up service costs. Catering is vegetarian and elaborate. Silk sarees (Kanchipuram) are the defining outfit investment.',
    keyDrivers: ['Muhurat-driven timing — affects venue hire and catering', 'Specialist Vadhyar and Nadhaswaram musicians required', 'Kanchipuram silk sarees are a major family investment', 'Vegetarian catering is standard — often at high quality and volume', 'Oonjal swing specialist and Tamil-specific event setup'],
    categories: { venue:22, catering:24, decor:12, photo:10, outfits:14, music:6, mehendi:3, priests:5, transport:2, invites:1, misc:1 }
  },

  'telugu': {
    rationale: 'Telugu weddings are known for their warmth and elaborateness. Catering is a major statement — Telugu hospitality culture demands abundance. The Pellikuthuru and specific Telugu rituals require additional preparation. Photography is increasingly a premium investment in Hyderabad and Vizag.',
    keyDrivers: ['Telugu hospitality culture demands exceptional catering', 'Elaborate silk pattu sarees for bride and family', 'Multiple ceremonies with specific Telugu rituals', 'Growing emphasis on premium wedding photography'],
    categories: { venue:22, catering:26, decor:12, photo:12, outfits:12, music:5, mehendi:3, priests:4, transport:2, invites:1, misc:1 }
  },

  'kannada': {
    rationale: 'Kannada weddings balance tradition with modern preferences. Catering and venue are the primary spends. Silk sarees (Mysore silk) are a key investment. The ceremonies are concise but complete, making Kannada weddings relatively efficient in duration and therefore potentially cost-effective.',
    keyDrivers: ['Mysore silk sarees for bride and family', 'Venue selection is a prestige element', 'Catering with Udupi-style vegetarian spread', 'Growing premium photography market in Bangalore'],
    categories: { venue:24, catering:24, decor:12, photo:12, outfits:12, music:5, mehendi:3, priests:4, transport:2, invites:1, misc:1 }
  },

  'malayalam': {
    rationale: 'Kerala weddings are elegant and relatively modest in display. The Sadhya (banana leaf feast) is a non-negotiable cultural institution and a significant catering expense. Venue is often a temple or community hall, keeping those costs lower. Kasavu silk sarees are the key outfit investment.',
    keyDrivers: ['Sadhya feast — traditional banana leaf meal for all guests', 'Temple or community hall venues are preferred — lower venue cost', 'Kasavu silk sarees and gold jewellery are major investments', 'Simple but complete Thalikettu ceremony requires Vadhyar', 'Kerala\'s high gold jewellery tradition affects overall outfit/jewellery budget'],
    categories: { venue:18, catering:28, decor:10, photo:10, outfits:16, music:5, mehendi:3, priests:5, transport:2, invites:1, misc:2 }
  },

  'kodava': {
    rationale: 'Kodava weddings are intimate community affairs. The Kodava community in Coorg places value on authenticity — traditional Kodava dress, community participation, and simple but excellent food. Large-scale decor and entertainment are not cultural priorities.',
    keyDrivers: ['Intimate, community-focused ceremonies', 'Traditional Kodava attire (Kupya for men, saree with distinct style for women)', 'Emphasis on food quality over display', 'Music is traditional — not DJ-focused'],
    categories: { venue:20, catering:28, decor:10, photo:10, outfits:14, music:5, mehendi:2, priests:5, transport:3, invites:1, misc:2 }
  },

  'bengali': {
    rationale: 'Bengali weddings are artistic, literary, and emotionally rich. Photography is extremely important — Bengalis value the documentation of every ritual. Catering is a central expression of Bengali hospitality (fish is essential at non-vegetarian weddings). The Loha (iron bangle) and conch bangles are significant jewellery investments.',
    keyDrivers: ['Photography is a premium priority — rituals are visually complex and meaningful', 'Fish dishes (especially Rohu) are culturally essential at non-vegetarian weddings', 'Elaborate sweets (mishti) are a cultural must', 'Shubho Drishti, Saat Paak, and Sindur Daan are high-emotion ritual moments', 'Banarasi or Benarasi silk sarees for bride'],
    categories: { venue:20, catering:24, decor:12, photo:16, outfits:12, music:5, mehendi:3, priests:4, transport:2, invites:1, misc:1 }
  },

  'odia': {
    rationale: 'Odia weddings are ritual-rich and community-oriented. Catering and venue are primary spends. The Sambalpuri or Khandua silk saree is the defining bridal outfit. Ceremonies follow specific Odia Brahmin traditions which require specialist priests.',
    keyDrivers: ['Ritual complexity requires specialist Odia Brahmin', 'Community participation and feeding is culturally expected', 'Sambalpuri silk is the prestigious bridal choice', 'Relatively conservative entertainment spend'],
    categories: { venue:22, catering:26, decor:12, photo:10, outfits:14, music:4, mehendi:3, priests:5, transport:2, invites:1, misc:1 }
  },

  'assamese': {
    rationale: 'Assamese weddings celebrate the state\'s textile heritage. The Mekhela Chador (Muga or Eri silk) is the most prized bridal outfit in all of India and a major expense. Catering includes Assamese cuisine with fish and traditional preparations. Ceremonies are warm and intimate.',
    keyDrivers: ['Muga silk Mekhela Chador is the most expensive bridal silk in India', 'Traditional Assamese cuisine with specific fish preparations', 'Bihu music and traditional instruments for celebration', 'Gamosa (traditional cotton cloth) used as ceremonial gifts'],
    categories: { venue:18, catering:24, decor:12, photo:10, outfits:20, music:5, mehendi:2, priests:4, transport:3, invites:1, misc:1 }
  },

  'manipuri': {
    rationale: 'Manipuri weddings blend Hindu Vaishnav traditions with Meitei customs. The Phanek (traditional wraparound skirt) and Innaphi (shawl) are the bride\'s outfit. Ceremonies are intimate and music is traditional — Manipuri classical dance and Pena (string instrument) music.',
    keyDrivers: ['Traditional Manipuri textiles are specialist and expensive', 'Smaller, intimate ceremony scale', 'Traditional music — not DJ-focused', 'Specific Meitei ritual requirements'],
    categories: { venue:18, catering:26, decor:12, photo:12, outfits:16, music:5, mehendi:2, priests:5, transport:2, invites:1, misc:1 }
  },

  'gujarati': {
    rationale: 'Gujarati weddings are a multi-day spectacle with Garba at the centre. Entertainment (Garba band or DJ, dandiya sticks, MC) is a defining spend. The community values lavish hospitality — catering is elaborate and Gujarati food is celebrated. Gold jewellery is a generational investment.',
    keyDrivers: ['Garba night is a major standalone event — significant entertainment spend', 'Gujarati hospitality culture demands exceptional catering', 'Gold jewellery is both cultural and investment — major family spend', 'Mameru ceremony involves substantial gifts', 'Multi-day events (Garba, Haldi, Mehendi, Wedding, Reception)'],
    categories: { venue:20, catering:24, decor:12, photo:10, outfits:14, music:10, mehendi:3, priests:2, transport:2, invites:1, misc:2 }
  },

  'maharashtrian': {
    rationale: 'Maharashtrian weddings value authenticity and cultural integrity. The Nauvari (9-yard) saree and Paithani silk are signature bridal outfits. The wedding ceremony itself (Mangalashtak, Antarpat) is choreographed. Catering includes traditional Maharashtrian cuisine with Puran Poli and Modak.',
    keyDrivers: ['Nauvari saree and Paithani silk are premium bridal investments', 'Ceremony choreography (Mangalashtak singers) is a unique requirement', 'Traditional Maharashtrian cuisine catering', 'Venue emphasis on traditional aesthetic'],
    categories: { venue:22, catering:24, decor:12, photo:12, outfits:14, music:5, mehendi:3, priests:4, transport:2, invites:1, misc:1 }
  },

  'jain': {
    rationale: 'Jain weddings follow strict Ahimsa principles — no leather, no non-vegetarian food, no alcohol. Every vendor must be vetted. The pure vegetarian sattvic catering is elaborate and high quality. Outfits avoid silk (some communities) due to silk worms being harmed. Diamond and gold jewellery is a traditional major investment.',
    keyDrivers: ['All-vegetarian sattvic catering — higher quality premium', 'All vendors must be Jain-compliant (no leather, no non-veg)', 'Absence of alcohol and non-veg actually reduces catering complexity but increases quality requirements', 'Jewellery (diamonds, gold) is a generational Jain family investment', 'Religious ceremony requires Jain Pandya'],
    categories: { venue:22, catering:22, decor:14, photo:10, outfits:16, music:5, mehendi:3, priests:4, transport:2, invites:1, misc:1 }
  },

  'parsi': {
    rationale: 'Parsi weddings are intimate, sophisticated, and steeped in Zoroastrian tradition. The community is small — guest lists are typically 150–400. The Dastur (priest) is a premium requirement. Catering includes traditional Parsi dishes (Dhansak, Patra ni Machi, Chicken Farcha). Photography is valued for documenting rare traditions.',
    keyDrivers: ['Certified Dastur (Zoroastrian priest) is expensive and limited availability', 'Traditional Parsi cuisine — specialist catering required', 'Intimate scale means lower overall volume costs but higher per-head quality', 'Sacred fire setup and Lagan ritual items', 'Photography to document an increasingly rare tradition'],
    categories: { venue:20, catering:26, decor:12, photo:14, outfits:12, music:4, mehendi:2, priests:8, transport:3, invites:2, misc:3 }
  },

}

// ── AI BUDGET PROMPT BUILDER ──────────────────────────────────
// Constructs the system + user prompt for Claude API

export const BUDGET_SYSTEM_PROMPT = `You are ShaadiOS's wedding budget AI assistant. You have deep knowledge of Indian wedding traditions, regional customs, and the cost structures of weddings across all Indian cultural communities.

Your role is to recommend a budget allocation split across the following categories for a specific wedding, based on the cultures, city, scale, and preferences provided.

BUDGET CATEGORIES (you must allocate across ALL of these, and they MUST sum to exactly 100%):
${BUDGET_CATEGORIES.map(c => `- ${c.id}: ${c.label} ${c.emoji}`).join('\n')}

IMPORTANT RULES:
1. Percentages MUST sum to exactly 100. Check your arithmetic before responding.
2. No category should be 0% unless the planner has explicitly disabled it (e.g., no photography).
3. Minimum 1% for any included category.
4. Catering is ALWAYS a significant spend in Indian weddings — never below 18%.
5. For multi-culture weddings, blend the two cultures' profiles proportionally.
6. Adjust for city (Mumbai/Delhi/Bangalore are 20–30% more expensive for venue and catering vs tier-2 cities).
7. Adjust for guest count (500+ guests shifts more budget to catering; <150 guests shifts more to photography and décor).
8. Adjust for destination weddings (+15% transport, +10% venue, -10% catering relative).
9. Adjust for multi-day events (each additional full wedding day adds ~15% overall budget requirement).

OUTPUT FORMAT — respond ONLY with a valid JSON object, no markdown, no explanation text:
{
  "allocations": [
    {
      "categoryId": "venue",
      "percentage": 22,
      "rationale": "One-line explanation specific to THIS wedding"
    },
    ... (all 11 categories)
  ],
  "aiSummary": "2–3 sentence summary of the overall approach to this wedding's budget",
  "culturalNotes": [
    "Bullet point 1 — specific cultural spending driver",
    "Bullet point 2",
    "Bullet point 3"
  ],
  "warnings": [
    "Optional: any budget adequacy warnings based on guest count / city / ambition"
  ],
  "suggestedGuestRange": "e.g. This budget comfortably supports 150–250 guests in Mumbai"
}

Do not include any text outside the JSON object.`

export function buildBudgetPrompt(input: WeddingBudgetInput): string {
  const totalLakh = (input.totalBudgetPaise / 10_000_000).toFixed(2)
  const cultureNames = input.cultures.map(c => CULTURE_MAP[c]?.name || c).join(' + ')

  // Build reference profiles for selected cultures
  const profileContext = input.cultures.map(cId => {
    const { BUDGET_PROFILES } = require('./budgetAI')
    const profile = BUDGET_PROFILES[cId]
    if (!profile) return ''
    return `
${CULTURE_MAP[cId]?.name} wedding profile:
- Rationale: ${profile.rationale}
- Key spending drivers: ${profile.keyDrivers.join('; ')}
- Reference split: ${Object.entries(profile.categories).map(([k, v]) => `${k}:${v}%`).join(', ')}`
  }).join('\n')

  const userPrompt = `Please recommend a budget allocation for this specific wedding:

WEDDING DETAILS:
- Cultures: ${cultureNames}
- Total budget: ₹${totalLakh} Lakh (${input.totalBudgetPaise} paise)
- City: ${input.weddingCity}
- Estimated guests: ${input.estimatedGuestCount ?? 'Not specified'}
- Number of events/ceremonies: ${input.numberOfEvents}
- Number of wedding days: ${input.numberOfDays}
- Venue tier preference: ${input.venueTier ?? 'Not specified'}
- Is destination wedding: ${input.isDestinationWedding ? 'Yes' : 'No'}
- Photography included: ${input.includePhotography ? 'Yes' : 'No'}
- Décor included: ${input.includeDecor ? 'Yes' : 'No'}

CULTURAL REFERENCE PROFILES FOR CONTEXT:
${profileContext}

Based on all of the above, provide the recommended budget allocation JSON.`

  return userPrompt
}

// ── RESPONSE PARSER ───────────────────────────────────────────

export function parseBudgetResponse(
  aiResponseText: string,
  input: WeddingBudgetInput
): BudgetAllocationResult {
  let parsed: {
    allocations: Array<{ categoryId: string; percentage: number; rationale: string }>
    aiSummary: string
    culturalNotes: string[]
    warnings: string[]
    suggestedGuestRange?: string
  }

  try {
    // Strip any accidental markdown fences
    const clean = aiResponseText.replace(/```json|```/g, '').trim()
    parsed = JSON.parse(clean)
  } catch {
    // If JSON parse fails, fall back to first selected culture's profile
    return buildFallbackAllocation(input)
  }

  // Validate percentages sum to 100
  const total = parsed.allocations.reduce((sum, a) => sum + a.percentage, 0)
  if (Math.abs(total - 100) > 2) {
    // Normalise
    const factor = 100 / total
    parsed.allocations = parsed.allocations.map(a => ({
      ...a,
      percentage: Math.round(a.percentage * factor)
    }))
  }

  const allocations: BudgetAllocation[] = parsed.allocations.map(a => {
    const cat = BUDGET_CATEGORIES.find(c => c.id === a.categoryId)
    return {
      categoryId: a.categoryId,
      label: cat?.label ?? a.categoryId,
      emoji: cat?.emoji ?? '📦',
      percentage: a.percentage,
      estimatedAmount: Math.round((a.percentage / 100) * input.totalBudgetPaise),
      rationale: a.rationale,
    }
  })

  return {
    allocations,
    totalBudget: input.totalBudgetPaise,
    aiSummary: parsed.aiSummary,
    culturalNotes: parsed.culturalNotes ?? [],
    warnings: parsed.warnings ?? [],
    suggestedGuestRange: parsed.suggestedGuestRange,
  }
}

// ── FALLBACK ALLOCATION (if AI unavailable) ───────────────────

export function buildFallbackAllocation(input: WeddingBudgetInput): BudgetAllocationResult {
  // Blend profiles from selected cultures
  const profiles = input.cultures
    .map(c => BUDGET_PROFILES[c]?.categories)
    .filter(Boolean)

  const blended: Record<string, number> = {}
  BUDGET_CATEGORIES.forEach(cat => {
    const vals = profiles.map(p => p?.[cat.id] ?? 0).filter(v => v > 0)
    blended[cat.id] = vals.length > 0
      ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)
      : 1
  })

  // Normalise to 100
  const total = Object.values(blended).reduce((a, b) => a + b, 0)
  Object.keys(blended).forEach(k => {
    blended[k] = Math.round((blended[k] / total) * 100)
  })

  const allocations: BudgetAllocation[] = BUDGET_CATEGORIES.map(cat => ({
    categoryId: cat.id,
    label: cat.label,
    emoji: cat.emoji,
    percentage: blended[cat.id] ?? 1,
    estimatedAmount: Math.round(((blended[cat.id] ?? 1) / 100) * input.totalBudgetPaise),
    rationale: 'Based on cultural profile average',
  }))

  return {
    allocations,
    totalBudget: input.totalBudgetPaise,
    aiSummary: 'Budget split based on cultural profile averages. Enable AI for a personalised recommendation.',
    culturalNotes: input.cultures.map(c =>
      BUDGET_PROFILES[c]?.keyDrivers?.[0] ?? ''
    ).filter(Boolean),
    warnings: [],
  }
}

// ── EDGE FUNCTION IMPLEMENTATION ──────────────────────────────
// Drop this into supabase/functions/ai-budget-allocation/index.ts

export const EDGE_FUNCTION_CODE = `
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')!

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      }
    })
  }

  try {
    const input = await req.json()
    // input shape: WeddingBudgetInput from budgetAI.ts
    const { buildBudgetPrompt, BUDGET_SYSTEM_PROMPT } = await import('./budgetAI.ts')
    const userPrompt = buildBudgetPrompt(input)

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        system: BUDGET_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    })

    const data = await response.json()
    const aiText = data.content?.[0]?.text ?? ''

    return new Response(JSON.stringify({ aiText }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })
  }
})
`

// ── FRONTEND HOOK ─────────────────────────────────────────────
// Drop this into src/hooks/useBudgetAllocation.ts

export const FRONTEND_HOOK_CODE = `
import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { parseBudgetResponse, buildFallbackAllocation } from '@/data/budgetAI'
import type { WeddingBudgetInput, BudgetAllocationResult } from '@/data/budgetAI'

export function useBudgetAllocation() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<BudgetAllocationResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const getAllocation = useCallback(async (input: WeddingBudgetInput) => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: fnError } = await supabase.functions.invoke(
        'ai-budget-allocation',
        { body: input }
      )
      if (fnError) throw fnError
      const parsed = parseBudgetResponse(data.aiText, input)
      setResult(parsed)
      return parsed
    } catch (err) {
      console.error('AI budget allocation failed, using fallback:', err)
      const fallback = buildFallbackAllocation(input)
      setResult(fallback)
      setError('AI unavailable — using profile defaults')
      return fallback
    } finally {
      setLoading(false)
    }
  }, [])

  return { getAllocation, loading, result, error }
}
`
