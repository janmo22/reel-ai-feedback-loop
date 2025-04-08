
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { VideoIcon, HistoryIcon, HomeIcon, Instagram } from "lucide-react";

const Header = () => {
  return (
    <header className="sticky top-0 z-10 bg-white/80 dark:bg-flow-dark/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <img 
            src="/lovable-uploads/23bce40c-310f-4879-a62c-17047b61ab18.png" 
            alt="Flow Logo" 
            className="h-8" 
          />
          <span className="font-tt-travel font-bold text-xl electric-text">
            ReelAI
          </span>
        </Link>

        <nav className="hidden md:flex gap-6 items-center">
          <Link 
            to="/" 
            className="text-foreground/70 hover:text-foreground transition-colors flex items-center gap-1 font-satoshi"
          >
            <HomeIcon className="h-4 w-4" />
            <span>Inicio</span>
          </Link>
          <Link 
            to="/upload" 
            className="text-foreground/70 hover:text-foreground transition-colors flex items-center gap-1 font-satoshi"
          >
            <VideoIcon className="h-4 w-4" />
            <span>Subir Reel</span>
          </Link>
          <Link 
            to="/history" 
            className="text-foreground/70 hover:text-foreground transition-colors flex items-center gap-1 font-satoshi"
          >
            <HistoryIcon className="h-4 w-4" />
            <span>Historial</span>
          </Link>
          <a 
            href="https://instagram.com/janmoliner.ia" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-foreground/70 hover:text-foreground transition-colors flex items-center gap-1 font-satoshi"
          >
            <Instagram className="h-4 w-4" />
            <span>@janmoliner.ia</span>
          </a>
          <Button className="bg-flow-electric hover:bg-flow-electric/90">
            Comenzar
          </Button>
        </nav>
        
        <div className="md:hidden">
          <Button variant="ghost" size="icon">
            <span className="sr-only">Menú</span>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 6h16M4 12h16M4 18h16" 
              />
            </svg>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
