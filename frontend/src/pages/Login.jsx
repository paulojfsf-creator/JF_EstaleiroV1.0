import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/App";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const LOGO_URL = "https://customer-assets.emergentagent.com/job_construction-hub-119/artifacts/t5nlg1av_logo_jose_firmino_word-removebg-preview.png";

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({ name: "", email: "", password: "" });

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(loginData.email, loginData.password);
      toast.success("Sessão iniciada com sucesso!");
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Erro ao iniciar sessão");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await register(registerData.name, registerData.email, registerData.password);
      toast.success("Conta criada com sucesso!");
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Erro ao criar conta");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <img 
              src={LOGO_URL} 
              alt="José Firmino" 
              className="h-16 w-auto object-contain"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>
          <p className="text-neutral-400">Gestão de Armazém de Construção Civil</p>
        </div>

        <Card className="bg-neutral-900 border-neutral-800">
          <Tabs defaultValue="login" className="w-full">
            <CardHeader className="pb-0">
              <TabsList className="grid w-full grid-cols-2 bg-neutral-800">
                <TabsTrigger value="login" data-testid="login-tab" className="data-[state=active]:bg-orange-500 data-[state=active]:text-black">Entrar</TabsTrigger>
                <TabsTrigger value="register" data-testid="register-tab" className="data-[state=active]:bg-orange-500 data-[state=active]:text-black">Registar</TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent className="pt-6">
              <TabsContent value="login" className="mt-0">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="text-neutral-300">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      required
                      data-testid="login-email-input"
                      className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-neutral-300">Palavra-passe</Label>
                    <div className="relative">
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        required
                        data-testid="login-password-input"
                        className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-orange-500 hover:bg-orange-600 text-black font-semibold"
                    disabled={isLoading}
                    data-testid="login-submit-btn"
                  >
                    {isLoading ? "A entrar..." : "Entrar"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register" className="mt-0">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-name" className="text-neutral-300">Nome</Label>
                    <Input
                      id="register-name"
                      type="text"
                      placeholder="O seu nome"
                      value={registerData.name}
                      onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                      required
                      data-testid="register-name-input"
                      className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email" className="text-neutral-300">Email</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                      required
                      data-testid="register-email-input"
                      className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password" className="text-neutral-300">Palavra-passe</Label>
                    <div className="relative">
                      <Input
                        id="register-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={registerData.password}
                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                        required
                        minLength={6}
                        data-testid="register-password-input"
                        className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-orange-500 hover:bg-orange-600 text-black font-semibold"
                    disabled={isLoading}
                    data-testid="register-submit-btn"
                  >
                    {isLoading ? "A criar conta..." : "Criar Conta"}
                  </Button>
                </form>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
