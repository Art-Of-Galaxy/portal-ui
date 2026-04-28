const ONBOARDING_PROGRESS_KEY = "aog_onboarding_progress";
const CURRENT_ONBOARDING_USER_KEY = "aog_current_onboarding_user";
const TOTAL_STEPS = 4;

const isBrowser = typeof window !== "undefined";

const normalizeEmail = (email) => {
  if (typeof email !== "string") {
    return "";
  }
  return email.trim().toLowerCase();
};

const clampStep = (step) => {
  const parsedStep = Number(step);
  if (!Number.isFinite(parsedStep)) {
    return 1;
  }
  return Math.min(Math.max(Math.floor(parsedStep), 1), TOTAL_STEPS);
};

const readProgressMap = () => {
  if (!isBrowser) {
    return {};
  }

  try {
    const rawData = localStorage.getItem(ONBOARDING_PROGRESS_KEY);
    if (!rawData) {
      return {};
    }

    const parsedData = JSON.parse(rawData);
    return parsedData && typeof parsedData === "object" ? parsedData : {};
  } catch (error) {
    console.error("Unable to read onboarding progress:", error);
    return {};
  }
};

const writeProgressMap = (progressMap) => {
  if (!isBrowser) {
    return;
  }

  localStorage.setItem(ONBOARDING_PROGRESS_KEY, JSON.stringify(progressMap));
};

export const setCurrentOnboardingUser = (email) => {
  if (!isBrowser) {
    return;
  }

  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) {
    return;
  }

  localStorage.setItem(CURRENT_ONBOARDING_USER_KEY, normalizedEmail);
};

export const getCurrentOnboardingUser = () => {
  if (!isBrowser) {
    return "";
  }

  return normalizeEmail(localStorage.getItem(CURRENT_ONBOARDING_USER_KEY));
};

const resolveUserEmail = (email) => normalizeEmail(email) || getCurrentOnboardingUser();

export const saveOnboardingProgress = (email, step) => {
  const resolvedEmail = resolveUserEmail(email);
  if (!resolvedEmail) {
    return;
  }

  const progressMap = readProgressMap();
  progressMap[resolvedEmail] = {
    step: clampStep(step),
    completed: false,
    updatedAt: Date.now(),
  };

  writeProgressMap(progressMap);
  setCurrentOnboardingUser(resolvedEmail);
};

export const getOnboardingProgress = (email) => {
  const resolvedEmail = resolveUserEmail(email);
  if (!resolvedEmail) {
    return null;
  }

  const progressMap = readProgressMap();
  const progress = progressMap[resolvedEmail];

  if (!progress || progress.completed) {
    return null;
  }

  return {
    step: clampStep(progress.step),
  };
};

export const markOnboardingCompleted = (email) => {
  if (!isBrowser) {
    return;
  }

  const resolvedEmail = resolveUserEmail(email);
  if (!resolvedEmail) {
    return;
  }

  const progressMap = readProgressMap();
  progressMap[resolvedEmail] = {
    step: TOTAL_STEPS,
    completed: true,
    updatedAt: Date.now(),
  };

  writeProgressMap(progressMap);

  if (getCurrentOnboardingUser() === resolvedEmail) {
    localStorage.removeItem(CURRENT_ONBOARDING_USER_KEY);
  }
};

