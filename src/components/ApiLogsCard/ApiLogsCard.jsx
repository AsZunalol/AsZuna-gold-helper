"use client";
import { useState, useEffect } from "react";
import Spinner from "@/components/ui/spinner"; // ✅ Correct
import { FiAlertTriangle, FiInfo, FiCheckCircle } from "react-icons/fi";

const ApiLogsCard = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/logs");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        // sort logs by timestamp descending and take the latest 10
        const sortedLogs = data.sort(
          (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
        );
        setLogs(sortedLogs.slice(0, 10));
      } catch (e) {
        console.error("Failed to fetch logs:", e);
        setError("Failed to load API logs.");
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
    // Refresh logs every 30 seconds
    const intervalId = setInterval(fetchLogs, 30000);

    // Cleanup on unmount
    return () => clearInterval(intervalId);
  }, []);

  const getLogLevelClass = (level) => {
    switch (level) {
      case "ERROR":
        return "text-red-400";
      case "WARN":
        return "text-yellow-400";
      case "INFO":
      default:
        return "text-blue-400";
    }
  };

  const getLogLevelIcon = (level) => {
    switch (level) {
      case "ERROR":
        return <FiAlertTriangle className="mr-2 text-red-500" />;
      case "WARN":
        return <FiAlertTriangle className="mr-2 text-yellow-500" />;
      case "INFO":
      default:
        return <FiInfo className="mr-2 text-blue-500" />;
    }
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md text-white h-full flex flex-col">
      {loading ? (
        <div className="flex items-center justify-center flex-grow">
          <Spinner />
        </div>
      ) : error ? (
        <div className="text-red-400 flex items-center justify-center flex-grow">
          <p>{error}</p>
        </div>
      ) : logs.length > 0 ? (
        <ul className="space-y-2 overflow-y-auto max-h-80 pr-2">
          {logs.map((log) => (
            <li key={log.id} className="text-xs p-2 bg-gray-700 rounded-md">
              <div className="flex justify-between items-center mb-1">
                <span
                  className={`font-bold flex items-center ${getLogLevelClass(
                    log.level
                  )}`}
                >
                  {getLogLevelIcon(log.level)}
                  {log.level}
                </span>
                <span className="text-gray-400">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-gray-300 break-words">{log.message}</p>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-gray-400 flex items-center justify-center flex-grow">
          <FiCheckCircle className="mr-2 text-green-500" /> No recent log
          entries.
        </div>
      )}
    </div>
  );
};

export default ApiLogsCard;
