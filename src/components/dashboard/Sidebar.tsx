
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Target, History, Settings, Upload, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const DashboardSidebar = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  const getInitials = () => {
    if (!user) return "??";
    const email = user.email || "";
    return email.substring(0, 2).toUpperCase();
  };
  
  const menuItems = [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      path: "/dashboard",
      description: "Panel principal"
    },
    {
      icon: Target,
      label: "Estrategia",
      path: "/strategy",
      description: "Define tu contenido"
    },
    {
      icon: Upload,
      label: "Subir Reel",
      path: "/upload",
      description: "Carga nuevos videos"
    },
    {
      icon: History,
      label: "Historial",
      path: "/history",
      description: "Análisis anteriores"
    },
    {
      icon: Settings,
      label: "Ajustes",
      path: "/settings",
      description: "Configura tu cuenta"
    }
  ];

  return (
    <Sidebar variant="inset">
      <SidebarHeader className="border-b p-4">
        <Link to="/dashboard" className="flex items-center gap-2">
          <img src="/lovable-uploads/3c9a72c2-c7cb-434b-a53c-191e56b8a161.png" alt="FLOW Logo" className="h-8" />
          <span className="font-medium text-lg">FLOW</span>
        </Link>
      </SidebarHeader>
      
      <SidebarContent className="py-4">
        {user && (
          <div className="px-4 mb-4">
            <div className="flex items-center gap-3 mb-2">
              <Avatar className="h-9 w-9">
                <AvatarImage src="" alt="Avatar" />
                <AvatarFallback>{getInitials()}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{user.user_metadata?.first_name || 'Usuario'}</p>
                <p className="text-xs text-muted-foreground truncate max-w-[150px]">{user.email}</p>
              </div>
            </div>
          </div>
        )}
        
        <SidebarGroup>
          <SidebarGroupLabel>Navegación</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.path)}
                    tooltip={item.description}
                  >
                    <Link to={item.path} className="flex items-center gap-3">
                      <item.icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="border-t p-4">
        <div className="flex flex-col gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start text-muted-foreground" 
            onClick={() => signOut()}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Cerrar sesión
          </Button>
          <div className="text-xs text-muted-foreground text-center">
            FLOW © 2023-2025
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default DashboardSidebar;
