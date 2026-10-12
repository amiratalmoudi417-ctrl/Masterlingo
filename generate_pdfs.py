import os

def create_simple_pdf(filepath, title, subtitle, level, skill, content_sections):
    """
    Generates a valid, minimal PDF 1.4 file with text streams.
    """
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    
    # We will format text into PDF text operators
    # Clean string helper
    def escape_pdf(text):
        # Replace non-ascii unicode quotes and dashes
        text = text.replace('\u2019', "'").replace('\u2018', "'").replace('\u201c', '"').replace('\u201d', '"').replace('\u2013', '-').replace('\u2014', '--').replace('ɔː', 'or').replace('əʊ', 'ow').replace('ɒ', 'o').replace('ə', 'e')
        text = text.encode('ascii', errors='replace').decode('ascii')
        return text.replace('\\', '\\\\').replace('(', '\\(').replace(')', '\\)')

    lines = []
    lines.append(f"BT")
    lines.append(f"/F1 22 Tf")
    lines.append(f"50 780 Td")
    lines.append(f"({escape_pdf(title)}) Tj")
    lines.append(f"ET")

    lines.append(f"BT")
    lines.append(f"/F1 12 Tf")
    lines.append(f"50 755 Td")
    lines.append(f"({escape_pdf(f'Skill: {skill.capitalize()}  |  Target CEFR Level: {level}  |  EnglishPath Self-Study Library')}) Tj")
    lines.append(f"ET")

    lines.append(f"BT")
    lines.append(f"/F1 10 Tf")
    lines.append(f"50 735 Td")
    lines.append(f"({escape_pdf(subtitle)}) Tj")
    lines.append(f"ET")

    # Add divider line
    # Content sections
    y = 700
    for section_title, paragraphs in content_sections:
        if y < 100:
            break
        # Section header
        lines.append(f"BT")
        lines.append(f"/F1 14 Tf")
        lines.append(f"50 {y} Td")
        lines.append(f"({escape_pdf(section_title)}) Tj")
        lines.append(f"ET")
        y -= 22

        for p in paragraphs:
            if y < 80:
                break
            # Split paragraph into ~85 character lines
            words = p.split()
            current_line = []
            current_len = 0
            for w in words:
                if current_len + len(w) + 1 > 85:
                    line_str = " ".join(current_line)
                    lines.append(f"BT /F1 10 Tf 50 {y} Td ({escape_pdf(line_str)}) Tj ET")
                    y -= 14
                    current_line = [w]
                    current_len = len(w)
                else:
                    current_line.append(w)
                    current_len += len(w) + 1
            if current_line:
                line_str = " ".join(current_line)
                lines.append(f"BT /F1 10 Tf 50 {y} Td ({escape_pdf(line_str)}) Tj ET")
                y -= 16
        y -= 10

    # Footer
    lines.append(f"BT /F1 9 Tf 50 40 Td ({escape_pdf('EnglishPath - Independent Learning Platform (B2-C2) - Free Study Resource')}) Tj ET")

    stream_content = "\n".join(lines).encode('latin1')
    stream_len = len(stream_content)

    # Assemble PDF objects
    objs = []
    # 1: Catalog
    objs.append(b"1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n")
    # 2: Pages
    objs.append(b"2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n")
    # 3: Page
    objs.append(b"3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n")
    # 4: Stream
    objs.append(f"4 0 obj\n<< /Length {stream_len} >>\nstream\n".encode('latin1') + stream_content + b"\nendstream\nendobj\n")
    # 5: Font
    objs.append(b"5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n")

    # Header
    pdf_bytes = b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n"
    offsets = []
    for obj in objs:
        offsets.append(len(pdf_bytes))
        pdf_bytes += obj

    xref_offset = len(pdf_bytes)
    pdf_bytes += b"xref\n0 6\n"
    pdf_bytes += b"0000000000 65535 f \n"
    for off in offsets:
        pdf_bytes += f"{off:010d} 00000 n \n".encode('latin1')

    pdf_bytes += f"trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n{xref_offset}\n%%EOF\n".encode('latin1')

    with open(filepath, "wb") as f:
        f.write(pdf_bytes)
    print(f"Created: {filepath} ({len(pdf_bytes)} bytes)")

pdf_defs = [
    (
        "pdfs/reading/reading-c1-inference-mastery.pdf",
        "Reading: Advanced Inference & Subtext Analysis",
        "Framework for discerning nuanced implication, irony, and rhetorical stance.",
        "C1",
        "reading",
        [
            ("1. Learning Objective", [
                "At C1 level, readers must decode not merely semantic content, but presupposition, stance, and rhetorical nuance. This worksheet examines how writers signal unstated premises.",
            ]),
            ("2. Key Principles of C1 Inference", [
                "- Modality & Hedging: Note epistemic modals (might, arguably, ostensibly) that convey detachment.",
                "- Concessive Structures: Look for clauses with 'while', 'granted', or 'albeit' which balance counter-arguments.",
                "- Lexical Choice: Detect evocative verbs and adjectives that reveal author bias without explicit evaluation.",
            ]),
            ("3. Practical Exercise: Read and Deduce", [
                "Text excerpt: 'The administration heralded the measure as a paradigm shift, though seasoned market watchers were quick to observe that similar overtures had historically foundered on bureaucratic inertia.'",
                "Task 1: What is the author's underlying attitude toward the administration's announcement? (A: Enthusiastic, B: Skeptical, C: Neutral, D: Confirmatory). Correct Answer: B.",
                "Task 2: Identify the word that functions as an explicit hedge.",
            ]),
            ("4. Independent Study Recommendations", [
                "Read weekly editorial pieces in Aeon and The Guardian. Underline five phrases per essay where the author expresses stance through nuance rather than direct assertion.",
            ])
        ]
    ),
    (
        "pdfs/reading/reading-b2-critical-analysis.pdf",
        "Reading: Distinguishing Fact vs. Opinion at B2",
        "Core strategies to identify evidentiary claims, subjective bias, and supporting data.",
        "B2",
        "reading",
        [
            ("1. Overview", [
                "Upper-intermediate readers frequently encounter texts that blend empirical assertions with journalistic opinion. Mastering this boundary is vital for Cambridge B2 First.",
            ]),
            ("2. Signal Markers", [
                "- Factual Indicators: 'According to empirical trials...', 'Data compiled between 2018 and 2023 indicates...'",
                "- Evaluative Markers: 'Inevitably', 'It is reasonable to suppose...', 'Crucially', 'Disappointingly'.",
            ]),
            ("3. Practice Tasks", [
                "Classify each statement: 1. 'Renewable energy output expanded by 18 percent last quarter.' (Fact). 2. 'The government’s current subsidy scheme is lamentably shortsighted.' (Opinion).",
            ])
        ]
    ),
    (
        "pdfs/listening/listening-b2-note-taking-guide.pdf",
        "Listening: Structured Cornell Note-Taking Guide",
        "Techniques for capturing main points, logical markers, and supporting examples.",
        "B2",
        "listening",
        [
            ("1. The Cornell Method for Academic Listening", [
                "Divide your paper into three sectors: Cue Column (left, 2.5 inches), Notes Sector (right, 6 inches), and Summary (bottom, 2 inches).",
            ]),
            ("2. Identifying Discourse Markers", [
                "- Sequencing: 'First and foremost', 'Turning our attention to...', 'In subsequent chapters...'",
                "- Contrast & Rebuttal: 'However', 'Conversely', 'That notwithstanding...'",
                "- Causation: 'Consequently', 'Stemming from this reality...'",
            ]),
            ("3. Dictation & Detail Practice", [
                "Listen to 3-minute clips from BBC Radio 4 or NPR Podcasts. Fill cue terms within 30 seconds of audio conclusion.",
            ])
        ]
    ),
    (
        "pdfs/listening/listening-c1-connected-speech.pdf",
        "Listening: Connected Speech & Phonetic Assimilation",
        "Decoding elision, intrusive sounds, and weak forms in fast natural speech.",
        "C1",
        "listening",
        [
            ("1. Phonetic Realities at C1/C2", [
                "Native speakers rarely articulate words in isolation. Fast speech undergoes elision (dropping sounds), assimilation (sounds adapting to adjacent sounds), and liaison.",
            ]),
            ("2. Core Phenomena", [
                "- Elision: 'Next door' sounds like /neks dɔː/. 'Hold on' sounds like /həʊl dɒn/.",
                "- Intrusion: Intrusive /r/, /j/, and /w/ in vowel-vowel boundaries ('law and order' -> /lɔː r ən ɔːdə/).",
                "- Weak Forms: Prepositions and auxiliary verbs reduced to schwa /ə/.",
            ]),
            ("3. Audio Exercise Routine", [
                "Use YouGlish to search for 'in terms of' and observe how native speakers compress syllables.",
            ])
        ]
    ),
    (
        "pdfs/writing/writing-c1-advanced-essay-structures.pdf",
        "Writing: Advanced Discursive & Argumentative Essay",
        "Architecture, cohesion devices, and counter-argument synthesis for C1 Advanced.",
        "C1",
        "writing",
        [
            ("1. Essay Architecture", [
                "A high-scoring C1 essay avoids generic templates. It demonstrates nuance, well-calibrated topic sentences, and seamless transitional signposting.",
            ]),
            ("2. Paragraph Anatomy", [
                "- Sentence 1: Macro-claim / Topic sentence establishing the thematic scope.",
                "- Sentence 2-3: Elaboration and empirical or illustrative justification.",
                "- Sentence 4: Anticipation of counter-argument / Nuanced caveat.",
                "- Sentence 5: Concluding synthesis connecting back to the thesis statement.",
            ]),
            ("3. Sophisticated Linkers", [
                "Replace 'Moreover' with 'By extension' or 'Compounding this dilemma'. Replace 'On the other hand' with 'Viewed from an opposing vantage point'.",
            ])
        ]
    ),
    (
        "pdfs/writing/writing-c2-formal-proposals-and-reports.pdf",
        "Writing: C2 Proficiency Executive Proposals",
        "High-register formatting, pragmatic recommendations, and executive style.",
        "C2",
        "writing",
        [
            ("1. CEFR C2 Standard", [
                "At C2, your writing must exhibit total command of register, persuasive rhetoric, and idiomatic precision. Reports must be clear, actionable, and authoritative.",
            ]),
            ("2. Standard Sections", [
                "- Introduction: Purpose, scope, and investigative methods.",
                "- Current Situation: Objective evaluation of existing conditions.",
                "- Evaluation of Feasibility: Pros, cons, budgetary considerations.",
                "- Strategic Recommendations: Prioritized, pragmatic action points.",
            ]),
            ("3. Model Sentence Starters", [
                "'It is strongly recommended that the committee sanction...', 'Were funding to be allocated, preliminary milestones could be attained within six months.'",
            ])
        ]
    ),
    (
        "pdfs/speaking/speaking-c1-debate-and-discourse.pdf",
        "Speaking: C1 Discourse Markers & Spontaneous Debate",
        "Formulas for buying thinking time, defending positions, and polite disagreement.",
        "C1",
        "speaking",
        [
            ("1. Natural Hesitation Strategies", [
                "Avoid silence or 'um'. Employ discourse anchors: 'That is an intriguing dimension to ponder...', 'If we unpack the premise behind that proposition...'",
            ]),
            ("2. Nuanced Disagreement", [
                "- 'I concede your initial point, yet empirical precedent suggests otherwise.'",
                "- 'I find myself somewhat at variance with that conclusion.'",
            ]),
            ("3. Daily 2-Minute Speaking Drills", [
                "Pick a randomized prompt: 'Should artificial intelligence be granted intellectual copyright?' Speak uninterrupted for 120 seconds while recording your voice.",
            ])
        ]
    ),
    (
        "pdfs/speaking/speaking-c2-spontaneous-rhetoric.pdf",
        "Speaking: C2 Rhetorical Devices & Fluency Guide",
        "Advanced pacing, triadic structures, metaphor, and spontaneous articulation.",
        "C2",
        "speaking",
        [
            ("1. Rhetorical Eloquence", [
                "C2 speech is distinguished by rhythmic balance, precise cadence, and idiomatic ease without sounding theatrical.",
            ]),
            ("2. Key Stylistic Devices", [
                "- Tricolon (Rule of Three): 'We must assess the risk, confront the skepticism, and execute the mandate.'",
                "- Chiasmus and Parallelism: 'Not merely an academic hypothesis, but a lived imperative.'",
            ]),
            ("3. Evaluation Rubric", [
                "Assess your recording for: Grammatical versatility, lexical range, phonetic intonation, and absence of unnatural hesitation.",
            ])
        ]
    ),
    (
        "pdfs/vocabulary/vocabulary-c1-academic-collocations.pdf",
        "Vocabulary: Academic & Professional Collocations",
        "Over 50 indispensable verb-noun and adjective-noun collocations for C1/C2.",
        "C1",
        "vocabulary",
        [
            ("1. Why Collocations Matter", [
                "Advanced fluency is defined not by obscure single words, but by the natural pairing of lexical chunks.",
            ]),
            ("2. High-Yield Academic Pairs", [
                "- Verb + Noun: formulate a hypothesis, pose a threat, substantiate an assertion, draw an analogy, exert influence.",
                "- Adjective + Noun: compelling evidence, seminal study, profound implication, contentious debate, rigorous methodology.",
                "- Adverb + Adjective: fundamentally flawed, inextricably linked, strikingly disparate, overwhelmingly supportive.",
            ]),
            ("3. Practice Transformations", [
                "Rewrite using advanced collocations: 'His proof made everyone believe him.' -> 'He provided compelling evidence that substantiated his claim.'",
            ])
        ]
    ),
    (
        "pdfs/vocabulary/vocabulary-c2-idiomatic-mastery.pdf",
        "Vocabulary: C2 Fixed Expressions & Idiomatic Nuance",
        "Subtle metaphors, binomial pairs, and register-sensitive idioms.",
        "C2",
        "vocabulary",
        [
            ("1. Idiomatic Precision at C2", [
                "At C2, avoid trite clichés ('raining cats and dogs'). Focus on idioms used in professional journalism, high-level debate, and literature.",
            ]),
            ("2. Selected High-Register Expressions", [
                "- 'To tip the scales': to supply the decisive factor in an outcome.",
                "- 'A double-edged sword': a circumstance carrying both positive and adverse implications.",
                "- 'To toe the line': to conform strictly to directives or protocol.",
                "- 'Part and parcel': an essential and unavoidable component of something.",
                "- 'Through the grapevine': learned via informal or unofficial word of mouth.",
            ]),
            ("3. Self-Check Task", [
                "Construct original sentences illustrating the difference between 'by leaps and bounds' and 'by fits and starts'.",
            ])
        ]
    ),
    (
        "pdfs/grammar/grammar-c1-inversion-and-clefts.pdf",
        "Grammar: Inversion & Cleft Sentences Mastery",
        "Syntactic rearrangement for emphasis, drama, and formal variety.",
        "C1",
        "grammar",
        [
            ("1. Negative Inversion Rules", [
                "When beginning a sentence with a restrictive adverb (Seldom, Rarely, Never, Not only, Under no circumstances), invert auxiliary verb and subject.",
                "Example: 'Rarely have we witnessed such comprehensive transformation.'",
            ]),
            ("2. Cleft Sentences for Emphasis", [
                "- It-Cleft: 'It was the regulatory delay that caused the logistical bottleneck.'",
                "- Wh-Cleft: 'What astonished the auditors was the disparity between projected and actual costs.'",
                "- All-Cleft: 'All they sought was transparent disclosure.'",
            ]),
            ("3. Transformation Practice", [
                "Rewrite: 'You must not reveal these credentials under any circumstances.' -> 'Under no circumstances must you reveal these credentials.'",
            ])
        ]
    ),
    (
        "pdfs/grammar/grammar-c2-sentence-transformations.pdf",
        "Grammar: C2 Cambridge Proficiency Transformations",
        "Key word transformations testing mixed conditionals, passives, and idioms.",
        "C2",
        "grammar",
        [
            ("1. Exam Format & Strategy", [
                "Complete the second sentence so that it has a similar meaning to the first sentence, using the word given. Do not change the word given. Use between 3 and 8 words.",
            ]),
            ("2. Exemplar Exercises", [
                "1. He was so enthusiastic that he overlooked the obvious risks. (BLINDED) -> His enthusiasm BLINDED HIM TO THE obvious risks.",
                "2. If it hadn't been for your prompt assistance, we would have missed the deadline. (HAD) -> HAD IT NOT BEEN FOR your prompt assistance, we would have missed the deadline.",
                "3. Nobody expected the director would tender his resignation so abruptly. (CAME) -> The director's sudden resignation CAME AS A COMPLETE SURPRISE TO everyone.",
            ]),
            ("3. Self-Assessment Rule", [
                "Count your words precisely. Contractions count as two words. Ensure exact concordance.",
            ])
        ]
    )
]

for item in pdf_defs:
    create_simple_pdf(item[0], item[1], item[2], item[3], item[4], item[5])

print("All PDF files created successfully!")
