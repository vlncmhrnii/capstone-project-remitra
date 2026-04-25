"use client";

import { useSyncExternalStore } from "react";

const defaultProfile = {
  id: "",
  name: "Pengguna",
  email: "",
  storeName: "",
  createdAt: "",
};

let state = {
  profile: defaultProfile,
};

const listeners = new Set();

function emitChange() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return state;
}

function normalizeProfile(payload = {}) {
  const userMeta = payload.user_metadata || payload.userMetadata || {};

  return {
    id: payload.id || "",
    name:
      userMeta.full_name ||
      userMeta.name ||
      payload.email ||
      defaultProfile.name,
    email: payload.email || "",
    storeName: userMeta.nama_toko || userMeta.store_name || "",
    createdAt: payload.created_at || "",
  };
}

function setProfile(profileInput = {}) {
  state = {
    ...state,
    profile: {
      ...defaultProfile,
      ...normalizeProfile(profileInput),
    },
  };
  emitChange();
}

function clearProfile() {
  state = {
    ...state,
    profile: defaultProfile,
  };
  emitChange();
}

export function useAuthProfileStore(selector = (store) => store) {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return selector(snapshot);
}

export { setProfile, clearProfile, normalizeProfile };
