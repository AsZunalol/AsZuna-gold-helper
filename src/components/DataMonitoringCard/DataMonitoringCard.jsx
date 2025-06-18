"use client";
import { useState, useEffect } from "react";
import Spinner from "@/components/ui/spinner"; // ✅ Correct

const DataMonitoringCard = () => {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHealthData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/admin/health-check");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setHealthData(data);
      } catch (e) {
        console.error("Failed to fetch health data:", e);
        setError("Failed to load health data.");
      } finally {
        setLoading(false);
      }
    };

    fetchHealthData();
    // Set up an interval to refetch the data every minute
    const intervalId = setInterval(fetchHealthData, 60000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  const StatusIndicator = ({ status }) => {
    const isOk = status === "OK";
    const color = isOk ? "bg-green-500" : "bg-red-500";
    const pulse = isOk ? "" : "animate-pulse";
    return (
      <span
        className={`w-3 h-3 rounded-full inline-block mr-2 ${color} ${pulse}`}
      ></span>
    );
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md text-white h-full">
      {loading ? (
        <div className="flex items-center justify-center h-full">
          <Spinner />
        </div>
      ) : error ? (
        <div className="text-red-400 flex items-center justify-center h-full">
          <p>{error}</p>
        </div>
      ) : healthData ? (
        <ul className="space-y-3">
          <li className="flex justify-between items-center">
            <span className="font-semibold text-gray-300">
              Database Status:
            </span>
            <span className="flex items-center font-bold">
              <StatusIndicator status={healthData.database} />
              {healthData.database}
            </span>
          </li>
          <li className="flex justify-between items-center">
            <span className="font-semibold text-gray-300">Redis Status:</span>
            <span className="flex items-center font-bold">
              <StatusIndicator status={healthData.redis} />
              {healthData.redis}
            </span>
          </li>
          <li className="flex justify-between items-center">
            <span className="font-semibold text-gray-300">Blizzard API:</span>
            <span className="flex items-center font-bold">
              <StatusIndicator status={healthData.blizzardApi} />
              {healthData.blizzardApi}
            </span>
          </li>
          <li className="pt-2 mt-2 border-t border-gray-700">
            <p className="text-xs text-gray-400 text-center">
              Last Checked:{" "}
              {new Date(healthData.timestamp).toLocaleTimeString()}
            </p>
          </li>
        </ul>
      ) : (
        <div className="text-gray-400 flex items-center justify-center h-full">
          No data available.
        </div>
      )}
    </div>
  );
};

export default DataMonitoringCard;
