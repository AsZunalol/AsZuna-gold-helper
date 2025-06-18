// src/app/admin/page.jsx
"use client";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ROLES } from "@/lib/constants";
import { useEffect, useState } from "react";
import { FaUsers, FaFileAlt, FaShieldAlt } from "react-icons/fa";
import MonitoringGrid from "../../components/MonitoringGrid/MonitoringGrid";
import Spinner from "@/components/ui/spinner";

const AdminPage = () => {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState({ users: 0, guides: 0 });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoadingStats(true);
      try {
        const [usersRes, guidesRes] = await Promise.all([
          fetch("/api/users"),
          fetch("/api/guides"),
        ]);

        const usersData = await usersRes.json();
        const guidesData = await guidesRes.json();

        setStats({
          users: usersData?.length || 0,
          guides: guidesData?.length || 0,
        });
      } catch (error) {
        console.error("Failed to fetch stats:", error);
        setStats({ users: "N/A", guides: "N/A" });
      } finally {
        setLoadingStats(false);
      }
    };

    const role = session?.user?.role?.toLowerCase();
    if (role === ROLES.ADMIN || role === ROLES.OWNER) {
      fetchStats();
    }
  }, [session]);

  const role = session?.user?.role?.toLowerCase();
  if (
    status !== "loading" &&
    (!session || (role !== ROLES.ADMIN && role !== ROLES.OWNER))
  ) {
    redirect("/");
  }

  const StatCard = ({ icon, title, value, color, loading }) => (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg flex items-center">
      <div className={`mr-4 ${color}`}>{icon}</div>
      <div>
        <p className="text-sm text-gray-400">{title}</p>
        {loading ? <Spinner /> : <p className="text-2xl font-bold">{value}</p>}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-400">
            Welcome back, {session?.user?.name || "Admin"}.
          </p>
        </header>

        {/* Stats Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard
            icon={<FaUsers size={32} />}
            title="Total Users"
            value={stats.users}
            color="text-blue-400"
            loading={loadingStats}
          />
          <StatCard
            icon={<FaFileAlt size={32} />}
            title="Total Guides"
            value={stats.guides}
            color="text-green-400"
            loading={loadingStats}
          />
          <StatCard
            icon={<FaShieldAlt size={32} />}
            title="Your Role"
            value={session?.user?.role}
            color="text-purple-400"
            loading={false}
          />
        </section>

        {/* Action Buttons */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link
              href="/admin/create-guide"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 px-6 rounded-lg text-center transition duration-300 flex flex-col justify-center items-center shadow-lg"
            >
              <h3 className="text-xl">Create Farming Guide</h3>
              <p className="text-sm opacity-80 mt-1">
                Start a new gold farming guide.
              </p>
            </Link>
            <Link
              href="/admin/guides-list"
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-6 px-6 rounded-lg text-center transition duration-300 flex flex-col justify-center items-center shadow-lg"
            >
              <h3 className="text-xl">Manage Guides</h3>
              <p className="text-sm opacity-80 mt-1">
                Edit, delete, or update guides.
              </p>
            </Link>
            {role === ROLES.OWNER && (
              <Link
                href="/admin/owner-hub"
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-6 px-6 rounded-lg text-center transition duration-300 flex flex-col justify-center items-center shadow-lg"
              >
                <h3 className="text-xl">Owner Hub</h3>
                <p className="text-sm opacity-80 mt-1">
                  Access owner-only settings.
                </p>
              </Link>
            )}
          </div>
        </section>

        <section className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4">System Monitoring</h2>
          <MonitoringGrid />
        </section>
      </div>
    </div>
  );
};

export default AdminPage;
