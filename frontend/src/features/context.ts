import { createContext, useContext } from "react";
import type { Session, DemoData } from "../lib/types";
type Store = {
  session: Session | null;
  ready: boolean;
  login: (session: Session) => void;
  logout: () => void;
  data: DemoData;
  update: (fn: (data: DemoData) => DemoData) => void;
  toast: (text: string) => void;
  notice: string;
};
export const Context = createContext<Store | null>(null);
export function useStore() {
  const value = useContext(Context);
  if (!value) throw new Error("StoreProvider is required");
  return value;
}
