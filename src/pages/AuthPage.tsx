
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2, AlertCircle, Mail } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

const AuthPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const { signIn, signUp, signInWithGoogle } = useAuth();
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
  
  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      // La redirección la manejará el flujo OAuth
    } catch (error) {
      console.error("Error during Google sign-in:", error);
      // El estado googleLoading se desactiva aquí si hay error
      setGoogleLoading(false);
      
      toast({
        title: "Error de autenticación con Google",
        description: "Por favor, verifica que hayas habilitado el inicio de sesión con Google en la consola de Supabase.",
        variant: "destructive"
      });
    }
    // No desactivamos googleLoading aquí si todo va bien, ya que la página se redirigirá
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-flow-blue/5 via-background to-flow-accent/5 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-10">
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-flow-blue rounded-full filter blur-3xl"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-flow-accent rounded-full filter blur-3xl"></div>
      </div>
      
      <Card className="w-full max-w-md relative z-10 border-flow-blue/10 shadow-xl backdrop-blur-sm">
        <Tabs defaultValue="login" className="w-full">
          <CardHeader className="pb-2">
            <div className="flex flex-col items-center justify-center mb-6">
              <img 
                src="/lovable-uploads/3c9a72c2-c7cb-434b-a53c-191e56b8a161.png" 
                alt="FLOW Logo" 
                className="h-16 mb-2" 
              />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-flow-blue to-flow-accent bg-clip-text text-transparent">FLOW</h1>
              <p className="text-muted-foreground">Analiza tus reels con IA</p>
            </div>
            <TabsList className="grid w-full grid-cols-2 bg-muted/50">
              <TabsTrigger value="login" className="data-[state=active]:bg-flow-blue/10 data-[state=active]:text-flow-blue">
                Iniciar sesión
              </TabsTrigger>
              <TabsTrigger value="register" className="data-[state=active]:bg-flow-blue/10 data-[state=active]:text-flow-blue">
                Registrarse
              </TabsTrigger>
            </TabsList>
          </CardHeader>
          
          <CardContent className="pt-4">
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
                      className="border-muted-foreground/20 focus-visible:ring-flow-blue"
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
                      className="border-muted-foreground/20 focus-visible:ring-flow-blue"
                    />
                  </div>
                  <Button 
                    className="w-full bg-flow-blue hover:bg-flow-blue/90 text-white" 
                    type="submit" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Cargando...
                      </>
                    ) : (
                      "Iniciar sesión"
                    )}
                  </Button>
                  
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <Separator className="w-full" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-background px-2 text-xs text-muted-foreground">
                        O continúa con
                      </span>
                    </div>
                  </div>
                  
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full flex gap-2 items-center justify-center border-flow-blue/20 hover:bg-flow-blue/5" 
                    onClick={handleGoogleLogin}
                    disabled={googleLoading}
                  >
                    {googleLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 186.69 190.5">
                          <g transform="translate(1184.583 765.171)">
                            <path d="M-1089.333-687.239v36.888h51.262c-2.251 11.863-9.006 21.908-19.137 28.662l30.913 23.986c18.011-16.625 28.402-41.044 28.402-70.052 0-6.754-.606-13.249-1.732-19.483z" fill="#4285f4"/>
                            <path d="M-1142.714-651.791l-6.972 5.337-24.679 19.223h0c15.673 31.086 47.796 52.561 85.03 52.561 25.717 0 47.278-8.486 63.038-23.033l-30.913-23.986c-8.486 5.715-19.31 9.179-32.125 9.179-24.765 0-45.806-16.712-53.34-39.226z" fill="#34a853"/>
                            <path d="M-1174.365-712.61c-6.494 12.815-10.217 27.276-10.217 42.689s3.723 29.874 10.217 42.689c0 .086 31.693-24.592 31.693-24.592-1.905-5.715-3.031-11.776-3.031-18.098s1.126-12.383 3.031-18.098z" fill="#fbbc05"/>
                            <path d="M-1089.333-727.244c14.028 0 26.497 4.849 36.455 14.201l27.276-27.276c-16.539-15.413-38.013-24.852-63.731-24.852-37.234 0-69.359 21.388-85.032 52.561l31.692 24.592c7.533-22.514 28.575-39.226 53.34-39.226z" fill="#ea4335"/>
                          </g>
                        </svg>
                        Iniciar con Google
                      </>
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
                    className="w-full bg-flow-blue hover:bg-flow-blue/90 text-white" 
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
                          className="border-muted-foreground/20 focus-visible:ring-flow-blue"
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
                          className="border-muted-foreground/20 focus-visible:ring-flow-blue"
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
                        className="border-muted-foreground/20 focus-visible:ring-flow-blue"
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
                        className="border-muted-foreground/20 focus-visible:ring-flow-blue"
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
                        className="border-muted-foreground/20 focus-visible:ring-flow-blue"
                      />
                    </div>
                    <Button 
                      className="w-full bg-flow-blue hover:bg-flow-blue/90 text-white" 
                      type="submit" 
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Cargando...
                        </>
                      ) : (
                        "Crear cuenta"
                      )}
                    </Button>
                    
                    <div className="relative my-4">
                      <div className="absolute inset-0 flex items-center">
                        <Separator className="w-full" />
                      </div>
                      <div className="relative flex justify-center">
                        <span className="bg-background px-2 text-xs text-muted-foreground">
                          O continúa con
                        </span>
                      </div>
                    </div>
                    
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-full flex gap-2 items-center justify-center border-flow-blue/20 hover:bg-flow-blue/5" 
                      onClick={handleGoogleLogin}
                      disabled={googleLoading}
                    >
                      {googleLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 186.69 190.5">
                            <g transform="translate(1184.583 765.171)">
                              <path d="M-1089.333-687.239v36.888h51.262c-2.251 11.863-9.006 21.908-19.137 28.662l30.913 23.986c18.011-16.625 28.402-41.044 28.402-70.052 0-6.754-.606-13.249-1.732-19.483z" fill="#4285f4"/>
                              <path d="M-1142.714-651.791l-6.972 5.337-24.679 19.223h0c15.673 31.086 47.796 52.561 85.03 52.561 25.717 0 47.278-8.486 63.038-23.033l-30.913-23.986c-8.486 5.715-19.31 9.179-32.125 9.179-24.765 0-45.806-16.712-53.34-39.226z" fill="#34a853"/>
                              <path d="M-1174.365-712.61c-6.494 12.815-10.217 27.276-10.217 42.689s3.723 29.874 10.217 42.689c0 .086 31.693-24.592 31.693-24.592-1.905-5.715-3.031-11.776-3.031-18.098s1.126-12.383 3.031-18.098z" fill="#fbbc05"/>
                              <path d="M-1089.333-727.244c14.028 0 26.497 4.849 36.455 14.201l27.276-27.276c-16.539-15.413-38.013-24.852-63.731-24.852-37.234 0-69.359 21.388-85.032 52.561l31.692 24.592c7.533-22.514 28.575-39.226 53.34-39.226z" fill="#ea4335"/>
                            </g>
                          </svg>
                          Registrarse con Google
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </TabsContent>
          </CardContent>
          
          <CardFooter>
            <p className="text-center text-xs text-muted-foreground w-full mt-2">
              Al continuar, aceptas nuestros términos de servicio y política de privacidad.
            </p>
          </CardFooter>
        </Tabs>
      </Card>
    </div>
  );
};

export default AuthPage;
