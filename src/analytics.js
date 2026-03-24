const GA_DEBUG_STORAGE_KEY = 'jhl_ga_debug';
const GA_DEBUG_GLOBAL_FLAG = '__JHL_GA_DEBUG__';
const GA_DEBUG_DEFAULT_ENABLED = true;

function getWritableDataLayer() {
  if (typeof window === 'undefined') {
    return null;
  }

  if (!Array.isArray(window.dataLayer)) {
    window.dataLayer = [];
  }

  return window.dataLayer;
}

function isAnalyticsDebugEnabled() {
  if (typeof window === 'undefined') {
    return GA_DEBUG_DEFAULT_ENABLED;
  }

  if (typeof window[GA_DEBUG_GLOBAL_FLAG] === 'boolean') {
    return window[GA_DEBUG_GLOBAL_FLAG];
  }

  try {
    const persistedValue = window.localStorage?.getItem(GA_DEBUG_STORAGE_KEY);
    if (persistedValue !== null) {
      return persistedValue === 'true';
    }
  } catch {
    // Ignore localStorage access issues in privacy-restricted environments.
  }

  return GA_DEBUG_DEFAULT_ENABLED;
}

export function setAnalyticsDebug(enabled) {
  const normalized = Boolean(enabled);

  if (typeof window === 'undefined') {
    return normalized;
  }

  window[GA_DEBUG_GLOBAL_FLAG] = normalized;

  try {
    window.localStorage?.setItem(GA_DEBUG_STORAGE_KEY, String(normalized));
  } catch {
    // Ignore persistence failures and keep runtime flag only.
  }

  return normalized;
}

export function trackEvent(eventName, payload = {}) {
  if (typeof eventName !== 'string' || !eventName.trim()) {
    return;
  }

  const dispatch = () => {
    const dataLayer = getWritableDataLayer();
    if (!dataLayer) {
      return;
    }

    const eventPayload = {
      event: eventName,
      ...payload,
    };

    dataLayer.push(eventPayload);

    if (isAnalyticsDebugEnabled()) {
      console.info('[analytics] event tracked', eventPayload);
    }
  };

  try {
    // Keep link/navigation clicks responsive by queuing analytics work.
    if (typeof window !== 'undefined' && typeof window.requestIdleCallback === 'function') {
      window.requestIdleCallback(dispatch, { timeout: 300 });
      return;
    }

    setTimeout(dispatch, 0);
  } catch {
    // Never let analytics errors impact user actions.
  }
}