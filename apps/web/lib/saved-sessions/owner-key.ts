const OWNER_KEY_STORAGE_KEY = "localspeak.ownerKey.v1";

export function getOrCreateOwnerKey(): string {
  const ownerKey = tryGetOrCreateOwnerKey();
  if (!ownerKey) {
    throw new Error("Secure random generation is unavailable.");
  }
  return ownerKey;
}

export function tryGetOrCreateOwnerKey(): string | null {
  const existing = window.localStorage.getItem(OWNER_KEY_STORAGE_KEY);
  if (existing) return existing;

  const cryptoApi = globalThis.crypto;
  try {
    const ownerKey =
      typeof cryptoApi?.randomUUID === "function"
        ? cryptoApi.randomUUID()
        : createOwnerKeyFromSecureBytes(cryptoApi);
    window.localStorage.setItem(OWNER_KEY_STORAGE_KEY, ownerKey);
    return ownerKey;
  } catch {
    return null;
  }
}

function createOwnerKeyFromSecureBytes(cryptoApi: Crypto | undefined): string {
  if (typeof cryptoApi?.getRandomValues !== "function") {
    throw new Error("Secure random generation is unavailable.");
  }

  const bytes = new Uint8Array(16);
  cryptoApi.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(
    "",
  );
}
