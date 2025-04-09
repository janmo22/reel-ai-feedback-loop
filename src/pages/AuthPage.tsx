
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, AlertCircle, Mail } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const AuthPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await signIn(loginEmail, loginPassword);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    if (registerPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }
    
    try {
      await signUp(registerEmail, registerPassword, firstName, lastName);
      // After successful signup, show confirmation message
      setRegistrationSuccess(true);
      // Clear form
      setRegisterEmail("");
      setRegisterPassword("");
      setConfirmPassword("");
      setFirstName("");
      setLastName("");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <Tabs defaultValue="login" className="w-full">
          <CardHeader>
            <div className="text-center mb-4">
              <h1 className="text-3xl font-bold electric-text">FLOW</h1>
              <p className="text-muted-foreground">Analiza tus reels con IA</p>
            </div>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Iniciar sesión</TabsTrigger>
              <TabsTrigger value="register">Registrarse</TabsTrigger>
            </TabsList>
          </CardHeader>
          
          <CardContent>
            <TabsContent value="login">
              <form onSubmit={handleLogin}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="ejemplo@email.com"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Contraseña</Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                    />
                  </div>
                  <Button className="w-full" type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Cargando...
                      </>
                    ) : (
                      "Iniciar sesión"
                    )}
                  </Button>
                </div>
              </form>
            </TabsContent>
            
            <TabsContent value="register">
              {registrationSuccess ? (
                <div className="space-y-4">
                  <Alert className="bg-green-50 border-green-200">
                    <Mail className="h-5 w-5 text-green-600" />
                    <AlertTitle className="text-green-800">Registro exitoso</AlertTitle>
                    <AlertDescription className="text-green-700">
                      Se ha enviado un correo de confirmación a tu email. 
                      Por favor, verifica tu bandeja de entrada y confirma tu cuenta para continuar.
                    </AlertDescription>
                  </Alert>
                  <Button 
                    className="w-full" 
                    onClick={() => setRegistrationSuccess(false)}
                  >
                    Registrar otra cuenta
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleRegister}>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">Nombre</Label>
                        <Input
                          id="firstName"
                          placeholder="Juan"
                          required
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Apellido</Label>
                        <Input
                          id="lastName"
                          placeholder="Pérez"
                          required
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="registerEmail">Email</Label>
                      <Input
                        id="registerEmail"
                        type="email"
                        placeholder="ejemplo@email.com"
                        required
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="registerPassword">Contraseña</Label>
                      <Input
                        id="registerPassword"
                        type="password"
                        required
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                    <Button className="w-full" type="submit" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Cargando...
                        </>
                      ) : (
                        "Crear cuenta"
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </TabsContent>
          </CardContent>
          
          <CardFooter>
            <p className="text-center text-sm text-muted-foreground w-full">
              Al continuar, aceptas nuestros términos de servicio y política de privacidad.
            </p>
          </CardFooter>
        </Tabs>
      </Card>
    </div>
  );
};

export default AuthPage;
