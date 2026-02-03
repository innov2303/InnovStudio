import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  LogOut, 
  User, 
  Building2, 
  MapPin, 
  Receipt,
  Users,
  Settings,
  Shield,
  Loader2,
  LayoutDashboard,
  FolderKanban,
  FileText,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Home,
  Plus,
  Clock
} from "lucide-react";
import type { User as UserType, Project, CreateProjectData } from "@shared/schema";
import { createProjectSchema } from "@shared/schema";

type MenuSection = "dashboard" | "profile" | "projects" | "documents" | "users" | "settings";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { user, logout, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState<MenuSection>("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showProjectForm, setShowProjectForm] = useState(false);

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

  const { data: projects, isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
    enabled: !!user,
  });

  const projectForm = useForm<CreateProjectData>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      title: "",
      description: "",
      businessSector: "",
      features: "",
      designStyle: "",
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: async (data: CreateProjectData) => {
      const response = await apiRequest("POST", "/api/projects", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Demande envoyée",
        description: "Votre demande de projet a été soumise avec succès.",
      });
      projectForm.reset();
      setShowProjectForm(false);
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la soumission",
        variant: "destructive",
      });
    },
  });

  const onSubmitProject = (data: CreateProjectData) => {
    if (createProjectMutation.isPending) return;
    createProjectMutation.mutate(data);
  };

  const updateStatusMutation = useMutation({
    mutationFn: async ({ projectId, status }: { projectId: string; status: string }) => {
      const response = await apiRequest("PATCH", `/api/projects/${projectId}/status`, { status });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Statut mis à jour",
        description: "Le statut du projet a été modifié.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la mise à jour",
        variant: "destructive",
      });
    },
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

  const menuItems = [
    { id: "dashboard" as MenuSection, label: "Tableau de bord", icon: LayoutDashboard },
    { id: "profile" as MenuSection, label: "Mon Profil", icon: User },
    ...(user.role !== "admin" ? [{ id: "projects" as MenuSection, label: "Mes Projets", icon: FolderKanban }] : []),
    ...(user.role === "admin" ? [{ id: "projects" as MenuSection, label: "Gestion des projets", icon: FolderKanban }] : []),
    { id: "documents" as MenuSection, label: "Documents", icon: FileText },
    ...(user.role === "admin" ? [{ id: "users" as MenuSection, label: "Utilisateurs", icon: Users }] : []),
    { id: "settings" as MenuSection, label: "Paramètres", icon: Settings },
  ];

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className={`${sidebarCollapsed ? 'w-16' : 'w-64'} border-r bg-muted/30 flex flex-col transition-all duration-300`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b flex items-center justify-between">
          {!sidebarCollapsed && (
            <Link href="/">
              <span className="text-lg font-light tracking-wide bg-gradient-to-r from-primary via-cyan-400 to-primary bg-clip-text text-transparent cursor-pointer">
                Innov Studio
              </span>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="ml-auto"
            data-testid="button-toggle-sidebar"
          >
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-2 space-y-1">
          {menuItems.map((item) => (
            <Button
              key={item.id}
              variant={activeSection === item.id ? "secondary" : "ghost"}
              className={`w-full justify-start gap-3 ${sidebarCollapsed ? 'px-2' : ''}`}
              onClick={() => setActiveSection(item.id)}
              data-testid={`menu-${item.id}`}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!sidebarCollapsed && <span>{item.label}</span>}
            </Button>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-2 border-t space-y-1">
          <Link href="/">
            <Button variant="ghost" className={`w-full justify-start gap-3 ${sidebarCollapsed ? 'px-2' : ''}`}>
              <Home className="h-5 w-5 flex-shrink-0" />
              {!sidebarCollapsed && <span>Retour au site</span>}
            </Button>
          </Link>
          <Button
            variant="ghost"
            className={`w-full justify-start gap-3 text-destructive hover:text-destructive ${sidebarCollapsed ? 'px-2' : ''}`}
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
            data-testid="button-logout"
          >
            {logoutMutation.isPending ? (
              <Loader2 className="h-5 w-5 animate-spin flex-shrink-0" />
            ) : (
              <LogOut className="h-5 w-5 flex-shrink-0" />
            )}
            {!sidebarCollapsed && <span>Déconnexion</span>}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b px-6 py-3 flex items-center justify-between">
          <h1 className="text-xl font-semibold">
            {menuItems.find(m => m.id === activeSection)?.label || "Tableau de bord"}
          </h1>
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
                <p className="text-xs text-muted-foreground">{user.role === "admin" ? "Administrateur" : "Client"}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-auto">
          {/* Dashboard Section */}
          {activeSection === "dashboard" && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Projets actifs</CardTitle>
                    <FolderKanban className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">0</div>
                    <p className="text-xs text-muted-foreground">Aucun projet en cours</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Documents</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">0</div>
                    <p className="text-xs text-muted-foreground">Aucun document</p>
                  </CardContent>
                </Card>
                {user.role === "admin" && (
                  <>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Utilisateurs</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{allUsers?.length || 0}</div>
                        <p className="text-xs text-muted-foreground">Comptes enregistrés</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Statut</CardTitle>
                        <Shield className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <Badge>Administrateur</Badge>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Bienvenue, {user.firstName} !</CardTitle>
                  <CardDescription>
                    Utilisez le menu à gauche pour naviguer dans votre espace client.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          )}

          {/* Profile Section */}
          {activeSection === "profile" && (
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Informations personnelles</CardTitle>
                    <CardDescription>Vos informations de profil</CardDescription>
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
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Rôle</span>
                    <Badge variant={user.role === "admin" ? "default" : "secondary"} data-testid="badge-role">
                      {user.role === "admin" ? "Administrateur" : "Client"}
                    </Badge>
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
            </div>
          )}

          {/* Projects Section */}
          {activeSection === "projects" && (
            <div className="space-y-6">
              {/* Header - different for admin vs user */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">
                    {user.role === "admin" ? "Gestion des projets" : "Mes Projets"}
                  </h2>
                  <p className="text-muted-foreground">
                    {user.role === "admin" 
                      ? "Gérez les demandes de projets des clients" 
                      : "Suivez l'avancement de vos projets en temps réel"}
                  </p>
                </div>
                {user.role !== "admin" && (
                  <Button onClick={() => setShowProjectForm(!showProjectForm)} data-testid="button-new-project">
                    <Plus className="h-4 w-4 mr-2" />
                    Nouvelle demande
                  </Button>
                )}
              </div>

              {/* Project form */}
              {showProjectForm && (
                <Card>
                  <CardHeader>
                    <CardTitle>Nouvelle demande de projet</CardTitle>
                    <CardDescription>Décrivez votre projet pour que nous puissions vous accompagner</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...projectForm}>
                      <form onSubmit={projectForm.handleSubmit(onSubmitProject)} className="space-y-4">
                        <FormField
                          control={projectForm.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Titre / Nom du projet</FormLabel>
                              <FormControl>
                                <Input placeholder="Ex: Site vitrine pour mon entreprise" data-testid="input-project-title" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={projectForm.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description du besoin</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Décrivez votre projet et vos objectifs..." 
                                  className="min-h-[100px]"
                                  data-testid="input-project-description"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={projectForm.control}
                          name="businessSector"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Secteur d'activité</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-business-sector">
                                    <SelectValue placeholder="Sélectionnez votre secteur" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="commerce">Commerce / E-commerce</SelectItem>
                                  <SelectItem value="services">Services aux entreprises</SelectItem>
                                  <SelectItem value="industrie">Industrie</SelectItem>
                                  <SelectItem value="sante">Santé / Médical</SelectItem>
                                  <SelectItem value="education">Éducation / Formation</SelectItem>
                                  <SelectItem value="immobilier">Immobilier</SelectItem>
                                  <SelectItem value="restauration">Restauration / Hôtellerie</SelectItem>
                                  <SelectItem value="tech">Technologie / IT</SelectItem>
                                  <SelectItem value="autre">Autre</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={projectForm.control}
                          name="features"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description des fonctionnalités souhaitées</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Listez les fonctionnalités que vous souhaitez (formulaire de contact, espace client, blog, etc.)" 
                                  className="min-h-[100px]"
                                  data-testid="input-project-features"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={projectForm.control}
                          name="designStyle"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Style de design souhaité</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-design-style">
                                    <SelectValue placeholder="Sélectionnez un style" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="moderne">Moderne & Minimaliste</SelectItem>
                                  <SelectItem value="corporate">Corporate / Professionnel</SelectItem>
                                  <SelectItem value="creatif">Créatif & Artistique</SelectItem>
                                  <SelectItem value="luxe">Luxe & Premium</SelectItem>
                                  <SelectItem value="tech">Tech & Futuriste</SelectItem>
                                  <SelectItem value="nature">Nature & Écologique</SelectItem>
                                  <SelectItem value="autre">Autre (à préciser)</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {projectForm.watch("designStyle") === "autre" && (
                          <FormField
                            control={projectForm.control}
                            name="designStyle"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Précisez le style souhaité</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="Décrivez le style que vous imaginez..." 
                                    data-testid="input-design-style-other"
                                    value={field.value.startsWith("autre:") ? field.value.replace("autre:", "") : ""}
                                    onChange={(e) => field.onChange(`autre:${e.target.value}`)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}

                        <div className="flex gap-3 pt-4">
                          <Button 
                            type="submit" 
                            disabled={createProjectMutation.isPending}
                            data-testid="button-submit-project"
                          >
                            {createProjectMutation.isPending ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Envoi en cours...
                              </>
                            ) : (
                              "Soumettre la demande"
                            )}
                          </Button>
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setShowProjectForm(false)}
                            data-testid="button-cancel-project"
                          >
                            Annuler
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              )}

              {/* Projects list */}
              {projectsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : projects && projects.length > 0 ? (
                <div className="grid gap-4">
                  {projects.map((project) => (
                    <Card key={project.id} data-testid={`card-project-${project.id}`}>
                      <CardHeader className="flex flex-row items-start justify-between space-y-0 gap-4">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{project.title}</CardTitle>
                          <CardDescription className="mt-1">
                            {project.businessSector} • {project.designStyle}
                          </CardDescription>
                        </div>
                        {user.role === "admin" ? (
                          <Select 
                            value={project.status} 
                            onValueChange={(status) => updateStatusMutation.mutate({ projectId: project.id, status })}
                          >
                            <SelectTrigger className="w-[160px]" data-testid={`select-status-${project.id}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">En attente</SelectItem>
                              <SelectItem value="in_review">En cours d'étude</SelectItem>
                              <SelectItem value="approved">Approuvé</SelectItem>
                              <SelectItem value="in_progress">En cours</SelectItem>
                              <SelectItem value="completed">Terminé</SelectItem>
                              <SelectItem value="cancelled">Annulé</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge variant={
                            project.status === "pending" ? "secondary" :
                            project.status === "in_progress" ? "default" :
                            project.status === "completed" ? "outline" : "secondary"
                          }>
                            {project.status === "pending" && "En attente"}
                            {project.status === "in_review" && "En cours d'étude"}
                            {project.status === "approved" && "Approuvé"}
                            {project.status === "in_progress" && "En cours"}
                            {project.status === "completed" && "Terminé"}
                            {project.status === "cancelled" && "Annulé"}
                          </Badge>
                        )}
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>Créé le {new Date(project.createdAt!).toLocaleDateString('fr-FR')}</span>
                          </div>
                          {user.role === "admin" && (
                            <p className="text-xs text-muted-foreground">
                              Client ID: {project.userId.slice(0, 8)}...
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <FolderKanban className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Aucun projet en cours</p>
                    <p className="text-sm text-muted-foreground mt-1">Cliquez sur "Nouvelle demande" pour démarrer</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Documents Section */}
          {activeSection === "documents" && (
            <Card>
              <CardHeader>
                <CardTitle>Documents</CardTitle>
                <CardDescription>Vos devis, factures et contrats</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Aucun document disponible</p>
                <p className="text-sm text-muted-foreground mt-1">Vos documents seront accessibles ici</p>
              </CardContent>
            </Card>
          )}

          {/* Users Section (Admin only) */}
          {activeSection === "users" && user.role === "admin" && (
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
          )}

          {/* Settings Section */}
          {activeSection === "settings" && (
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Settings className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Sécurité</CardTitle>
                    <CardDescription>Gérer votre mot de passe</CardDescription>
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

              <Card>
                <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <HelpCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Aide</CardTitle>
                    <CardDescription>Besoin d'assistance ?</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Contactez-nous pour toute question concernant votre compte ou vos projets.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
