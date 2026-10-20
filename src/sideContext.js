import { createContext, useContext, useEffect } from "react";

/* The path lines at the right of the header (Products & Collections / Toys & Hobbies / ... / this card's path).
   The card on screen sends its lines here; the header shows them. */
export const SideCtx = createContext({ lines: [], set: () => {} });
export const useSideLines = () => useContext(SideCtx).lines;
export function useSide(lines) {
  const { set } = useContext(SideCtx);
  const key = lines.join("|");
  useEffect(() => { set(key ? key.split("|") : []); return () => set([]); }, [key, set]);
}
