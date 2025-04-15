
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

type StrategyFormValues = {
  target_audience: string;
  audience_interests: string;
  audience_content_consumption: string;
  audience_pain_points: string;
  solution_approach: string;
  differentiating_factor: string;
  positioning_type: string;
  content_character: string;
  content_personality: string;
  content_tone: string;
  niche: string;
  audience_perception: string;
  value_proposition: string;
  mission: string;
};

const StrategyForm = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("value");
  
  const form = useForm<StrategyFormValues>({
    defaultValues: {
      target_audience: "",
      audience_interests: "",
      audience_content_consumption: "",
      audience_pain_points: "",
      solution_approach: "",
      differentiating_factor: "",
      positioning_type: "",
      content_character: "",
      content_personality: "",
      content_tone: "",
      niche: "",
      audience_perception: "",
      value_proposition: "",
      mission: ""
    }
  });

  // Fetch existing data if available
  useEffect(() => {
    const fetchUserStrategy = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('user_mission')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (error) throw error;
        
        if (data) {
          form.reset({
            target_audience: data.target_audience || "",
            audience_interests: data.audience_interests || "",
            audience_content_consumption: data.audience_content_consumption || "",
            audience_pain_points: data.audience_pain_points || "",
            solution_approach: data.solution_approach || "",
            differentiating_factor: data.differentiating_factor || "",
            positioning_type: data.positioning_type || "",
            content_character: data.content_character || "",
            content_personality: data.content_personality || "",
            content_tone: data.content_tone || "",
            niche: data.niche || "",
            audience_perception: data.audience_perception || "",
            value_proposition: data.value_proposition || "",
            mission: data.mission || ""
          });
        }
      } catch (error) {
        console.error("Error fetching user strategy:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserStrategy();
  }, [user, form]);

  const onSubmit = async (values: StrategyFormValues) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('user_mission')
        .upsert({
          user_id: user.id,
          ...values,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });
      
      if (error) throw error;
      
      toast({
        title: "Guardado correctamente",
        description: "Tu estrategia ha sido actualizada.",
      });
    } catch (error: any) {
      console.error("Error saving user strategy:", error);
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="value">Propuesta de Valor</TabsTrigger>
            <TabsTrigger value="4ps">Las 4Ps</TabsTrigger>
          </TabsList>
          
          <TabsContent value="value" className="pt-4">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Grupo 1: Tu propuesta de valor */}
              <Card>
                <CardHeader>
                  <CardTitle>A quién te diriges</CardTitle>
                  <CardDescription>Define quién es tu audiencia objetivo</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="target_audience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>¿Quién es tu audiencia?</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Edad, género, ubicación, poder adquisitivo..."
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="audience_interests"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>¿Qué intereses principales tiene tu audiencia?</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Escribe los intereses principales de tu audiencia"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="audience_content_consumption"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>¿Qué tipo de contenido consume habitualmente?</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe los formatos y tipos de contenido que consume tu audiencia"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="audience_pain_points"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>¿Qué problema o frustración principal tiene tu audiencia?</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe los problemas a los que se enfrenta tu audiencia"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
              
              {/* Segunda tarjeta: Tu propuesta */}
              <Card>
                <CardHeader>
                  <CardTitle>Tu propuesta</CardTitle>
                  <CardDescription>Define cómo vas a ayudar a tu audiencia</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="solution_approach"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>¿Cómo vas a resolver tú ese problema?</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Explica tu solución al problema de tu audiencia"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="differentiating_factor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>¿Cuál es tu factor diferenciador?</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="¿Por qué deberían elegirte a ti?"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="positioning_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>¿Qué tipo de posicionamiento vas a adoptar?</FormLabel>
                        <FormControl>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona un tipo" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="educando">Educando</SelectItem>
                              <SelectItem value="inspirando">Inspirando</SelectItem>
                              <SelectItem value="entreteniendo">Entreteniendo</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="value_proposition"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tu propuesta de valor</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Ej: Ayudo a emprendedores a escalar sus negocios a través de contenido en redes sociales"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="mission"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tu misión</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Ej: Democratizar el acceso al conocimiento de marketing digital para pequeños empresarios"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="4ps" className="pt-4">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Grupo 2: Tus 4Ps - Primera parte */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>1. Personaje</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="content_character"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>¿Quién aparece en tus contenidos?</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Puedes ser tú, tus manos, tu voz, tu avatar, etc."
                              className="resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>2. Personalidad</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="content_personality"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>¿Qué ofrece realmente tu contenido al espectador?</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Valor que se lleva la audiencia: entretenimiento, formación, reflexión, inspiración..."
                              className="resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </div>
              
              {/* Grupo 2: Tus 4Ps - Segunda parte */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>3. Producto</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="content_tone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>¿Qué tono, actitud o carácter define tus contenidos?</FormLabel>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="flex items-center space-x-2">
                                <input
                                  type="radio"
                                  id="serio"
                                  value="serio"
                                  className="form-radio"
                                  checked={field.value === "serio"}
                                  onChange={() => field.onChange("serio")}
                                />
                                <label htmlFor="serio">Serio</label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="radio"
                                  id="espontaneo"
                                  value="espontaneo"
                                  className="form-radio"
                                  checked={field.value === "espontaneo"}
                                  onChange={() => field.onChange("espontaneo")}
                                />
                                <label htmlFor="espontaneo">Espontáneo</label>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div className="flex items-center space-x-2">
                                <input
                                  type="radio"
                                  id="relajado"
                                  value="relajado"
                                  className="form-radio"
                                  checked={field.value === "relajado"}
                                  onChange={() => field.onChange("relajado")}
                                />
                                <label htmlFor="relajado">Relajado</label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="radio"
                                  id="energico"
                                  value="energico"
                                  className="form-radio"
                                  checked={field.value === "energico"}
                                  onChange={() => field.onChange("energico")}
                                />
                                <label htmlFor="energico">Enérgico</label>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div className="flex items-center space-x-2">
                                <input
                                  type="radio"
                                  id="casual"
                                  value="casual"
                                  className="form-radio"
                                  checked={field.value === "casual"}
                                  onChange={() => field.onChange("casual")}
                                />
                                <label htmlFor="casual">Casual</label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="radio"
                                  id="profesional"
                                  value="profesional"
                                  className="form-radio"
                                  checked={field.value === "profesional"}
                                  onChange={() => field.onChange("profesional")}
                                />
                                <label htmlFor="profesional">Profesional</label>
                              </div>
                            </div>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>4. Posicionamiento</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="niche"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>¿En qué nicho te posicionas?</FormLabel>
                          <FormControl>
                            <Input placeholder="Tu nicho específico" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="audience_perception"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>¿Cómo quieres que te perciba tu audiencia?</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe la percepción que quieres generar"
                              className="resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="text-right">
          <Button type="submit" disabled={isLoading} size="lg">
            {isLoading ? "Guardando..." : "Guardar estrategia"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default StrategyForm;
