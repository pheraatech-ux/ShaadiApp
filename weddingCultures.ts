// ============================================================
// ShaadiOS — Wedding Culture & Event Data
// Full reference data for all 19 Indian wedding traditions
// Used by: Culture selector, Event timeline, Task generation,
//          AI Budget Allocation prompt, Workspace overview
//
// DATA STRUCTURE:
//   CULTURES       → selectable culture entries (for step 2 wizard)
//   EVENT_LIBRARY  → all events keyed by id, with full metadata
//   CULTURE_EVENTS → maps each culture to its ordered event ids
//   TASK_TEMPLATES → per-event task templates with deadlines
//   BUDGET_PROFILES→ per-culture recommended budget split %s
// ============================================================

// ── TYPES ────────────────────────────────────────────────────

export type CultureRegion = 'north' | 'south' | 'east' | 'west'
export type CultureId =
  | 'hindu-hindi' | 'punjabi' | 'rajasthani' | 'kashmiri'
  | 'sindhi' | 'up-bihari'
  | 'tamil' | 'telugu' | 'kannada' | 'malayalam' | 'kodava'
  | 'bengali' | 'odia' | 'assamese' | 'manipuri'
  | 'gujarati' | 'maharashtrian' | 'jain' | 'parsi'

export type TaskPriority = 'high' | 'medium' | 'low'
export type TaskVisibility = 'planner' | 'client' | 'vendor' | 'all'

export interface Culture {
  id: CultureId
  flag: string
  name: string
  region: CultureRegion
  color: string          // hex — used for culture tags and legend
  shortName: string      // used on chips e.g. "Punjabi"
}

export interface WeddingEvent {
  id: string
  emoji: string
  name: string
  alternateNames?: string[]   // same event, different culture names
  duration: string            // e.g. "2–3h", "½ day", "Full day"
  cultures: CultureId[]       // which cultures include this event
  isShared: boolean           // true if event appears in 3+ cultures
  description: string         // shown to planner on hover/expand
  culturalSignificance: string // deeper context for the planner
  requiresSpecialist: boolean  // flags events needing special booking
  specialistNote?: string      // e.g. "Requires Granthi from Gurdwara"
  daysBeforeWedding: number    // typical days before main ceremony
  defaultOrder: number         // sort order in timeline
}

export interface TaskTemplate {
  id: string
  text: string
  eventId: string
  priority: TaskPriority
  dueDaysBeforeEvent: number   // task due X days before the event date
  assigneeRole: 'planner' | 'bride' | 'groom' | 'family' | 'vendor'
  visibility: TaskVisibility
  notes?: string               // helper note shown to planner
}

export interface BudgetCategory {
  id: string
  label: string
  emoji: string
}

export interface BudgetProfile {
  cultureId: CultureId
  rationale: string            // shown in AI explanation
  categories: Record<string, number>  // category id → percentage
}

// ── BUDGET CATEGORIES ────────────────────────────────────────

export const BUDGET_CATEGORIES: BudgetCategory[] = [
  { id: 'venue',      label: 'Venue & décor',            emoji: '🏛️' },
  { id: 'catering',   label: 'Catering & food',          emoji: '🍽️' },
  { id: 'decor',      label: 'Florals & decoration',     emoji: '🌸' },
  { id: 'photo',      label: 'Photography & videography', emoji: '📷' },
  { id: 'outfits',    label: 'Outfits & jewellery',      emoji: '👗' },
  { id: 'music',      label: 'Music & entertainment',    emoji: '🎵' },
  { id: 'mehendi',    label: 'Mehendi & beauty',         emoji: '🌿' },
  { id: 'priests',    label: 'Priests & religious',      emoji: '🙏' },
  { id: 'transport',  label: 'Transport & logistics',    emoji: '🚗' },
  { id: 'invites',    label: 'Invitations & stationery', emoji: '✉️' },
  { id: 'misc',       label: 'Miscellaneous / buffer',   emoji: '📦' },
]

// ── CULTURES ─────────────────────────────────────────────────

export const CULTURES: Culture[] = [
  // NORTH INDIA
  { id: 'hindu-hindi',  flag: '🏮', name: 'Hindu (Hindi belt)',   region: 'north', color: '#B5541A', shortName: 'Hindi' },
  { id: 'punjabi',      flag: '🌾', name: 'Punjabi',              region: 'north', color: '#B5541A', shortName: 'Punjabi' },
  { id: 'rajasthani',   flag: '🏰', name: 'Rajasthani / Marwari', region: 'north', color: '#854F0B', shortName: 'Rajasthani' },
  { id: 'kashmiri',     flag: '❄️', name: 'Kashmiri Pandit',      region: 'north', color: '#185FA5', shortName: 'Kashmiri' },
  { id: 'sindhi',       flag: '🪷', name: 'Sindhi',               region: 'north', color: '#993556', shortName: 'Sindhi' },
  { id: 'up-bihari',    flag: '🪔', name: 'UP / Bihari',          region: 'north', color: '#633806', shortName: 'UP/Bihar' },
  // SOUTH INDIA
  { id: 'tamil',        flag: '🌴', name: 'Tamil',                region: 'south', color: '#2D6A4F', shortName: 'Tamil' },
  { id: 'telugu',       flag: '🌸', name: 'Telugu',               region: 'south', color: '#0F6E56', shortName: 'Telugu' },
  { id: 'kannada',      flag: '🌻', name: 'Kannada',              region: 'south', color: '#1D9E75', shortName: 'Kannada' },
  { id: 'malayalam',    flag: '🌊', name: 'Kerala / Malayalam',   region: 'south', color: '#185FA5', shortName: 'Kerala' },
  { id: 'kodava',       flag: '🍃', name: 'Kodava',               region: 'south', color: '#3B6D11', shortName: 'Kodava' },
  // EAST & NORTHEAST
  { id: 'bengali',      flag: '🐟', name: 'Bengali',              region: 'east',  color: '#534AB7', shortName: 'Bengali' },
  { id: 'odia',         flag: '🎨', name: 'Odia',                 region: 'east',  color: '#D85A30', shortName: 'Odia' },
  { id: 'assamese',     flag: '🎋', name: 'Assamese',             region: 'east',  color: '#BA7517', shortName: 'Assamese' },
  { id: 'manipuri',     flag: '🌺', name: 'Manipuri',             region: 'east',  color: '#993556', shortName: 'Manipuri' },
  // WEST & COMMUNITIES
  { id: 'gujarati',     flag: '🎭', name: 'Gujarati',             region: 'west',  color: '#B5541A', shortName: 'Gujarati' },
  { id: 'maharashtrian',flag: '🌿', name: 'Maharashtrian',        region: 'west',  color: '#2D6A4F', shortName: 'Marathi' },
  { id: 'jain',         flag: '☮️', name: 'Jain',                 region: 'west',  color: '#888780', shortName: 'Jain' },
  { id: 'parsi',        flag: '🔥', name: 'Parsi / Zoroastrian',  region: 'west',  color: '#854F0B', shortName: 'Parsi' },
]

export const CULTURE_MAP = Object.fromEntries(CULTURES.map(c => [c.id, c])) as Record<CultureId, Culture>

// ── EVENT LIBRARY ─────────────────────────────────────────────
// All ~60 unique events across all cultures

export const EVENT_LIBRARY: Record<string, WeddingEvent> = {

  // ── NORTH — SHARED ACROSS MOST HINDU TRADITIONS ──

  roka: {
    id: 'roka', emoji: '💐', name: 'Roka', duration: '2–3h',
    cultures: ['punjabi', 'hindu-hindi', 'up-bihari', 'rajasthani'],
    isShared: false,
    description: 'The formal agreement ceremony between both families to confirm the match. Gifts and blessings are exchanged and the wedding date is announced to the family.',
    culturalSignificance: 'Roka literally means "to stop" — the groom is stopped from being available to other matches. It is the first official step in the wedding process and carries significant social weight in North Indian families.',
    requiresSpecialist: false,
    daysBeforeWedding: 90,
    defaultOrder: 1,
  },

  chunni_chadana: {
    id: 'chunni_chadana', emoji: '🧣', name: 'Chunni Chadana', duration: '1–2h',
    cultures: ['punjabi'],
    isShared: false,
    description: 'The groom\'s family visits the bride\'s home and presents her with a red or orange chunni (dupatta) as a formal welcome into the family.',
    culturalSignificance: 'The chunni represents the groom\'s family\'s acceptance and blessing of the bride. The colour red or orange is auspicious and the moment is deeply emotional for the bride\'s family.',
    requiresSpecialist: false,
    daysBeforeWedding: 60,
    defaultOrder: 2,
  },

  sagan: {
    id: 'sagan', emoji: '⭐', name: 'Sagan', duration: '2h',
    cultures: ['punjabi', 'hindu-hindi', 'up-bihari'],
    isShared: true,
    description: 'An auspicious ceremony where elders bless the couple by applying a tilak, offering money, and gifting sweets. Marks the official start of the wedding festivities.',
    culturalSignificance: 'Sagan is derived from the Sanskrit word "shakuna" meaning auspicious omen. Elders placing tilak on the groom\'s forehead and gifting him transfers their blessings and formally announces him as the chosen groom.',
    requiresSpecialist: false,
    daysBeforeWedding: 45,
    defaultOrder: 3,
  },

  tilak: {
    id: 'tilak', emoji: '🪔', name: 'Tilak ceremony', duration: '2h',
    cultures: ['rajasthani', 'hindu-hindi', 'up-bihari'],
    isShared: false,
    description: 'The bride\'s family formally applies tilak on the groom\'s forehead, gifting clothes, dry fruits, and cash. A precursor to the wedding confirming the alliance.',
    culturalSignificance: 'In Rajasthani and UP traditions, the Tilak is a major ceremony attended by the groom\'s entire male family. The gifts sent are elaborate and the ceremony solidifies the bond between the two families publicly.',
    requiresSpecialist: true,
    specialistNote: 'Requires a Brahmin pandit to perform the tilak with mantras.',
    daysBeforeWedding: 30,
    defaultOrder: 3,
  },

  haldi: {
    id: 'haldi', emoji: '🌼', name: 'Haldi', duration: '2–3h',
    alternateNames: ['Halad (Marathi)', 'Pithi (Gujarati)', 'Mangalasnanam (South)'],
    cultures: ['punjabi', 'hindu-hindi', 'up-bihari', 'rajasthani', 'gujarati', 'maharashtrian', 'bengali', 'sindhi', 'kashmiri'],
    isShared: true,
    description: 'Turmeric paste is applied to the bride and groom separately (or together) for skin cleansing and blessings. Considered highly auspicious — the turmeric brings a golden glow and wards off evil.',
    culturalSignificance: 'Turmeric (haldi) is considered sacred in Hindu tradition, with antiseptic and purifying properties. The ceremony is believed to protect the couple from evil spirits and bring radiance before the wedding. It is one of the most photographed and joyful pre-wedding events.',
    requiresSpecialist: false,
    daysBeforeWedding: 2,
    defaultOrder: 8,
  },

  mehendi: {
    id: 'mehendi', emoji: '🌿', name: 'Mehendi', duration: '4–6h',
    alternateNames: ['Mehndi'],
    cultures: ['punjabi', 'hindu-hindi', 'up-bihari', 'rajasthani', 'gujarati', 'sindhi', 'kashmiri', 'maharashtrian'],
    isShared: true,
    description: 'The bride\'s hands and feet are adorned with intricate henna designs by professional mehendi artists. A celebrated gathering of women with music, food, and folk songs.',
    culturalSignificance: 'Mehendi is believed to bring good luck, love, and prosperity to the bride. The darker the mehendi, the more love from the husband. Traditional motifs include the groom\'s name or face hidden within the design — the groom must find it on the wedding night. In Punjab, Giddha and Boliyan (folk songs) are performed.',
    requiresSpecialist: true,
    specialistNote: 'Book at least 2 professional mehendi artists. For large bridal parties, 3–4 artists recommended. Confirm their portfolio for bridal designs specifically.',
    daysBeforeWedding: 3,
    defaultOrder: 7,
  },

  sangeet: {
    id: 'sangeet', emoji: '🎵', name: 'Sangeet', duration: '4–5h',
    cultures: ['punjabi', 'hindu-hindi', 'up-bihari', 'rajasthani', 'gujarati', 'sindhi', 'maharashtrian'],
    isShared: true,
    description: 'A musical celebration where both families perform choreographed dances and songs. Often the most anticipated pre-wedding event, with a DJ, live dhol, and dinner.',
    culturalSignificance: 'Originally a women-only ceremony where songs were sung about the bride\'s childhood and the groom\'s family. Now a co-ed, high-energy event that marks the merging of two families through shared celebration. In North India it often rivals the wedding itself in scale and investment.',
    requiresSpecialist: true,
    specialistNote: 'Book DJ, dhol player, and sound engineer separately. Hire an MC/anchor who can manage both families and keep the energy high.',
    daysBeforeWedding: 2,
    defaultOrder: 9,
  },

  baraat: {
    id: 'baraat', emoji: '🐴', name: 'Baraat', duration: '3–4h',
    cultures: ['punjabi', 'hindu-hindi', 'up-bihari', 'rajasthani', 'gujarati', 'sindhi', 'kashmiri'],
    isShared: true,
    description: 'The groom\'s wedding procession — traditionally on a decorated horse or vintage car — to the wedding venue, accompanied by his family and friends dancing to dhol beats.',
    culturalSignificance: 'The Baraat symbolises the groom\'s triumphant arrival as a king (raja) to claim his bride. The procession is a public announcement of the wedding and a celebration of the groom\'s family. In some traditions, the groom rides a white horse (symbol of purity and royalty).',
    requiresSpecialist: true,
    specialistNote: 'Book horse 6–8 weeks in advance — decorated wedding horses are in high demand. Alternative: vintage car with floral garlands. Dhol band of 3–5 players keeps the procession energy high.',
    daysBeforeWedding: 0,
    defaultOrder: 12,
  },

  jaimala: {
    id: 'jaimala', emoji: '💐', name: 'Jaimala / Varmala', duration: '30min',
    cultures: ['punjabi', 'hindu-hindi', 'up-bihari', 'rajasthani', 'gujarati', 'sindhi'],
    isShared: true,
    description: 'The exchange of fresh flower garlands between the bride and groom as a symbol of acceptance and choosing each other. A playful moment as families try to lift the groom to prevent the bride from garlanding him.',
    culturalSignificance: 'The Jaimala is derived from ancient Swayamvara traditions where a princess would choose her husband by placing a garland around his neck. The modern version is a joyful contest — the groom\'s family tries to lift him so the bride can\'t reach, while the bride\'s family pulls him down.',
    requiresSpecialist: false,
    daysBeforeWedding: 0,
    defaultOrder: 13,
  },

  pheras: {
    id: 'pheras', emoji: '🔥', name: 'Pheras / Saat Phere', duration: '2–3h',
    alternateNames: ['Phere', 'Saptapadi (North)'],
    cultures: ['punjabi', 'hindu-hindi', 'up-bihari', 'rajasthani', 'sindhi', 'kashmiri', 'maharashtrian', 'gujarati'],
    isShared: true,
    description: 'The seven sacred rounds (saat phere) around the holy fire (agni) with the pandit reciting mantras. Each of the seven rounds carries a specific vow — the spiritual heart of a Hindu wedding.',
    culturalSignificance: 'The seven vows cover: nourishment, strength, prosperity, happiness, progeny, longevity, and friendship/loyalty. Fire (Agni) is the witness and the divine element. The couple is considered married only after completing all seven rounds. In North India, the groom leads the first six rounds and the bride leads the seventh.',
    requiresSpecialist: true,
    specialistNote: 'Book pandit 6–8 weeks before the wedding. Confirm the muhurat (auspicious time) with the pandit and align venue booking accordingly.',
    daysBeforeWedding: 0,
    defaultOrder: 15,
  },

  vidai: {
    id: 'vidai', emoji: '🙏', name: 'Vidai', duration: '1h',
    cultures: ['punjabi', 'hindu-hindi', 'up-bihari', 'rajasthani', 'sindhi', 'kashmiri', 'maharashtrian'],
    isShared: true,
    description: 'The emotional farewell of the bride from her parental home. The bride throws puffed rice (laja) or rice over her shoulder as she leaves — symbolising prosperity remaining with her natal family.',
    culturalSignificance: 'Vidai is often the most emotionally charged moment of the entire wedding. The bride leaving her home is both a celebration and a mourning. Folk songs (Ghar Chhadna in Punjab) are sung. The ritual of throwing rice over the shoulder means the bride gives back to her parents what they invested in raising her.',
    requiresSpecialist: false,
    daysBeforeWedding: 0,
    defaultOrder: 17,
  },

  griha_pravesh: {
    id: 'griha_pravesh', emoji: '🏠', name: 'Griha Pravesh', duration: '1–2h',
    cultures: ['punjabi', 'hindu-hindi', 'up-bihari', 'rajasthani', 'gujarati', 'maharashtrian'],
    isShared: true,
    description: 'The bride\'s formal first entry into her marital home. She kicks a kalash of rice into the house and steps on a plate of kumkum before entering — symbolising prosperity and fertility.',
    culturalSignificance: 'The Griha Pravesh is the bride\'s first act as a "Grihalakshmi" — the goddess Lakshmi entering the home to bring wealth. The rice kicked into the house represents abundance. The mother-in-law welcomes her with an aarti and the ceremony is private, for close family only.',
    requiresSpecialist: false,
    daysBeforeWedding: 0,
    defaultOrder: 18,
  },

  reception: {
    id: 'reception', emoji: '🥂', name: 'Reception', duration: '4–6h',
    cultures: ['punjabi', 'hindu-hindi', 'up-bihari', 'rajasthani', 'sindhi', 'kashmiri', 'maharashtrian', 'gujarati', 'jain', 'tamil', 'telugu', 'kannada', 'malayalam', 'bengali', 'odia', 'assamese'],
    isShared: true,
    description: 'A post-wedding celebration to introduce the couple as a married pair to extended family, friends, and colleagues. More formal than the wedding, often with a staged entry, seated dinner, and toasts.',
    culturalSignificance: 'The Reception is the couple\'s first public appearance as a married unit. It serves a dual social purpose: announcing the marriage to the wider community, and giving both families a chance to celebrate with friends outside the core family circle who may not have been included in the main ceremonies.',
    requiresSpecialist: false,
    daysBeforeWedding: -1,
    defaultOrder: 19,
  },

  // ── RAJASTHANI / MARWARI ──

  palla_dastoor: {
    id: 'palla_dastoor', emoji: '🎀', name: 'Palla Dastoor', duration: '2–3h',
    cultures: ['rajasthani', 'sindhi'],
    isShared: false,
    description: 'A Rajasthani and Sindhi tradition where the bride\'s dupatta is ritually tied to the groom\'s stole (palla), symbolising the sacred union of two families through cloth.',
    culturalSignificance: 'The tying of the palla is a deeply symbolic act — two families literally joined by cloth. The Purohit (Marwari priest) recites specific mantras during the tying. In some regions, the tied palla is never to be undone by anyone other than the couple themselves.',
    requiresSpecialist: true,
    specialistNote: 'Requires a Marwari Purohit familiar with Palla ceremony protocol.',
    daysBeforeWedding: 0,
    defaultOrder: 14,
  },

  // ── GUJARATI ──

  gol_dhana: {
    id: 'gol_dhana', emoji: '🌰', name: 'Gol Dhana', duration: '1–2h',
    cultures: ['gujarati'],
    isShared: false,
    description: 'A fun Gujarati tradition where the groom tries to reach the bride\'s brother while family members playfully block him. Ends with sweet offerings of coconut (gol) and jaggery (dhana).',
    culturalSignificance: 'Gol Dhana signals the beginning of the wedding day rituals. The playful blocking by the bride\'s family represents protective love for the bride. The offering of coconut and jaggery is a symbolic welcome of the groom into the family.',
    requiresSpecialist: false,
    daysBeforeWedding: 0,
    defaultOrder: 11,
  },

  garba_raas: {
    id: 'garba_raas', emoji: '🎪', name: 'Garba / Raas', duration: '4–6h',
    cultures: ['gujarati', 'jain'],
    isShared: false,
    description: 'The traditional Gujarati dance form performed in circles around a clay pot (garba) or with dandiya sticks (raas). Often performed over multiple nights leading to the wedding.',
    culturalSignificance: 'Garba is performed in reverence to the goddess Durga or Amba. The circular motion represents the cycle of life. During wedding season (especially Navratri), Garba is the central social event — communities compete in elaborate costume and performance. For weddings it serves as the sangeet equivalent.',
    requiresSpecialist: true,
    specialistNote: 'Book a live Garba band or Gujarati DJ 8–10 weeks in advance. Arrange dandiya sticks in quantity for all guests.',
    daysBeforeWedding: 1,
    defaultOrder: 9,
  },

  mameru: {
    id: 'mameru', emoji: '🎁', name: 'Mameru', duration: '2–3h',
    cultures: ['gujarati'],
    isShared: false,
    description: 'The maternal uncle (mama) of the bride brings an elaborate gift ensemble — clothes, jewellery, sweets, dry fruits, and items for the wedding — before the ceremony. A cherished tradition.',
    culturalSignificance: 'In Gujarati tradition, the maternal uncle has a unique and honoured role. The Mameru is both a gift and a public display of the mama\'s love and capacity to provide for his niece. The gifts are traditionally laid out for all to see and admire.',
    requiresSpecialist: false,
    daysBeforeWedding: 1,
    defaultOrder: 6,
  },

  madhuparka: {
    id: 'madhuparka', emoji: '🍯', name: 'Madhuparka', duration: '30min',
    cultures: ['gujarati', 'tamil', 'telugu', 'kannada'],
    isShared: false,
    description: 'The groom is welcomed at the wedding venue by the bride\'s parents with a ceremonial drink of honey, curd, and ghee — a traditional Vedic welcoming ritual.',
    culturalSignificance: 'Madhuparka (honey-offering) is one of the oldest Vedic rites of hospitality. The five elements — honey, curd, ghee, sugar, and water — represent purity and nourishment. Offering this to the groom elevates him to the status of an honoured guest and later, family.',
    requiresSpecialist: false,
    daysBeforeWedding: 0,
    defaultOrder: 12,
  },

  // ── MAHARASHTRIAN ──

  sakhar_puda: {
    id: 'sakhar_puda', emoji: '🍬', name: 'Sakhar Puda', duration: '1–2h',
    cultures: ['maharashtrian'],
    isShared: false,
    description: 'The Maharashtrian engagement — literally "sugar packet" — where families exchange sugar packets and gifts to formalise the match. Simple, intimate, and joyful.',
    culturalSignificance: 'The simplicity of exchanging a sugar packet (shakkar) speaks to the Maharashtrian value of understatement and substance over show. The sweetness of sugar represents the sweetness of the union to come. The ceremony is deliberately small — a sharp contrast to the elaborate engagement practices in other traditions.',
    requiresSpecialist: false,
    daysBeforeWedding: 90,
    defaultOrder: 1,
  },

  antarpat: {
    id: 'antarpat', emoji: '🌸', name: 'Antarpat', duration: '30min',
    cultures: ['maharashtrian'],
    isShared: false,
    description: 'A white cloth held between the bride and groom as the pandit recites mantras. When removed to the sound of conch shells and flower petals, the couple see each other for the first time in the ceremony.',
    culturalSignificance: 'The Antarpat (curtain) represents the separation between two worlds — the bride and groom\'s individual lives before marriage. The removal of the cloth is the moment their shared life begins. The conch shell sound (shankh) and flowers create an intensely sensory, spiritual moment.',
    requiresSpecialist: true,
    specialistNote: 'Coordinate exact timing with pandit. The shankh (conch) must be blown by a family member at the precise moment. Critical photography moment — brief the photographer.',
    daysBeforeWedding: 0,
    defaultOrder: 13,
  },

  mangalashtak: {
    id: 'mangalashtak', emoji: '🎵', name: 'Mangalashtak', duration: '1h',
    cultures: ['maharashtrian'],
    isShared: false,
    description: 'Eight sacred Sanskrit shlokas sung at key moments during the wedding ceremony. Traditionally sung by women from both families together — a uniquely Maharashtrian practice.',
    culturalSignificance: 'The Mangalashtak are auspicious verses from Sanskrit literature that bless the union. The practice of women singing them together represents the joining of two family voices in harmony. Each of the eight shlokas corresponds to a moment in the ceremony.',
    requiresSpecialist: false,
    daysBeforeWedding: 0,
    defaultOrder: 16,
  },

  // ── TAMIL ──

  nicchayathartham: {
    id: 'nicchayathartham', emoji: '💍', name: 'Nicchayathartham', duration: '2–3h',
    alternateNames: ['Nischitartham (Telugu)', 'Nischay (Kannada)'],
    cultures: ['tamil', 'telugu', 'kannada'],
    isShared: false,
    description: 'The formal engagement ceremony where elders exchange betel leaves and areca nuts, and the groom\'s family presents gifts to the bride. The wedding date is officially fixed.',
    culturalSignificance: 'Betel leaves and areca nuts (vettrilai paaku) are considered sacred in South Indian traditions, representing auspiciousness and fertility. The exchange signals that both families have entered into a sacred contract. The Vadhyar recites mantras to formalise the match under divine witness.',
    requiresSpecialist: true,
    specialistNote: 'Requires Tamil Vadhyar (priest). Book 8 weeks in advance.',
    daysBeforeWedding: 45,
    defaultOrder: 2,
  },

  kasi_yatra: {
    id: 'kasi_yatra', emoji: '🚶', name: 'Kasi Yatrai', duration: '30min',
    cultures: ['tamil', 'telugu', 'kannada'],
    isShared: false,
    description: 'A playful pre-ceremony ritual where the groom pretends he is going to Kashi (Varanasi) to become a sanyasi instead of marrying. The bride\'s father intercepts him with an umbrella and persuades him with the offer of his daughter.',
    culturalSignificance: 'Kasi Yatrai is rich in symbolism: the groom demonstrates he is spiritually ready to renounce worldly life, but the bride\'s father shows him a higher path — family and responsibility. The umbrella, palm leaf fan, and wooden sandals are props of the sanyasi renunciation. It is also the most photographed humorous moment of South Indian weddings.',
    requiresSpecialist: false,
    daysBeforeWedding: 0,
    defaultOrder: 11,
  },

  oonjal: {
    id: 'oonjal', emoji: '🎠', name: 'Oonjal', duration: '1h',
    cultures: ['tamil'],
    isShared: false,
    description: 'The bride and groom sit on a decorated swing (oonjal) and are gently swung by married women who sing traditional songs. Symbolises the beginning of a shared life — smooth and beautiful as a swing in motion.',
    culturalSignificance: 'The Oonjal is one of the most visually striking and symbolically rich Tamil ceremonies. The swing represents the ups and downs of married life that the couple will navigate together. Only Sumangalis (married women with living husbands) can swing the couple — widows are traditionally excluded as the ceremony is meant to invoke longevity.',
    requiresSpecialist: true,
    specialistNote: 'Source a large traditional wooden swing (Oonjal). Book specialist swing decorator. Identify at least 4 married women to participate.',
    daysBeforeWedding: 0,
    defaultOrder: 12,
  },

  thaali_kattuthal: {
    id: 'thaali_kattuthal', emoji: '⭐', name: 'Thaali Kattuthal', duration: '30min',
    cultures: ['tamil', 'telugu', 'kannada', 'malayalam'],
    isShared: false,
    description: 'The most sacred moment of a Tamil and South Indian wedding — the thaali (sacred gold necklace/mangalsutra) is tied around the bride\'s neck by the groom during an auspicious muhurat while Nadhaswaram music plays.',
    culturalSignificance: 'The Thaali (also called Mangalsutra) is the ultimate symbol of a married woman in South India. The knot tied by the groom (and witnessed by his sister) must be tied three times. The Nadhaswaram (ceremonial oboe) plays specifically for this moment — its sound is considered auspicious and the vibration protective.',
    requiresSpecialist: true,
    specialistNote: 'Confirm Thaali is blessed by temple priest before the ceremony. Get exact muhurat from Vadhyar — even a few minutes off is considered inauspicious. Nadhaswaram players must be pre-positioned.',
    daysBeforeWedding: 0,
    defaultOrder: 14,
  },

  saptapadi_south: {
    id: 'saptapadi_south', emoji: '🔥', name: 'Saptapadi (South Indian)', duration: '2–3h',
    cultures: ['tamil', 'telugu', 'kannada', 'malayalam'],
    isShared: false,
    description: 'The seven sacred steps taken together in a South Indian ceremony, conducted by the Vadhyar. The couple takes seven steps around or towards the sacred fire — distinct from the circular North Indian pheras.',
    culturalSignificance: 'Each of the seven steps represents a vow: food, strength, prosperity, happiness, children, longevity, and friendship. In South Indian tradition, the groom holds the bride\'s right toe during the steps. The ceremony is considered legally binding in Hindu tradition.',
    requiresSpecialist: true,
    specialistNote: 'Requires Tamil/Telugu Vadhyar. Coordinate with Granthi if also doing Anand Karaj — two priests may need different timing slots.',
    daysBeforeWedding: 0,
    defaultOrder: 15,
  },

  nalangu: {
    id: 'nalangu', emoji: '🌸', name: 'Nalangu', duration: '2h',
    cultures: ['tamil'],
    isShared: false,
    description: 'A fun post-wedding game session between the bride and groom\'s families — challenges include finding a ring in milk, balancing pots, and playful competitions that break the ice between two families.',
    culturalSignificance: 'Nalangu is Tamil for "playful fun." It serves an important social function: after the emotional intensity of the wedding ceremonies, it provides a light, joyful context for the two families to interact informally. The games deliberately put bride and groom in silly, equal, human situations.',
    requiresSpecialist: false,
    daysBeforeWedding: 0,
    defaultOrder: 17,
  },

  // ── TELUGU ──

  pellikuthuru: {
    id: 'pellikuthuru', emoji: '🌺', name: 'Pellikuthuru', duration: '2–3h',
    cultures: ['telugu'],
    isShared: false,
    description: 'The pre-wedding ritual where the bride and groom are separately bathed in oil and turmeric by female family members. Similar to Haldi but with specific Telugu customs.',
    culturalSignificance: 'Pellikuthuru means "one who is ready for marriage." The ritual bath in sesame oil and turmeric is a purification before the sacred ceremony. Female relatives applying the oil is an act of maternal blessing and preparation.',
    requiresSpecialist: false,
    daysBeforeWedding: 1,
    defaultOrder: 7,
  },

  talambralu: {
    id: 'talambralu', emoji: '🌾', name: 'Talambralu', duration: '30min',
    cultures: ['telugu'],
    isShared: false,
    description: 'The bride and groom pour rice mixed with turmeric (talambralu) over each other\'s heads during the ceremony — a joyful and beloved Telugu ritual symbolising prosperity and blessings.',
    culturalSignificance: 'Talambralu comes from "talam" (palm) and "bralu" (to pour). The rice represents abundance and fertility. The mutual pouring signifies equal partnership — both give and both receive. It is a light-hearted moment in an otherwise serious ceremony.',
    requiresSpecialist: false,
    daysBeforeWedding: 0,
    defaultOrder: 14,
  },

  // ── BENGALI ──

  aiburobhaat: {
    id: 'aiburobhaat', emoji: '🍚', name: 'Aiburobhaat', duration: '2–3h',
    cultures: ['bengali'],
    isShared: false,
    description: 'The last unmarried feast — the bride and groom each have their final meal as an unmarried person at their respective homes, lovingly prepared by their families.',
    culturalSignificance: 'Aiburobhaat (aiburo = unmarried, bhaat = rice meal) marks the last day of the couple\'s individual identities. Bengali food is central to the culture, so this meal is elaborate and specific — a menu of the person\'s favourite dishes. It is bittersweet and deeply emotional.',
    requiresSpecialist: false,
    daysBeforeWedding: 1,
    defaultOrder: 6,
  },

  dodhi_mangal: {
    id: 'dodhi_mangal', emoji: '🌅', name: 'Dodhi Mangal', duration: '2h',
    cultures: ['bengali'],
    isShared: false,
    description: 'An early morning ritual on the wedding day — the bride and groom separately perform a small pooja with offerings of curd, puffed rice, and banana before the main ceremony begins.',
    culturalSignificance: 'Dodhi Mangal (curd + auspicious) begins at dawn. The early morning hour (brahma muhurat) is considered the most sacred. Curd (dahi) and puffed rice (muri) represent simple, sattvic nourishment. It is a quiet, intimate start to what will be an overwhelming day.',
    requiresSpecialist: true,
    specialistNote: 'Confirm early morning timing with Purohit. Begin before sunrise if possible.',
    daysBeforeWedding: 0,
    defaultOrder: 10,
  },

  shubho_drishti: {
    id: 'shubho_drishti', emoji: '👁️', name: 'Shubho Drishti', duration: '30min',
    cultures: ['bengali'],
    isShared: false,
    description: 'The most iconic Bengali wedding moment — the bride and groom exchange sacred eye contact while holding betel leaves, rotating them three times. One of the most photographed Indian wedding moments.',
    culturalSignificance: 'Shubho Drishti means "auspicious gaze." The eye contact is the first moment the couple truly see each other in the spiritual sense — as lifelong partners. The betel leaves held up to the eyes are sacred. The three rotations represent past, present, and future.',
    requiresSpecialist: false,
    daysBeforeWedding: 0,
    defaultOrder: 12,
  },

  saat_paak: {
    id: 'saat_paak', emoji: '🔥', name: 'Saat Paak', duration: '1h',
    cultures: ['bengali'],
    isShared: false,
    description: 'The bride is carried on a wooden seat (piri) by her brothers and rotated around the groom seven times while he holds betel leaves — the Bengali equivalent of the seven rounds.',
    culturalSignificance: 'The bride\'s brothers carrying her on the piri represent her family\'s protective love even as she transitions to her new home. The seven rotations (paak) correspond to the seven sacred promises. It is physically demanding and emotionally moving.',
    requiresSpecialist: false,
    daysBeforeWedding: 0,
    defaultOrder: 15,
  },

  sindur_daan: {
    id: 'sindur_daan', emoji: '❤️', name: 'Sindur Daan', duration: '30min',
    cultures: ['bengali', 'hindu-hindi', 'up-bihari'],
    isShared: false,
    description: 'The groom applies vermilion (sindoor) in the parting of the bride\'s hair — the defining moment of the Bengali and North Indian wedding that officially makes her his wife.',
    culturalSignificance: 'Sindoor in the hair parting is the most visible marker of a married Hindu woman. The act of the groom applying it is deeply intimate and spiritual. In Bengali tradition, it is followed by the conch-shell sound from female relatives and the sindoor is applied three times.',
    requiresSpecialist: false,
    daysBeforeWedding: 0,
    defaultOrder: 16,
  },

  // ── MALAYALAM / KERALA ──

  nischayam: {
    id: 'nischayam', emoji: '📜', name: 'Nischayam', duration: '2h',
    cultures: ['malayalam'],
    isShared: false,
    description: 'The formal agreement between families confirming the match and fixing the wedding date. An exchange of betel leaves, fruits, and gifts in the presence of elders.',
    culturalSignificance: 'In Kerala, the Nischayam (certainty/confirmation) is a low-key but sacred ceremony. The exchange happens in the presence of family elders and often a temple priest. It is less public than North Indian equivalents, reflecting the Kerala preference for intimate family ceremonies.',
    requiresSpecialist: false,
    daysBeforeWedding: 60,
    defaultOrder: 2,
  },

  maalayittal: {
    id: 'maalayittal', emoji: '💐', name: 'Maalayittal', duration: '30min',
    cultures: ['malayalam'],
    isShared: false,
    description: 'The exchange of flower garlands between bride and groom. In Kerala weddings, this precedes the main ceremony and symbolises mutual acceptance.',
    culturalSignificance: 'Maalayittal (garland exchange) is Kerala\'s version of the Varmala/Jaimala. Jasmine garlands are preferred for their sacred fragrance. The exchange is quiet and dignified — very different from the energetic North Indian version.',
    requiresSpecialist: false,
    daysBeforeWedding: 0,
    defaultOrder: 12,
  },

  thalikettu: {
    id: 'thalikettu', emoji: '⭐', name: 'Thalikettu', duration: '30min',
    cultures: ['malayalam'],
    isShared: false,
    description: 'The tying of the thali — the sacred gold necklace — around the bride\'s neck. The focal point of a Kerala Hindu wedding, performed at an exact auspicious muhurat.',
    culturalSignificance: 'In Kerala, the Thalikettu is the defining moment of the wedding. The thali design varies by caste and community. The tying must happen within a narrow auspicious window (muhurat) — sometimes just minutes long. The entire wedding is timed around this moment.',
    requiresSpecialist: true,
    specialistNote: 'Get muhurat from Vadhyar well in advance. Even 5 minutes late is considered inauspicious.',
    daysBeforeWedding: 0,
    defaultOrder: 14,
  },

  // ── KASHMIRI PANDIT ──

  livun: {
    id: 'livun', emoji: '🏺', name: 'Livun', duration: '3h',
    cultures: ['kashmiri'],
    isShared: false,
    description: 'The ritual cleaning and purification of the bride and groom\'s homes before the wedding. Performed with mustard oil and red sacred threads — a significant Kashmiri Pandit tradition.',
    culturalSignificance: 'Livun (purification) reflects the Kashmiri Pandit emphasis on ritual purity before sacred events. Mustard oil is believed to repel negative energies. The ceremony is performed by a Batuk (young Brahmin) with specific mantras. It is also a practical deep-cleaning of the home.',
    requiresSpecialist: true,
    specialistNote: 'Requires a Kashmiri Brahmin (Batuk) for the ceremony.',
    daysBeforeWedding: 3,
    defaultOrder: 5,
  },

  dev_pooja: {
    id: 'dev_pooja', emoji: '🪔', name: 'Dev Pooja', duration: '2h',
    cultures: ['kashmiri'],
    isShared: false,
    description: 'Worship of the family deity before wedding ceremonies begin. A private, intimate ceremony performed by close family with the pandit invoking ancestral blessings.',
    culturalSignificance: 'Kashmiri Pandits have a strong tradition of ancestral worship. The Dev Pooja connects the couple to their family lineage before they begin their own. It is a private ceremony — not for guests — and is the spiritual foundation on which all other ceremonies are built.',
    requiresSpecialist: true,
    specialistNote: 'Requires Kashmiri pandit.',
    daysBeforeWedding: 2,
    defaultOrder: 6,
  },

  vandun: {
    id: 'vandun', emoji: '🎵', name: 'Vandun', duration: '3–4h',
    cultures: ['kashmiri'],
    isShared: false,
    description: 'Traditional Kashmiri songs sung by women from the bride\'s family over multiple evenings leading to the wedding. Each song has specific ritual significance in the wedding sequence.',
    culturalSignificance: 'Vandun songs are a unique oral tradition of Kashmiri Pandits — many songs are passed down through generations and are specific to certain moments (the grinding of rice, the application of oil). They are the Kashmiri equivalent of Boliyan (Punjab) or Geet (UP). Many younger families struggle to find women who know all the traditional Vandun songs.',
    requiresSpecialist: false,
    daysBeforeWedding: 2,
    defaultOrder: 7,
  },

  // ── SINDHI ──

  berana: {
    id: 'berana', emoji: '🌺', name: 'Berana', duration: '2h',
    cultures: ['sindhi'],
    isShared: false,
    description: 'A Sindhi pre-wedding ritual where the groom\'s family visits the bride\'s home with gifts (called berana) — clothes, jewellery, sweets, and wedding necessities — formally asking for the bride\'s hand.',
    culturalSignificance: 'The Berana ceremony is the Sindhi formal proposal. The gifts sent are not just practical but symbolic of the groom\'s family\'s wealth and intention to take care of the bride. The term berana comes from the act of "bearing" gifts.',
    requiresSpecialist: false,
    daysBeforeWedding: 30,
    defaultOrder: 4,
  },

  sata_fera: {
    id: 'sata_fera', emoji: '🔥', name: 'Sata Fera', duration: '2–3h',
    cultures: ['sindhi'],
    isShared: false,
    description: 'The Sindhi equivalent of the seven rounds — the couple takes seven steps around the sacred fire led by the pandit with specific Sindhi mantras and customs.',
    culturalSignificance: 'Sindhi weddings blend Hindu Vedic traditions with specific Sindhi customs that evolved over centuries of the community\'s migration and diaspora experience. The Sata Fera maintains the core seven-vows structure but includes Sindhi-language elements.',
    requiresSpecialist: true,
    specialistNote: 'Book a Sindhi pandit specifically — general pandits may not know the Sindhi-specific mantras.',
    daysBeforeWedding: 0,
    defaultOrder: 15,
  },

  // ── ODIA ──

  lagna_patri: {
    id: 'lagna_patri', emoji: '📜', name: 'Lagna Patrika', duration: '1h',
    cultures: ['odia'],
    isShared: false,
    description: 'The reading of the Lagna Patrika — the auspicious wedding invitation letter — by a Brahmin pandit in the presence of both families, formally announcing the wedding date and muhurat.',
    culturalSignificance: 'The Lagna Patrika is not just an invitation but a sacred document. Its reading is a ceremony in itself — the pandit\'s voice giving weight to the words. In Odia tradition, no wedding can begin without this formal announcement.',
    requiresSpecialist: true,
    specialistNote: 'Requires an Odia Brahmin who can read the Lagna Patrika aloud.',
    daysBeforeWedding: 1,
    defaultOrder: 5,
  },

  // ── ASSAMESE ──

  juron_diya: {
    id: 'juron_diya', emoji: '🌾', name: 'Juron Diya', duration: '2–3h',
    cultures: ['assamese'],
    isShared: false,
    description: 'The Assamese blessing ceremony where the groom is formally welcomed by the bride\'s family with a juron (gift set of betel nut, betel leaf, raw silk, and sweets). A sacred exchange of acceptance.',
    culturalSignificance: 'The juron is one of the most important gift rituals in Assamese culture. Raw silk (Muga or Eri) represents Assam\'s most prized textile tradition. The betel nut is sacred in Assamese life — it appears in every auspicious moment from birth to death. Receiving juron means formal family acceptance.',
    requiresSpecialist: false,
    daysBeforeWedding: 1,
    defaultOrder: 6,
  },

  biya: {
    id: 'biya', emoji: '🔥', name: 'Biya (Wedding ceremony)', duration: '3–4h',
    cultures: ['assamese'],
    isShared: false,
    description: 'The main Assamese wedding ceremony. The couple sits on wooden stools, exchanges garlands, and completes sacred fire rituals led by a Brahmin. The bride wears a Mekhela Chador.',
    culturalSignificance: 'Biya is the Assamese word for wedding. The ceremony blends Vedic rituals with Assamese folk traditions. The wooden stools (pira) are carved specifically for the wedding. The Mekhela Chador (two-piece silk garment) worn by the bride is the most prestigious traditional Assamese textile.',
    requiresSpecialist: true,
    specialistNote: 'Book Assamese Brahmin. Confirm bride\'s Mekhela Chador is woven and ready — can take weeks to source for premium quality.',
    daysBeforeWedding: 0,
    defaultOrder: 13,
  },

  // ── JAIN ──

  sagai_jain: {
    id: 'sagai_jain', emoji: '💎', name: 'Sagai (Jain)', duration: '2h',
    cultures: ['jain'],
    isShared: false,
    description: 'The Jain engagement ceremony, conducted with purity and simplicity in line with Jain values. No alcohol, no non-vegetarian food. Exchange done in the presence of a Jain priest.',
    culturalSignificance: 'Jain ceremonies follow the principle of Ahimsa (non-violence) at every level — no leather goods as gifts, strictly vegetarian and sattvic food, no alcohol. The ceremony itself is an expression of spiritual values, not just social custom.',
    requiresSpecialist: true,
    specialistNote: 'Ensure all gifts, food, and decorations are Jain-approved. No leather, no animal products, no non-veg.',
    daysBeforeWedding: 60,
    defaultOrder: 1,
  },

  vivah_jain: {
    id: 'vivah_jain', emoji: '🙏', name: 'Vivah (Jain ceremony)', duration: '3–4h',
    cultures: ['jain'],
    isShared: false,
    description: 'The Jain wedding ceremony follows Vedic tradition but with Jain scriptural readings. Emphasis on non-violence, compassion, and purity. The couple takes vows aligned with the Jain way of life.',
    culturalSignificance: 'The Jain Vivah vows include commitments to Ahimsa, truth, non-stealing, celibacy (before marriage), and non-attachment. The ceremony is presided over by a lay Jain priest (Pandya or Yati) rather than a Brahmin. Tirthankar images may be present.',
    requiresSpecialist: true,
    specialistNote: 'Book a Jain Pandya (lay priest) specifically. Entire menu must be sattvic-vegetarian.',
    daysBeforeWedding: 0,
    defaultOrder: 14,
  },

  // ── PARSI ──

  adarni: {
    id: 'adarni', emoji: '🎁', name: 'Adarni', duration: '2–3h',
    cultures: ['parsi'],
    isShared: false,
    description: 'The formal gift exchange ceremony between Parsi families before the wedding. Trays of gifts, fruits, dried fruits, fish, and sweets are exchanged as a blessing.',
    culturalSignificance: 'In Parsi tradition, fish represents fertility and prosperity. The elaborate trays (sagan na paan) are decorated with coconuts, fruits, flowers, and specific items that carry auspicious meaning in Zoroastrian culture.',
    requiresSpecialist: false,
    daysBeforeWedding: 3,
    defaultOrder: 5,
  },

  lagan: {
    id: 'lagan', emoji: '🔥', name: 'Lagan (Parsi wedding)', duration: '2–3h',
    cultures: ['parsi'],
    isShared: false,
    description: 'The Parsi wedding ceremony performed by a Dastur (Zoroastrian priest) with recitation of Avestan prayers. The couple sits facing each other separated by a white cloth that is later removed.',
    culturalSignificance: 'The Lagan ceremony is one of the oldest surviving wedding traditions in the world, rooted in Zoroastrian practice over 3,000 years old. The Avestan prayers call on Ahura Mazda (the supreme deity). Fire, the most sacred Zoroastrian element, plays a central role.',
    requiresSpecialist: true,
    specialistNote: 'Requires a certified Dastur (Zoroastrian priest). Some Dasturs have restrictions on interfaith marriages — confirm early.',
    daysBeforeWedding: 0,
    defaultOrder: 13,
  },

  // ── ANAND KARAJ (Sikh) ──

  anand_karaj: {
    id: 'anand_karaj', emoji: '🙏', name: 'Anand Karaj', duration: '2h',
    cultures: ['punjabi'],
    isShared: false,
    description: 'The Sikh wedding ceremony — four laavaan (rounds) around the Guru Granth Sahib, each accompanied by a shabad (hymn) recited by the Granthi. Conducted at a Gurdwara or with a portable Granth Sahib.',
    culturalSignificance: 'Anand Karaj means "blissful union" in Punjabi. It was formalised by Guru Ram Das (4th Sikh Guru) in the 16th century. The four laavaan describe the progressive stages of spiritual marriage — from social duty, to love, detachment, and finally divine union. It is both a religious and civil marriage ceremony.',
    requiresSpecialist: true,
    specialistNote: 'Book Gurdwara 8–12 weeks in advance — especially for popular dates. Granthi must be confirmed separately. For home ceremonies, a portable Guru Granth Sahib must be arranged respectfully.',
    daysBeforeWedding: 0,
    defaultOrder: 15,
  },

}

// ── CULTURE → EVENTS MAPPING ──────────────────────────────────
// Ordered list of event IDs per culture

export const CULTURE_EVENTS: Record<CultureId, string[]> = {
  'punjabi':       ['roka','chunni_chadana','sagan','haldi','mehendi','sangeet','baraat','jaimala','anand_karaj','pheras','vidai','griha_pravesh','reception'],
  'hindu-hindi':   ['roka','sagan','tilak','haldi','mehendi','sangeet','baraat','jaimala','pheras','sindur_daan','vidai','griha_pravesh','reception'],
  'rajasthani':    ['roka','tilak','haldi','mehendi','sangeet','baraat','jaimala','palla_dastoor','pheras','vidai','griha_pravesh','reception'],
  'kashmiri':      ['livun','dev_pooja','vandun','haldi','mehendi','baraat','jaimala','pheras','vidai','griha_pravesh','reception'],
  'sindhi':        ['berana','haldi','mehendi','sangeet','baraat','jaimala','palla_dastoor','sata_fera','vidai','reception'],
  'up-bihari':     ['roka','tilak','haldi','mehendi','sangeet','baraat','jaimala','pheras','sindur_daan','vidai','griha_pravesh','reception'],
  'tamil':         ['nicchayathartham','haldi','mehendi','kasi_yatra','madhuparka','oonjal','jaimala','thaali_kattuthal','saptapadi_south','nalangu','vidai','reception'],
  'telugu':        ['nicchayathartham','pellikuthuru','haldi','mehendi','kasi_yatra','madhuparka','jaimala','thaali_kattuthal','talambralu','saptapadi_south','vidai','reception'],
  'kannada':       ['nicchayathartham','haldi','mehendi','kasi_yatra','madhuparka','jaimala','thaali_kattuthal','saptapadi_south','vidai','reception'],
  'malayalam':     ['nischayam','haldi','mehendi','maalayittal','thalikettu','saptapadi_south','vidai','reception'],
  'kodava':        ['haldi','mehendi','jaimala','pheras','vidai','reception'],
  'bengali':       ['aiburobhaat','dodhi_mangal','haldi','mehendi','shubho_drishti','saat_paak','sindur_daan','vidai','reception'],
  'odia':          ['lagna_patri','haldi','mehendi','jaimala','pheras','vidai','reception'],
  'assamese':      ['juron_diya','haldi','mehendi','biya','vidai','reception'],
  'manipuri':      ['haldi','mehendi','jaimala','pheras','vidai','reception'],
  'gujarati':      ['sakhar_puda','mameru','gol_dhana','haldi','mehendi','garba_raas','baraat','madhuparka','jaimala','pheras','vidai','griha_pravesh','reception'],
  'maharashtrian': ['sakhar_puda','haldi','mehendi','sangeet','baraat','jaimala','antarpat','mangalashtak','pheras','vidai','griha_pravesh','reception'],
  'jain':          ['sagai_jain','garba_raas','haldi','mehendi','jaimala','vivah_jain','vidai','reception'],
  'parsi':         ['adarni','haldi','mehendi','lagan','reception'],
}

// ── TASK TEMPLATES ────────────────────────────────────────────

export const TASK_TEMPLATES: TaskTemplate[] = [

  // ROKA
  { id:'roka-1', text:'Book venue for Roka ceremony', eventId:'roka', priority:'high', dueDaysBeforeEvent:21, assigneeRole:'planner', visibility:'planner' },
  { id:'roka-2', text:'Prepare gift exchange list for both families', eventId:'roka', priority:'medium', dueDaysBeforeEvent:14, assigneeRole:'planner', visibility:'planner' },
  { id:'roka-3', text:'Arrange sweets — mithai and dry fruit hampers', eventId:'roka', priority:'medium', dueDaysBeforeEvent:7, assigneeRole:'planner', visibility:'planner' },
  { id:'roka-4', text:'Book pandit — confirm muhurat date', eventId:'roka', priority:'high', dueDaysBeforeEvent:30, assigneeRole:'planner', visibility:'planner', notes:'Pandit must be booked before venue to align muhurat with availability.' },

  // CHUNNI CHADANA
  { id:'chunni-1', text:'Purchase chunni (red or orange dupatta)', eventId:'chunni_chadana', priority:'high', dueDaysBeforeEvent:14, assigneeRole:'planner', visibility:'client' },
  { id:'chunni-2', text:'Prepare gift basket for bride from groom\'s family', eventId:'chunni_chadana', priority:'medium', dueDaysBeforeEvent:7, assigneeRole:'family', visibility:'client' },
  { id:'chunni-3', text:'Arrange halwai for sweets and refreshments', eventId:'chunni_chadana', priority:'low', dueDaysBeforeEvent:5, assigneeRole:'planner', visibility:'planner' },

  // SAGAN
  { id:'sagan-1', text:'Prepare sagan thali (vermilion, rice, sweets, coins)', eventId:'sagan', priority:'medium', dueDaysBeforeEvent:7, assigneeRole:'planner', visibility:'planner' },
  { id:'sagan-2', text:'Invite close family elders from both sides', eventId:'sagan', priority:'medium', dueDaysBeforeEvent:14, assigneeRole:'planner', visibility:'client' },
  { id:'sagan-3', text:'Book pandit for sagan ceremony', eventId:'sagan', priority:'high', dueDaysBeforeEvent:21, assigneeRole:'planner', visibility:'planner' },
  { id:'sagan-4', text:'Arrange background dhol or music', eventId:'sagan', priority:'low', dueDaysBeforeEvent:7, assigneeRole:'planner', visibility:'planner' },

  // TILAK
  { id:'tilak-1', text:'Prepare tilak thali with kumkum, rice, flowers, sweets', eventId:'tilak', priority:'medium', dueDaysBeforeEvent:5, assigneeRole:'planner', visibility:'planner' },
  { id:'tilak-2', text:'Arrange gifts for groom\'s side (clothes, dry fruits, cash)', eventId:'tilak', priority:'high', dueDaysBeforeEvent:14, assigneeRole:'family', visibility:'client' },
  { id:'tilak-3', text:'Book Brahmin pandit for tilak', eventId:'tilak', priority:'high', dueDaysBeforeEvent:21, assigneeRole:'planner', visibility:'planner' },
  { id:'tilak-4', text:'Confirm groom\'s family guest list and seating', eventId:'tilak', priority:'low', dueDaysBeforeEvent:7, assigneeRole:'planner', visibility:'planner' },

  // HALDI
  { id:'haldi-1', text:'Order fresh turmeric paste (or whole turmeric to grind)', eventId:'haldi', priority:'medium', dueDaysBeforeEvent:3, assigneeRole:'planner', visibility:'planner' },
  { id:'haldi-2', text:'Arrange banana leaves, bronze/brass trays', eventId:'haldi', priority:'low', dueDaysBeforeEvent:3, assigneeRole:'planner', visibility:'planner' },
  { id:'haldi-3', text:'Book floral decoration — marigolds and yellow flowers', eventId:'haldi', priority:'medium', dueDaysBeforeEvent:7, assigneeRole:'vendor', visibility:'vendor' },
  { id:'haldi-4', text:'Plan Haldi games and music playlist', eventId:'haldi', priority:'low', dueDaysBeforeEvent:7, assigneeRole:'planner', visibility:'planner' },
  { id:'haldi-5', text:'Source old clothes for family to wear (gets stained)', eventId:'haldi', priority:'low', dueDaysBeforeEvent:5, assigneeRole:'family', visibility:'client' },
  { id:'haldi-6', text:'Confirm photographer for haldi ceremony', eventId:'haldi', priority:'high', dueDaysBeforeEvent:21, assigneeRole:'planner', visibility:'planner' },

  // MEHENDI
  { id:'mehendi-1', text:'Book 2 professional mehendi artists — confirm bridal portfolio', eventId:'mehendi', priority:'high', dueDaysBeforeEvent:30, assigneeRole:'planner', visibility:'planner', notes:'Book minimum 2 artists for bridal party. Confirm they have done full-hand bridal designs.' },
  { id:'mehendi-2', text:'Confirm bride\'s mehendi design reference photos', eventId:'mehendi', priority:'medium', dueDaysBeforeEvent:14, assigneeRole:'bride', visibility:'client' },
  { id:'mehendi-3', text:'Arrange comfortable seating and back support for bride', eventId:'mehendi', priority:'medium', dueDaysBeforeEvent:7, assigneeRole:'planner', visibility:'planner' },
  { id:'mehendi-4', text:'Plan Giddha / Boliyan / folk entertainment', eventId:'mehendi', priority:'medium', dueDaysBeforeEvent:14, assigneeRole:'planner', visibility:'planner' },
  { id:'mehendi-5', text:'Order refreshments and finger foods for guests', eventId:'mehendi', priority:'low', dueDaysBeforeEvent:5, assigneeRole:'planner', visibility:'planner' },
  { id:'mehendi-6', text:'Set up photography station with good lighting', eventId:'mehendi', priority:'medium', dueDaysBeforeEvent:3, assigneeRole:'planner', visibility:'planner' },

  // SANGEET
  { id:'sangeet-1', text:'Book DJ and full sound system', eventId:'sangeet', priority:'high', dueDaysBeforeEvent:45, assigneeRole:'planner', visibility:'planner' },
  { id:'sangeet-2', text:'Confirm dance performances from both families — collect videos', eventId:'sangeet', priority:'high', dueDaysBeforeEvent:21, assigneeRole:'planner', visibility:'client' },
  { id:'sangeet-3', text:'Book dhol player (live dhol is essential for Sangeet)', eventId:'sangeet', priority:'high', dueDaysBeforeEvent:30, assigneeRole:'planner', visibility:'planner' },
  { id:'sangeet-4', text:'Set up stage, backdrop, and lighting', eventId:'sangeet', priority:'medium', dueDaysBeforeEvent:7, assigneeRole:'vendor', visibility:'vendor' },
  { id:'sangeet-5', text:'Plan costume colour coordination — brief both families', eventId:'sangeet', priority:'low', dueDaysBeforeEvent:14, assigneeRole:'planner', visibility:'client' },
  { id:'sangeet-6', text:'Arrange dinner buffet for sangeet night', eventId:'sangeet', priority:'high', dueDaysBeforeEvent:14, assigneeRole:'planner', visibility:'planner' },
  { id:'sangeet-7', text:'Hire MC / anchor for the evening', eventId:'sangeet', priority:'medium', dueDaysBeforeEvent:21, assigneeRole:'planner', visibility:'planner' },

  // GARBA / RAAS
  { id:'garba-1', text:'Book live Garba band or specialist Gujarati DJ', eventId:'garba_raas', priority:'high', dueDaysBeforeEvent:60, assigneeRole:'planner', visibility:'planner' },
  { id:'garba-2', text:'Source dandiya sticks for all expected guests', eventId:'garba_raas', priority:'medium', dueDaysBeforeEvent:14, assigneeRole:'planner', visibility:'planner' },
  { id:'garba-3', text:'Set up Garba circle lighting (string lights minimum)', eventId:'garba_raas', priority:'medium', dueDaysBeforeEvent:7, assigneeRole:'vendor', visibility:'vendor' },
  { id:'garba-4', text:'Organise costume colour theme and brief families', eventId:'garba_raas', priority:'low', dueDaysBeforeEvent:21, assigneeRole:'planner', visibility:'client' },
  { id:'garba-5', text:'Arrange catering for Garba night', eventId:'garba_raas', priority:'high', dueDaysBeforeEvent:21, assigneeRole:'planner', visibility:'planner' },

  // OONJAL
  { id:'oonjal-1', text:'Source traditional Oonjal swing (wooden, decorated)', eventId:'oonjal', priority:'high', dueDaysBeforeEvent:21, assigneeRole:'planner', visibility:'planner', notes:'Traditional swings can be hard to find — check with Tamil event decorators.' },
  { id:'oonjal-2', text:'Identify 4+ married women (Sumangalis) to swing couple and sing', eventId:'oonjal', priority:'high', dueDaysBeforeEvent:14, assigneeRole:'family', visibility:'client' },
  { id:'oonjal-3', text:'Decorate swing with jasmine, mango leaves, and marigolds', eventId:'oonjal', priority:'medium', dueDaysBeforeEvent:1, assigneeRole:'vendor', visibility:'vendor' },
  { id:'oonjal-4', text:'Prepare milk and rice for Oonjal ritual', eventId:'oonjal', priority:'low', dueDaysBeforeEvent:1, assigneeRole:'planner', visibility:'planner' },

  // BARAAT
  { id:'baraat-1', text:'Book decorated horse or vintage wedding car', eventId:'baraat', priority:'high', dueDaysBeforeEvent:45, assigneeRole:'planner', visibility:'planner', notes:'Good baraat horses book out months in advance. Confirm with horse owner and get written confirmation.' },
  { id:'baraat-2', text:'Hire dhol band (3–5 players) for procession', eventId:'baraat', priority:'high', dueDaysBeforeEvent:30, assigneeRole:'planner', visibility:'planner' },
  { id:'baraat-3', text:'Arrange baraat lighting — LED torches and sticks for guests', eventId:'baraat', priority:'medium', dueDaysBeforeEvent:7, assigneeRole:'planner', visibility:'planner' },
  { id:'baraat-4', text:'Plan baraat route to venue and coordinate with venue security', eventId:'baraat', priority:'medium', dueDaysBeforeEvent:7, assigneeRole:'planner', visibility:'planner' },
  { id:'baraat-5', text:'Arrange shagun envelopes for groom\'s party', eventId:'baraat', priority:'low', dueDaysBeforeEvent:3, assigneeRole:'family', visibility:'client' },

  // JAIMALA
  { id:'jaimala-1', text:'Order fresh flower garlands (jasmine + roses — bride, groom)', eventId:'jaimala', priority:'high', dueDaysBeforeEvent:1, assigneeRole:'vendor', visibility:'vendor' },
  { id:'jaimala-2', text:'Confirm stage setup for Jaimala moment with decorator', eventId:'jaimala', priority:'medium', dueDaysBeforeEvent:7, assigneeRole:'planner', visibility:'planner' },
  { id:'jaimala-3', text:'Plan groom\'s entrance music — confirm with DJ', eventId:'jaimala', priority:'medium', dueDaysBeforeEvent:7, assigneeRole:'planner', visibility:'planner' },

  // PHERAS / SAAT PHERE
  { id:'pheras-1', text:'Book pandit — confirm muhurat date and time', eventId:'pheras', priority:'high', dueDaysBeforeEvent:60, assigneeRole:'planner', visibility:'planner', notes:'Muhurat drives all other timing. Book pandit before venue.' },
  { id:'pheras-2', text:'Arrange havan kund, samagri, and sacred fire items', eventId:'pheras', priority:'high', dueDaysBeforeEvent:7, assigneeRole:'planner', visibility:'planner' },
  { id:'pheras-3', text:'Coordinate with venue for mandap setup and dimensions', eventId:'pheras', priority:'high', dueDaysBeforeEvent:14, assigneeRole:'planner', visibility:'vendor' },
  { id:'pheras-4', text:'Arrange for kanyadaan ceremony items (bride\'s parents)', eventId:'pheras', priority:'medium', dueDaysBeforeEvent:5, assigneeRole:'family', visibility:'client' },
  { id:'pheras-5', text:'Confirm bride\'s saree and groom\'s sherwani are ready', eventId:'pheras', priority:'high', dueDaysBeforeEvent:14, assigneeRole:'family', visibility:'client' },

  // ANAND KARAJ
  { id:'anandkaraj-1', text:'Book Gurdwara — confirm date and time with Sewadar', eventId:'anand_karaj', priority:'high', dueDaysBeforeEvent:60, assigneeRole:'planner', visibility:'planner', notes:'Popular Gurdwaras book out months in advance for auspicious dates.' },
  { id:'anandkaraj-2', text:'Confirm Granthi availability on wedding date', eventId:'anand_karaj', priority:'high', dueDaysBeforeEvent:45, assigneeRole:'planner', visibility:'planner' },
  { id:'anandkaraj-3', text:'Arrange bride\'s ghoonghat / chunni for ceremony', eventId:'anand_karaj', priority:'medium', dueDaysBeforeEvent:14, assigneeRole:'family', visibility:'client' },
  { id:'anandkaraj-4', text:'Brief family on Anand Karaj protocol (no shoes, head covered)', eventId:'anand_karaj', priority:'low', dueDaysBeforeEvent:7, assigneeRole:'planner', visibility:'client' },
  { id:'anandkaraj-5', text:'Arrange langar or post-ceremony meal for guests', eventId:'anand_karaj', priority:'medium', dueDaysBeforeEvent:14, assigneeRole:'planner', visibility:'planner' },

  // SAPTAPADI (SOUTH)
  { id:'saptapadi-1', text:'Book Tamil/Telugu Vadhyar (priest) for ceremony', eventId:'saptapadi_south', priority:'high', dueDaysBeforeEvent:60, assigneeRole:'planner', visibility:'planner', notes:'For cross-cultural weddings with both North and South priests, brief both on timing separately.' },
  { id:'saptapadi-2', text:'Confirm muhurat timing with Vadhyar', eventId:'saptapadi_south', priority:'high', dueDaysBeforeEvent:30, assigneeRole:'planner', visibility:'planner' },
  { id:'saptapadi-3', text:'Coordinate mandap setup with venue for South Indian ceremony items', eventId:'saptapadi_south', priority:'high', dueDaysBeforeEvent:14, assigneeRole:'planner', visibility:'vendor' },
  { id:'saptapadi-4', text:'Arrange sumangali ritual — invite married women', eventId:'saptapadi_south', priority:'medium', dueDaysBeforeEvent:14, assigneeRole:'family', visibility:'client' },
  { id:'saptapadi-5', text:'Source coconut, betel leaves, and sacred items for ceremony', eventId:'saptapadi_south', priority:'medium', dueDaysBeforeEvent:7, assigneeRole:'planner', visibility:'planner' },

  // THAALI KATTUTHAL
  { id:'thaali-1', text:'Confirm thaali is ready and blessed by temple priest', eventId:'thaali_kattuthal', priority:'high', dueDaysBeforeEvent:14, assigneeRole:'family', visibility:'client', notes:'Critical — thaali must be blessed at temple before wedding day.' },
  { id:'thaali-2', text:'Get exact muhurat window from Vadhyar', eventId:'thaali_kattuthal', priority:'high', dueDaysBeforeEvent:30, assigneeRole:'planner', visibility:'planner' },
  { id:'thaali-3', text:'Book Nadhaswaram players and position before ceremony', eventId:'thaali_kattuthal', priority:'high', dueDaysBeforeEvent:21, assigneeRole:'planner', visibility:'planner' },
  { id:'thaali-4', text:'Brief photographer for close-up thaali tying shot', eventId:'thaali_kattuthal', priority:'medium', dueDaysBeforeEvent:7, assigneeRole:'planner', visibility:'vendor' },

  // SHUBHO DRISHTI
  { id:'shubhodrishti-1', text:'Source fresh betel leaves for ceremony', eventId:'shubho_drishti', priority:'medium', dueDaysBeforeEvent:1, assigneeRole:'planner', visibility:'planner' },
  { id:'shubhodrishti-2', text:'Brief couple and Purohit on ritual steps', eventId:'shubho_drishti', priority:'medium', dueDaysBeforeEvent:3, assigneeRole:'planner', visibility:'client' },
  { id:'shubhodrishti-3', text:'Position photographers for Shubho Drishti moment', eventId:'shubho_drishti', priority:'high', dueDaysBeforeEvent:3, assigneeRole:'planner', visibility:'vendor' },

  // SINDUR DAAN
  { id:'sindurdaan-1', text:'Prepare vermilion (sindoor) case for ceremony', eventId:'sindur_daan', priority:'high', dueDaysBeforeEvent:3, assigneeRole:'planner', visibility:'planner' },
  { id:'sindurdaan-2', text:'Ensure conch shells available for female relatives', eventId:'sindur_daan', priority:'medium', dueDaysBeforeEvent:3, assigneeRole:'family', visibility:'client' },

  // RECEPTION
  { id:'reception-1', text:'Book banquet hall / reception venue', eventId:'reception', priority:'high', dueDaysBeforeEvent:90, assigneeRole:'planner', visibility:'planner' },
  { id:'reception-2', text:'Plan stage backdrop and couple entrance design', eventId:'reception', priority:'medium', dueDaysBeforeEvent:30, assigneeRole:'planner', visibility:'planner' },
  { id:'reception-3', text:'Arrange multi-cuisine catering for reception dinner', eventId:'reception', priority:'high', dueDaysBeforeEvent:30, assigneeRole:'planner', visibility:'planner' },
  { id:'reception-4', text:'Set up photo booth with props', eventId:'reception', priority:'low', dueDaysBeforeEvent:7, assigneeRole:'planner', visibility:'planner' },
  { id:'reception-5', text:'Book DJ and MC for reception evening', eventId:'reception', priority:'high', dueDaysBeforeEvent:30, assigneeRole:'planner', visibility:'planner' },
  { id:'reception-6', text:'Coordinate couple\'s entry music and choreography', eventId:'reception', priority:'medium', dueDaysBeforeEvent:14, assigneeRole:'planner', visibility:'client' },
  { id:'reception-7', text:'Send reception invitations (wider circle)', eventId:'reception', priority:'medium', dueDaysBeforeEvent:30, assigneeRole:'planner', visibility:'client' },

  // VIDAI
  { id:'vidai-1', text:'Arrange decorated bridal car for Vidai', eventId:'vidai', priority:'high', dueDaysBeforeEvent:7, assigneeRole:'planner', visibility:'planner' },
  { id:'vidai-2', text:'Brief family on Vidai rituals — rice throwing, emotional moment', eventId:'vidai', priority:'medium', dueDaysBeforeEvent:3, assigneeRole:'planner', visibility:'client' },
  { id:'vidai-3', text:'Confirm transport for bride\'s trousseau / luggage', eventId:'vidai', priority:'medium', dueDaysBeforeEvent:5, assigneeRole:'planner', visibility:'planner' },

  // GRIHA PRAVESH
  { id:'grihapravesh-1', text:'Prepare kalash of rice for bride to kick on entry', eventId:'griha_pravesh', priority:'high', dueDaysBeforeEvent:1, assigneeRole:'family', visibility:'client' },
  { id:'grihapravesh-2', text:'Arrange kumkum plate and flower rangoli at entrance', eventId:'griha_pravesh', priority:'medium', dueDaysBeforeEvent:1, assigneeRole:'family', visibility:'client' },
  { id:'grihapravesh-3', text:'Prepare aarti thali for mother-in-law welcome', eventId:'griha_pravesh', priority:'medium', dueDaysBeforeEvent:1, assigneeRole:'family', visibility:'client' },

  // KASI YATRA
  { id:'kasiyatra-1', text:'Source umbrella and palm leaf fan for groom (Kasi Yatrai props)', eventId:'kasi_yatra', priority:'medium', dueDaysBeforeEvent:7, assigneeRole:'planner', visibility:'planner' },
  { id:'kasiyatra-2', text:'Brief groom and bride\'s father on Kasi Yatrai ritual steps', eventId:'kasi_yatra', priority:'medium', dueDaysBeforeEvent:3, assigneeRole:'planner', visibility:'client' },
  { id:'kasiyatra-3', text:'Ensure photographer is ready for Kasi Yatrai moment', eventId:'kasi_yatra', priority:'high', dueDaysBeforeEvent:3, assigneeRole:'planner', visibility:'vendor' },

  // NALANGU
  { id:'nalangu-1', text:'Prepare Nalangu items — ring, turmeric, mirrors, milk bowl', eventId:'nalangu', priority:'medium', dueDaysBeforeEvent:1, assigneeRole:'planner', visibility:'planner' },
  { id:'nalangu-2', text:'Set up seating arrangement for both families opposite each other', eventId:'nalangu', priority:'low', dueDaysBeforeEvent:1, assigneeRole:'planner', visibility:'planner' },
  { id:'nalangu-3', text:'Plan Nalangu games list and appoint MC for the session', eventId:'nalangu', priority:'medium', dueDaysBeforeEvent:7, assigneeRole:'planner', visibility:'planner' },

  // AIBUROBHAAT
  { id:'aiburobhaat-1', text:'Plan special last-meal-as-single menu for bride and groom', eventId:'aiburobhaat', priority:'medium', dueDaysBeforeEvent:3, assigneeRole:'family', visibility:'client' },
  { id:'aiburobhaat-2', text:'Invite close family and friends for Aiburobhaat', eventId:'aiburobhaat', priority:'medium', dueDaysBeforeEvent:7, assigneeRole:'family', visibility:'client' },
  { id:'aiburobhaat-3', text:'Arrange floral decoration for the dining setting', eventId:'aiburobhaat', priority:'low', dueDaysBeforeEvent:2, assigneeRole:'planner', visibility:'planner' },

  // DODHI MANGAL
  { id:'dodhimangal-1', text:'Confirm early morning muhurat time with Bengali Purohit', eventId:'dodhi_mangal', priority:'high', dueDaysBeforeEvent:14, assigneeRole:'planner', visibility:'planner' },
  { id:'dodhimangal-2', text:'Prepare curd, puffed rice (muri), and banana for ritual', eventId:'dodhi_mangal', priority:'medium', dueDaysBeforeEvent:1, assigneeRole:'family', visibility:'client' },

  // SAAT PAAK
  { id:'saatpaak-1', text:'Arrange wooden piri (stool) for bride', eventId:'saat_paak', priority:'high', dueDaysBeforeEvent:7, assigneeRole:'planner', visibility:'planner' },
  { id:'saatpaak-2', text:'Brief bride\'s brothers who carry the piri on timing and technique', eventId:'saat_paak', priority:'medium', dueDaysBeforeEvent:3, assigneeRole:'planner', visibility:'client' },
  { id:'saatpaak-3', text:'Arrange conch shell (shankh) for female relatives', eventId:'saat_paak', priority:'medium', dueDaysBeforeEvent:3, assigneeRole:'family', visibility:'client' },

  // ANTARPAT
  { id:'antarpat-1', text:'Source white silk antarpat cloth', eventId:'antarpat', priority:'high', dueDaysBeforeEvent:14, assigneeRole:'planner', visibility:'planner' },
  { id:'antarpat-2', text:'Brief pandit and family member on conch shell (shankh) timing', eventId:'antarpat', priority:'high', dueDaysBeforeEvent:3, assigneeRole:'planner', visibility:'planner' },
  { id:'antarpat-3', text:'Plan flower petal shower moment — brief family', eventId:'antarpat', priority:'medium', dueDaysBeforeEvent:3, assigneeRole:'planner', visibility:'client' },
  { id:'antarpat-4', text:'Position photographer for the Antarpat reveal shot', eventId:'antarpat', priority:'high', dueDaysBeforeEvent:3, assigneeRole:'planner', visibility:'vendor' },

  // LIVUN
  { id:'livun-1', text:'Source mustard oil and red sacred threads for Livun', eventId:'livun', priority:'high', dueDaysBeforeEvent:7, assigneeRole:'planner', visibility:'planner' },
  { id:'livun-2', text:'Book Kashmiri Brahmin (Batuk) for Livun ceremony', eventId:'livun', priority:'high', dueDaysBeforeEvent:30, assigneeRole:'planner', visibility:'planner' },
  { id:'livun-3', text:'Organise home cleaning and decoration for Livun day', eventId:'livun', priority:'medium', dueDaysBeforeEvent:5, assigneeRole:'family', visibility:'client' },

  // VANDUN
  { id:'vandun-1', text:'Identify female family members who know Vandun songs', eventId:'vandun', priority:'high', dueDaysBeforeEvent:21, assigneeRole:'family', visibility:'client' },
  { id:'vandun-2', text:'Prepare Vandun song booklet for those who need prompting', eventId:'vandun', priority:'medium', dueDaysBeforeEvent:14, assigneeRole:'planner', visibility:'client' },
  { id:'vandun-3', text:'Arrange noon chai (Kashmiri pink tea) and wazwan snacks', eventId:'vandun', priority:'medium', dueDaysBeforeEvent:1, assigneeRole:'planner', visibility:'planner' },

  // BIYA (ASSAMESE)
  { id:'biya-1', text:'Book Assamese Brahmin pandit', eventId:'biya', priority:'high', dueDaysBeforeEvent:45, assigneeRole:'planner', visibility:'planner' },
  { id:'biya-2', text:'Confirm muhurat timing with pandit', eventId:'biya', priority:'high', dueDaysBeforeEvent:30, assigneeRole:'planner', visibility:'planner' },
  { id:'biya-3', text:'Source carved wooden wedding stools (pira)', eventId:'biya', priority:'high', dueDaysBeforeEvent:30, assigneeRole:'planner', visibility:'planner' },
  { id:'biya-4', text:'Confirm bride\'s Mekhela Chador is woven and ready', eventId:'biya', priority:'high', dueDaysBeforeEvent:30, assigneeRole:'family', visibility:'client', notes:'Premium Muga silk Mekhela Chadors take 4–6 weeks to weave. Order early.' },
  { id:'biya-5', text:'Hire traditional Assamese bihu musicians', eventId:'biya', priority:'medium', dueDaysBeforeEvent:21, assigneeRole:'planner', visibility:'planner' },

  // LAGAN (PARSI)
  { id:'lagan-1', text:'Book certified Dastur (Zoroastrian priest) early', eventId:'lagan', priority:'high', dueDaysBeforeEvent:60, assigneeRole:'planner', visibility:'planner', notes:'Dasturs are few — book 8–12 weeks in advance.' },
  { id:'lagan-2', text:'Confirm all ceremony items are Zoroastrian-approved', eventId:'lagan', priority:'high', dueDaysBeforeEvent:14, assigneeRole:'planner', visibility:'planner' },
  { id:'lagan-3', text:'Arrange sacred fire setup for Lagan ceremony', eventId:'lagan', priority:'high', dueDaysBeforeEvent:7, assigneeRole:'planner', visibility:'planner' },

  // JURON DIYA
  { id:'juron-1', text:'Prepare juron set (betel nut, betel leaf, Muga silk, sweets)', eventId:'juron_diya', priority:'high', dueDaysBeforeEvent:7, assigneeRole:'family', visibility:'client' },
  { id:'juron-2', text:'Invite family elders for Juron ceremony', eventId:'juron_diya', priority:'medium', dueDaysBeforeEvent:14, assigneeRole:'family', visibility:'client' },
  { id:'juron-3', text:'Arrange traditional gamosa (Assamese cloth) for presentation', eventId:'juron_diya', priority:'medium', dueDaysBeforeEvent:7, assigneeRole:'planner', visibility:'planner' },

]

// ── TASK MAP (by event) ───────────────────────────────────────

export const TASKS_BY_EVENT: Record<string, TaskTemplate[]> = {}
TASK_TEMPLATES.forEach(task => {
  if (!TASKS_BY_EVENT[task.eventId]) TASKS_BY_EVENT[task.eventId] = []
  TASKS_BY_EVENT[task.eventId].push(task)
})

// ── HELPER: get tasks for given events and wedding date ───────

export function generateTasksForWedding(
  eventIds: string[],
  weddingDate: Date
): Array<TaskTemplate & { dueDate: Date }> {
  const tasks: Array<TaskTemplate & { dueDate: Date }> = []
  eventIds.forEach(eventId => {
    const event = EVENT_LIBRARY[eventId]
    const eventTemplateTasks = TASKS_BY_EVENT[eventId] || []
    eventTemplateTasks.forEach(task => {
      // Event date = wedding date minus event's daysBeforeWedding offset
      const eventDate = new Date(weddingDate)
      eventDate.setDate(eventDate.getDate() - (event?.daysBeforeWedding ?? 0))
      // Task due = event date minus task's dueDaysBeforeEvent
      const dueDate = new Date(eventDate)
      dueDate.setDate(dueDate.getDate() - task.dueDaysBeforeEvent)
      tasks.push({ ...task, dueDate })
    })
  })
  return tasks.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
}

// ── HELPER: get events for selected cultures ──────────────────

export function getEventsForCultures(cultureIds: CultureId[]): WeddingEvent[] {
  const seen = new Set<string>()
  const result: WeddingEvent[] = []
  cultureIds.forEach(cultureId => {
    const eventIds = CULTURE_EVENTS[cultureId] || []
    eventIds.forEach(eventId => {
      if (!seen.has(eventId) && EVENT_LIBRARY[eventId]) {
        seen.add(eventId)
        result.push(EVENT_LIBRARY[eventId])
      }
    })
  })
  return result.sort((a, b) => a.defaultOrder - b.defaultOrder)
}
