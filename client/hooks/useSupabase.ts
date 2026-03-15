import { useState, useEffect } from "react";

const SUPABASE_URL = "https://spmfgzvsdmbkrwjjhove.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_Id2cAFvp3qZ6vmEIlqfwJQ_M_t8k-3V";

interface Division {
  id: string;
  title: string;
  icon: string;
  div_status: "hiring" | "urgent" | "full";
  slots_oo: number;
  slots_cd: number;
  last_updated: string;
}

interface Driver {
  id: string;
  name: string;
  position: string;
  company: string;
  Truck: string;
  status: string;
  notes: string;
  division_id: string;
  created_at: string;
}

async function supabaseFetch(
  method: string,
  table: string,
  query: Record<string, string> | null = null,
  body: Record<string, any> | null = null
) {
  const headers: Record<string, string> = {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    "Content-Type": "application/json",
  };

  if (method === "POST") headers.Prefer = "return=representation";

  const opts: RequestInit = { method, headers };
  if (body) opts.body = JSON.stringify(body);

  let url = `${SUPABASE_URL}/rest/v1/${table}`;
  if (query) url += "?" + new URLSearchParams(query);

  try {
    const res = await fetch(url, opts);
    if (!res.ok) {
      console.error("Supabase error:", res.status, await res.text());
      return null;
    }
    const text = await res.text();
    return text ? JSON.parse(text) : null;
  } catch (e) {
    console.error("Fetch error:", e);
    return null;
  }
}

export function useSupabase() {
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [divData, drvData] = await Promise.all([
      supabaseFetch("GET", "divisions"),
      supabaseFetch("GET", "drivers"),
    ]);
    setDivisions(divData || []);
    setDrivers(drvData || []);
    setLoading(false);
  };

  const updateDriver = async (
    driverId: string | null,
    data: Partial<Driver>
  ) => {
    if (driverId) {
      // Update existing driver
      await supabaseFetch("PATCH", "drivers", { id: `eq.${driverId}` }, data);
      setDrivers((prev) =>
        prev.map((d) => (d.id === driverId ? { ...d, ...data } : d))
      );
    } else {
      // Create new driver
      const result = await supabaseFetch("POST", "drivers", null, data);
      if (result && result.length > 0) {
        setDrivers((prev) => [...prev, result[0]]);
      }
    }
  };

  const deleteDriver = async (driverId: string) => {
    await supabaseFetch("DELETE", "drivers", { id: `eq.${driverId}` });
    setDrivers((prev) => prev.filter((d) => d.id !== driverId));
  };

  const updateDivision = async (
    divisionId: string,
    data: Partial<Division>
  ) => {
    await supabaseFetch(
      "PATCH",
      "divisions",
      { id: `eq.${divisionId}` },
      data
    );
    setDivisions((prev) =>
      prev.map((d) => (d.id === divisionId ? { ...d, ...data } : d))
    );
  };

  return {
    divisions,
    drivers,
    loading,
    updateDriver,
    deleteDriver,
    updateDivision,
    loadData,
  };
}
