import { useSyncExternalStore } from "react";
import { getSession, onSessionChange } from "../api/index.js";

/** Qui est connecté ? Se met à jour tout seul à la connexion / déconnexion. */
export default function useSession() {
  const session = useSyncExternalStore(onSessionChange, getSession, getSession);
  const user = session?.user || null;
  return { user, isAdmin: user?.role === "admin", isClient: user?.role === "client" };
}
