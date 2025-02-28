import { useLocation } from "react-router-dom";
import { Navbar } from "./Navbar";
import APINavbar from "./APINavbar.tsx";

interface LayoutProps {
  children: React.ReactNode;
  userType: string; // Add the new parameter
}

const Layout = ({ children, userType }: LayoutProps) => {
  const location = useLocation();
  const isAPIRoute = location.pathname.startsWith("/api");

  return (
    <div className="min-h-screen flex flex-col">
      {isAPIRoute ? <APINavbar /> : <Navbar userType={userType} />}
      <main className="container mx-auto p-6 pt-16 flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

export default Layout;
