import React from "react";
import SettingsForm from "@/components/settings/SettingsForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Settings } from "lucide-react";

const SettingsPage: React.FC = () => {
  return (
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
  );
};

export default SettingsPage;
