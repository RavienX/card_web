import { useState } from "react";
import { SideCtx } from "./sideContext";

export function SideProvider({ children }) {
  const [lines, set] = useState([]);
  return <SideCtx.Provider value={{ lines, set }}>{children}</SideCtx.Provider>;
}
