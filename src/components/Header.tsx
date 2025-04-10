
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { Home, Upload, History, ChevronDown } from "lucide-react";

const Header = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  
  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };
  
  const getInitials = () => {
    if (!user) return "??";
    const email = user.email || "";
    return email.substring(0, 2).toUpperCase();
  };
  
  return (
    <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2">
            <img 
              src="/lovable-uploads/3c9a72c2-c7cb-434b-a53c-191e56b8a161.png" 
              alt="FLOW Logo" 
              className="h-8" 
            />
            <span className="font-medium text-lg bg-gradient-to-r from-flow-blue to-flow-accent bg-clip-text text-transparent">
              Analiza con Flow
            </span>
          </Link>
          
          <nav className="hidden md:flex gap-6">
            <Link
              to="/dashboard"
              className={`text-sm font-medium transition-colors flex items-center gap-1 ${
                isActiveRoute("/dashboard")
                  ? "text-flow-blue"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Inicio</span>
            </Link>
            <Link
              to="/upload"
              className={`text-sm font-medium transition-colors flex items-center gap-1 ${
                isActiveRoute("/upload")
                  ? "text-flow-blue"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>Subir Reel</span>
            </Link>
            <Link
              to="/history"
              className={`text-sm font-medium transition-colors flex items-center gap-1 ${
                isActiveRoute("/history")
                  ? "text-flow-blue"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <History className="w-4 h-4" />
              <span>Historial</span>
            </Link>
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2 text-sm">
                <Avatar className="h-7 w-7">
                  <AvatarImage src="" alt="Avatar" />
                  <AvatarFallback>{getInitials()}</AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline-block">Mi cuenta</span>
                <ChevronDown className="h-4 w-4 opacity-70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {user && <DropdownMenuItem className="font-medium">{user.email}</DropdownMenuItem>}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/history">Mi historial</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/settings">Ajustes</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut()}>
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
