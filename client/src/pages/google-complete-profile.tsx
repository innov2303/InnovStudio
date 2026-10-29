import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useForceLight } from "@/hooks/use-force-light";
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { googleProfileSchema, type GoogleProfileData } from "@shared/schema";

type PendingGoogleSignup = {
  email: string;
  firstName: string;
  lastName: string;
};

export default function GoogleCompleteProfile() {
  useForceLight();
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const [pending, setPending] = useState<PendingGoogleSignup | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<GoogleProfileData>({
    resolver: zodResolver(googleProfileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      company: "",
      address: "",
      postalCode: "",
      city: "",
      sameAsBilling: true,
      billingAddress: "",
      billingPostalCode: "",
      billingCity: "",
    },
  });
  const sameAsBilling = form.watch("sameAsBilling");

  useEffect(() => {
    let active = true;
    fetch("/api/auth/google/pending", { credentials: "include" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Connexion Google expirée");
        return response.json();
      })
      .then((data: PendingGoogleSignup) => {
        if (!active) return;
        setPending(data);
        form.setValue("firstName", data.firstName);
        form.setValue("lastName", data.lastName);
      })
      .catch(() => {
        if (!active) return;
        toast({
          title: "Connexion expirée",
          description: "Reconnectez-vous avec Google pour continuer.",
          variant: "destructive",
        });
        setLocation("/login?google_error=invalid_state");
      })
      .finally(() => {
        if (active) setIsChecking(false);
      });

    return () => {
      active = false;
    };
  }, [form, setLocation, toast]);

  const completeProfileMutation = useMutation({
    mutationFn: async (data: GoogleProfileData) => {
      const response = await apiRequest("POST", "/api/auth/google/complete-profile", data);
      return response.json();
    },
    onSuccess: (data) => {
      login(data.user);
      toast({ title: "Compte créé", description: "Bienvenue sur Innov Studio." });
      setLocation("/dashboard");
    },
    onError: (requestError: Error) => {
      setError(requestError.message || "Impossible de finaliser la création du compte.");
    },
  });

  const onSubmit = (data: GoogleProfileData) => {
    setError(null);
    completeProfileMutation.mutate(data);
  };

  if (isChecking) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background text-muted-foreground" aria-live="polite">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Vérification de votre compte Google…
      </main>
    );
  }

  if (!pending) return null;

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
          <Link href="/login">
            <Button variant="ghost" className="mb-6 gap-2">
              <ArrowLeft className="h-4 w-4" />
              Retour à la connexion
            </Button>
          </Link>

          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Finalisez votre compte</CardTitle>
              <CardDescription>
                Votre adresse Google est vérifiée. Complétez ces informations avant d’accéder à votre espace client.
              </CardDescription>
              <p className="pt-2 font-medium text-primary" data-testid="text-google-email">{pending.email}</p>
            </CardHeader>

            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  {error && (
                    <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive" role="alert">
                      {error}
                    </div>
                  )}

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prénom</FormLabel>
                          <FormControl><Input autoComplete="given-name" {...field} /></FormControl>
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
                          <FormControl><Input autoComplete="family-name" {...field} /></FormControl>
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
                        <FormControl><Input autoComplete="organization" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Adresse</FormLabel>
                        <FormControl><Input autoComplete="street-address" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="postalCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Code postal</FormLabel>
                          <FormControl><Input autoComplete="postal-code" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ville</FormLabel>
                          <FormControl><Input autoComplete="address-level2" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="sameAsBilling"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormLabel className="cursor-pointer leading-5">
                          L’adresse de facturation est identique à l’adresse de l’entreprise
                        </FormLabel>
                      </FormItem>
                    )}
                  />

                  {!sameAsBilling && (
                    <>
                      <FormField
                        control={form.control}
                        name="billingAddress"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Adresse de facturation</FormLabel>
                            <FormControl><Input autoComplete="billing street-address" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="billingPostalCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Code postal</FormLabel>
                              <FormControl><Input autoComplete="billing postal-code" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="billingCity"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Ville</FormLabel>
                              <FormControl><Input autoComplete="billing address-level2" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </>
                  )}

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={completeProfileMutation.isPending}
                    data-testid="button-complete-google-profile"
                  >
                    {completeProfileMutation.isPending ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Création du compte…</>
                    ) : (
                      "Créer mon compte"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
