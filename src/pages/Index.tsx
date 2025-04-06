
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Video, 
  Upload, 
  PieChart, 
  BarChart3, 
  TrendingUp, 
  BrainCircuit, 
  ScanFace, 
  Mic,
  Lightbulb,
  Target
} from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 md:py-24 px-4 bg-gradient-to-br from-flow-blue/10 via-background to-flow-accent/10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <div className="absolute -top-20 -left-20 w-72 h-72 bg-flow-blue rounded-full filter blur-3xl animate-flow-wave"></div>
            <div className="absolute top-40 right-20 w-96 h-96 bg-flow-accent rounded-full filter blur-3xl animate-flow-wave" style={{ animationDelay: '1s' }}></div>
          </div>
          
          <div className="container mx-auto max-w-6xl relative z-10">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                  Mejora tus <span className="bg-gradient-to-r from-flow-blue to-flow-accent bg-clip-text text-transparent">reels</span> con análisis de IA
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground">
                  Obtén feedback detallado sobre tus videos y mejora tu contenido con recomendaciones personalizadas de inteligencia artificial.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button asChild size="lg" className="bg-flow-blue hover:bg-flow-blue/90 text-white">
                    <Link to="/upload">Subir Reel</Link>
                  </Button>
                  <Button variant="outline" size="lg" className="border-flow-blue text-flow-blue hover:bg-flow-blue/10">
                    Saber más
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <span className="font-medium">Creado por:</span>
                  <a 
                    href="https://instagram.com/janmoliner.ai" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-flow-blue hover:text-flow-accent flex items-center gap-1 transition-colors"
                  >
                    @janmoliner.ai
                  </a>
                </div>
              </div>
              
              <div className="relative">
                <div className="aspect-[9/16] max-w-xs mx-auto bg-flow-dark rounded-3xl border-8 border-flow-dark shadow-xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-flow-blue/30 to-flow-accent/30 opacity-70"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Video className="h-24 w-24 text-white opacity-30" />
                  </div>
                </div>
                <div className="absolute -bottom-4 -right-4 md:bottom-0 md:-right-12 w-24 h-24 md:w-32 md:h-32 bg-white rounded-lg shadow-lg p-4 flex items-center justify-center">
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
        
        {/* Features Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">¿Cómo funciona?</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Nuestra plataforma utiliza inteligencia artificial avanzada para analizar tus reels y darte feedback que te ayudará a mejorar tu contenido.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="rounded-full bg-flow-blue/10 p-3 w-12 h-12 flex items-center justify-center mb-4">
                    <Upload className="h-6 w-6 text-flow-blue" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Sube tu reel</h3>
                  <p className="text-muted-foreground">
                    Sube tu video en cualquier formato popular. Aceptamos MP4, MOV y WebM hasta 200MB.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="rounded-full bg-flow-accent/10 p-3 w-12 h-12 flex items-center justify-center mb-4">
                    <BarChart3 className="h-6 w-6 text-flow-accent" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Análisis de IA</h3>
                  <p className="text-muted-foreground">
                    Nuestro modelo de IA analiza múltiples aspectos de tu contenido, desde la calidad visual hasta el engagement esperado.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="rounded-full bg-flow-blue/10 p-3 w-12 h-12 flex items-center justify-center mb-4">
                    <PieChart className="h-6 w-6 text-flow-blue" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Recibe feedback</h3>
                  <p className="text-muted-foreground">
                    Obtén un análisis detallado de tus reels con recomendaciones prácticas para mejorar tu contenido.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        
        {/* Analytics Features */}
        <section className="py-16 px-4 bg-gradient-to-br from-flow-blue/5 to-flow-accent/5">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Características principales</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Todo lo que necesitas para optimizar tus reels y aumentar tu alcance en redes sociales.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="rounded-full bg-flow-blue/10 p-3 w-12 h-12 flex items-center justify-center mb-4">
                    <ScanFace className="h-6 w-6 text-flow-blue" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Análisis facial</h3>
                  <p className="text-sm text-muted-foreground">
                    Detecta emociones y expresiones para mejorar tu storytelling visual.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="rounded-full bg-flow-accent/10 p-3 w-12 h-12 flex items-center justify-center mb-4">
                    <Mic className="h-6 w-6 text-flow-accent" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Calidad del audio</h3>
                  <p className="text-sm text-muted-foreground">
                    Evaluación de claridad, volumen y ambiente para una experiencia auditiva óptima.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="rounded-full bg-flow-blue/10 p-3 w-12 h-12 flex items-center justify-center mb-4">
                    <TrendingUp className="h-6 w-6 text-flow-blue" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Predicción de engagement</h3>
                  <p className="text-sm text-muted-foreground">
                    Estimación del potencial de interacción basada en millones de datos analizados.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="rounded-full bg-flow-accent/10 p-3 w-12 h-12 flex items-center justify-center mb-4">
                    <BrainCircuit className="h-6 w-6 text-flow-accent" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Sugerencias de IA</h3>
                  <p className="text-sm text-muted-foreground">
                    Recomendaciones personalizadas para mejorar cada aspecto de tu contenido.
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <div className="mt-12 flex justify-center">
              <Button asChild size="lg" className="bg-flow-accent hover:bg-flow-accent/90 text-white">
                <Link to="/upload">Probar ahora</Link>
              </Button>
            </div>
          </div>
        </section>
        
        {/* Benefits Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="relative">
                <div className="absolute -left-6 -top-6 w-24 h-24 bg-flow-blue/20 rounded-full"></div>
                <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-flow-accent/20 rounded-full"></div>
                <div className="relative overflow-hidden rounded-xl border bg-card p-6 shadow-sm">
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="shrink-0 rounded-full bg-flow-blue/10 p-3">
                        <Target className="h-6 w-6 text-flow-blue" />
                      </div>
                      <div>
                        <h4 className="text-lg font-medium">Maximiza tu audiencia</h4>
                        <p className="text-muted-foreground">
                          Optimiza tus reels para alcanzar a más personas y aumentar tu visibilidad.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="shrink-0 rounded-full bg-flow-accent/10 p-3">
                        <Lightbulb className="h-6 w-6 text-flow-accent" />
                      </div>
                      <div>
                        <h4 className="text-lg font-medium">Aprende y mejora</h4>
                        <p className="text-muted-foreground">
                          Feedback constructivo para desarrollar tus habilidades como creador de contenido.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="shrink-0 rounded-full bg-flow-blue/10 p-3">
                        <BrainCircuit className="h-6 w-6 text-flow-blue" />
                      </div>
                      <div>
                        <h4 className="text-lg font-medium">Tecnología avanzada</h4>
                        <p className="text-muted-foreground">
                          Respaldado por algoritmos de IA entrenados con millones de videos virales.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <h2 className="text-3xl font-bold">Impulsa tu presencia en redes sociales</h2>
                <p className="text-muted-foreground">
                  Con nuestra plataforma de análisis impulsada por IA, podrás entender qué hace que un reel sea exitoso y cómo puedes aplicar esos principios a tu propio contenido.
                </p>
                <p className="text-muted-foreground">
                  Ya sea que seas un creador principiante o experimentado, nuestras herramientas te ayudarán a perfeccionar tu técnica y a crear contenido que resuene con tu audiencia.
                </p>
                <div className="flex gap-4 pt-4">
                  <Button asChild className="bg-flow-blue hover:bg-flow-blue/90 text-white">
                    <Link to="/upload">Comenzar ahora</Link>
                  </Button>
                  <Button variant="outline" className="border-flow-blue text-flow-blue hover:bg-flow-blue/10">
                    Ver planes
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16 px-4 bg-flow-blue/10">
          <div className="container mx-auto max-w-6xl text-center">
            <h2 className="text-3xl font-bold mb-6">¿Listo para mejorar tus reels?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              Comienza hoy mismo a recibir feedback profesional generado por IA para mejorar la calidad de tu contenido.
            </p>
            <Button asChild size="lg" className="bg-flow-blue hover:bg-flow-blue/90 text-white">
              <Link to="/upload">Subir primer reel</Link>
            </Button>
          </div>
        </section>
      </main>
      
      <footer className="py-6 px-4 border-t">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <img 
                src="/lovable-uploads/23bce40c-310f-4879-a62c-17047b61ab18.png" 
                alt="Flow Logo" 
                className="h-6 mr-2" 
              />
              <span className="font-semibold text-lg">Flow ReelAI</span>
            </div>
            <div className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Flow. Creado por <a 
                href="https://instagram.com/janmoliner.ai" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-flow-blue hover:text-flow-accent"
              >@janmoliner.ai</a>. Todos los derechos reservados.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
