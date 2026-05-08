const OWNER_KEY_STORAGE_KEY = "localspeak.ownerKey.v1";

export function getOrCreateOwnerKey(): string {
  const existing = window.localStorage.getItem(OWNER_KEY_STORAGE_KEY);
  if (existing) return existing;

  const ownerKey =
    typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `localspeak-${Math.random().toString(36).slice(2)}-${Date.now()}`;
  window.localStorage.setItem(OWNER_KEY_STORAGE_KEY, ownerKey);
  return ownerKey;
}
