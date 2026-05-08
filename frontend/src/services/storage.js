import * as FileSystem from "expo-file-system";

const memoryStore = new Map();
const STORAGE_DIR = FileSystem.documentDirectory ? `${FileSystem.documentDirectory}local-store` : null;

const ensureDir = async () => {
  if (!STORAGE_DIR) {
    return;
  }

  const info = await FileSystem.getInfoAsync(STORAGE_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(STORAGE_DIR, { intermediates: true });
  }
};

const buildPath = (key) => `${STORAGE_DIR}/${key}.json`;

export async function saveLocal(key, value) {
  if (!STORAGE_DIR) {
    memoryStore.set(key, value);
    return { key, value };
  }

  await ensureDir();
  const path = buildPath(key);
  await FileSystem.writeAsStringAsync(path, JSON.stringify(value));
  return { key, value };
}

export async function loadLocal(key, defaultValue = null) {
  if (!STORAGE_DIR) {
    return memoryStore.has(key) ? memoryStore.get(key) : defaultValue;
  }

  await ensureDir();
  const path = buildPath(key);
  const info = await FileSystem.getInfoAsync(path);
  if (!info.exists) {
    return defaultValue;
  }

  try {
    const content = await FileSystem.readAsStringAsync(path);
    return JSON.parse(content);
  } catch (error) {
    console.warn("Failed to parse local storage", error);
    return defaultValue;
  }
}

export async function appendLocalArray(key, entry, limit = 120) {
  const current = await loadLocal(key, []);
  const next = Array.isArray(current) ? [...current, entry] : [entry];
  const trimmed = limit ? next.slice(-limit) : next;
  await saveLocal(key, trimmed);
  return trimmed;
}
