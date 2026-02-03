import { useEffect, useState } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function VerifyEmail() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const token = params.get("token");
  
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Token de vérification manquant");
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch(`/api/auth/verify-email?token=${token}`);
        const data = await response.json();
        
        if (response.ok) {
          setStatus("success");
          setMessage(data.message);
        } else {
          setStatus("error");
          setMessage(data.message || "Erreur lors de la vérification");
        }
      } catch (error) {
        setStatus("error");
        setMessage("Erreur de connexion au serveur");
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b">
        <div className="container mx-auto flex items-center justify-between gap-4 px-6 py-2">
          <Link href="/">
            <span className="text-xl md:text-2xl font-light tracking-wide bg-gradient-to-r from-primary via-cyan-400 to-primary bg-clip-text text-transparent cursor-pointer">
              Innov Studio
            </span>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="text-center">
              {status === "loading" && (
                <>
                  <div className="flex justify-center mb-4">
                    <Loader2 className="h-16 w-16 text-primary animate-spin" />
                  </div>
                  <CardTitle className="text-2xl">Vérification en cours...</CardTitle>
                  <CardDescription>
                    Veuillez patienter pendant que nous vérifions votre adresse email.
                  </CardDescription>
                </>
              )}
              
              {status === "success" && (
                <>
                  <div className="flex justify-center mb-4">
                    <CheckCircle className="h-16 w-16 text-green-500" />
                  </div>
                  <CardTitle className="text-2xl text-green-600">Email vérifié !</CardTitle>
                  <CardDescription>
                    {message}
                  </CardDescription>
                </>
              )}
              
              {status === "error" && (
                <>
                  <div className="flex justify-center mb-4">
                    <XCircle className="h-16 w-16 text-destructive" />
                  </div>
                  <CardTitle className="text-2xl text-destructive">Erreur de vérification</CardTitle>
                  <CardDescription>
                    {message}
                  </CardDescription>
                </>
              )}
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              {status === "success" && (
                <Link href="/login">
                  <Button data-testid="button-go-login">
                    Se connecter
                  </Button>
                </Link>
              )}
              
              {status === "error" && (
                <div className="flex flex-col items-center gap-2">
                  <p className="text-sm text-muted-foreground text-center">
                    Le lien peut être expiré ou invalide. Essayez de vous réinscrire.
                  </p>
                  <Link href="/register">
                    <Button variant="outline" data-testid="button-go-register">
                      Créer un nouveau compte
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
