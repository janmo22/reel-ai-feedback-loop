import React from "react";
const Footer: React.FC = () => {
  return <footer className="py-6 px-4 border-t bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-6 md:mb-0">
            <img src="/lovable-uploads/3c9a72c2-c7cb-434b-a53c-191e56b8a161.png" alt="Flow Logo" className="h-8 mr-2" />
            <span className="font-bold text-lg bg-gradient-to-r from-flow-blue to-flow-accent bg-clip-text text-transparent">Analiza con flow</span>
          </div>
          <div className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Flow · Creado por <a href="https://instagram.com/janmoliner.ia" target="_blank" rel="noopener noreferrer" className="text-flow-blue hover:text-flow-accent transition-colors">@janmoliner.ia</a>
          </div>
        </div>
      </div>
    </footer>;
};
export default Footer;