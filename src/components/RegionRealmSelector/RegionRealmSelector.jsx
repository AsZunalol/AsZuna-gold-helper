"use client";

import { useEffect, useState } from "react";

export default function RegionRealmSelector({
  region,
  realm,
  onRegionChange,
  onRealmChange,
}) {
  const [realms, setRealms] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!region) return;

    const loadRealms = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/blizzard/realms?region=${region}`);
        if (!res.ok) throw new Error("Failed to fetch realms");
        const data = await res.json();
        setRealms(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch realms", err);
        setRealms([]);
      } finally {
        setLoading(false);
      }
    };

    loadRealms();
  }, [region]);

  return (
    <>
      <div className="form-group">
        <label htmlFor="region-select">Region</label>
        <select
          id="region-select"
          className="select-field"
          value={region}
          onChange={(e) => onRegionChange(e.target.value)}
        >
          <option value="us">North America</option>
          <option value="eu">Europe</option>
          <option value="kr">Korea</option>
          <option value="tw">Taiwan</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="realm-select">Realm</label>
        <select
          id="realm-select"
          className="select-field"
          value={realm}
          onChange={(e) => onRealmChange(e.target.value)}
          disabled={loading || !region}
        >
          {loading ? (
            <option>Loading realms...</option>
          ) : (
            realms.map((r) => (
              <option key={r.slug} value={r.slug}>
                {r.name}
              </option>
            ))
          )}
        </select>
      </div>
    </>
  );
}
