import { NavLink } from "react-router-dom";
import {
  LayoutGrid,
  Users,
  UserCog,
  CalendarCheck,
  Calendar,
  FileCheck,
  User,
  LogOut
} from "lucide-react";

import schoolLogo from "../../assets/nosa-rs-logo.png";




export default function Sidebar() {
  const menu = [
    { name: "Dashboard", path: "/principal", icon: <LayoutGrid size={20} /> },
    { name: "Staff Management", path: "/principal/staff", icon: <Users size={20} /> },
    { name: "Student Management", path: "/principal/students", icon: <UserCog size={20} /> },
    { name: "Attendance", path: "/principal/attendance", icon: <CalendarCheck size={20} /> },
    { name: "Time Table", path: "/principal/timetable", icon: <Calendar size={20} /> },
    { name: "Leave Management", path: "/principal/leave", icon: <FileCheck size={20} /> },
    { name: "Profile", path: "/principal/profile", icon: <User size={20} /> },
  ];

  return (
    <aside className="w-64 bg-white shadow-md h-screen fixed left-0 top-0 flex flex-col border-r">
      
     {/* 🔷 LOGO + SCHOOL NAME */}
           <div className="bg-blue-400 text-white p-3.5 flex flex-col items-center justify-center border-b">
             <img
               src={schoolLogo}
               alt="NLVRGSRV School Logo"
               className="w-16 h-16 object-contain mb-2"
             />
             <h1 className="text-sm font-semibold text-center leading-tight">
               NLVRGSRV <br /> Residential School
             </h1>
           </div>

      {/* Menu Items */}
      <nav className="flex-1 p-3 space-y-2">
        {menu.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 p-2 rounded-md cursor-pointer transition ${
                isActive
                  ? "bg-blue-400 text-white shadow-sm"
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
        <button className="flex items-center gap-3 w-full p-2 rounded-md text-red-600 hover:bg-red-100 transition" onClick={()=>{
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          localStorage.removeItem("role");
          window.location.href = "/";
        }}>
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </aside>
  );
}
