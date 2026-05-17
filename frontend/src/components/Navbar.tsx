"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  MessageSquare, 
  FileText, 
  ClipboardList, 
  BarChart3, 
  LogOut,
  Video,
  Layers,
  Calendar
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  // Hide sidebar on landing, login, and register pages
  if (pathname === "/" || pathname === "/login" || pathname === "/register") {
    return null;
  }

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "AI Chat", href: "/chat", icon: MessageSquare },
    { name: "YouTube", href: "/youtube", icon: Video },
    { name: "Notes", href: "/notes", icon: FileText },
    { name: "Flashcards", href: "/flashcards", icon: Layers },
    { name: "Quiz", href: "/quiz", icon: ClipboardList },
    { name: "Planner", href: "/planner", icon: Calendar },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <nav className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col z-20">
      <div className="p-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-200">
            A
          </div>
          <span className="font-black text-xl tracking-tight text-gray-900">AI Tutor</span>
        </div>
      </div>

      <div className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                isActive 
                  ? "bg-blue-50 text-blue-600 shadow-sm" 
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <item.icon size={20} />
              {item.name}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all"
        >
          <LogOut size={20} />
          Log Out
        </button>
      </div>
    </nav>
  );
}
