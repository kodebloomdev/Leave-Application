import { Outlet } from "react-router-dom";
import PrincipalSidebar from "./siddebar";
import PrincipalHeader from "./header";
import PrincipalFooter from "./Footer";

export default function PrincipalLayout() {
  return (
    <div className="flex min-h-screen w-full">
      
      {/* Sidebar Left */}
      <div className="fixed left-0 top-0 h-full">
        <PrincipalSidebar />
      </div>

      {/* Right Section */}
      <div className="flex flex-col w-full ml-64">
        
        {/* Header */}
        <PrincipalHeader principalName="Principal" />

        {/* Main Content */}
        <main className="flex-1 p-6 bg-gray-50 overflow-y-auto">
          <Outlet />  {/* This renders PrincipalDashboard */}
        </main>

        {/* Footer */}
        <PrincipalFooter />
      </div>
    </div>
  );
}
