
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Star, BarChart2 } from "lucide-react";

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-flow-blue/10 to-flow-accent/5 border-b">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img 
              src="/lovable-uploads/43d0d4b9-0d80-4f4b-bd92-87de16ec68d8.png" 
              alt="FLOW Logo" 
              className="h-8" 
            />
            <span className="font-bold text-xl bg-gradient-to-r from-flow-blue to-flow-accent bg-clip-text text-transparent">
              Flow ReelAI
            </span>
          </div>
          <div className="flex gap-4">
            <Button asChild variant="ghost" size="sm">
              <Link to="/auth">Iniciar sesión</Link>
            </Button>
            <Button asChild size="sm" className="bg-flow-blue hover:bg-flow-electric">
              <Link to="/auth">Registrarse</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 px-4 bg-gradient-to-br from-flow-blue/10 via-background to-flow-accent/10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <div className="absolute -top-20 -left-20 w-72 h-72 bg-flow-blue rounded-full filter blur-3xl"></div>
            <div className="absolute top-40 right-20 w-96 h-96 bg-flow-accent rounded-full filter blur-3xl"></div>
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
                    <Link to="/auth">Empieza ya</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <a href="#como-funciona">Cómo funciona <ArrowRight className="ml-2 h-4 w-4" /></a>
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

        {/* Features Section */}
        <section id="como-funciona" className="py-16 px-4">
          <div className="container mx-auto max-w-5xl">
            <h2 className="text-3xl font-bold mb-3 text-center">Cómo funciona</h2>
            <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-12">
              Flow ReelAI analiza tus videos y te ofrece recomendaciones personalizadas para mejorar tu rendimiento
            </p>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-gradient-to-br from-background to-muted/30 p-6 rounded-xl border shadow-sm">
                <div className="h-12 w-12 rounded-full bg-flow-blue/10 flex items-center justify-center mb-4">
                  <Star className="h-6 w-6 text-flow-blue" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Sube tu reel</h3>
                <p className="text-muted-foreground">
                  Sube tu video en cualquier formato popular y obtén un análisis detallado en minutos.
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-background to-muted/30 p-6 rounded-xl border shadow-sm">
                <div className="h-12 w-12 rounded-full bg-flow-accent/10 flex items-center justify-center mb-4">
                  <BarChart2 className="h-6 w-6 text-flow-accent" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Análisis de IA</h3>
                <p className="text-muted-foreground">
                  Nuestro modelo analiza múltiples aspectos de tu contenido para optimizarlo y aumentar su alcance.
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-background to-muted/30 p-6 rounded-xl border shadow-sm">
                <div className="h-12 w-12 rounded-full bg-flow-electric/10 flex items-center justify-center mb-4">
                  <CheckCircle className="h-6 w-6 text-flow-electric" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Mejora continua</h3>
                <p className="text-muted-foreground">
                  Recibe recomendaciones personalizadas para mejorar tus futuros videos y aumentar tu engagement.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Testimonials Section */}
        <section className="py-16 px-4 bg-muted/20">
          <div className="container mx-auto max-w-5xl">
            <h2 className="text-3xl font-bold mb-12 text-center">Lo que dicen nuestros usuarios</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-xl border shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-12 w-12 rounded-full bg-gray-200"></div>
                  <div>
                    <h4 className="font-semibold">Laura Martínez</h4>
                    <p className="text-sm text-muted-foreground">@laura.creadora</p>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  "Flow ReelAI ha transformado completamente la forma en que creo contenido. Las recomendaciones son precisas y han aumentado mi engagement un 45% en solo un mes."
                </p>
                <div className="flex mt-4 text-amber-400">
                  <Star className="h-5 w-5 fill-current" />
                  <Star className="h-5 w-5 fill-current" />
                  <Star className="h-5 w-5 fill-current" />
                  <Star className="h-5 w-5 fill-current" />
                  <Star className="h-5 w-5 fill-current" />
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl border shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-12 w-12 rounded-full bg-gray-200"></div>
                  <div>
                    <h4 className="font-semibold">Carlos Ruiz</h4>
                    <p className="text-sm text-muted-foreground">@carlosmarketing</p>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  "Increíble herramienta para cualquier creador de contenido. El análisis profundo de cada reel me ha permitido entender exactamente qué funciona y qué no en mis videos."
                </p>
                <div className="flex mt-4 text-amber-400">
                  <Star className="h-5 w-5 fill-current" />
                  <Star className="h-5 w-5 fill-current" />
                  <Star className="h-5 w-5 fill-current" />
                  <Star className="h-5 w-5 fill-current" />
                  <Star className="h-5 w-5 fill-current" />
                </div>
              </div>
            </div>
            
            <div className="text-center mt-12">
              <Button asChild size="lg" className="bg-flow-blue hover:bg-flow-electric">
                <Link to="/auth">Empieza ya</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-8 px-4 border-t bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto max-w-5xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center">
              <img src="/lovable-uploads/23bce40c-310f-4879-a62c-17047b61ab18.png" alt="Flow Logo" className="h-8 mr-2" />
              <span className="font-bold text-lg bg-gradient-to-r from-flow-blue to-flow-accent bg-clip-text text-transparent">Flow ReelAI</span>
            </div>
            
            <div className="flex gap-8">
              <a href="#como-funciona" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Cómo funciona
              </a>
              <Link to="/auth" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Iniciar sesión
              </Link>
              <Link to="/auth" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Registrarse
              </Link>
            </div>
            
            <div className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Flow · <a href="https://instagram.com/janmoliner.ia" target="_blank" rel="noopener noreferrer" className="text-flow-blue hover:text-flow-accent transition-colors">@janmoliner.ia</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
