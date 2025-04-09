
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { 
  Upload, 
  BarChart3,
  BrainCircuit,
  History,
  ArrowRight,
  LayoutDashboard,
  Sparkles,
  Video,
  TrendingUp
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-muted/30">
      <Header />
      
      <main className="flex-1">
        {user ? (
          <div className="container mx-auto py-12 px-4 max-w-6xl">
            <div className="mb-10">
              <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
                <LayoutDashboard className="text-flow-blue" size={30} />
                <span className="bg-gradient-to-r from-flow-blue to-flow-electric bg-clip-text text-transparent">
                  Dashboard
                </span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Hola, {user.user_metadata?.first_name || user.email}. ¿Qué te gustaría hacer hoy?
              </p>
            </div>
            
            <div className="mb-10">
              <Tabs defaultValue="actions" className="w-full">
                <TabsList className="mb-6">
                  <TabsTrigger value="actions">Acciones</TabsTrigger>
                  <TabsTrigger value="analytics">Analíticas</TabsTrigger>
                </TabsList>
                
                <TabsContent value="actions" className="space-y-6">
                  <div className="grid gap-8 md:grid-cols-2">
                    <Card className="overflow-hidden group border-flow-blue/20 hover:border-flow-blue/60 transition-all duration-300 shadow-sm hover:shadow-md">
                      <CardHeader className="bg-gradient-to-r from-flow-blue/5 to-flow-accent/10 pb-6">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2.5 bg-flow-blue/20 rounded-full">
                            <Upload className="h-6 w-6 text-flow-blue" />
                          </div>
                          <CardTitle>Nuevo análisis</CardTitle>
                        </div>
                        <CardDescription className="text-base">
                          Sube tu reel para obtener feedback profesional
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <p className="text-muted-foreground mb-6">
                          Nuestra IA analizará tu contenido para brindarte recomendaciones personalizadas
                          que te ayudarán a mejorar el alcance de tus reels.
                        </p>
                        <Button asChild className="w-full bg-flow-blue hover:bg-flow-blue/90 group-hover:bg-flow-electric transition-all duration-300">
                          <Link to="/upload" className="flex items-center justify-between">
                            Subir nuevo reel
                            <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                    
                    <Card className="overflow-hidden group border-flow-accent/20 hover:border-flow-accent/60 transition-all duration-300 shadow-sm hover:shadow-md">
                      <CardHeader className="bg-gradient-to-r from-flow-accent/5 to-flow-blue/10 pb-6">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2.5 bg-flow-accent/20 rounded-full">
                            <History className="h-6 w-6 text-flow-accent" />
                          </div>
                          <CardTitle>Ver historial</CardTitle>
                        </div>
                        <CardDescription className="text-base">
                          Revisa tus análisis anteriores
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <p className="text-muted-foreground mb-6">
                          Accede a todos tus análisis previos para comparar resultados
                          y ver tu progreso a lo largo del tiempo.
                        </p>
                        <Button asChild variant="outline" className="w-full border-flow-accent/30 text-flow-accent hover:bg-flow-accent/10 hover:text-flow-accent">
                          <Link to="/history" className="flex items-center justify-between">
                            Ver análisis previos
                            <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="analytics" className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-3">
                    <StatCard 
                      icon={<Video className="h-5 w-5 text-flow-blue" />}
                      title="Videos analizados"
                      value="3"
                      trend="+2 este mes"
                      trendUp={true}
                    />
                    
                    <StatCard 
                      icon={<Sparkles className="h-5 w-5 text-flow-accent" />}
                      title="Recomendaciones"
                      value="24"
                      trend="12 aplicadas"
                      trendUp={true}
                    />
                    
                    <StatCard 
                      icon={<TrendingUp className="h-5 w-5 text-green-500" />}
                      title="Mejoras detectadas"
                      value="68%"
                      trend="+12% vs anterior"
                      trendUp={true}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </div>
            
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <BrainCircuit className="mr-2 text-flow-accent" size={20} />
                Inteligencia Artificial para creadores
              </h2>
              
              <div className="grid gap-6 md:grid-cols-3">
                <FeatureCard 
                  icon={<BarChart3 className="h-6 w-6 text-white" />}
                  title="Análisis de contenido"
                  description="Recibe métricas detalladas sobre tu contenido y audiencia"
                  colorClass="from-flow-blue to-flow-electric"
                />
                
                <FeatureCard 
                  icon={<Sparkles className="h-6 w-6 text-white" />}
                  title="Recomendaciones personalizadas"
                  description="Sugerencias adaptadas a tu estilo y temática"
                  colorClass="from-flow-accent to-flow-blue"
                />
                
                <FeatureCard 
                  icon={<TrendingUp className="h-6 w-6 text-white" />}
                  title="Mejora constante"
                  description="Compara tus resultados y visualiza tu progreso con el tiempo"
                  colorClass="from-flow-electric to-flow-accent"
                />
              </div>
            </div>
          </div>
        ) : (
          <>
            <section className="py-20 px-4 bg-gradient-to-br from-flow-blue/10 via-background to-flow-accent/10 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full opacity-10">
                <div className="absolute -top-20 -left-20 w-72 h-72 bg-flow-blue rounded-full filter blur-3xl animate-flow-wave"></div>
                <div className="absolute top-40 right-20 w-96 h-96 bg-flow-accent rounded-full filter blur-3xl animate-flow-wave" style={{ animationDelay: '1s' }}></div>
              </div>
              
              <div className="container mx-auto max-w-5xl relative z-10">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                  <div className="space-y-8">
                    <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight">
                      Mejora tus <span className="bg-gradient-to-r from-flow-blue to-flow-accent bg-clip-text text-transparent">reels</span> con el poder de la IA
                    </h1>
                    <p className="text-xl text-muted-foreground">
                      Análisis detallado y recomendaciones personalizadas para maximizar el alcance de tu contenido.
                    </p>
                    <div className="flex flex-wrap gap-4">
                      <Button asChild size="lg" className="bg-flow-blue hover:bg-flow-electric text-white transition-all duration-300 shadow-lg hover:shadow-flow-blue/20">
                        <Link to="/auth">Comenzar ahora</Link>
                      </Button>
                    </div>
                  </div>
                  
                  <div className="relative hidden md:block">
                    <div className="aspect-[9/16] max-w-xs mx-auto bg-flow-dark rounded-3xl border-8 border-flow-dark shadow-xl overflow-hidden relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-flow-blue/30 to-flow-accent/30 opacity-70"></div>
                    </div>
                    <div className="absolute -bottom-4 -right-4 md:bottom-0 md:-right-12 w-24 h-24 md:w-32 md:h-32 bg-white rounded-xl shadow-xl p-4 flex items-center justify-center">
                      <img 
                        src="/lovable-uploads/23bce40c-310f-4879-a62c-17047b61ab18.png" 
                        alt="Flow Logo" 
                        className="w-full" 
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>
            
            <section className="py-16 px-4">
              <div className="container mx-auto max-w-5xl">
                <h2 className="text-3xl font-bold mb-10 text-center">Cómo funciona</h2>
                <div className="grid md:grid-cols-3 gap-10">
                  <FeatureCard 
                    icon={<Upload className="h-6 w-6 text-white" />} 
                    title="Sube tu reel"
                    description="Sube tu video en cualquier formato popular y obtén un análisis detallado."
                    colorClass="from-flow-blue to-flow-electric"
                  />
                  
                  <FeatureCard 
                    icon={<BarChart3 className="h-6 w-6 text-white" />} 
                    title="Análisis de IA"
                    description="Nuestro modelo analiza múltiples aspectos de tu contenido para optimizarlo."
                    colorClass="from-flow-accent to-flow-blue"
                  />
                  
                  <FeatureCard 
                    icon={<BrainCircuit className="h-6 w-6 text-white" />} 
                    title="Mejora continua"
                    description="Recibe recomendaciones personalizadas para mejorar tus futuros videos."
                    colorClass="from-flow-electric to-flow-accent"
                  />
                </div>
              </div>
            </section>
            
            <section className="py-16 px-4 bg-flow-blue/5">
              <div className="container mx-auto max-w-5xl text-center">
                <h2 className="text-3xl font-bold mb-6">¿Listo para potenciar tu contenido?</h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                  Únete hoy y comienza a mejorar tus reels con el poder de la inteligencia artificial.
                </p>
                <Button asChild size="lg" className="bg-flow-blue hover:bg-flow-electric transition-all duration-300 shadow-md hover:shadow-lg">
                  <Link to="/auth">Crear cuenta gratis</Link>
                </Button>
              </div>
            </section>
          </>
        )}
      </main>
      
      <footer className="py-8 px-4 border-t bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-6 md:mb-0">
              <img 
                src="/lovable-uploads/23bce40c-310f-4879-a62c-17047b61ab18.png" 
                alt="Flow Logo" 
                className="h-8 mr-2" 
              />
              <span className="font-bold text-lg">Flow ReelAI</span>
            </div>
            <div className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Flow · Creado por <a 
                href="https://instagram.com/janmoliner.ai" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-flow-blue hover:text-flow-accent transition-colors"
              >@janmoliner.ai</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Componente para las tarjetas de estadísticas
const StatCard = ({ 
  icon, 
  title, 
  value, 
  trend, 
  trendUp = true 
}: { 
  icon: React.ReactNode;
  title: string;
  value: string;
  trend: string;
  trendUp?: boolean;
}) => {
  return (
    <Card className="border-muted/40">
      <CardContent className="pt-6">
        <div className="flex justify-between items-start mb-2">
          <div className="p-2 rounded-md bg-muted">
            {icon}
          </div>
          <span className={`text-xs flex items-center ${trendUp ? 'text-green-500' : 'text-red-500'}`}>
            {trend}
            {trendUp ? (
              <ArrowRight className="h-3 w-3 ml-1 rotate-[-45deg]" />
            ) : (
              <ArrowRight className="h-3 w-3 ml-1 rotate-45" />
            )}
          </span>
        </div>
        <p className="text-sm text-muted-foreground mb-1">{title}</p>
        <h4 className="text-2xl font-bold">{value}</h4>
      </CardContent>
    </Card>
  );
};

// Componente para las tarjetas de características
const FeatureCard = ({ 
  icon, 
  title, 
  description, 
  colorClass 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
  colorClass: string;
}) => {
  return (
    <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all">
      <div className={`bg-gradient-to-br ${colorClass} p-4 flex items-center justify-center`}>
        <div className="p-2 rounded-full bg-white/10 backdrop-blur-sm">
          {icon}
        </div>
      </div>
      <CardContent className="p-6">
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground">
          {description}
        </p>
      </CardContent>
    </Card>
  );
};

export default Index;
