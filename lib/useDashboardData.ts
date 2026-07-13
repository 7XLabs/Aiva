"use client";

import { useEffect, useState } from "react";
import { useBusinessFilter } from "@/components/BusinessFilter";
import type { Appointment, CallLog, Order } from "./types";

export interface DashboardData {
  appointments: Appointment[];
  orders: Order[];
  calls: CallLog[];
}

// Polls the dashboard API so bookings from the demo show up live.
export function useDashboardData(intervalMs = 5000) {
  const { businessId } = useBusinessFilter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function fetchData() {
      try {
        const url = businessId
          ? `/api/dashboard?businessId=${encodeURIComponent(businessId)}`
          : "/api/dashboard";
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as DashboardData;
        if (active) {
          setData(json);
          setError(null);
        }
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : "fetch failed");
      }
    }
    fetchData();
    const t = setInterval(fetchData, intervalMs);
    return () => {
      active = false;
      clearInterval(t);
    };
  }, [intervalMs, businessId]);

  return { data, error };
}
