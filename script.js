/**
 * EnglishPath Learning Platform - Application Controller
 * Vanilla JavaScript (ES6+) Architecture
 * Handles Navigation, State, Filtering, Search, Exercises, and Progress Tracking
 */

(function () {
  'use strict';

  // ==========================================================================
  // 1. STATE MANAGEMENT & LOCAL STORAGE
  // ==========================================================================
  const STORAGE_KEYS = {
    THEME: 'englishpath_theme',
    LEVEL: 'englishpath_level',
    COMPLETED_RESOURCES: 'englishpath_completed_resources',
    COMPLETED_EXERCISES: 'englishpath_completed_exercises',
    BOOKMARKS: 'englishpath_bookmarks',
    RECENT: 'englishpath_recent_resources'
  };

  const AppState = {
    currentView: 'dashboard',
    currentSkill: null,
    globalLevel: 'all', // 'all', 'B2', 'C1', 'C2'
    theme: 'dark',
    searchQuery: '',
    
    // Skill View Filters
    skillFilters: {
      level: 'all',
      type: 'all',
      sortBy: 'recommended'
    },

    // All Resources View Filters
    allFilters: {
      skill: 'all',
      level: 'all',
      type: 'all',
      sortBy: 'recommended'
    },

    // PDF Library View Filter
    pdfSkillFilter: 'all',

    // User Progress Data
    completedResources: new Set(),
    completedExercises: {}, // { resourceId: { score: number, maxScore: number, timestamp: number } }
    bookmarks: new Set(),
    recentResourceIds: [],

    // Active Exercise Modal State
    activeExerciseResource: null,
    speakingTimerInterval: null,
    speakingSecondsRemaining: 120
  };

  // Safe localStorage helper
  function loadStoredData() {
    try {
      const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
      if (savedTheme === 'light' || savedTheme === 'dark') {
        AppState.theme = savedTheme;
      }

      const savedLevel = localStorage.getItem(STORAGE_KEYS.LEVEL);
      if (['all', 'B2', 'C1', 'C2'].includes(savedLevel)) {
        AppState.globalLevel = savedLevel;
        AppState.skillFilters.level = savedLevel;
        AppState.allFilters.level = savedLevel;
      }

      const completed = JSON.parse(localStorage.getItem(STORAGE_KEYS.COMPLETED_RESOURCES) || '[]');
      if (Array.isArray(completed)) {
        AppState.completedResources = new Set(completed);
      }

      const exercises = JSON.parse(localStorage.getItem(STORAGE_KEYS.COMPLETED_EXERCISES) || '{}');
      if (typeof exercises === 'object' && exercises !== null) {
        AppState.completedExercises = exercises;
      }

      const marks = JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKMARKS) || '[]');
      if (Array.isArray(marks)) {
        AppState.bookmarks = new Set(marks);
      }

      const recents = JSON.parse(localStorage.getItem(STORAGE_KEYS.RECENT) || '[]');
      if (Array.isArray(recents)) {
        AppState.recentResourceIds = recents;
      }
    } catch (err) {
      console.warn('Error reading from localStorage:', err);
    }
  }

  function saveStoredData(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.warn('Error saving to localStorage:', err);
    }
  }

  function persistProgress() {
    saveStoredData(STORAGE_KEYS.COMPLETED_RESOURCES, Array.from(AppState.completedResources));
    saveStoredData(STORAGE_KEYS.COMPLETED_EXERCISES, AppState.completedExercises);
    saveStoredData(STORAGE_KEYS.BOOKMARKS, Array.from(AppState.bookmarks));
    saveStoredData(STORAGE_KEYS.RECENT, AppState.recentResourceIds);
  }

  // ==========================================================================
  // 2. DOM UTILITIES & SANITIZATION
  // ==========================================================================
  function escapeHtml(str) {
    if (!str && str !== 0) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getSkillDef(skillKey) {
    return window.SKILL_DEFINITIONS ? window.SKILL_DEFINITIONS[skillKey] : null;
  }

  function getAllResources() {
    return window.ENGLISH_RESOURCES || [];
  }

  function getResourceById(id) {
    return getAllResources().find(r => r.id === id) || null;
  }

  function getSkillSvgIcon(iconName) {
    switch (iconName) {
      case 'book-open':
        return '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>';
      case 'headphones':
        return '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>';
      case 'feather':
        return '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>';
      case 'mic':
        return '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>';
      case 'layers':
        return '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>';
      case 'sliders':
        return '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" x2="20" y1="21" y2="21"/><line x1="4" x2="20" y1="3" y2="3"/><line x1="12" x2="12" y1="3" y2="21"/><path d="m17 7-5-5-5 5"/><path d="m17 17-5 5-5-5"/></svg>';
      default:
        return '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>';
    }
  }

  // Record a resource as recently visited
  function recordRecentAccess(resourceId) {
    AppState.recentResourceIds = [resourceId, ...AppState.recentResourceIds.filter(id => id !== resourceId)].slice(0, 8);
    persistProgress();
  }

  // ==========================================================================
  // 3. STATS & PROGRESS CALCULATIONS
  // ==========================================================================
  function computeSkillStats(skillId) {
    const resources = getAllResources().filter(r => r.skill === skillId);
    const totalCount = resources.length;
    const completedCount = resources.filter(r => AppState.completedResources.has(r.id)).length;
    const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    return { totalCount, completedCount, percent };
  }

  function computeOverallStats() {
    const resources = getAllResources();
    const totalCount = resources.length;
    const completedCount = resources.filter(r => AppState.completedResources.has(r.id)).length;
    const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    const exerciseCount = Object.keys(AppState.completedExercises).length;
    const bookmarkCount = AppState.bookmarks.size;
    
    // Estimated study hours based on completed items duration
    const completedDurations = resources
      .filter(r => AppState.completedResources.has(r.id))
      .reduce((acc, curr) => acc + (curr.duration || 20), 0);
    const hours = (completedDurations / 60).toFixed(1);

    return { totalCount, completedCount, percent, exerciseCount, bookmarkCount, hours };
  }

  function updateGlobalStatsUI() {
    const stats = computeOverallStats();

    // Sidebar
    const sidebarPercent = document.getElementById('sidebarPercent');
    const sidebarBar = document.getElementById('sidebarProgressBar');
    if (sidebarPercent) sidebarPercent.textContent = `${stats.percent}%`;
    if (sidebarBar) sidebarBar.style.width = `${stats.percent}%`;

    // Counts in sidebar
    const allResources = getAllResources();
    const sidebarTotalCount = document.getElementById('sidebarTotalCount');
    const sidebarPdfCount = document.getElementById('sidebarPdfCount');
    if (sidebarTotalCount) sidebarTotalCount.textContent = allResources.length;
    if (sidebarPdfCount) sidebarPdfCount.textContent = allResources.filter(r => r.pdf || r.type === 'pdf').length;

    ['reading', 'listening', 'writing', 'speaking', 'vocabulary', 'grammar'].forEach(skill => {
      const el = document.getElementById(`navCount${skill.charAt(0).toUpperCase() + skill.slice(1)}`);
      if (el) {
        el.textContent = allResources.filter(r => r.skill === skill).length;
      }
    });

    // Dashboard view metrics
    const dashOverall = document.getElementById('dashOverallProgress');
    const dashLevel = document.getElementById('dashCurrentLevel');
    const dashCompleted = document.getElementById('dashCompletedCount');
    const dashSaved = document.getElementById('dashSavedCount');

    if (dashOverall) dashOverall.textContent = `${stats.percent}%`;
    if (dashLevel) dashLevel.textContent = AppState.globalLevel === 'all' ? 'B2 — C2' : AppState.globalLevel;
    if (dashCompleted) dashCompleted.textContent = stats.completedCount;
    if (dashSaved) dashSaved.textContent = stats.bookmarkCount;

    // Progress view metrics
    const progTotalCompleted = document.getElementById('progTotalCompleted');
    const progExercisesScored = document.getElementById('progExercisesScored');
    const progTotalBookmarks = document.getElementById('progTotalBookmarks');
    const progEstStudyTime = document.getElementById('progEstStudyTime');

    if (progTotalCompleted) progTotalCompleted.textContent = stats.completedCount;
    if (progExercisesScored) progExercisesScored.textContent = stats.exerciseCount;
    if (progTotalBookmarks) progTotalBookmarks.textContent = stats.bookmarkCount;
    if (progEstStudyTime) progEstStudyTime.textContent = `${stats.hours} hrs`;
  }

  // ==========================================================================
  // 4. RENDERING FUNCTIONS
  // ==========================================================================

  // Render a Single Resource Card
  function renderResourceCard(resource) {
    const isCompleted = AppState.completedResources.has(resource.id);
    const isBookmarked = AppState.bookmarks.has(resource.id);
    const levelsStr = resource.level.join(' / ');
    const durationStr = `${resource.duration || 20} min`;
    const providerStr = resource.provider || 'Self-Study';
    const typeLabel = resource.type ? resource.type.toUpperCase() : 'RESOURCE';

    // Format tags cleanly with zero-pill separators
    const tagsStr = (resource.tags || []).slice(0, 3).map(t => `#${t}`).join(' · ');

    let actionBtnHtml = '';
    if (resource.type === 'interactive' || resource.exercise) {
      actionBtnHtml = `
        <button type="button" class="primary-card-btn" onclick="openExerciseRunner('${resource.id}')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          Practice Exercise
        </button>
      `;
    } else if (resource.pdf) {
      actionBtnHtml = `
        <button type="button" class="primary-card-btn" onclick="openPdfPreview('${resource.pdf}', '${escapeHtml(resource.title)}')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
          View PDF
        </button>
      `;
    } else if (resource.url) {
      actionBtnHtml = `
        <a href="${escapeHtml(resource.url)}" target="_blank" rel="noopener noreferrer" class="primary-card-btn" onclick="handleExternalLinkClick('${resource.id}')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" x2="21" y1="14" y2="3"/></svg>
          Open Resource
        </a>
      `;
    } else {
      actionBtnHtml = `
        <button type="button" class="secondary-card-btn" onclick="toggleResourceCompleted('${resource.id}')">
          ${isCompleted ? 'Completed' : 'Mark Complete'}
        </button>
      `;
    }

    return `
      <article class="resource-card ${isCompleted ? 'completed' : ''}" id="card-${resource.id}">
        <div>
          <!-- Zero-Pill Unboxed Metadata Line -->
          <div class="resource-meta-line">
            <span class="meta-skill-label">${escapeHtml(resource.skill)}</span>
            <span class="resource-meta-separator">·</span>
            <span class="meta-level-label">${escapeHtml(levelsStr)}</span>
            <span class="resource-meta-separator">·</span>
            <span>${escapeHtml(durationStr)}</span>
            <span class="resource-meta-separator">·</span>
            <span>${escapeHtml(providerStr)}</span>
          </div>

          <h3 class="resource-card-title">${escapeHtml(resource.title)}</h3>
          <p class="resource-card-description">${escapeHtml(resource.description)}</p>

          ${tagsStr ? `<div class="resource-card-tags">${escapeHtml(tagsStr)}</div>` : ''}
        </div>

        <div class="resource-card-footer">
          <div class="resource-actions-left">
            <!-- Bookmark Button -->
            <button type="button" 
              class="icon-action-btn ${isBookmarked ? 'active-bookmark' : ''}" 
              onclick="toggleBookmark('${resource.id}')"
              aria-label="${isBookmarked ? 'Remove bookmark' : 'Bookmark resource'}"
              title="${isBookmarked ? 'Saved in bookmarks' : 'Save bookmark'}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="${isBookmarked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
            </button>

            <!-- Complete Toggle Checkbox Button -->
            <button type="button" 
              class="icon-action-btn ${isCompleted ? 'active-completed' : ''}" 
              onclick="toggleResourceCompleted('${resource.id}')"
              aria-label="${isCompleted ? 'Mark incomplete' : 'Mark complete'}"
              title="${isCompleted ? 'Completed (Click to undo)' : 'Mark as completed'}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            </button>
          </div>

          <div>
            ${actionBtnHtml}
          </div>
        </div>
      </article>
    `;
  }

  // Render a PDF Card
  function renderPdfCard(resource) {
    const skillName = resource.skill ? resource.skill.charAt(0).toUpperCase() + resource.skill.slice(1) : 'General';
    const levelsStr = (resource.level || []).join(' / ');
    return `
      <div class="pdf-card">
        <div class="pdf-card-top">
          <div class="pdf-icon-badge">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/></svg>
          </div>
          <div>
            <div class="resource-meta-line" style="margin-bottom: 2px;">
              <span class="meta-skill-label">${escapeHtml(skillName)}</span>
              <span class="resource-meta-separator">·</span>
              <span class="meta-level-label">${escapeHtml(levelsStr)}</span>
            </div>
            <h4 class="pdf-card-title">${escapeHtml(resource.title)}</h4>
            <p style="font-size: 0.8125rem; color: var(--text-muted); line-height: 1.4;">${escapeHtml(resource.description)}</p>
          </div>
        </div>

        <div class="pdf-card-actions">
          <button type="button" class="secondary-card-btn" style="flex: 1;" onclick="openPdfPreview('${resource.pdf}', '${escapeHtml(resource.title)}')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
            Preview
          </button>
          <a href="${escapeHtml(resource.pdf)}" download class="primary-card-btn" style="flex: 1; text-align: center; justify-content: center;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
            Download
          </a>
        </div>
      </div>
    `;
  }

  // Render Dashboard Skills Grid
  function renderDashboardSkills() {
    const grid = document.getElementById('dashboardSkillsGrid');
    if (!grid) return;

    const skills = ['reading', 'listening', 'writing', 'speaking', 'vocabulary', 'grammar'];
    grid.innerHTML = skills.map(skillKey => {
      const def = getSkillDef(skillKey);
      if (!def) return '';

      const stats = computeSkillStats(skillKey);
      return `
        <div class="skill-card" onclick="navigateTo('${skillKey}')">
          <div>
            <div class="skill-card-top">
              <div class="skill-card-icon">
                ${getSkillSvgIcon(def.icon)}
              </div>
              <div class="skill-card-meta">
                <h3 class="skill-card-title">${escapeHtml(def.name)}</h3>
                <p class="skill-card-desc">${escapeHtml(def.tagline)}</p>
              </div>
            </div>

            <div class="skill-card-stats">
              <span>${stats.completedCount} of ${stats.totalCount} completed</span>
              <span style="font-weight: 600;">${stats.percent}%</span>
            </div>
            <div class="skill-card-progress">
              <div class="skill-card-progress-bar" style="width: ${stats.percent}%;"></div>
            </div>
          </div>

          <button type="button" class="skill-card-btn">
            Explore ${escapeHtml(def.name)}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </div>
      `;
    }).join('');
  }

  // Render Continue Learning & Recommendation Cards
  function renderDashboardSubsections() {
    const all = getAllResources();

    // 1. Continue Learning
    const continueContent = document.getElementById('continueLearningContent');
    if (continueContent) {
      let targetItem = null;
      // First try recently accessed that isn't completed
      if (AppState.recentResourceIds.length > 0) {
        for (const id of AppState.recentResourceIds) {
          const item = getResourceById(id);
          if (item && !AppState.completedResources.has(item.id)) {
            targetItem = item;
            break;
          }
        }
      }
      // If not, pick first uncompleted item matching global level
      if (!targetItem) {
        targetItem = all.find(r => {
          const levelMatch = AppState.globalLevel === 'all' || r.level.includes(AppState.globalLevel);
          return levelMatch && !AppState.completedResources.has(r.id);
        }) || all[0];
      }

      if (targetItem) {
        continueContent.innerHTML = `
          <div class="resource-meta-line">
            <span class="meta-skill-label">${escapeHtml(targetItem.skill)}</span>
            <span class="resource-meta-separator">·</span>
            <span class="meta-level-label">${escapeHtml(targetItem.level.join('/'))}</span>
            <span class="resource-meta-separator">·</span>
            <span>${targetItem.duration || 20} min</span>
          </div>
          <h4 style="font-size: 1rem; margin-bottom: 0.25rem;">${escapeHtml(targetItem.title)}</h4>
          <p style="font-size: 0.8125rem; line-height: 1.4; margin-bottom: 0.75rem;">${escapeHtml(targetItem.description)}</p>
          <div>
            ${targetItem.exercise || targetItem.type === 'interactive' 
              ? `<button type="button" class="primary-card-btn" onclick="openExerciseRunner('${targetItem.id}')">Resume Exercise</button>`
              : targetItem.pdf 
                ? `<button type="button" class="primary-card-btn" onclick="openPdfPreview('${targetItem.pdf}', '${escapeHtml(targetItem.title)}')">Open Worksheet</button>`
                : `<a href="${escapeHtml(targetItem.url)}" target="_blank" rel="noopener noreferrer" class="primary-card-btn" onclick="handleExternalLinkClick('${targetItem.id}')">Continue Resource</a>`
            }
          </div>
        `;
      } else {
        continueContent.innerHTML = `<p style="font-size: 0.875rem;">All caught up! You have mastered all learning resources in this tier.</p>`;
      }
    }

    // 2. Daily Recommendation
    const dailyContent = document.getElementById('dailyRecommendationContent');
    if (dailyContent) {
      // Pick an interactive exercise or advanced resource
      const recommended = all.find(r => r.exercise && !AppState.completedResources.has(r.id)) || all[0];
      if (recommended) {
        dailyContent.innerHTML = `
          <div class="resource-meta-line">
            <span class="meta-skill-label">${escapeHtml(recommended.skill)}</span>
            <span class="resource-meta-separator">·</span>
            <span class="meta-level-label">${escapeHtml(recommended.level.join('/'))}</span>
            <span class="resource-meta-separator">·</span>
            <span>${recommended.duration || 25} min</span>
          </div>
          <h4 style="font-size: 1rem; margin-bottom: 0.25rem;">${escapeHtml(recommended.title)}</h4>
          <p style="font-size: 0.8125rem; line-height: 1.4; margin-bottom: 0.75rem;">${escapeHtml(recommended.description)}</p>
          <div>
            ${recommended.exercise 
              ? `<button type="button" class="primary-card-btn" onclick="openExerciseRunner('${recommended.id}')">Start Daily Challenge</button>`
              : `<button type="button" class="primary-card-btn" onclick="navigateTo('${recommended.skill}')">Explore Practice</button>`
            }
          </div>
        `;
      }
    }

    // 3. Saved Bookmarks Strip on Dashboard
    const bkmkSection = document.getElementById('dashboardBookmarksSection');
    const bkmkGrid = document.getElementById('dashboardBookmarksGrid');
    if (bkmkSection && bkmkGrid) {
      const bookmarkedResources = Array.from(AppState.bookmarks).map(getResourceById).filter(Boolean);
      if (bookmarkedResources.length > 0) {
        bkmkSection.style.display = 'block';
        bkmkGrid.innerHTML = bookmarkedResources.slice(0, 3).map(renderResourceCard).join('');
      } else {
        bkmkSection.style.display = 'none';
      }
    }

    // 4. Quick PDF Strip on Dashboard
    const dashPdfGrid = document.getElementById('dashboardPdfGrid');
    if (dashPdfGrid) {
      const pdfs = all.filter(r => r.pdf).slice(0, 4);
      dashPdfGrid.innerHTML = pdfs.map(renderPdfCard).join('');
    }
  }

  // Render Dedicated Skill View
  function renderSkillView(skillKey) {
    const def = getSkillDef(skillKey);
    if (!def) return;

    AppState.currentSkill = skillKey;

    // Skill Hero Banner Info
    const iconEl = document.getElementById('skillHeroIcon');
    const titleEl = document.getElementById('skillHeroTitle');
    const taglineEl = document.getElementById('skillHeroTagline');
    if (iconEl) iconEl.innerHTML = getSkillSvgIcon(def.icon);
    if (titleEl) titleEl.textContent = def.name;
    if (taglineEl) taglineEl.textContent = def.tagline;

    // Competencies Grid (B2, C1, C2)
    const compGrid = document.getElementById('skillCompetenciesGrid');
    if (compGrid) {
      compGrid.innerHTML = `
        <div class="competency-level-item b2">
          <div class="competency-level-badge" style="color: var(--level-b2);">B2 · Upper-Intermediate</div>
          <div class="competency-level-desc">${escapeHtml(def.competencies.B2)}</div>
        </div>
        <div class="competency-level-item c1">
          <div class="competency-level-badge" style="color: var(--level-c1);">C1 · Advanced</div>
          <div class="competency-level-desc">${escapeHtml(def.competencies.C1)}</div>
        </div>
        <div class="competency-level-item c2">
          <div class="competency-level-badge" style="color: var(--level-c2);">C2 · Proficient</div>
          <div class="competency-level-desc">${escapeHtml(def.competencies.C2)}</div>
        </div>
      `;
    }

    // Build Resource Type Filters dynamically for this skill
    const skillResources = getAllResources().filter(r => r.skill === skillKey);
    const availableTypes = ['all', ...Array.from(new Set(skillResources.map(r => r.type).filter(Boolean)))];

    const typeGroup = document.getElementById('skillTypeFilterGroup');
    if (typeGroup) {
      typeGroup.innerHTML = availableTypes.map(type => {
        const label = type === 'all' ? 'All Types' 
          : type === 'interactive' ? 'Interactive Exercises'
          : type === 'article' ? 'Articles & Texts'
          : type === 'video' ? 'Video & Audio'
          : type === 'pdf' ? 'PDF Worksheets'
          : type === 'external' ? 'External Tools'
          : type.charAt(0).toUpperCase() + type.slice(1);
        const isActive = AppState.skillFilters.type === type;
        return `<button type="button" class="filter-btn ${isActive ? 'active' : ''}" data-val="${escapeHtml(type)}">${escapeHtml(label)}</button>`;
      }).join('');

      // Attach click events
      typeGroup.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          typeGroup.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          AppState.skillFilters.type = btn.dataset.val;
          filterAndRenderSkillResources();
        });
      });
    }

    // Set level filter active state
    const levelGroup = document.getElementById('skillLevelFilterGroup');
    if (levelGroup) {
      levelGroup.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.val === AppState.skillFilters.level);
      });
    }

    filterAndRenderSkillResources();
  }

  function filterAndRenderSkillResources() {
    const skillKey = AppState.currentSkill;
    if (!skillKey) return;

    let items = getAllResources().filter(r => r.skill === skillKey);

    // Global Search Query
    if (AppState.searchQuery.trim()) {
      const q = AppState.searchQuery.toLowerCase().trim();
      items = items.filter(r => 
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        (r.provider && r.provider.toLowerCase().includes(q)) ||
        (r.category && r.category.toLowerCase().includes(q)) ||
        (r.tags && r.tags.some(t => t.toLowerCase().includes(q)))
      );
    }

    // Level filter
    if (AppState.skillFilters.level !== 'all') {
      items = items.filter(r => r.level.includes(AppState.skillFilters.level));
    }

    // Type filter
    if (AppState.skillFilters.type !== 'all') {
      items = items.filter(r => r.type === AppState.skillFilters.type);
    }

    // Sorting
    items = sortResources(items, AppState.skillFilters.sortBy);

    // Render count
    const countEl = document.getElementById('skillResultCount');
    if (countEl) countEl.textContent = `Showing ${items.length} resource${items.length === 1 ? '' : 's'}`;

    // Render cards
    const grid = document.getElementById('skillResourceGrid');
    if (grid) {
      if (items.length > 0) {
        grid.innerHTML = items.map(renderResourceCard).join('');
      } else {
        grid.innerHTML = `
          <div class="empty-state" style="grid-column: 1 / -1;">
            <svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/><line x1="8" x2="14" y1="11" y2="11"/></svg>
            <h3>No resources found</h3>
            <p>No learning materials match your selected level and filter combination. Try resetting your filters to see all available items.</p>
            <button type="button" class="primary-card-btn" onclick="resetSkillFilters()">Reset Skill Filters</button>
          </div>
        `;
      }
    }

    // Render Skill PDF Worksheets
    const pdfGrid = document.getElementById('skillPdfGrid');
    if (pdfGrid) {
      const skillPdfs = getAllResources().filter(r => r.skill === skillKey && r.pdf);
      if (skillPdfs.length > 0) {
        pdfGrid.innerHTML = skillPdfs.map(renderPdfCard).join('');
      } else {
        pdfGrid.innerHTML = `
          <div class="empty-state" style="grid-column: 1 / -1;">
            <p>No worksheets available yet for this skill category.</p>
          </div>
        `;
      }
    }
  }

  // Render All Resources View
  function renderAllResourcesView() {
    let items = getAllResources();

    // Query
    if (AppState.searchQuery.trim()) {
      const q = AppState.searchQuery.toLowerCase().trim();
      items = items.filter(r => 
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        (r.provider && r.provider.toLowerCase().includes(q)) ||
        (r.category && r.category.toLowerCase().includes(q)) ||
        (r.tags && r.tags.some(t => t.toLowerCase().includes(q)))
      );
    }

    // Skill filter
    if (AppState.allFilters.skill !== 'all') {
      items = items.filter(r => r.skill === AppState.allFilters.skill);
    }

    // Level filter
    if (AppState.allFilters.level !== 'all') {
      items = items.filter(r => r.level.includes(AppState.allFilters.level));
    }

    // Type filter
    if (AppState.allFilters.type !== 'all') {
      items = items.filter(r => r.type === AppState.allFilters.type);
    }

    // Sort
    items = sortResources(items, AppState.allFilters.sortBy);

    // Count
    const countEl = document.getElementById('allResultCount');
    if (countEl) countEl.textContent = `Showing ${items.length} of ${getAllResources().length} resources`;

    const grid = document.getElementById('allResourceGrid');
    if (grid) {
      if (items.length > 0) {
        grid.innerHTML = items.map(renderResourceCard).join('');
      } else {
        grid.innerHTML = `
          <div class="empty-state" style="grid-column: 1 / -1;">
            <svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/><line x1="8" x2="14" y1="11" y2="11"/></svg>
            <h3>No matching resources</h3>
            <p>We could not find any learning items matching your current filters and search query.</p>
            <button type="button" class="primary-card-btn" onclick="resetAllFilters()">Reset All Filters</button>
          </div>
        `;
      }
    }
  }

  // Render PDF Library View
  function renderPdfLibraryView() {
    let items = getAllResources().filter(r => r.pdf || r.type === 'pdf');

    if (AppState.pdfSkillFilter !== 'all') {
      items = items.filter(r => r.skill === AppState.pdfSkillFilter);
    }

    const countEl = document.getElementById('pdfResultCount');
    if (countEl) countEl.textContent = `Showing ${items.length} downloadable worksheet${items.length === 1 ? '' : 's'}`;

    const grid = document.getElementById('pdfLibraryGrid');
    if (grid) {
      if (items.length > 0) {
        grid.innerHTML = items.map(renderPdfCard).join('');
      } else {
        grid.innerHTML = `
          <div class="empty-state" style="grid-column: 1 / -1;">
            <p>No worksheets available yet for this selection.</p>
          </div>
        `;
      }
    }
  }

  // Render Progress View
  function renderProgressView() {
    updateGlobalStatsUI();

    // Skill mastery bars breakdown
    const barsContainer = document.getElementById('progressSkillBars');
    if (barsContainer) {
      const skills = ['reading', 'listening', 'writing', 'speaking', 'vocabulary', 'grammar'];
      barsContainer.innerHTML = skills.map(skill => {
        const def = getSkillDef(skill);
        const stats = computeSkillStats(skill);
        return `
          <div style="display: flex; flex-direction: column; gap: 0.375rem;">
            <div style="display: flex; justify-content: space-between; font-size: 0.875rem;">
              <span style="font-weight: 600; text-transform: capitalize;">${escapeHtml(def ? def.name : skill)}</span>
              <span style="color: var(--text-muted); font-feature-settings: 'tnum';">${stats.completedCount}/${stats.totalCount} completed (${stats.percent}%)</span>
            </div>
            <div class="skill-card-progress" style="margin-bottom: 0;">
              <div class="skill-card-progress-bar" style="width: ${stats.percent}%;"></div>
            </div>
          </div>
        `;
      }).join('');
    }

    // Bookmarks list
    const bkmkGrid = document.getElementById('progressBookmarksGrid');
    if (bkmkGrid) {
      const bookmarked = Array.from(AppState.bookmarks).map(getResourceById).filter(Boolean);
      if (bookmarked.length > 0) {
        bkmkGrid.innerHTML = bookmarked.map(renderResourceCard).join('');
      } else {
        bkmkGrid.innerHTML = `
          <div class="empty-state" style="grid-column: 1 / -1;">
            <p>You have not bookmarked any resources yet. Use the bookmark icon on any card to save it here.</p>
          </div>
        `;
      }
    }

    // Completed Exercises Review
    const completedGrid = document.getElementById('progressCompletedGrid');
    if (completedGrid) {
      const completed = Array.from(AppState.completedResources).map(getResourceById).filter(Boolean);
      if (completed.length > 0) {
        completedGrid.innerHTML = completed.map(renderResourceCard).join('');
      } else {
        completedGrid.innerHTML = `
          <div class="empty-state" style="grid-column: 1 / -1;">
            <p>No completed activities yet. Start an exercise or mark resources as done to build your history.</p>
          </div>
        `;
      }
    }
  }

  // Helper Sort Function
  function sortResources(list, sortBy) {
    const copy = [...list];
    if (sortBy === 'title') {
      copy.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'duration') {
      copy.sort((a, b) => (a.duration || 0) - (b.duration || 0));
    } else if (sortBy === 'difficulty') {
      const order = { 'Upper-Intermediate': 1, 'Advanced': 2, 'Proficient': 3 };
      copy.sort((a, b) => (order[a.difficulty] || 0) - (order[b.difficulty] || 0));
    }
    return copy;
  }

  // ==========================================================================
  // 5. NAVIGATION CONTROLLER
  // ==========================================================================
  function navigateTo(viewId) {
    // Determine view and skill
    const coreSkills = ['reading', 'listening', 'writing', 'speaking', 'vocabulary', 'grammar'];
    let targetSectionId = 'viewDashboard';

    if (coreSkills.includes(viewId)) {
      targetSectionId = 'viewSkillPage';
      AppState.currentSkill = viewId;
    } else if (viewId === 'all-resources') {
      targetSectionId = 'viewAllResources';
      AppState.currentSkill = null;
    } else if (viewId === 'pdf-library') {
      targetSectionId = 'viewPdfLibrary';
      AppState.currentSkill = null;
    } else if (viewId === 'my-progress') {
      targetSectionId = 'viewMyProgress';
      AppState.currentSkill = null;
    } else {
      targetSectionId = 'viewDashboard';
      AppState.currentSkill = null;
      viewId = 'dashboard';
    }

    AppState.currentView = viewId;

    // Update URL hash without scroll jumping
    if (window.location.hash !== `#${viewId}`) {
      window.location.hash = `#${viewId}`;
    }

    // Toggle active section
    document.querySelectorAll('.view-section').forEach(section => {
      section.classList.remove('active');
    });
    const targetSection = document.getElementById(targetSectionId);
    if (targetSection) targetSection.classList.add('active');

    // Update active nav links
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.toggle('active', link.dataset.view === viewId);
    });

    // Close mobile drawer if open
    closeMobileSidebar();

    // Render corresponding view contents
    if (targetSectionId === 'viewDashboard') {
      renderDashboardSkills();
      renderDashboardSubsections();
      updateGlobalStatsUI();
    } else if (targetSectionId === 'viewSkillPage') {
      renderSkillView(viewId);
    } else if (targetSectionId === 'viewAllResources') {
      renderAllResourcesView();
    } else if (targetSectionId === 'viewPdfLibrary') {
      renderPdfLibraryView();
    } else if (targetSectionId === 'viewMyProgress') {
      renderProgressView();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleHashChange() {
    const hash = window.location.hash.replace('#', '') || 'dashboard';
    navigateTo(hash);
  }

  // ==========================================================================
  // 6. INTERACTIVE EXERCISE RUNNER
  // ==========================================================================
  function openExerciseRunner(resourceId) {
    const resource = getResourceById(resourceId);
    if (!resource) return;

    recordRecentAccess(resourceId);
    AppState.activeExerciseResource = resource;

    const modal = document.getElementById('exerciseModal');
    const modalTitle = document.getElementById('exerciseModalTitle');
    const modalMeta = document.getElementById('exerciseModalMeta');
    const modalBody = document.getElementById('exerciseModalBody');
    const retryBtn = document.getElementById('exerciseRetryBtn');
    const submitBtn = document.getElementById('exerciseSubmitBtn');
    const scoreSummary = document.getElementById('exerciseScoreSummary');

    if (!modal || !modalBody) return;

    // Reset buttons
    if (retryBtn) retryBtn.style.display = 'none';
    if (submitBtn) {
      submitBtn.style.display = 'inline-flex';
      submitBtn.textContent = 'Submit Answers';
      submitBtn.disabled = false;
    }
    if (scoreSummary) scoreSummary.textContent = '';

    // Clear any running timers
    if (AppState.speakingTimerInterval) {
      clearInterval(AppState.speakingTimerInterval);
      AppState.speakingTimerInterval = null;
    }

    // Set meta & title
    if (modalTitle) modalTitle.textContent = resource.exercise ? resource.exercise.title : resource.title;
    if (modalMeta) {
      modalMeta.innerHTML = `
        <span class="meta-skill-label">${escapeHtml(resource.skill)}</span>
        <span class="resource-meta-separator">·</span>
        <span class="meta-level-label">${escapeHtml(resource.level.join('/'))}</span>
        <span class="resource-meta-separator">·</span>
        <span>${escapeHtml(resource.category || 'Practice')}</span>
      `;
    }

    const ex = resource.exercise || {
      type: 'practice',
      instructions: resource.description,
      prompt: resource.description
    };

    let bodyHtml = '';

    // Render instructions
    if (ex.instructions) {
      bodyHtml += `<div class="exercise-instructions">${escapeHtml(ex.instructions)}</div>`;
    }

    // Render passage if present
    if (ex.passage) {
      bodyHtml += `<div class="exercise-passage">${escapeHtml(ex.passage)}</div>`;
    }

    // Exercise types
    if (ex.type === 'multiple-choice' || ex.type === 'true-false') {
      bodyHtml += renderMultipleChoiceQuestions(ex.questions);
    } else if (ex.type === 'fill-in-gap' || ex.type === 'word-formation') {
      bodyHtml += renderGapFillQuestions(ex.questions);
    } else if (ex.type === 'sentence-transformation') {
      bodyHtml += renderTransformationQuestions(ex.questions);
    } else if (ex.type === 'speaking-prompt') {
      bodyHtml += renderSpeakingExercise(ex);
      if (submitBtn) submitBtn.textContent = 'Complete Speaking Drill';
    } else if (ex.type === 'writing-prompt') {
      bodyHtml += renderWritingExercise(ex);
      if (submitBtn) submitBtn.textContent = 'Mark Writing Complete';
    } else {
      // General practice fallback
      bodyHtml += `
        <div class="question-block">
          <p>${escapeHtml(resource.description)}</p>
          <div style="margin-top: 1rem;">
            <p style="font-size: 0.8125rem; color: var(--text-muted);">Self-directed practice: Once you have completed this learning activity, click the button below to register your progress.</p>
          </div>
        </div>
      `;
      if (submitBtn) submitBtn.textContent = 'Record Completion';
    }

    modalBody.innerHTML = bodyHtml;
    modal.classList.add('open');

    // If speaking drill, attach timer listeners
    if (ex.type === 'speaking-prompt') {
      initSpeakingTimer(ex.durationLimit || 120);
    }
  }

  function renderMultipleChoiceQuestions(questions) {
    if (!questions) return '';
    return questions.map((q, qIndex) => `
      <div class="question-block" id="qBlock-${q.id}">
        <div class="question-text">${qIndex + 1}. ${escapeHtml(q.text)}</div>
        <div class="options-list">
          ${q.options.map((opt, optIndex) => `
            <label class="option-label" id="optLabel-${q.id}-${optIndex}">
              <input type="radio" name="answer-${q.id}" value="${optIndex}" />
              <span>${escapeHtml(opt)}</span>
            </label>
          `).join('')}
        </div>
        <div class="question-explanation" id="expl-${q.id}">
          <strong>Explanation:</strong> ${escapeHtml(q.explanation)}
        </div>
      </div>
    `).join('');
  }

  function renderGapFillQuestions(questions) {
    if (!questions) return '';
    return questions.map((q, qIndex) => `
      <div class="question-block" id="qBlock-${q.id}">
        <div class="question-text">${qIndex + 1}. ${escapeHtml(q.sentence)}</div>
        ${q.hint ? `<div style="font-size: 0.75rem; color: var(--text-muted);">Hint: ${escapeHtml(q.hint)}</div>` : ''}
        ${q.rootWord ? `<div style="font-size: 0.75rem; color: var(--accent-violet);">Base word: <strong>${escapeHtml(q.rootWord)}</strong></div>` : ''}
        <div>
          <input type="text" id="gapInput-${q.id}" class="gap-fill-input" placeholder="Type your answer here..." autocomplete="off" />
        </div>
        <div class="question-explanation" id="expl-${q.id}">
          <strong>Target Answer:</strong> ${escapeHtml(q.acceptableAnswers[0])}<br />
          <strong>Explanation:</strong> ${escapeHtml(q.explanation)}
        </div>
      </div>
    `).join('');
  }

  function renderTransformationQuestions(questions) {
    if (!questions) return '';
    return questions.map((q, qIndex) => `
      <div class="question-block" id="qBlock-${q.id}">
        <div class="question-text">${qIndex + 1}. ${escapeHtml(q.prompt)}</div>
        <div style="font-size: 0.8125rem; color: var(--accent-blue); font-weight: 500;">${escapeHtml(q.instruction)}</div>
        <div>
          <input type="text" id="transInput-${q.id}" class="text-answer-input" placeholder="Enter rewritten sentence..." autocomplete="off" />
        </div>
        <div class="question-explanation" id="expl-${q.id}">
          <strong>Model Answer:</strong> ${escapeHtml(q.modelAnswer)}<br />
          <strong>Rule / Nuance:</strong> ${escapeHtml(q.explanation)}
        </div>
      </div>
    `).join('');
  }

  function renderSpeakingExercise(ex) {
    const limit = ex.durationLimit || 120;
    const minutes = Math.floor(limit / 60);
    const seconds = limit % 60;
    const timeDisplay = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

    return `
      <div class="question-block">
        <div class="question-text" style="font-size: 1.05rem;">${escapeHtml(ex.prompt)}</div>
      </div>

      <div class="speaking-timer-container">
        <div class="speaking-timer-digits" id="speakingTimerDigits">${timeDisplay}</div>
        <div class="timer-controls">
          <button type="button" id="startTimerBtn" class="primary-card-btn">Start Timer</button>
          <button type="button" id="pauseTimerBtn" class="secondary-card-btn" disabled>Pause</button>
          <button type="button" id="resetTimerBtn" class="secondary-card-btn">Reset</button>
        </div>
      </div>

      <div class="question-block">
        <h4 style="font-size: 0.875rem; font-weight: 600; margin-bottom: 0.5rem;">Self-Assessment Rubric:</h4>
        <div class="speaking-checklist">
          ${(ex.criteria || []).map((crit, idx) => `
            <label class="checklist-item">
              <input type="checkbox" id="critCheck-${idx}" />
              <span>${escapeHtml(crit)}</span>
            </label>
          `).join('')}
        </div>
      </div>
    `;
  }

  function renderWritingExercise(ex) {
    return `
      <div class="question-block">
        <div class="question-text" style="font-size: 1.05rem;">${escapeHtml(ex.prompt)}</div>
      </div>

      <div class="question-block">
        <label for="writingTextarea" style="font-size: 0.8125rem; font-weight: 600; color: var(--text-muted); display: flex; justify-content: space-between;">
          <span>Draft your response:</span>
          <span id="wordCounter">0 words</span>
        </label>
        <textarea id="writingTextarea" rows="8" class="text-answer-input" style="font-family: inherit; resize: vertical;" placeholder="Compose your response here..."></textarea>
      </div>

      <div class="question-block">
        <h4 style="font-size: 0.875rem; font-weight: 600; margin-bottom: 0.5rem;">Self-Evaluation Criteria:</h4>
        <div class="speaking-checklist">
          ${(ex.criteria || []).map((crit, idx) => `
            <label class="checklist-item">
              <input type="checkbox" id="writeCrit-${idx}" />
              <span>${escapeHtml(crit)}</span>
            </label>
          `).join('')}
        </div>
      </div>
    `;
  }

  function initSpeakingTimer(durationSeconds) {
    AppState.speakingSecondsRemaining = durationSeconds;
    const digits = document.getElementById('speakingTimerDigits');
    const startBtn = document.getElementById('startTimerBtn');
    const pauseBtn = document.getElementById('pauseTimerBtn');
    const resetBtn = document.getElementById('resetTimerBtn');

    function updateDigits() {
      const m = Math.floor(AppState.speakingSecondsRemaining / 60);
      const s = AppState.speakingSecondsRemaining % 60;
      if (digits) digits.textContent = `${m}:${s < 10 ? '0' : ''}${s}`;
    }

    if (startBtn) {
      startBtn.addEventListener('click', () => {
        if (AppState.speakingTimerInterval) return;
        startBtn.disabled = true;
        if (pauseBtn) pauseBtn.disabled = false;

        AppState.speakingTimerInterval = setInterval(() => {
          if (AppState.speakingSecondsRemaining > 0) {
            AppState.speakingSecondsRemaining--;
            updateDigits();
          } else {
            clearInterval(AppState.speakingTimerInterval);
            AppState.speakingTimerInterval = null;
            if (digits) digits.textContent = "Time's up!";
            if (startBtn) startBtn.disabled = false;
            if (pauseBtn) pauseBtn.disabled = true;
          }
        }, 1000);
      });
    }

    if (pauseBtn) {
      pauseBtn.addEventListener('click', () => {
        if (AppState.speakingTimerInterval) {
          clearInterval(AppState.speakingTimerInterval);
          AppState.speakingTimerInterval = null;
          if (startBtn) startBtn.disabled = false;
          pauseBtn.disabled = true;
        }
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (AppState.speakingTimerInterval) {
          clearInterval(AppState.speakingTimerInterval);
          AppState.speakingTimerInterval = null;
        }
        AppState.speakingSecondsRemaining = durationSeconds;
        updateDigits();
        if (startBtn) startBtn.disabled = false;
        if (pauseBtn) pauseBtn.disabled = true;
      });
    }
  }

  // Handle Exercise Submission & Validation
  function submitExercise() {
    const resource = AppState.activeExerciseResource;
    if (!resource) return;

    const ex = resource.exercise || {};
    let correctCount = 0;
    let totalQuestions = 0;

    if (ex.type === 'multiple-choice' || ex.type === 'true-false') {
      totalQuestions = ex.questions.length;
      ex.questions.forEach(q => {
        const selected = document.querySelector(`input[name="answer-${q.id}"]:checked`);
        const userChoice = selected ? parseInt(selected.value, 10) : -1;
        const explEl = document.getElementById(`expl-${q.id}`);
        if (explEl) explEl.classList.add('visible');

        q.options.forEach((_, optIdx) => {
          const label = document.getElementById(`optLabel-${q.id}-${optIdx}`);
          if (label) {
            if (optIdx === q.correctIndex) {
              label.classList.add('correct');
            } else if (optIdx === userChoice && userChoice !== q.correctIndex) {
              label.classList.add('incorrect');
            }
          }
        });

        if (userChoice === q.correctIndex) {
          correctCount++;
        }
      });
    } else if (ex.type === 'fill-in-gap' || ex.type === 'word-formation') {
      totalQuestions = ex.questions.length;
      ex.questions.forEach(q => {
        const input = document.getElementById(`gapInput-${q.id}`);
        const userVal = input ? input.value.trim().toLowerCase() : '';
        const isMatch = q.acceptableAnswers.some(ans => ans.toLowerCase() === userVal);
        const explEl = document.getElementById(`expl-${q.id}`);
        if (explEl) explEl.classList.add('visible');

        if (input) {
          input.disabled = true;
          if (isMatch) {
            input.style.borderColor = 'var(--accent-emerald)';
            input.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
            correctCount++;
          } else {
            input.style.borderColor = 'var(--accent-rose)';
            input.style.backgroundColor = 'rgba(244, 63, 94, 0.1)';
          }
        }
      });
    } else if (ex.type === 'sentence-transformation') {
      totalQuestions = ex.questions.length;
      ex.questions.forEach(q => {
        const input = document.getElementById(`transInput-${q.id}`);
        const userVal = input ? input.value.trim().toLowerCase().replace(/[.,!?;:]/g, '') : '';
        const isMatch = q.acceptableAnswers.some(ans => 
          ans.toLowerCase().replace(/[.,!?;:]/g, '') === userVal
        );
        const explEl = document.getElementById(`expl-${q.id}`);
        if (explEl) explEl.classList.add('visible');

        if (input) {
          input.disabled = true;
          if (isMatch) {
            input.style.borderColor = 'var(--accent-emerald)';
            input.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
            correctCount++;
          } else {
            input.style.borderColor = 'var(--accent-rose)';
            input.style.backgroundColor = 'rgba(244, 63, 94, 0.1)';
          }
        }
      });
    } else {
      // Writing or Speaking or self-directed
      totalQuestions = 1;
      correctCount = 1;
    }

    // Save exercise completion
    AppState.completedExercises[resource.id] = {
      score: correctCount,
      maxScore: totalQuestions,
      timestamp: Date.now()
    };
    AppState.completedResources.add(resource.id);
    persistProgress();

    // Show score summary
    const summary = document.getElementById('exerciseScoreSummary');
    if (summary) {
      if (ex.type === 'speaking-prompt' || ex.type === 'writing-prompt') {
        summary.innerHTML = `<span style="color: var(--accent-emerald);">Drill completed and recorded to your progress!</span>`;
      } else {
        const percent = Math.round((correctCount / totalQuestions) * 100);
        summary.innerHTML = `Score: <strong>${correctCount}/${totalQuestions} (${percent}%)</strong>`;
      }
    }

    // Show retry and hide submit
    const submitBtn = document.getElementById('exerciseSubmitBtn');
    const retryBtn = document.getElementById('exerciseRetryBtn');
    if (submitBtn) submitBtn.style.display = 'none';
    if (retryBtn) {
      retryBtn.style.display = 'inline-flex';
      retryBtn.onclick = () => openExerciseRunner(resource.id);
    }

    // Update UI across all views immediately
    updateGlobalStatsUI();
    updateCardStatusInDom(resource.id);
  }

  function closeExerciseModal() {
    const modal = document.getElementById('exerciseModal');
    if (modal) modal.classList.remove('open');
    if (AppState.speakingTimerInterval) {
      clearInterval(AppState.speakingTimerInterval);
      AppState.speakingTimerInterval = null;
    }
    AppState.activeExerciseResource = null;
  }

  // ==========================================================================
  // 7. PDF PREVIEW MODAL
  // ==========================================================================
  function openPdfPreview(pdfPath, title) {
    if (!pdfPath) return;

    const modal = document.getElementById('pdfModal');
    const frame = document.getElementById('pdfPreviewFrame');
    const modalTitle = document.getElementById('pdfModalTitle');
    const downloadBtn = document.getElementById('pdfModalDownloadBtn');

    if (!modal) return;

    if (modalTitle) modalTitle.textContent = title || 'Worksheet Preview';
    if (frame) frame.src = pdfPath;
    if (downloadBtn) {
      downloadBtn.href = pdfPath;
      downloadBtn.setAttribute('download', pdfPath.split('/').pop());
    }

    modal.classList.add('open');
  }

  function closePdfModal() {
    const modal = document.getElementById('pdfModal');
    const frame = document.getElementById('pdfPreviewFrame');
    if (modal) modal.classList.remove('open');
    if (frame) frame.src = '';
  }

  // ==========================================================================
  // 8. BOOKMARK & COMPLETION ACTIONS
  // ==========================================================================
  function toggleBookmark(resourceId) {
    if (AppState.bookmarks.has(resourceId)) {
      AppState.bookmarks.delete(resourceId);
    } else {
      AppState.bookmarks.add(resourceId);
    }
    persistProgress();
    updateGlobalStatsUI();
    updateCardStatusInDom(resourceId);

    // Refresh sub-views if relevant
    if (AppState.currentView === 'my-progress') renderProgressView();
    if (AppState.currentView === 'dashboard') renderDashboardSubsections();
  }

  function toggleResourceCompleted(resourceId) {
    if (AppState.completedResources.has(resourceId)) {
      AppState.completedResources.delete(resourceId);
      delete AppState.completedExercises[resourceId];
    } else {
      AppState.completedResources.add(resourceId);
    }
    persistProgress();
    updateGlobalStatsUI();
    updateCardStatusInDom(resourceId);

    if (AppState.currentView === 'my-progress') renderProgressView();
    if (AppState.currentView === 'dashboard') {
      renderDashboardSkills();
      renderDashboardSubsections();
    }
  }

  function handleExternalLinkClick(resourceId) {
    recordRecentAccess(resourceId);
  }

  function updateCardStatusInDom(resourceId) {
    const cards = document.querySelectorAll(`[id="card-${resourceId}"]`);
    const isCompleted = AppState.completedResources.has(resourceId);
    const isBookmarked = AppState.bookmarks.has(resourceId);

    cards.forEach(card => {
      card.classList.toggle('completed', isCompleted);

      const bkmkBtn = card.querySelector('.icon-action-btn[onclick*="toggleBookmark"]');
      if (bkmkBtn) {
        bkmkBtn.classList.toggle('active-bookmark', isBookmarked);
        bkmkBtn.setAttribute('title', isBookmarked ? 'Saved in bookmarks' : 'Save bookmark');
        const svg = bkmkBtn.querySelector('svg');
        if (svg) svg.setAttribute('fill', isBookmarked ? 'currentColor' : 'none');
      }

      const compBtn = card.querySelector('.icon-action-btn[onclick*="toggleResourceCompleted"]');
      if (compBtn) {
        compBtn.classList.toggle('active-completed', isCompleted);
        compBtn.setAttribute('title', isCompleted ? 'Completed (Click to undo)' : 'Mark as completed');
      }
    });
  }

  // Clear All Progress with Confirmation
  function confirmClearProgress() {
    const modal = document.getElementById('confirmClearModal');
    if (modal) modal.classList.add('open');
  }

  function executeClearProgress() {
    AppState.completedResources.clear();
    AppState.completedExercises = {};
    AppState.bookmarks.clear();
    AppState.recentResourceIds = [];
    persistProgress();

    const modal = document.getElementById('confirmClearModal');
    if (modal) modal.classList.remove('open');

    updateGlobalStatsUI();
    if (AppState.currentView === 'dashboard') {
      renderDashboardSkills();
      renderDashboardSubsections();
    } else if (AppState.currentView === 'my-progress') {
      renderProgressView();
    } else if (AppState.currentView === 'viewSkillPage') {
      filterAndRenderSkillResources();
    } else {
      renderAllResourcesView();
    }
  }

  // Reset Filters Helpers
  function resetSkillFilters() {
    AppState.skillFilters = { level: 'all', type: 'all', sortBy: 'recommended' };
    const levelBtns = document.querySelectorAll('#skillLevelFilterGroup .filter-btn');
    levelBtns.forEach(b => b.classList.toggle('active', b.dataset.val === 'all'));
    const sortSelect = document.getElementById('skillSortSelect');
    if (sortSelect) sortSelect.value = 'recommended';
    filterAndRenderSkillResources();
  }

  function resetAllFilters() {
    AppState.allFilters = { skill: 'all', level: 'all', type: 'all', sortBy: 'recommended' };
    document.querySelectorAll('#allSkillFilterGroup .filter-btn').forEach(b => b.classList.toggle('active', b.dataset.skill === 'all'));
    document.querySelectorAll('#allLevelFilterGroup .filter-btn').forEach(b => b.classList.toggle('active', b.dataset.level === 'all'));
    document.querySelectorAll('#allTypeFilterGroup .filter-btn').forEach(b => b.classList.toggle('active', b.dataset.type === 'all'));
    const sortSelect = document.getElementById('allSortSelect');
    if (sortSelect) sortSelect.value = 'recommended';
    renderAllResourcesView();
  }

  // Mobile Drawer Helpers
  function toggleMobileSidebar() {
    const sidebar = document.getElementById('appSidebar');
    const backdrop = document.getElementById('sidebarBackdrop');
    if (sidebar && backdrop) {
      const isOpen = sidebar.classList.contains('mobile-open');
      sidebar.classList.toggle('mobile-open', !isOpen);
      backdrop.classList.toggle('open', !isOpen);
    }
  }

  function closeMobileSidebar() {
    const sidebar = document.getElementById('appSidebar');
    const backdrop = document.getElementById('sidebarBackdrop');
    if (sidebar) sidebar.classList.remove('mobile-open');
    if (backdrop) backdrop.classList.remove('open');
  }

  // Theme Controller
  function applyTheme(theme) {
    AppState.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEYS.THEME, theme);

    const moonIcon = document.getElementById('moonIcon');
    const sunIcon = document.getElementById('sunIcon');
    if (moonIcon && sunIcon) {
      if (theme === 'light') {
        moonIcon.style.display = 'none';
        sunIcon.style.display = 'block';
      } else {
        moonIcon.style.display = 'block';
        sunIcon.style.display = 'none';
      }
    }
  }

  function toggleTheme() {
    const newTheme = AppState.theme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
  }

  // ==========================================================================
  // 9. EVENT LISTENERS & INITIALIZATION
  // ==========================================================================
  function initEvents() {
    // 1. Theme toggle
    const themeBtn = document.getElementById('themeToggleBtn');
    if (themeBtn) themeBtn.addEventListener('click', toggleTheme);

    // 2. Global Level selector buttons
    document.querySelectorAll('.level-toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.level-toggle-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const level = btn.dataset.level;
        AppState.globalLevel = level;
        AppState.skillFilters.level = level;
        AppState.allFilters.level = level;
        localStorage.setItem(STORAGE_KEYS.LEVEL, level);

        updateGlobalStatsUI();
        if (AppState.currentView === 'dashboard') {
          renderDashboardSubsections();
        } else if (AppState.currentSkill) {
          filterAndRenderSkillResources();
        } else if (AppState.currentView === 'all-resources') {
          renderAllResourcesView();
        }
      });
    });

    // 3. Global Search Input
    const searchInput = document.getElementById('globalSearchInput');
    const searchClear = document.getElementById('searchClearBtn');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        AppState.searchQuery = e.target.value;
        if (searchClear) searchClear.classList.toggle('visible', AppState.searchQuery.length > 0);

        if (AppState.currentSkill) {
          filterAndRenderSkillResources();
        } else if (AppState.currentView === 'all-resources') {
          renderAllResourcesView();
        } else {
          // If in dashboard and user types search, route to all-resources
          if (AppState.searchQuery.trim().length > 0) {
            navigateTo('all-resources');
          }
        }
      });

      // Press '/' shortcut to focus search
      window.addEventListener('keydown', (e) => {
        if (e.key === '/' && document.activeElement !== searchInput && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
          e.preventDefault();
          searchInput.focus();
        }
      });
    }

    if (searchClear) {
      searchClear.addEventListener('click', () => {
        if (searchInput) {
          searchInput.value = '';
          AppState.searchQuery = '';
          searchClear.classList.remove('visible');
          if (AppState.currentSkill) filterAndRenderSkillResources();
          if (AppState.currentView === 'all-resources') renderAllResourcesView();
        }
      });
    }

    // 4. Mobile sidebar toggle & backdrop
    const mobileBtn = document.getElementById('mobileMenuBtn');
    const backdrop = document.getElementById('sidebarBackdrop');
    if (mobileBtn) mobileBtn.addEventListener('click', toggleMobileSidebar);
    if (backdrop) backdrop.addEventListener('click', closeMobileSidebar);

    // 5. Skill Level Filter Buttons in Skill Page
    const skillLevelGroup = document.getElementById('skillLevelFilterGroup');
    if (skillLevelGroup) {
      skillLevelGroup.addEventListener('click', (e) => {
        const btn = e.target.closest('.filter-btn');
        if (!btn) return;
        skillLevelGroup.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        AppState.skillFilters.level = btn.dataset.val;
        filterAndRenderSkillResources();
      });
    }

    // 6. Skill Sort Dropdown
    const skillSortSelect = document.getElementById('skillSortSelect');
    if (skillSortSelect) {
      skillSortSelect.addEventListener('change', (e) => {
        AppState.skillFilters.sortBy = e.target.value;
        filterAndRenderSkillResources();
      });
    }

    const skillResetBtn = document.getElementById('skillResetFiltersBtn');
    if (skillResetBtn) skillResetBtn.addEventListener('click', resetSkillFilters);

    // 7. All Resources View Filters
    const allSkillGroup = document.getElementById('allSkillFilterGroup');
    if (allSkillGroup) {
      allSkillGroup.addEventListener('click', (e) => {
        const btn = e.target.closest('.filter-btn');
        if (!btn) return;
        allSkillGroup.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        AppState.allFilters.skill = btn.dataset.skill;
        renderAllResourcesView();
      });
    }

    const allLevelGroup = document.getElementById('allLevelFilterGroup');
    if (allLevelGroup) {
      allLevelGroup.addEventListener('click', (e) => {
        const btn = e.target.closest('.filter-btn');
        if (!btn) return;
        allLevelGroup.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        AppState.allFilters.level = btn.dataset.level;
        renderAllResourcesView();
      });
    }

    const allTypeGroup = document.getElementById('allTypeFilterGroup');
    if (allTypeGroup) {
      allTypeGroup.addEventListener('click', (e) => {
        const btn = e.target.closest('.filter-btn');
        if (!btn) return;
        allTypeGroup.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        AppState.allFilters.type = btn.dataset.type;
        renderAllResourcesView();
      });
    }

    const allSortSelect = document.getElementById('allSortSelect');
    if (allSortSelect) {
      allSortSelect.addEventListener('change', (e) => {
        AppState.allFilters.sortBy = e.target.value;
        renderAllResourcesView();
      });
    }

    const allResetBtn = document.getElementById('allResetFiltersBtn');
    if (allResetBtn) allResetBtn.addEventListener('click', resetAllFilters);

    // 8. PDF Library Skill Filter
    const pdfSkillGroup = document.getElementById('pdfSkillFilterGroup');
    if (pdfSkillGroup) {
      pdfSkillGroup.addEventListener('click', (e) => {
        const btn = e.target.closest('.filter-btn');
        if (!btn) return;
        pdfSkillGroup.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        AppState.pdfSkillFilter = btn.dataset.skill;
        renderPdfLibraryView();
      });
    }

    // 9. Modals close listeners
    const closeExBtn = document.getElementById('closeExerciseModalBtn');
    if (closeExBtn) closeExBtn.addEventListener('click', closeExerciseModal);

    const submitExBtn = document.getElementById('exerciseSubmitBtn');
    if (submitExBtn) submitExBtn.addEventListener('click', submitExercise);

    const closePdfBtn = document.getElementById('closePdfModalBtn');
    if (closePdfBtn) closePdfBtn.addEventListener('click', closePdfModal);

    const clearProgBtn = document.getElementById('clearProgressBtn');
    if (clearProgBtn) clearProgBtn.addEventListener('click', confirmClearProgress);

    const closeClearBtn = document.getElementById('closeClearModalBtn');
    const cancelClearBtn = document.getElementById('cancelClearBtn');
    const execClearBtn = document.getElementById('executeClearBtn');
    if (closeClearBtn) closeClearBtn.addEventListener('click', () => document.getElementById('confirmClearModal').classList.remove('open'));
    if (cancelClearBtn) cancelClearBtn.addEventListener('click', () => document.getElementById('confirmClearModal').classList.remove('open'));
    if (execClearBtn) execClearBtn.addEventListener('click', executeClearProgress);

    // Close modals on Escape key
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeExerciseModal();
        closePdfModal();
        const clearModal = document.getElementById('confirmClearModal');
        if (clearModal) clearModal.classList.remove('open');
      }
    });

    // Close modals on backdrop click
    ['exerciseModal', 'pdfModal', 'confirmClearModal'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('click', (e) => {
          if (e.target === el) {
            el.classList.remove('open');
            if (id === 'exerciseModal') closeExerciseModal();
            if (id === 'pdfModal') closePdfModal();
          }
        });
      }
    });

    // Word counter for writing prompt textarea
    document.addEventListener('input', (e) => {
      if (e.target && e.target.id === 'writingTextarea') {
        const words = e.target.value.trim().split(/\s+/).filter(Boolean).length;
        const counter = document.getElementById('wordCounter');
        if (counter) counter.textContent = `${words} word${words === 1 ? '' : 's'}`;
      }
    });

    // Hash routing
    window.addEventListener('hashchange', handleHashChange);
  }

  // ==========================================================================
  // 10. BOOTSTRAP APPLICATION
  // ==========================================================================
  function initApp() {
    loadStoredData();
    applyTheme(AppState.theme);

    // Set level buttons
    document.querySelectorAll('.level-toggle-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.level === AppState.globalLevel);
    });

    initEvents();

    // Initial render from hash or dashboard
    const initialView = window.location.hash.replace('#', '') || 'dashboard';
    navigateTo(initialView);
    updateGlobalStatsUI();
  }

  // Export functions to window for inline onclick handlers
  window.navigateTo = navigateTo;
  window.openExerciseRunner = openExerciseRunner;
  window.openPdfPreview = openPdfPreview;
  window.toggleBookmark = toggleBookmark;
  window.toggleResourceCompleted = toggleResourceCompleted;
  window.handleExternalLinkClick = handleExternalLinkClick;
  window.resetSkillFilters = resetSkillFilters;
  window.resetAllFilters = resetAllFilters;

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
})();
