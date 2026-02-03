import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { ThemeToggle } from "@/components/theme-toggle";
import { registerSchema, type RegisterData } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, Loader2 } from "lucide-react";
import logo from "@/assets/images/logo.png";

export default function Register() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      firstName: "",
      lastName: "",
      company: "",
      address: "",
      billingAddress: "",
      sameAsBilling: false,
    },
  });

  const sameAsBilling = form.watch("sameAsBilling");
  const address = form.watch("address");

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      const submitData = {
        ...data,
        billingAddress: data.sameAsBilling ? data.address : data.billingAddress,
      };
      const response = await apiRequest("POST", "/api/auth/register", submitData);
      return response.json();
    },
    onSuccess: (data) => {
      login(data.user);
      toast({
        title: "Inscription réussie",
        description: "Bienvenue sur Innov Studio !",
      });
      setLocation("/dashboard");
    },
    onError: (error: Error) => {
      setError(error.message || "Une erreur est survenue lors de l'inscription");
    },
  });

  const onSubmit = (data: RegisterData) => {
    setError(null);
    registerMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b">
        <div className="container mx-auto flex items-center justify-between gap-4 px-6 py-4">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <img src={logo} alt="Innov Studio" className="h-10 w-auto" />
            </div>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6 py-12">
        <div className="w-full max-w-2xl">
          <Link href="/">
            <Button variant="ghost" className="mb-6 gap-2" data-testid="button-back-home">
              <ArrowLeft className="h-4 w-4" />
              Retour à l'accueil
            </Button>
          </Link>

          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Créer un compte</CardTitle>
              <CardDescription>
                Rejoignez Innov Studio et accédez à votre espace client
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {error && (
                    <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive" data-testid="text-register-error">
                      {error}
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prénom</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Jean"
                              data-testid="input-firstname"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Dupont"
                              data-testid="input-lastname"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="company"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Entreprise</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Mon Entreprise SARL"
                            data-testid="input-company"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom d'utilisateur</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="jean.dupont"
                              data-testid="input-username"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mot de passe</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="••••••••"
                              data-testid="input-password"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Adresse</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="123 Rue de la Paix, 75001 Paris"
                            data-testid="input-address"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sameAsBilling"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="checkbox-same-billing"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="cursor-pointer">
                            L'adresse de facturation est identique à l'adresse
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  {!sameAsBilling && (
                    <FormField
                      control={form.control}
                      name="billingAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Adresse de facturation</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="456 Avenue des Champs-Élysées, 75008 Paris"
                              data-testid="input-billing-address"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={registerMutation.isPending}
                    data-testid="button-submit-register"
                  >
                    {registerMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Inscription...
                      </>
                    ) : (
                      "Créer mon compte"
                    )}
                  </Button>
                </form>
              </Form>

              <div className="mt-6 text-center text-sm">
                <span className="text-muted-foreground">Déjà un compte ? </span>
                <Link href="/login">
                  <span className="text-primary hover:underline cursor-pointer" data-testid="link-login">
                    Se connecter
                  </span>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
