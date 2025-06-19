
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { ChevronDown } from "lucide-react";
import BackButton from "@/components/ui/back-button";

const Header = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  
  const isAuthPage = location.pathname === '/auth';
  const isHistoryPage = location.pathname === '/history';
  const isDashboardPage = location.pathname === '/dashboard';

  const getInitials = () => {
    if (!user) return "??";
    const email = user.email || "";
    return email.substring(0, 2).toUpperCase();
  };
  
  // Para la página de auth, mostramos un header simple
  if (isAuthPage) {
    return (
      <header className="border-b bg-white/95 backdrop-blur-md sticky top-0 z-40 w-full">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2">
              <img src="/lovable-uploads/3c9a72c2-c7cb-434b-a53c-191e56b8a161.png" alt="FLOW Logo" className="h-8" />
            </Link>
          </div>
        </div>
      </header>
    );
  }
  
  // Evitar mostrar cabecera en historial
  if (isHistoryPage) {
    return null;
  }

  return (
    <header className="border-b bg-white/95 backdrop-blur-md sticky top-0 z-40 w-full">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Botón de retroceso solo en páginas que no sean dashboard */}
        <div className="flex items-center gap-4">
          {!isDashboardPage && (
            <BackButton />
          )}
        </div>
        
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2 text-sm">
                <Avatar className="h-7 w-7">
                  <AvatarImage src="" alt="Avatar" />
                  <AvatarFallback>{getInitials()}</AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline-block font-medium">Mi cuenta</span>
                <ChevronDown className="h-4 w-4 opacity-70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {user && <DropdownMenuItem className="font-medium">{user.email}</DropdownMenuItem>}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/dashboard/settings" className="font-medium">Ajustes</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut()} className="font-medium">
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
