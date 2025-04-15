
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import SettingsForm from "@/components/settings/SettingsForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import Footer from "@/components/layout/Footer";

const SettingsPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-white to-gray-50">
      <Header />
      
      <main className="flex-1 container mx-auto py-8 px-4 max-w-5xl">
        <h1 className="text-2xl font-bold mb-6">Ajustes de la cuenta</h1>
        
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="profile">Perfil</TabsTrigger>
            <TabsTrigger value="account">Cuenta</TabsTrigger>
            <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <Card className="p-6">
              <SettingsForm />
            </Card>
          </TabsContent>
          
          <TabsContent value="account">
            <Card className="p-6">
              <h2 className="text-lg font-medium mb-4">Ajustes de cuenta</h2>
              <p className="text-muted-foreground mb-4">
                Gestiona la configuración de tu cuenta y opciones de seguridad.
              </p>
              {/* Account settings will be implemented in future iterations */}
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications">
            <Card className="p-6">
              <h2 className="text-lg font-medium mb-4">Preferencias de notificaciones</h2>
              <p className="text-muted-foreground mb-4">
                Configura cómo y cuándo recibes notificaciones.
              </p>
              {/* Notification settings will be implemented in future iterations */}
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
};

export default SettingsPage;
