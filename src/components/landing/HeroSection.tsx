
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const HeroSection: React.FC = () => {
  return (
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
                <Link to="/auth">Empieza ya</Link>
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
  );
};

export default HeroSection;
