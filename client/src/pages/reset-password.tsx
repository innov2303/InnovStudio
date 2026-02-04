import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useLocation, useSearch } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useForceDark } from "@/hooks/use-force-dark";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, Loader2, CheckCircle, XCircle, Eye, EyeOff } from "lucide-react";

const resetFormSchema = z.object({
  newPassword: z.string().min(6, "Minimum 6 caractères"),
  confirmPassword: z.string().min(6, "Confirmation requise"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type ResetFormData = z.infer<typeof resetFormSchema>;

export default function ResetPassword() {
  useForceDark();
  const [, setLocation] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const token = params.get("token");
  const { toast } = useToast();
  
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<ResetFormData>({
    resolver: zodResolver(resetFormSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const resetMutation = useMutation({
    mutationFn: async (data: ResetFormData) => {
      const response = await apiRequest("POST", "/api/auth/reset-password", {
        token,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setSuccess(true);
      toast({
        title: "Mot de passe réinitialisé",
        description: data.message,
      });
    },
    onError: (error: Error) => {
      setError(error.message || "Erreur lors de la réinitialisation");
    },
  });

  const onSubmit = (data: ResetFormData) => {
    if (resetMutation.isPending) return;
    setError(null);
    resetMutation.mutate(data);
  };

  if (!token) {
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
            <Card>
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <XCircle className="h-16 w-16 text-destructive" />
                </div>
                <CardTitle className="text-2xl text-destructive">Lien invalide</CardTitle>
                <CardDescription>
                  Le lien de réinitialisation est invalide ou a expiré.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-4">
                <Link href="/forgot-password">
                  <Button data-testid="button-request-new">
                    Demander un nouveau lien
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

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
                  <CheckCircle className="h-16 w-16 text-green-500" />
                </div>
                <CardTitle className="text-2xl text-green-600" data-testid="text-reset-success-title">
                  Mot de passe réinitialisé
                </CardTitle>
                <CardDescription data-testid="text-reset-success-message">
                  Votre mot de passe a été modifié avec succès.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-4">
                <Link href="/login">
                  <Button data-testid="button-go-login">
                    Se connecter
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Nouveau mot de passe</CardTitle>
                <CardDescription>
                  Choisissez un nouveau mot de passe pour votre compte
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    {error && (
                      <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive" data-testid="text-reset-error">
                        {error}
                      </div>
                    )}

                    <FormField
                      control={form.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nouveau mot de passe</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                data-testid="input-new-password"
                                {...field}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                onClick={() => setShowPassword(!showPassword)}
                                data-testid="button-toggle-password"
                              >
                                {showPassword ? (
                                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <Eye className="h-4 w-4 text-muted-foreground" />
                                )}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirmer le mot de passe</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="••••••••"
                                data-testid="input-confirm-password"
                                {...field}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                data-testid="button-toggle-confirm-password"
                              >
                                {showConfirmPassword ? (
                                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <Eye className="h-4 w-4 text-muted-foreground" />
                                )}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={resetMutation.isPending}
                      data-testid="button-submit-reset"
                    >
                      {resetMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Réinitialisation...
                        </>
                      ) : (
                        "Réinitialiser le mot de passe"
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
