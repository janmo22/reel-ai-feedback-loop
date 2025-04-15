
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Target, History, Settings, Upload } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";

const DashboardSidebar = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  const menuItems = [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      path: "/dashboard",
    },
    {
      icon: Target,
      label: "Estrategia",
      path: "/strategy",
    },
    {
      icon: Upload,
      label: "Subir Reel",
      path: "/upload",
    },
    {
      icon: History,
      label: "Historial",
      path: "/history",
    },
    {
      icon: Settings,
      label: "Ajustes",
      path: "/settings",
    }
  ];

  return (
    <Sidebar variant="inset">
      <SidebarHeader className="border-b p-4">
        <Link to="/dashboard" className="flex items-center gap-2">
          <img src="/lovable-uploads/3c9a72c2-c7cb-434b-a53c-191e56b8a161.png" alt="FLOW Logo" className="h-8" />
        </Link>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.path}>
              <SidebarMenuButton
                asChild
                isActive={isActive(item.path)}
                tooltip={item.label}
              >
                <Link to={item.path} className="flex items-center gap-3">
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <div className="text-xs text-muted-foreground">
          FLOW © 2023-2025
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default DashboardSidebar;
