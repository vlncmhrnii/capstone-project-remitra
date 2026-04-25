const EMAIL_ACTION_COOLDOWN_MS = 60 * 1000;

function normalizeEmail(email) {
  return String(email ?? "").trim().toLowerCase();
}

function buildStorageKey(action, email) {
  return `remitra:${action}:email-cooldown:${normalizeEmail(email)}`;
}

export function getEmailActionCooldownMs() {
  return EMAIL_ACTION_COOLDOWN_MS;
}

export function getRemainingEmailCooldown(action, email) {
  if (typeof window === "undefined") {
    return 0;
  }

  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) {
    return 0;
  }

  const rawValue = window.localStorage.getItem(buildStorageKey(action, normalizedEmail));
  if (!rawValue) {
    return 0;
  }

  const expiresAt = Number(rawValue);
  if (!Number.isFinite(expiresAt)) {
    window.localStorage.removeItem(buildStorageKey(action, normalizedEmail));
    return 0;
  }

  const remainingMs = expiresAt - Date.now();
  if (remainingMs <= 0) {
    window.localStorage.removeItem(buildStorageKey(action, normalizedEmail));
    return 0;
  }

  return remainingMs;
}

export function startEmailCooldown(action, email, durationMs = EMAIL_ACTION_COOLDOWN_MS) {
  if (typeof window === "undefined") {
    return;
  }

  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) {
    return;
  }

  window.localStorage.setItem(
    buildStorageKey(action, normalizedEmail),
    String(Date.now() + durationMs),
  );
}

export function formatCooldownSeconds(remainingMs) {
  return Math.max(1, Math.ceil(remainingMs / 1000));
}
