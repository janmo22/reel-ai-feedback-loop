
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Video, Home } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-reel-purple/5 to-reel-pink/5">
      <div className="text-center max-w-md">
        <div className="mb-6 flex justify-center">
          <Video className="h-16 w-16 text-reel-purple opacity-50" />
        </div>
        <h1 className="text-4xl font-bold mb-2">404</h1>
        <p className="text-xl text-muted-foreground mb-6">
          Parece que esta página no existe o ha sido movida
        </p>
        <Button asChild>
          <Link to="/" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Volver al inicio
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
