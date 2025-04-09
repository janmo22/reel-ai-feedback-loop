
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { 
  Upload, 
  BarChart3,
  BrainCircuit,
} from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section - Simplified */}
        <section className="py-16 px-4 bg-gradient-to-br from-flow-blue/10 via-background to-flow-accent/10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <div className="absolute -top-20 -left-20 w-72 h-72 bg-flow-blue rounded-full filter blur-3xl animate-flow-wave"></div>
            <div className="absolute top-40 right-20 w-96 h-96 bg-flow-accent rounded-full filter blur-3xl animate-flow-wave" style={{ animationDelay: '1s' }}></div>
          </div>
          
          <div className="container mx-auto max-w-5xl relative z-10">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                  Mejora tus <span className="bg-gradient-to-r from-flow-blue to-flow-accent bg-clip-text text-transparent">reels</span> con análisis de IA
                </h1>
                <p className="text-lg text-muted-foreground">
                  Obtén feedback detallado sobre tus videos y optimiza tu contenido con recomendaciones personalizadas.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button asChild size="lg" className="bg-flow-blue hover:bg-flow-blue/90 text-white">
                    <Link to="/upload">Analizar mi reel</Link>
                  </Button>
                </div>
              </div>
              
              <div className="relative hidden md:block">
                <div className="aspect-[9/16] max-w-xs mx-auto bg-flow-dark rounded-3xl border-8 border-flow-dark shadow-xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-flow-blue/30 to-flow-accent/30 opacity-70"></div>
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
        
        {/* Features Section - Simplified */}
        <section className="py-12 px-4">
          <div className="container mx-auto max-w-5xl">
            <div className="grid md:grid-cols-3 gap-6">
              <FeatureCard 
                icon={<Upload className="h-6 w-6 text-flow-blue" />} 
                title="Sube tu reel"
                description="Sube tu video en cualquier formato popular y obtén un análisis detallado."
                colorClass="bg-flow-blue/10"
              />
              
              <FeatureCard 
                icon={<BarChart3 className="h-6 w-6 text-flow-accent" />} 
                title="Análisis de IA"
                description="Nuestro modelo analiza múltiples aspectos de tu contenido para optimizarlo."
                colorClass="bg-flow-accent/10"
              />
              
              <FeatureCard 
                icon={<BrainCircuit className="h-6 w-6 text-flow-blue" />} 
                title="Mejora continua"
                description="Recibe recomendaciones personalizadas para mejorar tus futuros videos."
                colorClass="bg-flow-blue/10"
              />
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-12 px-4 bg-flow-blue/10">
          <div className="container mx-auto max-w-5xl text-center">
            <h2 className="text-2xl font-bold mb-4">¿Listo para mejorar tus reels?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
              Comienza hoy mismo a recibir feedback profesional generado por IA.
            </p>
            <Button asChild size="lg" className="bg-flow-blue hover:bg-flow-blue/90 text-white">
              <Link to="/upload">Analizar mi primer reel</Link>
            </Button>
          </div>
        </section>
      </main>
      
      <footer className="py-6 px-4 border-t">
        <div className="container mx-auto max-w-5xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <img 
                src="/lovable-uploads/23bce40c-310f-4879-a62c-17047b61ab18.png" 
                alt="Flow Logo" 
                className="h-6 mr-2" 
              />
              <span className="font-semibold">Flow ReelAI</span>
            </div>
            <div className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Flow. Creado por <a 
                href="https://instagram.com/janmoliner.ai" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-flow-blue hover:text-flow-accent"
              >@janmoliner.ai</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Component extracted to simplify the main component
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
    <div className="p-6 border rounded-lg bg-card shadow-sm">
      <div className={`rounded-full ${colorClass} p-3 w-12 h-12 flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">
        {description}
      </p>
    </div>
  );
};

export default Index;
