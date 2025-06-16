"use client";

import { useEffect, useState } from "react";

export default function RegionRealmSelector({
  onChange,
  defaultRegion = "us",
  defaultRealm = "stormrage",
}) {
  const [region, setRegion] = useState("");
  const [realm, setRealm] = useState("");
  const [realms, setRealms] = useState([]);

  // Load from localStorage or default
  useEffect(() => {
    const storedRegion = localStorage.getItem("region") || defaultRegion;
    const storedRealm = localStorage.getItem("realm") || defaultRealm;
    setRegion(storedRegion);
    setRealm(storedRealm);
  }, [defaultRegion, defaultRealm]);

  // Fetch realms when region is set
  useEffect(() => {
    if (!region) return;

    async function loadRealms() {
      try {
        console.log("Fetching realms for region:", region);
        const res = await fetch(`/api/blizzard/realms?region=${region}`);
        const data = await res.json();
        console.log("Fetched realms:", data);
        setRealms(Array.isArray(data) ? data : []);

        if (!data.find((r) => r.slug === realm) && data.length > 0) {
          setRealm(data[0].slug);
        }
      } catch (err) {
        console.error("Failed to fetch realms", err);
        setRealms([]);
      }
    }

    loadRealms();
  }, [region]);

  // Fire onChange and persist to localStorage
  useEffect(() => {
    if (region && realm) {
      onChange({ region, realm });
      localStorage.setItem("region", region);
      localStorage.setItem("realm", realm);
    }
  }, [region, realm, onChange]);

  return (
    <div className="form-group">
      <label htmlFor="region-select">Region</label>
      <select
        id="region-select"
        className="select-field"
        value={region}
        onChange={(e) => setRegion(e.target.value)}
      >
        <option value="us">North America</option>
        <option value="eu">Europe</option>
        <option value="kr">Korea</option>
        <option value="tw">Taiwan</option>
      </select>

      <label htmlFor="realm-select">Realm</label>
      <select
        id="realm-select"
        className="select-field"
        value={realm}
        onChange={(e) => setRealm(e.target.value)}
      >
        {realms.map((r) => (
          <option key={r.slug} value={r.slug}>
            {r.name}
          </option>
        ))}
      </select>
    </div>
  );
}
