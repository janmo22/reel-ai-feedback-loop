
import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="py-6 px-4 border-t bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-6 md:mb-0">
            <img src="/lovable-uploads/23bce40c-310f-4879-a62c-17047b61ab18.png" alt="Flow Logo" className="h-8 mr-2" />
            <span className="font-bold text-lg bg-gradient-to-r from-flow-blue to-flow-accent bg-clip-text text-transparent">Flow ReelAI</span>
          </div>
          <div className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Flow · Creado por <a href="https://instagram.com/janmoliner.ia" target="_blank" rel="noopener noreferrer" className="text-flow-blue hover:text-flow-accent transition-colors">@janmoliner.ia</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
