
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Menu } from "lucide-react";

const MobileMenuButton = () => (
  <div className="fixed top-3 left-3 z-50 md:hidden">
    <SidebarTrigger className="bg-white rounded-full shadow p-2 border border-gray-200 hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-blue-500">
      <Menu className="w-6 h-6 text-flow-blue" />
      <span className="sr-only">Abrir menú</span>
    </SidebarTrigger>
  </div>
);

export default MobileMenuButton;
