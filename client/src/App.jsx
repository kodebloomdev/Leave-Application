import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import LeaveHistory from "./pages/LeaveHistory";
import NewLeaveRequest from "./pages/NewLeaveRequest";
import Students from "./pages/Students";

// Principal pages
import PrincipalLayout from "./pages/principal/principal";
import PrincipalDashboard from "./pages/principal/Dashboard";
import Staff from "./pages/principal/Staff";
import Attendance from "./pages/principal/Attendance";
import TimeTable from "./pages/principal/TimeTable";
import LeaveManagement from "./pages/principal/LeaveManagement";
import Profile from "./pages/principal/Profile";



function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login Route */}
        <Route path="/" element={<Login />} />

        {/* Staff Routes with Layout */}
        <Route path="/dashboard" element={<Dashboard />}>
          <Route index element={<Dashboard />} />
          <Route path="leave-request" element={<NewLeaveRequest />} />
        </Route>
        <Route path="/leave-request" element={<NewLeaveRequest />} />
        <Route path="/leave-history" element={<LeaveHistory />} />

        <Route path="/students" element={<Students />} />

        {/* Principal Routes with Layout */}
        <Route path="/principal" element={<PrincipalLayout />}>
          <Route index element={<PrincipalDashboard />} />
          <Route path="staff" element={<Staff />} />
          <Route path="students" element={<Students />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="timetable" element={<TimeTable />} />
          <Route path="leave" element={<LeaveManagement />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
