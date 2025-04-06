
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Video, Upload, PieChart, BarChart3 } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 md:py-24 px-4 bg-gradient-to-br from-reel-purple/10 via-background to-reel-pink/10">
          <div className="container mx-auto max-w-6xl">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                  Mejora tus <span className="bg-gradient-to-r from-reel-purple to-reel-pink bg-clip-text text-transparent">reels</span> con análisis de IA
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground">
                  Obtén feedback detallado sobre tus videos y mejora tu contenido con recomendaciones personalizadas de inteligencia artificial.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button asChild size="lg">
                    <Link to="/upload">Subir Reel</Link>
                  </Button>
                  <Button variant="outline" size="lg">
                    Saber más
                  </Button>
                </div>
              </div>
              
              <div className="relative">
                <div className="aspect-[9/16] max-w-xs mx-auto bg-reel-dark rounded-3xl border-8 border-reel-dark shadow-xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-reel-purple/30 to-reel-pink/30 opacity-70"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Video className="h-24 w-24 text-white opacity-30" />
                  </div>
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
                  <div className="rounded-full bg-reel-purple/10 p-3 w-12 h-12 flex items-center justify-center mb-4">
                    <Upload className="h-6 w-6 text-reel-purple" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Sube tu reel</h3>
                  <p className="text-muted-foreground">
                    Sube tu video en cualquier formato popular. Acepatamos MP4, MOV y WebM hasta 50MB.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="rounded-full bg-reel-pink/10 p-3 w-12 h-12 flex items-center justify-center mb-4">
                    <BarChart3 className="h-6 w-6 text-reel-pink" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Análisis de IA</h3>
                  <p className="text-muted-foreground">
                    Nuestro modelo de IA analiza múltiples aspectos de tu contenido, desde la calidad visual hasta el engagement esperado.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="rounded-full bg-reel-purple/10 p-3 w-12 h-12 flex items-center justify-center mb-4">
                    <PieChart className="h-6 w-6 text-reel-purple" />
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
        
        {/* CTA Section */}
        <section className="py-16 px-4 bg-muted">
          <div className="container mx-auto max-w-6xl text-center">
            <h2 className="text-3xl font-bold mb-6">¿Listo para mejorar tus reels?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              Comienza hoy mismo a recibir feedback profesional generado por IA para mejorar la calidad de tu contenido.
            </p>
            <Button asChild size="lg">
              <Link to="/upload">Subir primer reel</Link>
            </Button>
          </div>
        </section>
      </main>
      
      <footer className="py-6 px-4 border-t">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <Video className="h-5 w-5 text-reel-purple mr-2" />
              <span className="font-semibold text-lg">ReelAI</span>
            </div>
            <div className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} ReelAI. Todos los derechos reservados.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
