/**
 * EnglishPath Learning Platform - Resource Database
 * Single Source of Truth for B2 to C2 English Learning
 * 
 * Complies with the schema:
 * {
 *   id: string,
 *   title: string,
 *   skill: 'reading' | 'listening' | 'writing' | 'speaking' | 'vocabulary' | 'grammar',
 *   level: string[], // ['B2'], ['C1'], ['C2'] or combinations
 *   type: 'article' | 'video' | 'interactive' | 'pdf' | 'external' | 'practice',
 *   category: string,
 *   provider: string,
 *   description: string,
 *   url: string | null,
 *   pdf: string | null,
 *   duration: number, // in minutes
 *   difficulty: 'Upper-Intermediate' | 'Advanced' | 'Proficient',
 *   tags: string[],
 *   isFree: boolean,
 *   exercise?: object // data for interactive exercises
 * }
 */

(function () {
  'use strict';

  const SKILL_DEFINITIONS = {
    reading: {
      id: 'reading',
      name: 'Reading',
      icon: 'book-open',
      tagline: 'Textual analysis, subtext, synthesis, and critical reading',
      competencies: {
        B2: 'Can read with a large degree of independence, adapting style and speed of reading to different texts and purposes. Understands articles and reports concerned with contemporary problems in which writers adopt particular stances.',
        C1: 'Can understand in detail a wide range of lengthy, complex texts likely to be encountered in social, professional or academic life, identifying finer points of detail including attitudes and implied opinions.',
        C2: 'Can read with ease virtually all forms of the written language, including abstract, structurally or linguistically complex texts such as manuals, specialized articles and literary works.'
      },
      categories: [
        'Reading comprehension',
        'Main idea identification',
        "Author's purpose and tone",
        'Inference and implied meaning',
        'Vocabulary in context',
        'Fact versus opinion',
        'Argument and evidence analysis',
        'Text summarization',
        'Comparing two texts',
        'Critical reading'
      ]
    },
    listening: {
      id: 'listening',
      name: 'Listening',
      icon: 'headphones',
      tagline: 'Acoustic decoding, accent recognition, connected speech, and discourse nuances',
      competencies: {
        B2: 'Can understand the main ideas of propositionally and linguistically complex speech on both concrete and abstract topics, including technical discussions in their field of specialization.',
        C1: 'Can understand a wide range of recorded and broadcast audio material, including some non-standard usage, and identify finer points of detail including implied attitudes and relationships between speakers.',
        C2: 'Has no difficulty understanding any kind of spoken language, whether live or broadcast, even when delivered at fast native speed, provided there is some time to become familiar with the accent.'
      },
      categories: [
        'General comprehension',
        'Listening for specific details',
        'Dictation',
        'Transcript comparison',
        'Note-taking',
        'Speaker intention and attitude',
        'Accent recognition',
        'Connected speech',
        'Inference and implied meaning',
        'Listening summaries'
      ]
    },
    writing: {
      id: 'writing',
      name: 'Writing',
      icon: 'feather',
      tagline: 'Rhetorical structure, executive reports, discursive essays, and stylistic precision',
      competencies: {
        B2: 'Can write clear, detailed texts on a variety of subjects related to their field of interest, synthesizing and evaluating information and arguments from a number of sources.',
        C1: 'Can write clear, well-structured texts of complex subjects, underlining the relevant salient issues, expanding and supporting points of view at some length with subsidiary points, reasons and relevant examples.',
        C2: 'Can write clear, smoothly flowing, complex texts in an appropriate and effective style and a logical structure which helps the reader find and remember significant points.'
      },
      categories: [
        'Argumentative essays',
        'Opinion essays',
        'Formal emails',
        'Reports and proposals',
        'Reviews',
        'Paraphrasing',
        'Summarization',
        'Sentence combining',
        'Coherence and cohesion',
        'Editing and proofreading'
      ]
    },
    speaking: {
      id: 'speaking',
      name: 'Speaking',
      icon: 'mic',
      tagline: 'Spontaneous fluency, debate rhetoric, nuanced intonation, and public discourse',
      competencies: {
        B2: 'Can interact with a degree of fluency and spontaneity that makes regular interaction with native speakers quite possible without imposing strain on either party. Can account for and sustain views clearly.',
        C1: 'Can express ideas fluently and spontaneously, almost effortlessly. Has a good command of a broad lexical repertoire allowing gaps to be readily overcome with circumlocutions; little obvious searching for expressions.',
        C2: 'Can express themselves at length with a natural, effortless, unhesitating flow. Can formulate thoughts precisely, emphasize nuances, and employ colloquialisms and idioms naturally.'
      },
      categories: [
        'Timed speaking prompts',
        'Opinion presentation',
        'Debate practice',
        'Comparing viewpoints',
        'Story retelling',
        'Oral summaries',
        'Pronunciation practice',
        'Word stress and intonation',
        'Fluency and spontaneous speaking',
        'Professional role-play'
      ]
    },
    vocabulary: {
      id: 'vocabulary',
      name: 'Vocabulary',
      icon: 'layers',
      tagline: 'High-register collocations, binomial expressions, morphological derivation, and register shift',
      competencies: {
        B2: 'Has a good range of vocabulary for matters connected to his/her field and most general topics. Can vary formulation to avoid frequent repetition, but lexical gaps can still cause hesitation.',
        C1: 'Has a good command of a broad lexical repertoire including idiomatic expressions and colloquialisms; shows awareness of connotative levels of meaning and register nuance.',
        C2: 'Has a good command of a very broad lexical repertoire including idiomatic expressions, phrases, and colloquialisms; shows awareness of connotative levels of meaning; can convey finer shades of meaning precisely.'
      },
      categories: [
        'Academic vocabulary',
        'Professional vocabulary',
        'Collocations',
        'Phrasal verbs',
        'Idioms and fixed expressions',
        'Word formation',
        'Synonyms and near-synonyms',
        'Register and formality',
        'Contextual vocabulary',
        'Spaced-repetition review'
      ]
    },
    grammar: {
      id: 'grammar',
      name: 'Grammar',
      icon: 'sliders',
      tagline: 'Inversion structures, cleft clauses, mixed conditionals, and syntactic mastery',
      competencies: {
        B2: 'Shows a relatively high degree of grammatical control. Does not make mistakes which lead to misunderstanding and can correct most of his/her mistakes after the fact.',
        C1: 'Consistently maintains a high degree of grammatical accuracy; errors are rare, difficult to spot and generally corrected when they do occur.',
        C2: 'Maintains consistent grammatical control of complex language, even while attention is otherwise engaged (e.g. in forward-planning, in monitoring others’ reactions).'
      },
      categories: [
        'Advanced verb tenses',
        'Modal verbs',
        'Mixed conditionals',
        'Inversion',
        'Cleft sentences',
        'Passive constructions',
        'Relative clauses',
        'Articles and prepositions',
        'Sentence transformations',
        'Open cloze',
        'Word formation',
        'Error correction'
      ]
    }
  };

  const RESOURCES = [
    // ==========================================
    // READING RESOURCES
    // ==========================================
    {
      id: 'reading-c1-001',
      title: 'Advanced Subtext & Inference in Long-Form Essays',
      skill: 'reading',
      level: ['C1'],
      type: 'interactive',
      category: 'Inference and implied meaning',
      provider: 'British Council LearnEnglish',
      description: 'Analyze epistemic hedging, unstated premises, and rhetorical undertones in complex intellectual essays.',
      url: 'https://learnenglish.britishcouncil.org/',
      pdf: null,
      duration: 25,
      difficulty: 'Advanced',
      tags: ['inference', 'subtext', 'critical-thinking', 'C1'],
      isFree: true,
      exercise: {
        type: 'multiple-choice',
        title: 'Decoding Implied Author Stance',
        instructions: 'Read the excerpt and select the statement that best captures the author’s implied meaning.',
        passage: '“The university administration heralded its new modular curriculum as an egalitarian triumph. Yet seasoned faculty members were quick to remark off the record that similar structural overhauls in 2018 had merely shifted the pedagogical burden onto undercompensated adjunct tutors without yielding any demonstrable improvement in graduate literacy.”',
        questions: [
          {
            id: 'q1',
            text: 'What does the author imply about the administration’s characterization of the curriculum?',
            options: [
              'The author believes the administration is intentionally concealing academic misconduct.',
              'The author views the official narrative as an optimistic PR claim detached from pragmatic operational realities.',
              'The author fully endorses the egalitarian aims of the curriculum overhaul.',
              'The author thinks the faculty members are resistant to unavoidable modernizing technology.'
            ],
            correctIndex: 1,
            explanation: 'The juxtaposition of "heralded as an egalitarian triumph" with "Yet seasoned faculty members were quick to remark off the record..." reveals skepticism toward the administrative promotional narrative.'
          },
          {
            id: 'q2',
            text: 'The phrase "merely shifted the pedagogical burden onto undercompensated adjunct tutors" primarily functions to:',
            options: [
              'Provide an empirical statistic regarding university budget deficits.',
              'Demonstrate how structural reforms can exacerbate institutional inequities while claiming egalitarianism.',
              'Praise the resilience of junior teaching staff.',
              'Argue that modular courses are academically superior.'
            ],
            correctIndex: 1,
            explanation: 'It highlights the irony that a reform marketed as "egalitarian" actually imposed unpaid labor on the most vulnerable university staff.'
          }
        ]
      }
    },
    {
      id: 'reading-c1-002',
      title: 'Advanced Inference & Subtext Analysis Worksheet',
      skill: 'reading',
      level: ['C1'],
      type: 'pdf',
      category: 'Inference and implied meaning',
      provider: 'EnglishPath Curated Library',
      description: 'Comprehensive printable study guide covering modality hedging, concessive structures, and rhetorical deduction.',
      url: null,
      pdf: 'pdfs/reading/reading-c1-inference-mastery.pdf',
      duration: 30,
      difficulty: 'Advanced',
      tags: ['inference', 'pdf', 'worksheet', 'C1'],
      isFree: true
    },
    {
      id: 'reading-b2-001',
      title: 'Distinguishing Fact versus Opinion in Contemporary Media',
      skill: 'reading',
      level: ['B2'],
      type: 'interactive',
      category: 'Fact versus opinion',
      provider: 'The Conversation',
      description: 'Train your critical reading eye to distinguish empirical reporting from journalistic editorializing.',
      url: 'https://theconversation.com',
      pdf: null,
      duration: 18,
      difficulty: 'Upper-Intermediate',
      tags: ['fact-vs-opinion', 'media-literacy', 'B2'],
      isFree: true,
      exercise: {
        type: 'true-false',
        title: 'Fact vs. Opinion Classification',
        instructions: 'Determine whether each excerpt from a current affairs article constitutes a verifiable Factual claim or an Evaluative Opinion.',
        questions: [
          {
            id: 'fo1',
            text: '“Global offshore wind energy capacity expanded by 21.4% between 2021 and 2024 according to the International Energy Agency benchmark report.”',
            options: ['Factual Claim', 'Evaluative Opinion'],
            correctIndex: 0,
            explanation: 'This claim cites verifiable empirical metrics and an international reporting agency.'
          },
          {
            id: 'fo2',
            text: '“The municipal council’s refusal to subsidize public tram upgrades is a catastrophically short-sighted dereliction of duty.”',
            options: ['Factual Claim', 'Evaluative Opinion'],
            correctIndex: 1,
            explanation: 'The adverbs and emotive evaluative nouns ("catastrophically short-sighted dereliction") convey subjective value judgment.'
          },
          {
            id: 'fo3',
            text: '“Urban centers with protected bicycle infrastructure have experienced a documented 14% decrease in cycling fatalities over five years.”',
            options: ['Factual Claim', 'Evaluative Opinion'],
            correctIndex: 0,
            explanation: 'This presents quantifiable statistical data susceptible to objective verification.'
          }
        ]
      }
    },
    {
      id: 'reading-b2-002',
      title: 'Distinguishing Fact vs. Opinion at B2',
      skill: 'reading',
      level: ['B2'],
      type: 'pdf',
      category: 'Fact versus opinion',
      provider: 'EnglishPath Curated Library',
      description: 'Structured worksheet analyzing signal markers, modal qualification, and empirical justification.',
      url: null,
      pdf: 'pdfs/reading/reading-b2-critical-analysis.pdf',
      duration: 20,
      difficulty: 'Upper-Intermediate',
      tags: ['fact-vs-opinion', 'pdf', 'B2', 'worksheet'],
      isFree: true
    },
    {
      id: 'reading-c2-001',
      title: 'Aeon Cultural & Philosophical Essays: The Architecture of Thought',
      skill: 'reading',
      level: ['C2'],
      type: 'article',
      category: 'Critical reading',
      provider: 'Aeon Essays',
      description: 'Immerse yourself in profound philosophical discourse exploring contemporary epistemological questions.',
      url: 'https://aeon.co',
      pdf: null,
      duration: 35,
      difficulty: 'Proficient',
      tags: ['philosophy', 'c2-reading', 'critical-reading', 'deep-dive'],
      isFree: true
    },
    {
      id: 'reading-c2-002',
      title: 'Cambridge English C2 Proficiency Reading Analysis',
      skill: 'reading',
      level: ['C2'],
      type: 'external',
      category: 'Argument and evidence analysis',
      provider: 'Cambridge English',
      description: 'Official Cambridge C2 Proficiency sample papers assessing nuanced text coherence and text reconstruction.',
      url: 'https://www.cambridgeenglish.org',
      pdf: null,
      duration: 45,
      difficulty: 'Proficient',
      tags: ['cpe', 'cambridge', 'exam-prep', 'C2'],
      isFree: true
    },
    {
      id: 'reading-c1-003',
      title: 'The Guardian Long Reads & Investigative Journalism',
      skill: 'reading',
      level: ['C1', 'C2'],
      type: 'article',
      category: 'Comparing two texts',
      provider: 'The Guardian',
      description: 'Exemplary investigative prose featuring multi-perspective narrative arcs and rhetorical subtlety.',
      url: 'https://www.theguardian.com',
      pdf: null,
      duration: 30,
      difficulty: 'Advanced',
      tags: ['journalism', 'long-read', 'synthesis', 'C1', 'C2'],
      isFree: true
    },

    // ==========================================
    // LISTENING RESOURCES
    // ==========================================
    {
      id: 'listening-b2-001',
      title: 'Structured Cornell Note-Taking Guide for Academic Lectures',
      skill: 'listening',
      level: ['B2'],
      type: 'pdf',
      category: 'Note-taking',
      provider: 'EnglishPath Curated Library',
      description: 'Master cue-column methods, logical signposts, and discourse hierarchy when listening to rapid academic presentations.',
      url: null,
      pdf: 'pdfs/listening/listening-b2-note-taking-guide.pdf',
      duration: 25,
      difficulty: 'Upper-Intermediate',
      tags: ['note-taking', 'academic-listening', 'pdf', 'B2'],
      isFree: true
    },
    {
      id: 'listening-b2-002',
      title: 'BBC 6 Minute English: Deep Lexical & Auditory Comprehension',
      skill: 'listening',
      level: ['B2', 'C1'],
      type: 'video',
      category: 'General comprehension',
      provider: 'BBC Learning English',
      description: 'Engaging real-world discussions dissecting topical issues with authentic spoken cadence and transcript breakdowns.',
      url: 'https://www.bbc.co.uk/learningenglish',
      pdf: null,
      duration: 15,
      difficulty: 'Upper-Intermediate',
      tags: ['bbc', 'audio', 'comprehension', 'B2'],
      isFree: true
    },
    {
      id: 'listening-c1-001',
      title: 'Connected Speech & Phonetic Assimilation Mastery',
      skill: 'listening',
      level: ['C1'],
      type: 'pdf',
      category: 'Connected speech',
      provider: 'EnglishPath Curated Library',
      description: 'Detailed phonetic reference on elision, catenation, intrusive /r/ /j/ /w/, and vowel reduction.',
      url: null,
      pdf: 'pdfs/listening/listening-c1-connected-speech.pdf',
      duration: 30,
      difficulty: 'Advanced',
      tags: ['phonetics', 'connected-speech', 'pdf', 'C1'],
      isFree: true
    },
    {
      id: 'listening-c1-002',
      title: 'TED Global Talks: Decoding Speaker Intent & Subtext',
      skill: 'listening',
      level: ['C1'],
      type: 'interactive',
      category: 'Speaker intention and attitude',
      provider: 'TED Talks',
      description: 'Practice pinpointing implicit irony, rhetorical questions, and shift in speaker stance during live lectures.',
      url: 'https://www.ted.com/talks',
      pdf: null,
      duration: 25,
      difficulty: 'Advanced',
      tags: ['ted', 'speaker-attitude', 'rhetoric', 'C1'],
      isFree: true,
      exercise: {
        type: 'multiple-choice',
        title: 'Speaker Attitude and Implication Drill',
        instructions: 'Analyze the transcript excerpt from a keynote lecture on urban sociology and identify the speaker’s stance.',
        passage: '“We were assured that high-density glass towers would foster spontaneous community integration. Well, five years later, you can step into any elevator in downtown Metropolis and enjoy eighty uninterrupted floors of people avoiding eye contact with religious devotion.”',
        questions: [
          {
            id: 'lst1',
            text: 'What is the speaker’s tone when uttering "Well, five years later..."?',
            options: [
              'Earnest satisfaction with architectural progress.',
              'Ironic disillusionment highlighting the gap between design theory and human behavior.',
              'Indifference toward urban planning regulations.',
              'Admiration for the residents’ privacy habits.'
            ],
            correctIndex: 1,
            explanation: 'The deliberate contrast between the utopian claim ("foster spontaneous community integration") and the humorous reality ("avoiding eye contact with religious devotion") conveys sharp ironic disillusionment.'
          },
          {
            id: 'lst2',
            text: 'Why does the speaker use the phrase "with religious devotion"?',
            options: [
              'To criticize the spiritual convictions of the inhabitants.',
              'To hyperbolically emphasize the unwavering consistency of people avoiding social interaction.',
              'To suggest elevator silence is mandated by city by-laws.',
              'To indicate that community centers have replaced traditional venues.'
            ],
            correctIndex: 1,
            explanation: 'The phrase is a rhetorical hyperbole underlining how rigidly and consistently the residents avert their gaze.'
          }
        ]
      }
    },
    {
      id: 'listening-c2-001',
      title: 'NPR Fresh Air & Investigative Podcasts: Unscripted Discourse',
      skill: 'listening',
      level: ['C2'],
      type: 'external',
      category: 'Accent recognition',
      provider: 'NPR',
      description: 'High-speed unscripted conversations featuring diverse regional accents, overlapping dialogue, and colloquial cadence.',
      url: 'https://www.npr.org',
      pdf: null,
      duration: 40,
      difficulty: 'Proficient',
      tags: ['npr', 'unscripted', 'fast-speech', 'C2'],
      isFree: true
    },
    {
      id: 'listening-c2-002',
      title: 'Cambridge English C2 Proficiency Auditory Discrimination',
      skill: 'listening',
      level: ['C2'],
      type: 'external',
      category: 'Inference and implied meaning',
      provider: 'Cambridge English',
      description: 'Listen to multi-speaker discussions requiring simultaneous synthesis of conflicting viewpoints.',
      url: 'https://www.cambridgeenglish.org',
      pdf: null,
      duration: 35,
      difficulty: 'Proficient',
      tags: ['cambridge', 'c2-listening', 'exam-prep'],
      isFree: true
    },

    // ==========================================
    // WRITING RESOURCES
    // ==========================================
    {
      id: 'writing-c1-001',
      title: 'Discursive & Argumentative Essay Architecture',
      skill: 'writing',
      level: ['C1'],
      type: 'pdf',
      category: 'Argumentative essays',
      provider: 'EnglishPath Curated Library',
      description: 'Master macro-claims, paragraph anatomy, sophisticated transitions, and counter-argument synthesis for C1 Advanced.',
      url: null,
      pdf: 'pdfs/writing/writing-c1-advanced-essay-structures.pdf',
      duration: 35,
      difficulty: 'Advanced',
      tags: ['essays', 'argumentation', 'pdf', 'C1'],
      isFree: true
    },
    {
      id: 'writing-c1-002',
      title: 'Cambridge Write & Improve: Instant AI Feedback on Writing',
      skill: 'writing',
      level: ['B2', 'C1', 'C2'],
      type: 'interactive',
      category: 'Editing and proofreading',
      provider: 'Cambridge Write & Improve',
      description: 'Submit essays and written tasks to receive immediate CEFR-aligned evaluations and actionable revision tips.',
      url: 'https://writeandimprove.com',
      pdf: null,
      duration: 40,
      difficulty: 'Advanced',
      tags: ['cambridge', 'feedback', 'essay-writing', 'interactive'],
      isFree: true
    },
    {
      id: 'writing-c2-001',
      title: 'C2 Executive Proposals and Formal Reports Guide',
      skill: 'writing',
      level: ['C2'],
      type: 'pdf',
      category: 'Reports and proposals',
      provider: 'EnglishPath Curated Library',
      description: 'High-register formatting, pragmatic feasibility matrices, executive summaries, and formal register governance.',
      url: null,
      pdf: 'pdfs/writing/writing-c2-formal-proposals-and-reports.pdf',
      duration: 40,
      difficulty: 'Proficient',
      tags: ['proposals', 'reports', 'executive', 'pdf', 'C2'],
      isFree: true
    },
    {
      id: 'writing-b2-001',
      title: 'Formal Email Writing: Register, Nuance & Precision',
      skill: 'writing',
      level: ['B2'],
      type: 'interactive',
      category: 'Formal emails',
      provider: 'Purdue OWL',
      description: 'Transform informal, casual business messages into crisp, diplomatically worded professional correspondence.',
      url: 'https://owl.purdue.edu',
      pdf: null,
      duration: 25,
      difficulty: 'Upper-Intermediate',
      tags: ['business-english', 'emails', 'register', 'B2'],
      isFree: true,
      exercise: {
        type: 'sentence-transformation',
        title: 'Professional Register Transformation',
        instructions: 'Rewrite each colloquial sentence into a formal, diplomatic business equivalent using the key prompt provided.',
        questions: [
          {
            id: 'em1',
            prompt: 'Informal: "Sorry for the wait, I was super busy with another project."',
            instruction: 'Rewrite using: "apologize / delay / unforeseen"',
            acceptableAnswers: [
              'i apologize for the delay due to unforeseen commitments',
              'i apologize for the delay owing to unforeseen commitments',
              'please accept my apologies for the delay due to unforeseen commitments'
            ],
            modelAnswer: 'I apologize for the delay in responding, which was occasioned by unforeseen project commitments.',
            explanation: 'Formal register replaces colloquial apologies ("Sorry for the wait") with nominal structures and deferential phrasing.'
          },
          {
            id: 'em2',
            prompt: 'Informal: "Can you tell me how much this will cost ASAP?"',
            instruction: 'Rewrite using: "grateful / estimate / earliest convenience"',
            acceptableAnswers: [
              'i would be grateful if you could provide a cost estimate at your earliest convenience',
              'i would be grateful if you could provide an estimate at your earliest convenience',
              'i would be grateful for a cost estimate at your earliest convenience'
            ],
            modelAnswer: 'I would be grateful if you could provide a preliminary cost estimate at your earliest convenience.',
            explanation: 'Replaces direct demands ("Can you tell me ASAP") with conditional politeness ("I would be grateful if you could... at your earliest convenience").'
          }
        ]
      }
    },
    {
      id: 'writing-c1-003',
      title: 'Academic Synthesis & Cohesion Interactive Workshop',
      skill: 'writing',
      level: ['C1'],
      type: 'practice',
      category: 'Coherence and cohesion',
      provider: 'EnglishPath Writing Lab',
      description: 'Practice combining conflicting data sets into a coherent, balanced analytical synthesis paragraph.',
      url: null,
      pdf: null,
      duration: 30,
      difficulty: 'Advanced',
      tags: ['synthesis', 'cohesion', 'linking-devices', 'C1'],
      isFree: true,
      exercise: {
        type: 'writing-prompt',
        title: 'C1 Argumentative Synthesis Task',
        instructions: 'Compose a 150–200 word discursive paragraph synthesizing the two contrasting viewpoints below.',
        prompt: 'Source A contends that telecommuting fosters unprecedented personal autonomy and reduces carbon emissions. Source B cautions that pervasive remote work erodes spontaneous organizational innovation and leads to social alienation. Synthesize these arguments into an objective, coherent evaluation with nuanced linking devices.',
        criteria: [
          'Use at least two concessive clauses (e.g., "While it is indisputable that...", "That notwithstanding...")',
          'Include advanced linking phrases (e.g., "By extension", "Conversely", "Compounding this reality")',
          'Maintain an objective, analytical register without personal bias',
          'Ensure clear paragraph unity from topic sentence to conclusion'
        ]
      }
    },

    // ==========================================
    // SPEAKING RESOURCES
    // ==========================================
    {
      id: 'speaking-c1-001',
      title: 'C1 Discourse Markers & Spontaneous Debate Practice',
      skill: 'speaking',
      level: ['C1'],
      type: 'pdf',
      category: 'Debate practice',
      provider: 'EnglishPath Curated Library',
      description: 'Formulas for buying cognitive processing time, defusing hostile questions, and formulating counter-claims.',
      url: null,
      pdf: 'pdfs/speaking/speaking-c1-debate-and-discourse.pdf',
      duration: 30,
      difficulty: 'Advanced',
      tags: ['debate', 'discourse-markers', 'speaking', 'pdf', 'C1'],
      isFree: true
    },
    {
      id: 'speaking-c1-002',
      title: 'YouGlish: Real-World Pronunciation & Cadence in Context',
      skill: 'speaking',
      level: ['B2', 'C1', 'C2'],
      type: 'external',
      category: 'Pronunciation practice',
      provider: 'YouGlish',
      description: 'Search any word or collocation to see authentic video clips of native speakers delivering it naturally.',
      url: 'https://youglish.com',
      pdf: null,
      duration: 20,
      difficulty: 'Advanced',
      tags: ['pronunciation', 'youglish', 'intonation', 'audio-visual'],
      isFree: true
    },
    {
      id: 'speaking-c2-001',
      title: 'C2 Rhetorical Devices & Fluency Cadence Guide',
      skill: 'speaking',
      level: ['C2'],
      type: 'pdf',
      category: 'Fluency and spontaneous speaking',
      provider: 'EnglishPath Curated Library',
      description: 'Master tricolon structures, chiasmus, rhetorical cadence, and spontaneous articulation at C2 proficiency.',
      url: null,
      pdf: 'pdfs/speaking/speaking-c2-spontaneous-rhetoric.pdf',
      duration: 35,
      difficulty: 'Proficient',
      tags: ['rhetoric', 'c2-speaking', 'fluency', 'pdf'],
      isFree: true
    },
    {
      id: 'speaking-b2-001',
      title: 'Timed 2-Minute Spontaneous Speaking Prompt Generator',
      skill: 'speaking',
      level: ['B2', 'C1'],
      type: 'interactive',
      category: 'Timed speaking prompts',
      provider: 'EnglishPath Speaking Studio',
      description: 'Simulate Cambridge speaking Part 2 & Part 3 with built-in timer, structure checklist, and recording self-review.',
      url: null,
      pdf: null,
      duration: 15,
      difficulty: 'Upper-Intermediate',
      tags: ['timed-prompts', 'cambridge-speaking', 'timer', 'B2', 'C1'],
      isFree: true,
      exercise: {
        type: 'speaking-prompt',
        title: '2-Minute Monologue: Ethical Dilemmas in Technology',
        instructions: 'Take 60 seconds to prepare notes. Then speak aloud continuously for 120 seconds addressing the prompt.',
        prompt: '“To what extent should individuals be held personally accountable for verifying the veracity of news articles before sharing them on social platforms? Consider the role of algorithmic curation, digital literacy, and civic responsibility.”',
        durationLimit: 120,
        criteria: [
          'State a clear opening thesis within the first 20 seconds',
          'Explore both individual responsibility and systemic platform architecture',
          'Use at least 3 discourse markers (e.g., "From an ethical standpoint", "It is worth acknowledging that", "Ultimately...")',
          'Avoid unfilled pauses exceeding 3 seconds'
        ]
      }
    },
    {
      id: 'speaking-c1-003',
      title: 'Toastmasters International: Impromptu Table Topics Strategy',
      skill: 'speaking',
      level: ['C1'],
      type: 'article',
      category: 'Opinion presentation',
      provider: 'Toastmasters International',
      description: 'Proven frameworks (PREP, STAR, Past-Present-Future) for structuring spontaneous responses under pressure.',
      url: 'https://www.toastmasters.org',
      pdf: null,
      duration: 25,
      difficulty: 'Advanced',
      tags: ['public-speaking', 'table-topics', 'structure', 'C1'],
      isFree: true
    },
    {
      id: 'speaking-b2-002',
      title: 'ConversationExchange: Language Exchange & Peer Discourse',
      skill: 'speaking',
      level: ['B2', 'C1'],
      type: 'external',
      category: 'Fluency and spontaneous speaking',
      provider: 'ConversationExchange',
      description: 'Connect with native English speakers across the globe for scheduled conversational practice sessions.',
      url: 'https://www.conversationexchange.com',
      pdf: null,
      duration: 45,
      difficulty: 'Upper-Intermediate',
      tags: ['peer-learning', 'conversation', 'exchange', 'B2'],
      isFree: true
    },

    // ==========================================
    // VOCABULARY RESOURCES
    // ==========================================
    {
      id: 'vocab-c1-001',
      title: 'Academic & Professional Collocations Mastery',
      skill: 'vocabulary',
      level: ['C1'],
      type: 'pdf',
      category: 'Collocations',
      provider: 'EnglishPath Curated Library',
      description: '50+ high-yield verb-noun and adjective-noun collocations with contextual examples and sentence frames.',
      url: null,
      pdf: 'pdfs/vocabulary/vocabulary-c1-academic-collocations.pdf',
      duration: 25,
      difficulty: 'Advanced',
      tags: ['collocations', 'academic-vocabulary', 'pdf', 'C1'],
      isFree: true
    },
    {
      id: 'vocab-c1-002',
      title: 'Advanced Collocations & Verb-Noun Concord Drills',
      skill: 'vocabulary',
      level: ['C1'],
      type: 'interactive',
      category: 'Collocations',
      provider: 'Cambridge Collocations in Use',
      description: 'Interactive gap-fill drills evaluating natural prepositional and lexical bindings in high-register English.',
      url: 'https://dictionary.cambridge.org',
      pdf: null,
      duration: 20,
      difficulty: 'Advanced',
      tags: ['collocations', 'gap-fill', 'c1-vocab', 'interactive'],
      isFree: true,
      exercise: {
        type: 'fill-in-gap',
        title: 'Precision Verb-Noun Collocations',
        instructions: 'Type the single most natural verb that collocates with the noun phrase in each sentence.',
        questions: [
          {
            id: 'vc1',
            sentence: 'The research committee has yet to ________ a formal hypothesis to explain the anomaly.',
            hint: 'Starts with f (formulate / frame)',
            acceptableAnswers: ['formulate', 'frame'],
            explanation: 'In academic contexts, one "formulates a hypothesis" or "poses a question".'
          },
          {
            id: 'vc2',
            sentence: 'Unless the company takes decisive action, this regulatory violation will ________ a grave threat to its solvency.',
            hint: 'P-verb (pose / present)',
            acceptableAnswers: ['pose', 'present'],
            explanation: 'Threats, risks, and challenges are conventionally "posed" or "presented".'
          },
          {
            id: 'vc3',
            sentence: 'The defense attorney sought to ________ an analogy between modern algorithms and classic editorial bias.',
            hint: 'D-verb (draw)',
            acceptableAnswers: ['draw'],
            explanation: 'The established collocation is to "draw an analogy" or "draw a comparison".'
          }
        ]
      }
    },
    {
      id: 'vocab-c2-001',
      title: 'C2 Fixed Expressions & Idiomatic Nuance Guide',
      skill: 'vocabulary',
      level: ['C2'],
      type: 'pdf',
      category: 'Idioms and fixed expressions',
      provider: 'EnglishPath Curated Library',
      description: 'Sophisticated metaphors, binomial pairs, and register-sensitive idioms used in intellectual publications.',
      url: null,
      pdf: 'pdfs/vocabulary/vocabulary-c2-idiomatic-mastery.pdf',
      duration: 30,
      difficulty: 'Proficient',
      tags: ['idioms', 'binomials', 'c2-vocab', 'pdf'],
      isFree: true
    },
    {
      id: 'vocab-b2-001',
      title: 'Cambridge Dictionary: Essential Phrasal Verbs in Context',
      skill: 'vocabulary',
      level: ['B2'],
      type: 'external',
      category: 'Phrasal verbs',
      provider: 'Cambridge Dictionary',
      description: 'Comprehensive directory of multi-word verbs classified by semantic particle and register nuances.',
      url: 'https://dictionary.cambridge.org',
      pdf: null,
      duration: 20,
      difficulty: 'Upper-Intermediate',
      tags: ['phrasal-verbs', 'cambridge', 'dictionary', 'B2'],
      isFree: true
    },
    {
      id: 'vocab-c1-003',
      title: 'Morphological Derivation & Word Formation Drills',
      skill: 'vocabulary',
      level: ['C1'],
      type: 'interactive',
      category: 'Word formation',
      provider: 'EnglishPath Vocabulary Lab',
      description: 'Derive abstract nouns, negative adjectives, and compound adverbs from root lexemes.',
      url: null,
      pdf: null,
      duration: 20,
      difficulty: 'Advanced',
      tags: ['word-formation', 'prefixes-suffixes', 'morphology', 'C1'],
      isFree: true,
      exercise: {
        type: 'word-formation',
        title: 'Word Formation: Prefixes, Suffixes & Roots',
        instructions: 'Use the base word in brackets to form a grammatically appropriate word that fits the gap.',
        questions: [
          {
            id: 'wf1',
            sentence: 'His arguments were so [CONVINCE] that several dissenting committee members altered their stance.',
            rootWord: 'CONVINCE',
            acceptableAnswers: ['convincing', 'cogent'],
            explanation: 'Adjective required: "convincing".'
          },
          {
            id: 'wf2',
            sentence: 'The minister dismissed the allegation as entirely [SUBSTANCE] and politically motivated.',
            rootWord: 'SUBSTANCE',
            acceptableAnswers: ['unsubstantiated', 'insubstantial'],
            explanation: 'Negative participial adjective required: "unsubstantiated" (lacking evidentiary proof).'
          },
          {
            id: 'wf3',
            sentence: 'There has been a [NOTICE] improvement in client retention following the software release.',
            rootWord: 'NOTICE',
            acceptableAnswers: ['noticeable'],
            explanation: 'Spelled "noticeable" retaining the letter e to keep the soft c sound.'
          }
        ]
      }
    },
    {
      id: 'vocab-c2-002',
      title: 'BBC The English We Speak: Contemporary Idiomatic Nuances',
      skill: 'vocabulary',
      level: ['C1', 'C2'],
      type: 'video',
      category: 'Idioms and fixed expressions',
      provider: 'BBC Learning English',
      description: 'Deconstruct idioms and metaphors emerging from modern cultural and professional environments.',
      url: 'https://www.bbc.co.uk/learningenglish',
      pdf: null,
      duration: 15,
      difficulty: 'Advanced',
      tags: ['bbc', 'idioms', 'contemporary', 'C1', 'C2'],
      isFree: true
    },

    // ==========================================
    // GRAMMAR RESOURCES
    // ==========================================
    {
      id: 'grammar-c1-001',
      title: 'Negative Inversion & Cleft Sentences Mastery',
      skill: 'grammar',
      level: ['C1'],
      type: 'pdf',
      category: 'Inversion',
      provider: 'EnglishPath Curated Library',
      description: 'Syntactic fronting with restrictive adverbs, it-clefts, wh-clefts, and stylistic emphasis.',
      url: null,
      pdf: 'pdfs/grammar/grammar-c1-inversion-and-clefts.pdf',
      duration: 30,
      difficulty: 'Advanced',
      tags: ['inversion', 'cleft-sentences', 'syntax', 'pdf', 'C1'],
      isFree: true
    },
    {
      id: 'grammar-c2-001',
      title: 'C2 Cambridge Proficiency Sentence Transformations',
      skill: 'grammar',
      level: ['C2'],
      type: 'pdf',
      category: 'Sentence transformations',
      provider: 'EnglishPath Curated Library',
      description: 'Exam-standard Key Word Transformations testing conditionals, passives, idioms, and modal concord.',
      url: null,
      pdf: 'pdfs/grammar/grammar-c2-sentence-transformations.pdf',
      duration: 40,
      difficulty: 'Proficient',
      tags: ['cpe', 'sentence-transformations', 'pdf', 'C2'],
      isFree: true
    },
    {
      id: 'grammar-c1-002',
      title: 'Advanced Inversion & Fronting Interactive Drill',
      skill: 'grammar',
      level: ['C1'],
      type: 'interactive',
      category: 'Inversion',
      provider: 'Cambridge English',
      description: 'Practice transforming standard declarative statements into high-impact inverted sentences.',
      url: 'https://www.cambridgeenglish.org',
      pdf: null,
      duration: 20,
      difficulty: 'Advanced',
      tags: ['inversion', 'grammar-drill', 'c1-grammar', 'interactive'],
      isFree: true,
      exercise: {
        type: 'sentence-transformation',
        title: 'Restrictive Inversion Transformations',
        instructions: 'Rewrite the sentence starting with the prompt given so that it has the exact same meaning.',
        questions: [
          {
            id: 'inv1',
            prompt: 'Original: "We have seldom witnessed such unprecedented global collaboration."',
            instruction: 'Begin with: "Seldom..."',
            acceptableAnswers: [
              'seldom have we witnessed such unprecedented global collaboration',
              'seldom have we witnessed such unprecedented global collaboration.'
            ],
            modelAnswer: 'Seldom have we witnessed such unprecedented global collaboration.',
            explanation: 'When "Seldom" fronts the sentence, subject-auxiliary inversion is mandatory: Seldom + have (auxiliary) + we (subject) + witnessed...'
          },
          {
            id: 'inv2',
            prompt: 'Original: "You must not disclose these confidential records under any circumstances."',
            instruction: 'Begin with: "Under no circumstances..."',
            acceptableAnswers: [
              'under no circumstances must you disclose these confidential records',
              'under no circumstances must you disclose these confidential records.',
              'under no circumstances should you disclose these confidential records'
            ],
            modelAnswer: 'Under no circumstances must you disclose these confidential records.',
            explanation: 'Negative prepositional phrases trigger auxiliary inversion: Under no circumstances + must + you + disclose...'
          },
          {
            id: 'inv3',
            prompt: 'Original: "I only realized the gravity of the situation after reading the full dossier."',
            instruction: 'Begin with: "Only after..."',
            acceptableAnswers: [
              'only after reading the full dossier did i realize the gravity of the situation',
              'only after reading the full dossier did i realise the gravity of the situation'
            ],
            modelAnswer: 'Only after reading the full dossier did I realize the gravity of the situation.',
            explanation: '"Only after [subordinate clause]" inverts the main clause: "...did I realize the gravity...".'
          }
        ]
      }
    },
    {
      id: 'grammar-b2-001',
      title: 'Mixed Conditionals in Argumentation & Hypothetical Debate',
      skill: 'grammar',
      level: ['B2', 'C1'],
      type: 'interactive',
      category: 'Mixed conditionals',
      provider: 'Purdue OWL',
      description: 'Analyze time-frame shifts: Past action with Present outcome, or Permanent state with Past outcome.',
      url: 'https://owl.purdue.edu',
      pdf: null,
      duration: 25,
      difficulty: 'Upper-Intermediate',
      tags: ['conditionals', 'hypotheticals', 'b2-grammar', 'interactive'],
      isFree: true,
      exercise: {
        type: 'multiple-choice',
        title: 'Mixed Conditionals Identification',
        instructions: 'Select the grammatically correct mixed conditional form for each hypothetical situation.',
        questions: [
          {
            id: 'mc1',
            text: 'Situation: He did not accept the job offer in Geneva last year, so he is not living in Switzerland today.',
            options: [
              'If he had accepted the job offer last year, he would be living in Switzerland today.',
              'If he accepted the job offer last year, he will live in Switzerland today.',
              'If he had accepted the job offer last year, he would have lived in Switzerland today.',
              'If he would have accepted the job offer, he lived in Switzerland today.'
            ],
            correctIndex: 0,
            explanation: 'Past condition (If + Past Perfect: "had accepted") paired with Present consequence (would + bare infinitive: "would be living").'
          },
          {
            id: 'mc2',
            text: 'Situation: She is terrified of public speaking (ongoing personality trait), which is why she did not volunteer for the debate yesterday.',
            options: [
              'If she was not terrified of public speaking, she volunteered for the debate.',
              'If she weren’t terrified of public speaking, she would have volunteered for the debate yesterday.',
              'If she hadn’t been terrified, she volunteered yesterday.',
              'If she wouldn’t be terrified, she had volunteered yesterday.'
            ],
            correctIndex: 1,
            explanation: 'Ongoing/permanent state (If + Past Subjunctive: "weren’t terrified") paired with Past consequence (would have + past participle: "would have volunteered").'
          }
        ]
      }
    },
    {
      id: 'grammar-c2-002',
      title: 'Open Cloze & Structural Particles Workshop',
      skill: 'grammar',
      level: ['C2'],
      type: 'practice',
      category: 'Open cloze',
      provider: 'Cambridge English',
      description: 'Tackle Cambridge C2 Part 2 open cloze passages where single grammatical tokens must be deduced.',
      url: 'https://www.cambridgeenglish.org',
      pdf: null,
      duration: 25,
      difficulty: 'Proficient',
      tags: ['open-cloze', 'cambridge-c2', 'particles', 'exam-practice'],
      isFree: true,
      exercise: {
        type: 'fill-in-gap',
        title: 'C2 Open Cloze Structural Drill',
        instructions: 'Read the text below and think of the word which best fits each gap. Use only ONE word in each gap.',
        questions: [
          {
            id: 'oc1',
            sentence: 'Hardly ________ the keynote speaker stepped up to the podium when the fire alarm sounded.',
            hint: 'Auxiliary verb (had)',
            acceptableAnswers: ['had'],
            explanation: '"Hardly had [subject] [participle] when..." is an invariant temporal inversion structure.'
          },
          {
            id: 'oc2',
            sentence: 'The committee’s findings, far ________ validating the original hypothesis, refuted it unequivocally.',
            hint: 'Preposition following "far" (from)',
            acceptableAnswers: ['from'],
            explanation: '"Far from [gerund]" means quite the opposite of.'
          },
          {
            id: 'oc3',
            sentence: 'Much ________ we might wish for an instantaneous resolution, negotiations are destined to take months.',
            hint: 'Concession marker (as / though)',
            acceptableAnswers: ['as', 'though'],
            explanation: '"Much as we might wish" is a formal concessive phrase meaning "Although we wish very much".'
          }
        ]
      }
    },
    {
      id: 'grammar-c1-003',
      title: 'Advanced Error Correction in Complex Syntactic Structures',
      skill: 'grammar',
      level: ['C1'],
      type: 'interactive',
      category: 'Error correction',
      provider: 'EnglishPath Grammar Lab',
      description: 'Isolate subtle faults in dangling participles, faulty parallelism, and prepositional concordance.',
      url: null,
      pdf: null,
      duration: 20,
      difficulty: 'Advanced',
      tags: ['error-correction', 'syntax', 'accuracy', 'C1'],
      isFree: true,
      exercise: {
        type: 'multiple-choice',
        title: 'Advanced Syntax Error Detection',
        instructions: 'Identify which portion of the sentence contains a grammatical or stylistic flaw.',
        questions: [
          {
            id: 'err1',
            text: '“Having reviewed the statistical anomalies in the clinical data, [A] the report was promptly finalized by the senior research fellow [B] who subsequently submitted it to the ethics board [C] for final ratification [D].”',
            options: [
              'Part A: "Having reviewed the statistical anomalies in the clinical data"',
              'Part B: "the report was promptly finalized by the senior research fellow"',
              'Part C: "who subsequently submitted it to the ethics board"',
              'Part D: "for final ratification"'
            ],
            correctIndex: 1,
            explanation: 'Dangling participle error. The introductory participial modifier "Having reviewed..." logically modifies the researcher, but the grammatical subject of the main clause is "the report". It should read: "...the senior research fellow promptly finalized the report..."'
          },
          {
            id: 'err2',
            text: '“The director emphasized that the program requires not only substantial monetary investment, [A] but also demands [B] that all stakeholders will commit [C] to a multi-year audit process [D].”',
            options: [
              'Part A: "not only substantial monetary investment"',
              'Part B: "but also demands"',
              'Part C: "that all stakeholders will commit"',
              'Part D: "to a multi-year audit process"'
            ],
            correctIndex: 2,
            explanation: 'Subjunctive mandate error. Verbs of demand/insistence require the present subjunctive (base form) in American/formal British English: "...that all stakeholders commit" (not "will commit").'
          }
        ]
      }
    }
  ];

  // Expose to window for direct browser usage
  if (typeof window !== 'undefined') {
    window.ENGLISH_RESOURCES = RESOURCES;
    window.SKILL_DEFINITIONS = SKILL_DEFINITIONS;
  }

  // Also support CommonJS or ES module imports if needed
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      ENGLISH_RESOURCES: RESOURCES,
      SKILL_DEFINITIONS: SKILL_DEFINITIONS
    };
  }
})();
