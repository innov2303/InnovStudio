import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForceDark } from "@/hooks/use-force-dark";
import { forgotPasswordSchema, type ForgotPasswordData } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, Loader2, Mail, CheckCircle } from "lucide-react";

export default function ForgotPassword() {
  useForceDark();
  const [success, setSuccess] = useState(false);

  const form = useForm<ForgotPasswordData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const forgotMutation = useMutation({
    mutationFn: async (data: ForgotPasswordData) => {
      const response = await apiRequest("POST", "/api/auth/forgot-password", data);
      return response.json();
    },
    onSuccess: () => {
      setSuccess(true);
    },
  });

  const onSubmit = (data: ForgotPasswordData) => {
    if (forgotMutation.isPending) return;
    forgotMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b">
        <div className="container mx-auto flex items-center justify-between gap-4 px-6 py-2">
          <Link href="/">
            <span className="text-xl md:text-2xl font-light tracking-wide bg-gradient-to-r from-primary via-cyan-400 to-primary bg-clip-text text-transparent cursor-pointer">
              Innov Studio
            </span>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Link href="/login">
            <Button variant="ghost" className="mb-6 gap-2" data-testid="button-back-login">
              <ArrowLeft className="h-4 w-4" />
              Retour à la connexion
            </Button>
          </Link>

          {success ? (
            <Card>
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Mail className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-2xl" data-testid="text-forgot-success-title">Email envoyé</CardTitle>
                <CardDescription className="text-base" data-testid="text-forgot-success-message">
                  Si un compte existe avec cet email, vous recevrez un lien pour réinitialiser votre mot de passe.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2 justify-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Vérifiez votre boîte de réception et vos spams</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Le lien est valable pendant 1 heure.
                </p>
                <Link href="/login">
                  <Button variant="outline" className="mt-4" data-testid="button-go-login">
                    Retour à la connexion
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Mot de passe oublié</CardTitle>
                <CardDescription>
                  Entrez votre adresse email pour recevoir un lien de réinitialisation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="votre@email.com"
                              data-testid="input-email"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={forgotMutation.isPending}
                      data-testid="button-submit-forgot"
                    >
                      {forgotMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Envoi...
                        </>
                      ) : (
                        "Envoyer le lien de réinitialisation"
                      )}
                    </Button>
                  </form>
                </Form>

                <div className="mt-6 text-center text-sm">
                  <span className="text-muted-foreground">Vous vous souvenez ? </span>
                  <Link href="/login">
                    <span className="text-primary hover:underline cursor-pointer" data-testid="link-login">
                      Se connecter
                    </span>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
