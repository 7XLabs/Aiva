"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import type { Business } from "@/lib/types";

interface FilterState {
  businessId: string | null; // null = all businesses
  businesses: Business[];
  setBusinessId: (id: string | null) => void;
}

const Ctx = createContext<FilterState>({
  businessId: null,
  businesses: [],
  setBusinessId: () => {},
});

export function useBusinessFilter() {
  return useContext(Ctx);
}

export function BusinessProvider({ children }: { children: React.ReactNode }) {
  const [businessId, setBusinessIdState] = useState<string | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);

  useEffect(() => {
    fetch("/api/businesses")
      .then((r) => r.json())
      .then(setBusinesses)
      .catch(() => {});
    const saved = localStorage.getItem("aiva.businessFilter");
    if (saved) setBusinessIdState(saved === "all" ? null : saved);
  }, []);

  function setBusinessId(id: string | null) {
    setBusinessIdState(id);
    localStorage.setItem("aiva.businessFilter", id ?? "all");
  }

  return (
    <Ctx.Provider value={{ businessId, businesses, setBusinessId }}>
      {children}
    </Ctx.Provider>
  );
}

export function BusinessSelect() {
  const { businessId, businesses, setBusinessId } = useBusinessFilter();
  return (
    <select
      value={businessId ?? "all"}
      onChange={(e) =>
        setBusinessId(e.target.value === "all" ? null : e.target.value)
      }
      className="rounded-xl border border-slate-700/80 bg-slate-900/80 px-3 py-2 text-sm outline-none transition focus:border-brand-500"
      title="Filter dashboard by business"
    >
      <option value="all">All businesses</option>
      {businesses.map((b) => (
        <option key={b.id} value={b.id}>
          {b.name}
        </option>
      ))}
    </select>
  );
}
