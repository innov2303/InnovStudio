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
import { useForceDark } from "@/hooks/use-force-dark";
import { registerSchema, type RegisterData } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, Loader2, Mail, CheckCircle, Eye, EyeOff } from "lucide-react";

export default function Register() {
  useForceDark();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [resendCooldown, setResendCooldown] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
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
      return { ...await response.json(), email: data.email };
    },
    onSuccess: (data) => {
      setRegisteredEmail(data.email);
      setRegistrationSuccess(true);
      toast({
        title: "Inscription réussie",
        description: "Vérifiez votre boîte mail pour activer votre compte.",
      });
    },
    onError: (error: Error) => {
      setError(error.message || "Une erreur est survenue lors de l'inscription");
    },
  });

  const resendMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/auth/resend-verification", { email: registeredEmail });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Email envoyé",
        description: data.message,
      });
      setResendCooldown(true);
      setTimeout(() => setResendCooldown(false), 60000);
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de renvoyer l'email",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RegisterData) => {
    setError(null);
    registerMutation.mutate(data);
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

      <main className="flex-1 flex items-center justify-center p-6 py-12">
        <div className="w-full max-w-2xl">
          <Link href="/">
            <Button variant="ghost" className="mb-6 gap-2" data-testid="button-back-home">
              <ArrowLeft className="h-4 w-4" />
              Retour à l'accueil
            </Button>
          </Link>

          {registrationSuccess ? (
            <Card>
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Mail className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-2xl" data-testid="text-verify-email-title">Vérifiez votre email</CardTitle>
                <CardDescription className="text-base" data-testid="text-verify-email-description">
                  Un email de vérification a été envoyé à
                </CardDescription>
                <p className="font-medium text-primary mt-2" data-testid="text-registered-email">{registeredEmail}</p>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2 justify-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Cliquez sur le lien dans l'email pour activer votre compte</span>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>Vous n'avez pas reçu l'email ? Vérifiez vos spams.</p>
                  <Button 
                    variant="ghost"
                    size="sm"
                    onClick={() => resendMutation.mutate()}
                    disabled={resendMutation.isPending || resendCooldown}
                    data-testid="button-resend-verification"
                  >
                    {resendMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Envoi...
                      </>
                    ) : resendCooldown ? (
                      "Email envoyé, réessayez dans 1 minute"
                    ) : (
                      "Renvoyer l'email de vérification"
                    )}
                  </Button>
                </div>
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
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="jean.dupont@example.com"
                              data-testid="input-email"
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
                            <div className="relative">
                              <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                className="pr-10"
                                data-testid="input-password"
                                {...field}
                              />
                              <button
                                type="button"
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                onClick={() => setShowPassword(!showPassword)}
                                data-testid="button-toggle-password"
                              >
                                {showPassword ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </button>
                            </div>
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
          )}
        </div>
      </main>
    </div>
  );
}
