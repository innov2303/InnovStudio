import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

export default function ConfirmEmailChange() {
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const [newEmail, setNewEmail] = useState("");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    if (!token) {
      setStatus("error");
      setMessage("Token manquant");
      return;
    }

    fetch(`/api/auth/confirm-email-change?token=${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.message === "Email modifié avec succès") {
          setStatus("success");
          setMessage(data.message);
          setNewEmail(data.newEmail);
        } else {
          setStatus("error");
          setMessage(data.message || "Une erreur est survenue");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Une erreur est survenue");
      });
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {status === "loading" && (
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
            )}
            {status === "success" && (
              <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            )}
            {status === "error" && (
              <div className="h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
            )}
          </div>
          <CardTitle className="text-2xl">
            {status === "loading" && "Confirmation en cours..."}
            {status === "success" && "Email modifié !"}
            {status === "error" && "Erreur"}
          </CardTitle>
          <CardDescription>
            {status === "loading" && "Veuillez patienter..."}
            {status === "success" && (
              <>
                Votre adresse email a été changée vers :
                <br />
                <span className="font-semibold text-primary">{newEmail}</span>
              </>
            )}
            {status === "error" && message}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          {status !== "loading" && (
            <Link href="/dashboard">
              <Button data-testid="button-go-dashboard">
                Retour au tableau de bord
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
