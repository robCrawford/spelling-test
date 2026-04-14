const localStoragePrefix = "tiles-";

export const localStorageKeys = {
  characterIndex: "character-index"
};

export function reloadPage(): void {
  window.location.reload();
}

export function setLocalStorage(key: string, value: string): void {
  window.localStorage.setItem(localStoragePrefix + key, value);
}

export function getLocalStorage(key: string): string | null {
  return window.localStorage.getItem(localStoragePrefix + key);
}
