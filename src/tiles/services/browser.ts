const localStoragePrefix = "tiles-";

export const localStorageKeys = {
  celebrationImgIndex: "celebration-img",
  rewards: "rewards",
  redeemed: "redeemed"
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

export function getRewardsDisplayAmount(): number {
  const total = Number(getLocalStorage(localStorageKeys.rewards) || 0);
  const redeemed = Number(getLocalStorage(localStorageKeys.redeemed) || 0);
  return Math.max(0, total - redeemed);
}

export function addReward(points: number): void {
  const total = Number(getLocalStorage(localStorageKeys.rewards) || 0);
  setLocalStorage(localStorageKeys.rewards, String(total + points));
}

export function redeemAllRewards(): void {
  const total = Number(getLocalStorage(localStorageKeys.rewards) || 0);
  setLocalStorage(localStorageKeys.redeemed, String(total));
}
