
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ChevronDown } from "lucide-react";

const Header = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  
  const isLandingPage = location.pathname === '/';
  const isAuthPage = location.pathname === '/auth';
  
  // Movida al inicio para solucionar el error TS2448
  const getInitials = () => {
    if (!user) return "??";
    const email = user.email || "";
    return email.substring(0, 2).toUpperCase();
  };
  
  // Si estamos en una página protegida y el usuario está logueado,
  // no mostramos el header completo, ya que usaremos la barra lateral
  if (user && !isLandingPage && !isAuthPage) {
    return (
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container flex h-16 items-center justify-between px-4">
          <SidebarTrigger />
          
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
  }
  
  // Para landing page y auth page, mostramos el header original
  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2">
            <img src="/lovable-uploads/3c9a72c2-c7cb-434b-a53c-191e56b8a161.png" alt="FLOW Logo" className="h-8" />
            <span className="font-medium text-lg bg-gradient-to-r from-flow-blue to-flow-accent bg-clip-text text-transparent">
            </span>
          </Link>
        </div>
        
        <div className="flex items-center gap-4">
          {user ? (
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
          ) : (
            <>
              {location.pathname !== '/auth' && (
                <Button asChild variant="default">
                  <Link to="/auth">Iniciar sesión</Link>
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
