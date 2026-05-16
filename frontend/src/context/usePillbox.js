import { useContext } from "react";
import { PillboxContext } from "./pillboxContextValue";

export function usePillbox() {
  const context = useContext(PillboxContext);

  if (!context) {
    throw new Error("usePillbox must be used inside PillboxProvider.");
  }

  return context;
}
