const BASE = 'http://localhost:5000/dashboard';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const json = await res.json().catch(() => ({}));
  // FIX #4: throw on non-ok so callers always land in catch, never show false success
  if (!res.ok) throw new Error(json.message || `Request failed (${res.status})`);
  return json.data ?? json;
}

// ── Language APIs ─────────────────────────────────────────────────────────────

function normalizeLanguageData(data) {
  const lang = data.language ?? data.languages ?? [];
  return {
    languages: Array.isArray(lang) ? lang : [lang],
    language_modules: data.languageModule ?? data.language_modules ?? [],
    que_cards: data.que_cards ?? data.queCards ?? [],
  };
}

export const getLanguage = async (l_id) => {
  const data = await request(`/get-language?l_id=${l_id}`);
  return normalizeLanguageData(data);
};

export const cloneLanguage = (l_id, l_name) =>
  request('/clone-language', {
    method: 'POST',
    body: JSON.stringify({ l_id: Number(l_id), l_name }),
  });

// FIX #2: always send { [idKey]: idValue, update } so q_id / lm_id / l_id
// are all present in the payload — not just the update object.
export const updateLanguage = (idKey, idValue, update) =>
  request('/update-languages', {
    method: 'POST',
    body: JSON.stringify({ [idKey]: idValue, update }),
  });

export const deleteLanguage = (idKey, idValue) =>
  request('/delete-language', {
    method: 'POST',
    body: JSON.stringify({ [idKey]: idValue }),
  });

// FIX #1: Add Language Module
export const addLanguageModule = (payload) =>
  request('/add-language-module', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

// FIX #1: Add Que Card
export const addQueCard = (payload) =>
  request('/add-que-card', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

// ── Landing Page APIs ─────────────────────────────────────────────────────────

function normalizeLandingPageData(data) {
  const land = data.landingPage ?? data.landing_page ?? data.landing_pages ?? [];
  return {
    landing_pages: Array.isArray(land) ? land : [land],
    landing_survey_questions:
      data.landingSurveyQuestions ?? data.landing_survey_questions ?? data.landingSurveyQuestion ?? [],
  };
}

export const getLandingPage = async (lp_id) => {
  const data = await request(`/get-landing-page?lp_id=${lp_id}`);
  return normalizeLandingPageData(data);
};

export const cloneLandingPage = (lp_id) =>
  request('/clone-landing-page', {
    method: 'POST',
    body: JSON.stringify({ lp_id: Number(lp_id) }),
  });

export const updateLandingPage = (idKey, idValue, update) =>
  request('/update-landing-page', {
    method: 'POST',
    body: JSON.stringify({ lp_id: idValue, update }),
  });

export const updateLandingSurveyQuestion = (idKey, idValue, update) =>
  request('/update-landing-page', {
    method: 'POST',
    body: JSON.stringify({ id: idValue, update }),
  });

export const deleteLandingPage = (idKey, idValue) =>
  request('/delete-landing-page', {
    method: 'POST',
    body: JSON.stringify({ [idKey]: idValue }),
  });

export const addLandingSurveyQuestion = (payload) =>
  request('/add-landing-survey-question', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
