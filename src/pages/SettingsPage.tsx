
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import SettingsForm from "@/components/settings/SettingsForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import Footer from "@/components/layout/Footer";
import DashboardSidebar from "@/components/dashboard/Sidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import { Settings } from "lucide-react";

const SettingsPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-white to-gray-50">
      {user ? (
        <div className="flex flex-1">
          <DashboardSidebar />
          <SidebarInset className="bg-gray-50 overflow-auto flex-1">
            <div className="container mx-auto px-4 py-6 max-w-7xl">
              <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
                <div className="mb-8">
                  <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gray-900 flex items-center gap-3">
                    <Settings className="h-8 w-8 text-flow-blue" />
                    Ajustes de la cuenta
                  </h1>
                </div>
                
                <Tabs defaultValue="profile" className="w-full">
                  <TabsList className="mb-6">
                    <TabsTrigger value="profile" className="font-tt-travels">Perfil</TabsTrigger>
                    <TabsTrigger value="account" className="font-tt-travels">Cuenta</TabsTrigger>
                    <TabsTrigger value="notifications" className="font-tt-travels">Notificaciones</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="profile">
                    <Card className="p-6">
                      <SettingsForm />
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="account">
                    <Card className="p-6">
                      <h2 className="text-lg font-medium mb-4 font-tt-travels">Ajustes de cuenta</h2>
                      <p className="text-muted-foreground mb-4">
                        Gestiona la configuración de tu cuenta y opciones de seguridad.
                      </p>
                      {/* Account settings will be implemented in future iterations */}
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="notifications">
                    <Card className="p-6">
                      <h2 className="text-lg font-medium mb-4 font-tt-travels">Preferencias de notificaciones</h2>
                      <p className="text-muted-foreground mb-4">
                        Configura cómo y cuándo recibes notificaciones.
                      </p>
                      {/* Notification settings will be implemented in future iterations */}
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </SidebarInset>
        </div>
      ) : (
        <>
          <Header />
          <main className="flex-1 container mx-auto px-4 py-6 max-w-7xl">
            <h1 className="text-2xl font-bold mb-6 font-tt-travels">Ajustes de la cuenta</h1>
            
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="profile" className="font-tt-travels">Perfil</TabsTrigger>
                <TabsTrigger value="account" className="font-tt-travels">Cuenta</TabsTrigger>
                <TabsTrigger value="notifications" className="font-tt-travels">Notificaciones</TabsTrigger>
              </TabsList>
              
              <TabsContent value="profile">
                <Card className="p-6">
                  <SettingsForm />
                </Card>
              </TabsContent>
              
              <TabsContent value="account">
                <Card className="p-6">
                  <h2 className="text-lg font-medium mb-4 font-tt-travels">Ajustes de cuenta</h2>
                  <p className="text-muted-foreground mb-4">
                    Gestiona la configuración de tu cuenta y opciones de seguridad.
                  </p>
                  {/* Account settings will be implemented in future iterations */}
                </Card>
              </TabsContent>
              
              <TabsContent value="notifications">
                <Card className="p-6">
                  <h2 className="text-lg font-medium mb-4 font-tt-travels">Preferencias de notificaciones</h2>
                  <p className="text-muted-foreground mb-4">
                    Configura cómo y cuándo recibes notificaciones.
                  </p>
                  {/* Notification settings will be implemented in future iterations */}
                </Card>
              </TabsContent>
            </Tabs>
          </main>
          <Footer />
        </>
      )}
    </div>
  );
};

export default SettingsPage;
