"use client";

import { useState, useEffect, useTransition } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import ApiHealthStatus from "@/components/ApiHealthStatus/ApiHealthStatus";
import UserManagementTable from "@/components/UserManagementTable/UserManagementTable";
import MonitoringGrid from "@/components/MonitoringGrid/MonitoringGrid";
import { LayoutDashboard, Users, BarChart2 } from "lucide-react";
// --- THIS IS THE FIX ---
// The path is now all lowercase to match your file system
import Button from "@/components/ui/button";
import styles from "./ownerHub.module.css";

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "users", label: "User Management", icon: Users },
  { id: "data", label: "Data & Monitoring", icon: BarChart2 },
];

export default function OwnerHubPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [lastUpdate, setLastUpdate] = useState("");
  const [nextUpdate, setNextUpdate] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "OWNER") {
      router.push("/");
    }
  }, [session, status, router]);

  useEffect(() => {
    const now = new Date();
    now.setMinutes(0, 0, 0);
    const next = new Date(now);
    next.setHours(now.getHours() + 1);
    setLastUpdate(now.toLocaleString());
    setNextUpdate(next.toLocaleString());
  }, []);

  if (status === "loading" || !session || session.user.role !== "OWNER")
    return null;

  return (
    <div className={styles.pageBackground}>
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <h1 style={{ fontSize: "1.875rem", fontWeight: "bold" }}>
            Owner Hub
          </h1>
          <p style={{ fontSize: "0.875rem", color: "#ccc" }}>
            Welcome, {session.user.name}
          </p>
        </div>

        <div className={styles.container}>
          <div
            style={{
              display: "flex",
              gap: "1rem",
              justifyContent: "center",
              marginBottom: "2.5rem",
              flexWrap: "wrap",
            }}
          >
            {tabs.map(({ id, label, icon }) => (
              <Button
                key={id}
                onClick={() => startTransition(() => setActiveTab(id))}
                variant={activeTab === id ? "default" : "outline"}
                icon={icon}
                loading={isPending && activeTab !== id}
              >
                {label}
              </Button>
            ))}
          </div>

          <div
            style={{
              display: "grid",
              gap: "1.5rem",
              transition: "opacity 0.3s ease-in-out",
              opacity: isPending ? 0.5 : 1,
            }}
          >
            {activeTab === "dashboard" && (
              <div
                style={{
                  display: "grid",
                  gap: "1rem",
                  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                }}
              >
                <div className={styles.card}>
                  <h3
                    style={{
                      fontSize: "1.125rem",
                      fontWeight: "600",
                      marginBottom: "0.5rem",
                    }}
                  >
                    API Health
                  </h3>
                  <ApiHealthStatus />
                </div>
              </div>
            )}

            {activeTab === "users" && (
              <div>
                <UserManagementTable />
              </div>
            )}

            {activeTab === "data" && (
              <MonitoringGrid lastUpdate={lastUpdate} nextUpdate={nextUpdate} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
