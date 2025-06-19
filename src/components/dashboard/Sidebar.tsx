
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Upload, 
  History, 
  Settings, 
  Target, 
  Users, 
  Video,
  User,
  Home,
  PlusCircle
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Crear Video", href: "/create-video", icon: PlusCircle },
  { name: "Mis Videos", href: "/videos", icon: Video },
  { name: "Subir Video", href: "/upload", icon: Upload },
  { name: "Mi Perfil", href: "/my-profile", icon: User },
  { name: "Competidores", href: "/competitors", icon: Users },
  { name: "Estrategia", href: "/strategy", icon: Target },
  { name: "Historial", href: "/history", icon: History },
  { name: "Ajustes", href: "/settings", icon: Settings },
];

const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
      <div className="flex flex-col flex-grow pt-5 bg-white overflow-y-auto border-r border-gray-200">
        <div className="flex items-center flex-shrink-0 px-4">
          <img
            className="h-8 w-auto"
            src="/lovable-uploads/3c9a72c2-c7cb-434b-a53c-191e56b8a161.png"
            alt="FLOW"
          />
        </div>
        <div className="mt-5 flex-grow flex flex-col">
          <nav className="flex-1 px-2 pb-4 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href || 
                             (item.href !== "/" && location.pathname.startsWith(item.href));
              return (
                <Button
                  key={item.name}
                  asChild
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    isActive && "bg-flow-electric/10 text-flow-electric"
                  )}
                >
                  <Link to={item.href}>
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                </Button>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
