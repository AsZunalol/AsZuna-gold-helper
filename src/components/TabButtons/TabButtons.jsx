import { Button } from "@/components/ui/button";
import { LayoutDashboard, Users, BarChart2 } from "lucide-react";

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "users", label: "User Management", icon: Users },
  { id: "data", label: "Data & Monitoring", icon: BarChart2 },
];

export default function TabButtons({ activeTab, setActiveTab }) {
  return (
    <div className="flex gap-4 justify-center mb-10">
      {tabs.map(({ id, label, icon: Icon }) => (
        <Button
          key={id}
          onClick={() => setActiveTab(id)}
          variant={activeTab === id ? "default" : "outline"}
          className="rounded-full px-6 py-2 flex items-center gap-2"
        >
          <Icon size={18} />
          {label}
        </Button>
      ))}
    </div>
  );
}
