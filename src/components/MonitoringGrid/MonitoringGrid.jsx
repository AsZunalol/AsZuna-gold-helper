"use client";
import React from "react";
import DataMonitoringCard from "../../components/DataMonitoringCard/DataMonitoringCard";
import ApiLogsCard from "../../components/ApiLogsCard/ApiLogsCard";
import UserManagementTable from "../../components/UserManagementTable/UserManagementTable";

const MonitoringGrid = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="lg:col-span-2 bg-gray-700 p-4 rounded-lg">
        <h3 className="text-xl font-bold mb-4">User Management</h3>
        <UserManagementTable />
      </div>
      <div className="bg-gray-700 p-4 rounded-lg h-full min-h-[250px] flex flex-col">
        <h3 className="text-xl font-bold mb-4">Data Monitoring</h3>
        <div className="flex-grow overflow-hidden">
          <DataMonitoringCard />
        </div>
      </div>
      <div className="bg-gray-700 p-4 rounded-lg h-full min-h-[250px] flex flex-col">
        <h3 className="text-xl font-bold mb-4">API Logs</h3>
        <div className="flex-grow overflow-hidden">
          <ApiLogsCard />
        </div>
      </div>
    </div>
  );
};

export default MonitoringGrid;
