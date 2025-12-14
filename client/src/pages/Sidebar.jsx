import { NavLink } from "react-router-dom";
import {
  LayoutGrid,
  Users,
  CalendarCheck,
  Calendar,
  FileCheck,
  History,
  User,
  LogOut
} from "lucide-react";

export default function StaffSidebar() {
  const menu = [
    { name: "Dashboard", path: "/dashboard", icon: <LayoutGrid size={20} /> },
    { name: "Students", path: "/students", icon: <Users size={20} /> },
    { name: "Attendance", path: "/attendance", icon: <CalendarCheck size={20} /> },
    { name: "Time Table", path: "/timetable", icon: <Calendar size={20} /> },
    { name: "Leave Requests", path: "/leave-request", icon: <FileCheck size={20} /> },
    { name: "Leave History", path: "/leave-history", icon: <History size={20} /> },

    { name: "Profile", path: "/profile", icon: <User size={20} /> },
  ];

  return (
    <aside className="w-64 bg-white shadow-md h-screen fixed left-0 top-0 flex flex-col border-r">

      {/* Title */}
      <div className="bg-purple-600 text-white font-semibold text-xl p-4 text-center">
        Staff Panel
      </div>

      {/* Menu */}
      <nav className="flex-1 p-3 space-y-2">
        {menu.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 p-2 rounded-md transition ${
                isActive
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-gray-700 hover:bg-purple-100"
              }`
            }
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3">
        <button
          className="flex items-center gap-3 w-full p-2 rounded-md text-red-600 hover:bg-red-100 transition"
          onClick={() => {
            localStorage.clear();
            window.location.href = "/";
          }}
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </aside>
  );
}
