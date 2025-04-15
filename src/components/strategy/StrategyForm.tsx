
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
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
import { Check, Loader2, Target, Users, Lightbulb, Star } from "lucide-react";

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
  const location = useLocation();
  const navigate = useNavigate();
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Parse tab from URL query parameter
  const queryParams = new URLSearchParams(location.search);
  const tabFromUrl = queryParams.get('tab') || 'value';
  const [activeTab, setActiveTab] = useState(tabFromUrl);
  
  // Update URL when tab changes
  const updateTabInUrl = (newTab: string) => {
    setActiveTab(newTab);
    const searchParams = new URLSearchParams(location.search);
    searchParams.set('tab', newTab);
    navigate(`${location.pathname}?${searchParams.toString()}`, { replace: true });
  };
  
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
    setSaveSuccess(false);
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
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
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
        <Tabs value={activeTab} onValueChange={updateTabInUrl} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-100 p-1">
            <TabsTrigger 
              value="value" 
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm flex gap-2 items-center"
            >
              <Target className="h-4 w-4" />
              Propuesta de Valor
            </TabsTrigger>
            <TabsTrigger 
              value="4ps" 
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm flex gap-2 items-center"
            >
              <Star className="h-4 w-4" />
              Las 4Ps
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="value" className="pt-2 animate-fade-in">
            <div className="grid gap-8 md:grid-cols-2">
              {/* Grupo 1: Tu propuesta de valor */}
              <Card className="border-flow-blue/20 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="bg-gradient-to-r from-flow-blue/5 to-flow-accent/5">
                  <div className="flex items-center gap-2 text-flow-blue mb-1">
                    <Users className="h-5 w-5" />
                    <CardTitle>A quién te diriges</CardTitle>
                  </div>
                  <CardDescription>Define quién es tu audiencia objetivo</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  <FormField
                    control={form.control}
                    name="target_audience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium flex items-center gap-1">
                          ¿Quién es tu audiencia?
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Edad, género, ubicación, poder adquisitivo..."
                            className="resize-none min-h-[80px] focus-visible:ring-flow-blue/30"
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
                        <FormLabel className="text-sm font-medium">¿Qué intereses principales tiene tu audiencia?</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Escribe los intereses principales de tu audiencia"
                            className="resize-none min-h-[80px] focus-visible:ring-flow-blue/30"
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
                        <FormLabel className="text-sm font-medium">¿Qué tipo de contenido consume habitualmente?</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe los formatos y tipos de contenido que consume tu audiencia"
                            className="resize-none min-h-[80px] focus-visible:ring-flow-blue/30"
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
                        <FormLabel className="text-sm font-medium">¿Qué problema o frustración principal tiene tu audiencia?</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe los problemas a los que se enfrenta tu audiencia"
                            className="resize-none min-h-[80px] focus-visible:ring-flow-blue/30"
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
              <Card className="border-flow-blue/20 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="bg-gradient-to-r from-flow-blue/5 to-flow-accent/5">
                  <div className="flex items-center gap-2 text-flow-blue mb-1">
                    <Lightbulb className="h-5 w-5" />
                    <CardTitle>Tu propuesta</CardTitle>
                  </div>
                  <CardDescription>Define cómo vas a ayudar a tu audiencia</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  <FormField
                    control={form.control}
                    name="solution_approach"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">¿Cómo vas a resolver tú ese problema?</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Explica tu solución al problema de tu audiencia"
                            className="resize-none min-h-[80px] focus-visible:ring-flow-blue/30"
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
                        <FormLabel className="text-sm font-medium">¿Cuál es tu factor diferenciador?</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="¿Por qué deberían elegirte a ti?"
                            className="resize-none min-h-[80px] focus-visible:ring-flow-blue/30"
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
                        <FormLabel className="text-sm font-medium">¿Qué tipo de posicionamiento vas a adoptar?</FormLabel>
                        <FormControl>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger className="focus:ring-flow-blue/30">
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
                        <FormLabel className="text-sm font-medium">Tu propuesta de valor</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Ej: Ayudo a emprendedores a escalar sus negocios a través de contenido en redes sociales"
                            className="resize-none min-h-[80px] focus-visible:ring-flow-blue/30"
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
                        <FormLabel className="text-sm font-medium">Tu misión</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Ej: Democratizar el acceso al conocimiento de marketing digital para pequeños empresarios"
                            className="resize-none min-h-[80px] focus-visible:ring-flow-blue/30"
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
          
          <TabsContent value="4ps" className="pt-2 animate-fade-in">
            <div className="grid gap-8">
              {/* Grupo 2: Tus 4Ps - Una debajo de otra */}
              <Card className="border-flow-blue/20 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="bg-gradient-to-r from-flow-blue/5 to-flow-accent/5">
                  <div className="flex items-center gap-2 text-flow-blue">
                    <span className="h-6 w-6 rounded-full bg-flow-blue text-white flex items-center justify-center font-medium text-sm">1</span>
                    <CardTitle>Personaje</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <FormField
                    control={form.control}
                    name="content_character"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">¿Quién aparece en tus contenidos?</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Puedes ser tú, tus manos, tu voz, tu avatar, etc."
                            className="resize-none min-h-[80px] focus-visible:ring-flow-blue/30"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
              
              <Card className="border-flow-blue/20 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="bg-gradient-to-r from-flow-blue/5 to-flow-accent/5">
                  <div className="flex items-center gap-2 text-flow-blue">
                    <span className="h-6 w-6 rounded-full bg-flow-blue text-white flex items-center justify-center font-medium text-sm">2</span>
                    <CardTitle>Personalidad</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <FormField
                    control={form.control}
                    name="content_personality"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">¿Qué tono, actitud o carácter define tus contenidos?</FormLabel>
                        <div className="space-y-4 mt-3">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:border-flow-blue transition-colors cursor-pointer">
                              <input
                                type="radio"
                                id="serio"
                                value="serio"
                                className="form-radio text-flow-blue focus:ring-flow-blue/30 h-4 w-4"
                                checked={field.value === "serio"}
                                onChange={() => field.onChange("serio")}
                              />
                              <label htmlFor="serio" className="cursor-pointer text-gray-700 text-sm">Serio</label>
                            </div>
                            <div className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:border-flow-blue transition-colors cursor-pointer">
                              <input
                                type="radio"
                                id="espontaneo"
                                value="espontaneo"
                                className="form-radio text-flow-blue focus:ring-flow-blue/30 h-4 w-4"
                                checked={field.value === "espontaneo"}
                                onChange={() => field.onChange("espontaneo")}
                              />
                              <label htmlFor="espontaneo" className="cursor-pointer text-gray-700 text-sm">Espontáneo</label>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:border-flow-blue transition-colors cursor-pointer">
                              <input
                                type="radio"
                                id="relajado"
                                value="relajado"
                                className="form-radio text-flow-blue focus:ring-flow-blue/30 h-4 w-4"
                                checked={field.value === "relajado"}
                                onChange={() => field.onChange("relajado")}
                              />
                              <label htmlFor="relajado" className="cursor-pointer text-gray-700 text-sm">Relajado</label>
                            </div>
                            <div className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:border-flow-blue transition-colors cursor-pointer">
                              <input
                                type="radio"
                                id="energico"
                                value="energico"
                                className="form-radio text-flow-blue focus:ring-flow-blue/30 h-4 w-4"
                                checked={field.value === "energico"}
                                onChange={() => field.onChange("energico")}
                              />
                              <label htmlFor="energico" className="cursor-pointer text-gray-700 text-sm">Enérgico</label>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:border-flow-blue transition-colors cursor-pointer">
                              <input
                                type="radio"
                                id="casual"
                                value="casual"
                                className="form-radio text-flow-blue focus:ring-flow-blue/30 h-4 w-4"
                                checked={field.value === "casual"}
                                onChange={() => field.onChange("casual")}
                              />
                              <label htmlFor="casual" className="cursor-pointer text-gray-700 text-sm">Casual</label>
                            </div>
                            <div className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:border-flow-blue transition-colors cursor-pointer">
                              <input
                                type="radio"
                                id="profesional"
                                value="profesional"
                                className="form-radio text-flow-blue focus:ring-flow-blue/30 h-4 w-4"
                                checked={field.value === "profesional"}
                                onChange={() => field.onChange("profesional")}
                              />
                              <label htmlFor="profesional" className="cursor-pointer text-gray-700 text-sm">Profesional</label>
                            </div>
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
              
              <Card className="border-flow-blue/20 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="bg-gradient-to-r from-flow-blue/5 to-flow-accent/5">
                  <div className="flex items-center gap-2 text-flow-blue">
                    <span className="h-6 w-6 rounded-full bg-flow-blue text-white flex items-center justify-center font-medium text-sm">3</span>
                    <CardTitle>Producto</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <FormField
                    control={form.control}
                    name="content_tone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">¿Qué ofrece realmente tu contenido al espectador?</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Valor que se lleva la audiencia: entretenimiento, formación, reflexión, inspiración..."
                            className="resize-none min-h-[80px] focus-visible:ring-flow-blue/30"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
              
              <Card className="border-flow-blue/20 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="bg-gradient-to-r from-flow-blue/5 to-flow-accent/5">
                  <div className="flex items-center gap-2 text-flow-blue">
                    <span className="h-6 w-6 rounded-full bg-flow-blue text-white flex items-center justify-center font-medium text-sm">4</span>
                    <CardTitle>Posicionamiento</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <FormField
                    control={form.control}
                    name="niche"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">¿En qué nicho te posicionas?</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Tu nicho específico" 
                            {...field} 
                            className="focus-visible:ring-flow-blue/30"
                          />
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
                        <FormLabel className="text-sm font-medium">¿Cómo quieres que te perciba tu audiencia?</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe la percepción que quieres generar"
                            className="resize-none min-h-[80px] focus-visible:ring-flow-blue/30"
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
        </Tabs>
        
        <div className="text-right pt-4">
          <Button 
            type="submit" 
            disabled={isLoading} 
            size="lg" 
            className={`bg-flow-blue hover:bg-flow-accent transition-all ${saveSuccess ? 'bg-green-600 hover:bg-green-700' : ''}`}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...
              </>
            ) : saveSuccess ? (
              <>
                <Check className="mr-2 h-4 w-4" /> Guardado
              </>
            ) : (
              "Guardar estrategia"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default StrategyForm;
