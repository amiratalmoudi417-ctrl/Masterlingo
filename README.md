# EnglishPath: B2 to C2 English Mastery Platform

A modern, responsive self-learning web platform for English learners progressing from **B2 (Upper-Intermediate)** to **C1 (Advanced)** and **C2 (Proficient)**. Built strictly with semantic **HTML5, CSS3, and vanilla JavaScript (ES6+)** with zero external frameworks or backend dependencies.

---

## 1. Project Folder Structure

```text
english-learning/
├── index.html          # Semantic layout, SPA view containers, accessible modals
├── style.css           # Design system (Dark navy & Light theme), CSS variables, responsive grid
├── script.js           # Client-side routing, state, exercise runner, search, and storage logic
├── resources.js        # Single source of truth containing resource schema & exercises
└── pdfs/               # Organized printable PDF study worksheets by skill
    ├── reading/
    │   ├── reading-c1-inference-mastery.pdf
    │   └── reading-b2-critical-analysis.pdf
    ├── listening/
    │   ├── listening-b2-note-taking-guide.pdf
    │   └── listening-c1-connected-speech.pdf
    ├── writing/
    │   ├── writing-c1-advanced-essay-structures.pdf
    │   └── writing-c2-formal-proposals-and-reports.pdf
    ├── speaking/
    │   ├── speaking-c1-debate-and-discourse.pdf
    │   └── speaking-c2-spontaneous-rhetoric.pdf
    ├── vocabulary/
    │   ├── vocabulary-c1-academic-collocations.pdf
    │   └── vocabulary-c2-idiomatic-mastery.pdf
    └── grammar/
        ├── grammar-c1-inversion-and-clefts.pdf
        └── grammar-c2-sentence-transformations.pdf
```

---

## 2. How to Add a New Learning Resource

To add any new resource, open `resources.js` and append a new object to the `RESOURCES` array using this schema:

```javascript
{
  id: "reading-c2-003",
  title: "Literary Nuance & Rhetorical Analysis",
  skill: "reading",                     // "reading" | "listening" | "writing" | "speaking" | "vocabulary" | "grammar"
  level: ["C2"],                        // ["B2"], ["C1"], ["C2"], or combinations like ["C1", "C2"]
  type: "article",                      // "interactive" | "article" | "video" | "pdf" | "external" | "practice"
  category: "Critical reading",         // One of the standard skill categories
  provider: "Aeon Essays",
  description: "Examine complex syntactic tropes and subtext in high-register literary prose.",
  url: "https://aeon.co",               // External URL or null
  pdf: null,                            // Path if PDF, e.g. "pdfs/reading/filename.pdf", or null
  duration: 35,                         // Estimated study duration in minutes
  difficulty: "Proficient",             // "Upper-Intermediate" | "Advanced" | "Proficient"
  tags: ["literature", "rhetoric", "C2"],
  isFree: true,
  // Optional for interactive exercises:
  exercise: {
    type: "multiple-choice",            // "multiple-choice" | "true-false" | "fill-in-gap" | "sentence-transformation" | "word-formation" | "speaking-prompt" | "writing-prompt"
    title: "Literary Subtext Analysis",
    instructions: "Read the passage and select the best answer.",
    passage: "Text snippet...",
    questions: [
      {
        id: "q1",
        text: "Question prompt?",
        options: ["Option A", "Option B", "Option C", "Option D"],
        correctIndex: 1,
        explanation: "Rationale why Option B is correct."
      }
    ]
  }
}
```

No HTML or JavaScript code changes are required. The interface will automatically render the new resource, calculate statistics, and enable search and filtering for it.

---

## 3. How to Add a PDF Worksheet

1. Place your PDF file into the matching skill subfolder under `pdfs/`:
   - `pdfs/reading/`
   - `pdfs/listening/`
   - `pdfs/writing/`
   - `pdfs/speaking/`
   - `pdfs/vocabulary/`
   - `pdfs/grammar/`
2. Add its entry to `resources.js`:
   ```javascript
   {
     id: "grammar-c1-004",
     title: "Passive Constructions in Academic Reports",
     skill: "grammar",
     level: ["C1"],
     type: "pdf",
     category: "Passive constructions",
     provider: "EnglishPath Curated Library",
     description: "Master agentless passive voice and reporting structures in formal prose.",
     url: null,
     pdf: "pdfs/grammar/grammar-c1-passives.pdf",
     duration: 30,
     difficulty: "Advanced",
     tags: ["passives", "pdf", "grammar", "C1"],
     isFree: true
   }
   ```
3. The platform will automatically expose it with in-browser **Preview** (modal iframe) and direct **Download** buttons.

---

## 4. How to Run Locally

Because the project uses purely vanilla web technologies, you can run it in multiple ways:

### Option A: Direct Browser File (No server required)
Double-click `index.html` (or drag into any browser). All stylesheets, scripts, interactive exercises, and local storage progress tracking work natively.

### Option B: Local HTTP Server (Python)
Run the following in the project directory:
```bash
python3 -m http.server 8000
```
Then visit `http://localhost:8000` in your browser.

### Option C: Node.js / NPX
```bash
npx serve .
```

---

## 5. How to Publish on GitHub Pages

1. Initialize git and commit your files:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of EnglishPath platform"
   ```
2. Push the repository to GitHub:
   ```bash
   git remote add origin https://github.com/<your-username>/<repo-name>.git
   git branch -M main
   git push -u origin main
   ```
3. Enable GitHub Pages:
   - On GitHub, go to your repository **Settings** → **Pages**.
   - Under **Build and deployment** > **Source**, choose **Deploy from a branch**.
   - Select branch `main` and folder `/ (root)`, then click **Save**.
4. Your site will be live at `https://<your-username>.github.io/<repo-name>/`.

---

## 6. Functional Verification Checklist

- [x] **Theme Switching**: Click the Sun/Moon icon in the header. Theme toggles between Dark Navy and Clean Light mode; selection persists across reloads via `localStorage`.
- [x] **CEFR Level Filter**: Click `B2`, `C1`, `C2`, or `All` in the header or skill views. Only resources matching that level are shown.
- [x] **Instant Search**: Type in the search bar (or press `/` on keyboard). Cards filter instantly across titles, descriptions, providers, and tags. Clear with the `X` button.
- [x] **Single-Page Navigation**: Click sidebar links or dashboard cards (`#reading`, `#listening`, `#writing`, `#speaking`, `#vocabulary`, `#grammar`, `#all-resources`, `#pdf-library`, `#my-progress`). View updates smoothly and browser back/forward buttons work.
- [x] **Interactive Exercises**: Click "Practice Exercise" on interactive cards. Complete multiple-choice, fill-in-the-gap, sentence transformation, speaking timers, or writing tasks. Submitting provides instant grading, explanations, and records completion in `localStorage`.
- [x] **PDF Downloads & Preview**: In the PDF library or skill views, click **Preview** to view inside the responsive modal viewer, or **Download** to save the actual PDF file.
- [x] **Bookmarks & Completion**: Click the Bookmark (ribbon) or Checkmark icon on any card. Dashboard and "My Progress" metrics immediately recalculate and reflect the changes.
- [x] **Clear Progress**: In "My Progress", click "Clear saved progress" to trigger a confirmation modal and safely reset data.
