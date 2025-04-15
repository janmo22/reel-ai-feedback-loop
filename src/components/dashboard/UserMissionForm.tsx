
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Target, FlaskConical } from "lucide-react";

type UserMissionFormValues = {
  valueProposition: string;
  mission: string;
};

const UserMissionForm = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<UserMissionFormValues>({
    defaultValues: {
      valueProposition: "",
      mission: ""
    }
  });

  // Fetch existing data if available
  useEffect(() => {
    const fetchUserMission = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('user_mission')
          .select('value_proposition, mission')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (error) throw error;
        
        if (data) {
          form.reset({
            valueProposition: data.value_proposition || "",
            mission: data.mission || ""
          });
        }
      } catch (error) {
        console.error("Error fetching user mission:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserMission();
  }, [user, form]);

  const onSubmit = async (values: UserMissionFormValues) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('user_mission')
        .upsert({
          user_id: user.id,
          value_proposition: values.valueProposition,
          mission: values.mission,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });
      
      if (error) throw error;
      
      toast({
        title: "Guardado correctamente",
        description: "Tu propuesta de valor y misión han sido actualizadas.",
      });
    } catch (error: any) {
      console.error("Error saving user mission:", error);
      toast({
        title: "Error al guardar",
        description: "No se pudo guardar la información. Por favor intenta nuevamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-flow-blue mb-2">
              <Target className="h-5 w-5" />
              <span className="text-sm font-medium">Propuesta de valor</span>
            </div>
            
            <FormField
              control={form.control}
              name="valueProposition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>¿Qué ofreces a tu audiencia?</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ej: Ayudo a emprendedores a escalar sus negocios a través de contenido en redes sociales"
                      className="resize-none h-32"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-flow-blue mb-2">
              <FlaskConical className="h-5 w-5" />
              <span className="text-sm font-medium">Misión</span>
            </div>
            
            <FormField
              control={form.control}
              name="mission"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>¿Cuál es tu propósito?</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ej: Democratizar el acceso al conocimiento de marketing digital para pequeños empresarios"
                      className="resize-none h-32"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
          {isLoading ? "Guardando..." : "Guardar información"}
        </Button>
      </form>
    </Form>
  );
};

export default UserMissionForm;
