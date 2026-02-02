import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Code2, 
  LogOut, 
  User, 
  Building2, 
  MapPin, 
  Receipt,
  Users,
  Settings,
  Shield,
  Loader2
} from "lucide-react";
import type { User as UserType } from "@shared/schema";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { user, logout, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !user) {
      setLocation("/login");
    }
  }, [user, authLoading, setLocation]);

  useEffect(() => {
    if (user?.mustChangePassword) {
      setLocation("/change-password");
    }
  }, [user, setLocation]);

  const { data: allUsers, isLoading: usersLoading } = useQuery<UserType[]>({
    queryKey: ["/api/users"],
    enabled: user?.role === "admin",
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout", {});
    },
    onSuccess: () => {
      logout();
      queryClient.clear();
      toast({
        title: "Déconnexion réussie",
        description: "À bientôt !",
      });
      setLocation("/");
    },
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const initials = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b">
        <div className="container mx-auto flex items-center justify-between gap-4 px-6 py-4">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary">
                <Code2 className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">Innov Studio</span>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block">
                <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
                <p className="text-xs text-muted-foreground">{user.username}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              data-testid="button-logout"
            >
              {logoutMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              Bienvenue, {user.firstName} !
            </h1>
            <p className="text-muted-foreground">
              Gérez votre compte et accédez à vos informations
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">Profil</CardTitle>
                  <CardDescription>Vos informations personnelles</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Prénom</span>
                  <span className="text-sm font-medium" data-testid="text-firstname">{user.firstName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Nom</span>
                  <span className="text-sm font-medium" data-testid="text-lastname">{user.lastName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Identifiant</span>
                  <span className="text-sm font-medium" data-testid="text-username">{user.username}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">Entreprise</CardTitle>
                  <CardDescription>Informations de votre société</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold" data-testid="text-company">{user.company}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">Statut</CardTitle>
                  <CardDescription>Type de compte</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <Badge 
                  variant={user.role === "admin" ? "default" : "secondary"}
                  data-testid="badge-role"
                >
                  {user.role === "admin" ? "Administrateur" : "Client"}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">Adresse</CardTitle>
                  <CardDescription>Adresse principale</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm" data-testid="text-address">{user.address}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Receipt className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">Facturation</CardTitle>
                  <CardDescription>Adresse de facturation</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm" data-testid="text-billing-address">
                  {user.sameAsBilling ? user.address : user.billingAddress}
                </p>
                {user.sameAsBilling && (
                  <Badge variant="secondary" className="mt-2">
                    Identique à l'adresse principale
                  </Badge>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Settings className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">Paramètres</CardTitle>
                  <CardDescription>Gérer votre compte</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <Link href="/change-password">
                  <Button variant="outline" className="w-full" data-testid="button-change-password">
                    Changer le mot de passe
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {user.role === "admin" && (
            <div className="mt-8">
              <Card>
                <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Gestion des utilisateurs</CardTitle>
                    <CardDescription>Liste de tous les utilisateurs enregistrés</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  {usersLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : allUsers && allUsers.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Utilisateur</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Entreprise</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Rôle</th>
                          </tr>
                        </thead>
                        <tbody>
                          {allUsers.map((u) => (
                            <tr key={u.id} className="border-b last:border-0" data-testid={`row-user-${u.id}`}>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-8 w-8">
                                    <AvatarFallback className="bg-muted text-xs">
                                      {`${u.firstName[0]}${u.lastName[0]}`.toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="text-sm font-medium">{u.firstName} {u.lastName}</p>
                                    <p className="text-xs text-muted-foreground">{u.username}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <span className="text-sm">{u.company}</span>
                              </td>
                              <td className="py-3 px-4">
                                <Badge variant={u.role === "admin" ? "default" : "secondary"}>
                                  {u.role === "admin" ? "Admin" : "Client"}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      Aucun utilisateur enregistré
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
