
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage
} from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import PasswordUpdateForm from "./PasswordUpdateForm";

const profileSchema = z.object({
  firstName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  lastName: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
  email: z.string().email("Ingrese un email válido").disabled(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const SettingsForm: React.FC = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: user?.email || "",
    },
  });

  // Load user data when component mounts
  useEffect(() => {
    if (user) {
      const firstName = user.user_metadata?.first_name || "";
      const lastName = user.user_metadata?.last_name || "";
      
      form.reset({
        firstName,
        lastName,
        email: user.email || "",
      });
    }
  }, [user, form]);

  const onSubmit = async (values: ProfileFormValues) => {
    try {
      setIsUpdating(true);
      
      const { error } = await supabase.auth.updateUser({
        data: {
          first_name: values.firstName,
          last_name: values.lastName,
        },
      });

      if (error) throw error;

      toast({
        title: "Perfil actualizado",
        description: "Tu información ha sido actualizada correctamente.",
      });
    } catch (error: any) {
      toast({
        title: "Error al actualizar perfil",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-flow-blue" />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-medium mb-4">Información del perfil</h2>
      <p className="text-muted-foreground mb-6">
        Actualiza la información de tu perfil personal.
      </p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input placeholder="Tu nombre" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Apellido</FormLabel>
                <FormControl>
                  <Input placeholder="Tu apellido" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="tu@email.com" 
                    {...field} 
                    disabled 
                    className="bg-muted cursor-not-allowed"
                  />
                </FormControl>
                <FormDescription>
                  Tu dirección de correo no se puede modificar.
                </FormDescription>
              </FormItem>
            )}
          />

          <Button 
            type="submit" 
            disabled={isUpdating || !form.formState.isDirty}
            className="w-full sm:w-auto"
          >
            {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Guardar cambios
          </Button>
        </form>
      </Form>

      <PasswordUpdateForm />
    </div>
  );
};

export default SettingsForm;
