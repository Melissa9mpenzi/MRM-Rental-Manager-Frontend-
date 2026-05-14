import { create } from "zustand";

function storageKey(userId) {
  return `rd_saved_listings_v1_${userId ?? 0}`;
}

/**
 * Saved listing IDs per user in localStorage until a backend favourites API exists.
 */
export const useSavedListingsStore = create((set, get) => ({
  userKey: null,
  ids: [],

  hydrate: (userId) => {
    const uid = userId ?? 0;
    try {
      const raw = localStorage.getItem(storageKey(uid));
      const parsed = raw ? JSON.parse(raw) : [];
      const ids = Array.isArray(parsed) ? parsed.map(Number).filter((n) => !Number.isNaN(n)) : [];
      set({ userKey: uid, ids });
    } catch {
      set({ userKey: uid, ids: [] });
    }
  },

  toggle: (listingId, userId) => {
    const uid = userId ?? 0;
    if (get().userKey !== uid) get().hydrate(uid);
    const n = Number(listingId);
    const prev = [...get().ids];
    const i = prev.indexOf(n);
    if (i >= 0) prev.splice(i, 1);
    else prev.push(n);
    localStorage.setItem(storageKey(uid), JSON.stringify(prev));
    set({ ids: prev, userKey: uid });
  },

  remove: (listingId, userId) => {
    const uid = userId ?? 0;
    if (get().userKey !== uid) get().hydrate(uid);
    const n = Number(listingId);
    const prev = get().ids.filter((id) => id !== n);
    localStorage.setItem(storageKey(uid), JSON.stringify(prev));
    set({ ids: prev, userKey: uid });
  },

  isSaved: (listingId) => get().ids.includes(Number(listingId)),
}));
