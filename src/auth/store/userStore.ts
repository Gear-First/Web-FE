export type UserProfile = {
  name: string;
  email?: string;
};

type Listener = () => void;

let profile: UserProfile | null = null;
const listeners = new Set<Listener>();

export function setUserProfile(next: UserProfile | null): void {
  profile = next;
  listeners.forEach((listener) => listener());
}

export function getUserProfile(): UserProfile | null {
  return profile;
}

export function clearUserProfile(): void {
  setUserProfile(null);
}

export function subscribeToUserProfile(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
