
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const CallToAction: React.FC = () => {
  return (
    <section className="py-16 px-4 bg-flow-blue/5">
      <div className="container mx-auto max-w-5xl text-center">
        <h2 className="text-3xl font-bold mb-6">¿Listo para potenciar tu contenido?</h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Únete hoy y comienza a mejorar tus reels con el poder de la inteligencia artificial.
        </p>
        <Button asChild size="lg" className="bg-flow-blue hover:bg-flow-electric transition-all duration-300 shadow-md hover:shadow-lg">
          <Link to="/auth">Empieza ya</Link>
        </Button>
      </div>
    </section>
  );
};

export default CallToAction;
