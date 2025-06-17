"use client";
import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function PriceHistoryChart({ itemId, region, realmSlug }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    async function fetchHistory() {
      const res = await fetch(
        `/api/history?itemId=${itemId}&region=${region}&realmSlug=${realmSlug}`
      );
      const json = await res.json();
      setData(json);
    }

    fetchHistory();
  }, [itemId, region, realmSlug]);

  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer>
        <LineChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid stroke="#333" strokeDasharray="3 3" />
          <XAxis
            dataKey="timestamp"
            tickFormatter={(str) => new Date(str).toLocaleDateString()}
          />
          <YAxis />
          <Tooltip
            labelFormatter={(str) => new Date(str).toLocaleString()}
            formatter={(value, name) => [`${value.toLocaleString()}g`, name]}
          />
          <Line
            type="monotone"
            dataKey="userRealmPrice"
            stroke="#00ffaa"
            name="User Realm Price"
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="regionalAvgPrice"
            stroke="#8884d8"
            name="Regional Avg Price"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
