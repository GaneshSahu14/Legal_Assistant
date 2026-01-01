import { Link, useLocation } from "react-router-dom";
import { FileText, Upload, GitCompare, MessageSquare, Home, LogOut, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";

const Navbar = () => {
  const location = useLocation();
  const { isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/dashboard", label: "Dashboard", icon: FileText },
    { path: "/upload", label: "Upload", icon: Upload },
    { path: "/compare", label: "Compare", icon: GitCompare },
    { path: "/chat", label: "Chat", icon: MessageSquare },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-300">
      <div className="container flex h-16 items-center">
        <Link to="/" className="flex items-center space-x-2 transition-all duration-300 hover:scale-105 group">
          <FileText className="h-6 w-6 text-primary transition-transform duration-300 group-hover:rotate-12" />
          <span className="font-bold text-xl transition-colors duration-300">LegalAssist</span>
        </Link>

        <div className="flex flex-1 items-center justify-end space-x-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Button
                key={item.path}
                variant={isActive ? "default" : "ghost"}
                asChild
                className={cn(
                  "transition-all duration-300 hover:scale-105 hover:shadow-md active:scale-95",
                  isActive && "shadow-lg scale-105"
                )}
              >
                <Link to={item.path} className="flex items-center">
                  <Icon className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                  <span className="transition-all duration-300">{item.label}</span>
                </Link>
              </Button>
            );
          })}
          <Button
            variant="ghost"
            onClick={toggleTheme}
            className="transition-all duration-300 hover:scale-105 hover:shadow-md active:scale-95"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
          {isAuthenticated && (
            <Button
              variant="ghost"
              onClick={logout}
              className="transition-all duration-300 hover:scale-105 hover:shadow-md active:scale-95"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
