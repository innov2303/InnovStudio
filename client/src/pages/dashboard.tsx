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
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Clock,
  CheckCircle2,
  Circle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Zap,
  AlertCircle,
  MessageSquare,
  Pencil,
  Trash2,
  X,
  Check
} from "lucide-react";
import type { User as UserType, Project, CreateProjectData, ProjectFeature, CreateFeatureData, ProjectDocument } from "@shared/schema";
import { createProjectSchema, createFeatureSchema } from "@shared/schema";
import { FileUp, Download, Upload, FilePenLine, FileCheck, FileClock, Save, Eye, X as XIcon } from "lucide-react";

type MenuSection = "dashboard" | "profile" | "projects" | "documents" | "users" | "settings";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { user, logout, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState<MenuSection>("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const [collapsedProjects, setCollapsedProjects] = useState<Set<string>>(new Set());
  const [showFeatureForm, setShowFeatureForm] = useState<string | null>(null);
  const [editingFeature, setEditingFeature] = useState<{ id: string; name: string; description: string } | null>(null);

  const toggleProjectCollapse = (projectId: string) => {
    setCollapsedProjects(prev => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) {
        newSet.delete(projectId);
      } else {
        newSet.add(projectId);
        // Also collapse the features section if open
        if (expandedProject === projectId) {
          setExpandedProject(null);
        }
      }
      return newSet;
    });
  };
  const [newFeatureTitle, setNewFeatureTitle] = useState("");
  const [newFeatureDescription, setNewFeatureDescription] = useState("");

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

  // Collapse all projects by default when they load
  const [initialCollapseApplied, setInitialCollapseApplied] = useState(false);

  const { data: allUsers, isLoading: usersLoading } = useQuery<UserType[]>({
    queryKey: ["/api/users"],
    enabled: user?.role === "admin",
  });

  const { data: projects, isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
    enabled: !!user,
  });

  // Collapse all projects by default when data first loads
  useEffect(() => {
    if (projects && projects.length > 0 && !initialCollapseApplied) {
      setCollapsedProjects(new Set(projects.map(p => p.id)));
      setInitialCollapseApplied(true);
    }
  }, [projects, initialCollapseApplied]);

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

  // Features query - fetch when a project is expanded
  const { data: features, isLoading: featuresLoading, refetch: refetchFeatures } = useQuery<ProjectFeature[]>({
    queryKey: ["/api/projects", expandedProject, "features"],
    queryFn: async () => {
      if (!expandedProject) return [];
      const response = await fetch(`/api/projects/${expandedProject}/features`, { credentials: "include" });
      if (!response.ok) throw new Error("Erreur lors du chargement");
      return response.json();
    },
    enabled: !!expandedProject,
  });

  const createFeatureMutation = useMutation({
    mutationFn: async ({ projectId, title, description }: { projectId: string; title: string; description?: string }) => {
      const response = await apiRequest("POST", `/api/projects/${projectId}/features`, { title, description });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Fonctionnalité ajoutée",
        description: "Votre demande de fonctionnalité a été enregistrée.",
      });
      setNewFeatureTitle("");
      setNewFeatureDescription("");
      setShowFeatureForm(null);
      refetchFeatures();
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de l'ajout",
        variant: "destructive",
      });
    },
  });

  const updateFeatureStatusMutation = useMutation({
    mutationFn: async ({ featureId, status, adminNotes }: { featureId: string; status: string; adminNotes?: string }) => {
      const response = await apiRequest("PATCH", `/api/features/${featureId}/status`, { status, adminNotes });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Statut mis à jour",
        description: "Le statut de la fonctionnalité a été modifié.",
      });
      refetchFeatures();
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la mise à jour",
        variant: "destructive",
      });
    },
  });

  const updateFeatureMutation = useMutation({
    mutationFn: async ({ featureId, name, description }: { featureId: string; name: string; description?: string }) => {
      const response = await apiRequest("PATCH", `/api/features/${featureId}`, { name, description });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Fonctionnalité modifiée",
        description: "Les modifications ont été enregistrées.",
      });
      setEditingFeature(null);
      refetchFeatures();
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la modification",
        variant: "destructive",
      });
    },
  });

  const deleteFeatureMutation = useMutation({
    mutationFn: async (featureId: string) => {
      const response = await apiRequest("DELETE", `/api/features/${featureId}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Fonctionnalité supprimée",
        description: "La fonctionnalité a été supprimée.",
      });
      refetchFeatures();
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la suppression",
        variant: "destructive",
      });
    },
  });

  const handleAddFeature = (projectId: string) => {
    if (!newFeatureTitle.trim()) return;
    createFeatureMutation.mutate({ 
      projectId, 
      title: newFeatureTitle.trim(), 
      description: newFeatureDescription.trim() || undefined 
    });
  };

  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: "feature" | "document"; id: string; title: string } | null>(null);

  // Documents state and queries
  const [expandedDocuments, setExpandedDocuments] = useState<string | null>(null);
  const [previewQuote, setPreviewQuote] = useState<string | null>(null);
  const [lineItems, setLineItems] = useState<Record<string, Array<{ description: string; amount: string }>>>({});

  const { data: documents, refetch: refetchDocuments } = useQuery<ProjectDocument[]>({
    queryKey: ["/api/projects", expandedDocuments, "documents"],
    queryFn: async () => {
      if (!expandedDocuments) return [];
      const response = await fetch(`/api/projects/${expandedDocuments}/documents`, { credentials: "include" });
      if (!response.ok) throw new Error("Erreur lors du chargement");
      return response.json();
    },
    enabled: !!expandedDocuments,
  });

  const createDocumentMutation = useMutation({
    mutationFn: async ({ projectId, type }: { projectId: string; type: string }) => {
      const response = await apiRequest("POST", `/api/projects/${projectId}/documents`, { type });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Devis créé",
        description: "Le devis a été créé et est en attente d'édition.",
      });
      refetchDocuments();
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la création",
        variant: "destructive",
      });
    },
  });

  const updateQuoteMutation = useMutation({
    mutationFn: async ({ documentId, data }: { documentId: string; data: { quoteTitle: string; quoteDescription?: string; quoteAmount: string; quoteValidityDays?: string; quoteNotes?: string } }) => {
      const response = await fetch(`/api/documents/${documentId}/quote`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erreur lors de la mise à jour");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Devis mis à jour",
        description: "Les informations du devis ont été enregistrées.",
      });
      refetchDocuments();
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la mise à jour",
        variant: "destructive",
      });
    },
  });

  const uploadQuoteMutation = useMutation({
    mutationFn: async ({ documentId, file }: { documentId: string; file: File }) => {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch(`/api/documents/${documentId}/upload-quote`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erreur lors de l'upload");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Devis envoyé",
        description: "Le devis a été envoyé au client pour signature.",
      });
      refetchDocuments();
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de l'upload",
        variant: "destructive",
      });
    },
  });

  const deleteDocumentMutation = useMutation({
    mutationFn: async (documentId: string) => {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erreur lors de la suppression");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Devis supprimé",
        description: "Le devis a été supprimé.",
      });
      refetchDocuments();
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la suppression",
        variant: "destructive",
      });
    },
  });

  const uploadSignedMutation = useMutation({
    mutationFn: async ({ documentId, file }: { documentId: string; file: File }) => {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch(`/api/documents/${documentId}/upload-signed`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erreur lors de l'upload");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Document signé",
        description: "Votre document signé a été envoyé avec succès.",
      });
      refetchDocuments();
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de l'upload",
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
                      <CardHeader 
                        className="flex flex-row items-start justify-between space-y-0 gap-4 cursor-pointer hover-elevate"
                        onClick={() => toggleProjectCollapse(project.id)}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className="flex-shrink-0">
                            {collapsedProjects.has(project.id) ? (
                              <ChevronRight className="h-5 w-5 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg">{project.title}</CardTitle>
                            {!collapsedProjects.has(project.id) && (
                              <CardDescription className="mt-1">
                                {project.businessSector} • {project.designStyle}
                              </CardDescription>
                            )}
                            {/* Mini progress bar when collapsed */}
                            {collapsedProjects.has(project.id) && project.status !== "cancelled" && (
                              <div className="mt-2 flex items-center gap-3">
                                <div className="flex-1 max-w-[200px]">
                                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-gradient-to-r from-primary via-cyan-400 to-primary transition-all duration-500 ease-out"
                                      style={{ 
                                        width: project.status === "pending" ? "0%" :
                                               project.status === "in_review" ? "25%" :
                                               project.status === "approved" ? "50%" :
                                               project.status === "in_progress" ? "75%" : "100%"
                                      }}
                                    />
                                  </div>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {project.status === "pending" && "Déposé"}
                                  {project.status === "in_review" && "Étude"}
                                  {project.status === "approved" && "Approuvé"}
                                  {project.status === "in_progress" && "En cours"}
                                  {project.status === "completed" && "Terminé"}
                                </span>
                              </div>
                            )}
                            {collapsedProjects.has(project.id) && project.status === "cancelled" && (
                              <div className="mt-2 flex items-center gap-2 text-destructive">
                                <XCircle className="h-3 w-3" />
                                <span className="text-xs font-medium">Annulé</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div onClick={(e) => e.stopPropagation()}>
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
                        </div>
                      </CardHeader>
                      {!collapsedProjects.has(project.id) && (
                      <CardContent className="space-y-4">
                        {/* Project details */}
                        <div className="space-y-3">
                          <div>
                            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Description du besoin</h4>
                            <p className="text-sm">{project.description}</p>
                          </div>
                          <div>
                            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Grandes fonctionnalités</h4>
                            <p className="text-sm whitespace-pre-line">{project.features}</p>
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Secteur : </span>
                              <span className="font-medium">{project.businessSector}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Style : </span>
                              <span className="font-medium">{project.designStyle}</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Progress tracker */}
                        {project.status !== "cancelled" && (
                          <div className="pt-2">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-medium">Progression</span>
                              <span className="text-xs text-muted-foreground">
                                {project.status === "pending" && "0%"}
                                {project.status === "in_review" && "25%"}
                                {project.status === "approved" && "50%"}
                                {project.status === "in_progress" && "75%"}
                                {project.status === "completed" && "100%"}
                              </span>
                            </div>
                            <div className="relative">
                              {/* Progress bar background */}
                              <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-primary via-cyan-400 to-primary transition-all duration-500 ease-out"
                                  style={{ 
                                    width: project.status === "pending" ? "0%" :
                                           project.status === "in_review" ? "25%" :
                                           project.status === "approved" ? "50%" :
                                           project.status === "in_progress" ? "75%" : "100%"
                                  }}
                                />
                              </div>
                              {/* Step indicators */}
                              <div className="flex justify-between mt-3">
                                {[
                                  { key: "pending", label: "Déposé" },
                                  { key: "in_review", label: "Étude" },
                                  { key: "approved", label: "Approuvé" },
                                  { key: "in_progress", label: "En cours" },
                                  { key: "completed", label: "Terminé" }
                                ].map((step, index) => {
                                  const statusOrder = ["pending", "in_review", "approved", "in_progress", "completed"];
                                  const currentIndex = statusOrder.indexOf(project.status);
                                  const isCompleted = index < currentIndex;
                                  const isCurrent = index === currentIndex;
                                  
                                  return (
                                    <div key={step.key} className="flex flex-col items-center gap-1">
                                      <div className={`flex items-center justify-center w-6 h-6 rounded-full transition-all ${
                                        isCompleted 
                                          ? "bg-primary text-primary-foreground" 
                                          : isCurrent 
                                            ? "bg-primary/20 text-primary border-2 border-primary" 
                                            : "bg-muted text-muted-foreground"
                                      }`}>
                                        {isCompleted ? (
                                          <CheckCircle2 className="h-4 w-4" />
                                        ) : (
                                          <span className="text-xs font-medium">{index + 1}</span>
                                        )}
                                      </div>
                                      <span className={`text-[10px] ${isCurrent ? "font-medium text-primary" : "text-muted-foreground"}`}>
                                        {step.label}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Cancelled status */}
                        {project.status === "cancelled" && (
                          <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive">
                            <XCircle className="h-4 w-4" />
                            <span className="text-sm font-medium">Projet annulé</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t">
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

                        {/* Features toggle button */}
                        <Button
                          variant="ghost"
                          className="w-full mt-3 justify-between"
                          onClick={() => setExpandedProject(expandedProject === project.id ? null : project.id)}
                          data-testid={`button-toggle-features-${project.id}`}
                        >
                          <div className="flex items-center gap-2">
                            <Zap className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium">Suivi des fonctionnalités</span>
                          </div>
                          {expandedProject === project.id ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>

                        {/* Features section - expanded */}
                        {expandedProject === project.id && (
                          <div className="mt-4 pt-4 border-t space-y-4">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-semibold">Fonctionnalités demandées</h4>
                              {user.role !== "admin" && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => setShowFeatureForm(showFeatureForm === project.id ? null : project.id)}
                                  data-testid={`button-add-feature-${project.id}`}
                                >
                                  <Plus className="h-3 w-3 mr-1" />
                                  Ajouter
                                </Button>
                              )}
                            </div>

                            {/* Add feature form (client only) */}
                            {showFeatureForm === project.id && user.role !== "admin" && (
                              <div className="p-3 rounded-lg bg-muted/50 space-y-3">
                                <Input
                                  placeholder="Titre de la fonctionnalité"
                                  value={newFeatureTitle}
                                  onChange={(e) => setNewFeatureTitle(e.target.value)}
                                  data-testid="input-feature-title"
                                />
                                <Textarea
                                  placeholder="Description (optionnel)"
                                  value={newFeatureDescription}
                                  onChange={(e) => setNewFeatureDescription(e.target.value)}
                                  className="resize-none"
                                  rows={2}
                                  data-testid="input-feature-description"
                                />
                                <div className="flex gap-2">
                                  <Button 
                                    size="sm" 
                                    onClick={() => handleAddFeature(project.id)}
                                    disabled={!newFeatureTitle.trim() || createFeatureMutation.isPending}
                                    data-testid="button-submit-feature"
                                  >
                                    {createFeatureMutation.isPending ? (
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                      "Ajouter"
                                    )}
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="ghost"
                                    onClick={() => {
                                      setShowFeatureForm(null);
                                      setNewFeatureTitle("");
                                      setNewFeatureDescription("");
                                    }}
                                    data-testid="button-cancel-feature"
                                  >
                                    Annuler
                                  </Button>
                                </div>
                              </div>
                            )}

                            {/* Features list */}
                            {featuresLoading ? (
                              <div className="flex justify-center py-4">
                                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                              </div>
                            ) : features && features.length > 0 ? (
                              <div className="space-y-3">
                                {features.map((feature) => (
                                  <div 
                                    key={feature.id} 
                                    className="p-3 rounded-lg border bg-background/50"
                                    data-testid={`feature-item-${feature.id}`}
                                  >
                                    <div className="flex items-start justify-between gap-3">
                                      <div className="flex-1 min-w-0">
                                        {editingFeature?.id === feature.id ? (
                                          <div className="space-y-2">
                                            <Input
                                              value={editingFeature.name}
                                              onChange={(e) => setEditingFeature({ ...editingFeature, name: e.target.value })}
                                              placeholder="Nom de la fonctionnalité"
                                              data-testid={`input-edit-feature-name-${feature.id}`}
                                            />
                                            <Input
                                              value={editingFeature.description}
                                              onChange={(e) => setEditingFeature({ ...editingFeature, description: e.target.value })}
                                              placeholder="Description (optionnel)"
                                              data-testid={`input-edit-feature-desc-${feature.id}`}
                                            />
                                            <div className="flex gap-2">
                                              <Button
                                                size="sm"
                                                onClick={() => updateFeatureMutation.mutate({
                                                  featureId: feature.id,
                                                  name: editingFeature.name,
                                                  description: editingFeature.description || undefined
                                                })}
                                                disabled={!editingFeature.name.trim() || updateFeatureMutation.isPending}
                                                data-testid={`button-save-feature-${feature.id}`}
                                              >
                                                {updateFeatureMutation.isPending ? (
                                                  <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                  <Check className="h-4 w-4" />
                                                )}
                                              </Button>
                                              <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => setEditingFeature(null)}
                                                data-testid={`button-cancel-edit-feature-${feature.id}`}
                                              >
                                                <X className="h-4 w-4" />
                                              </Button>
                                            </div>
                                          </div>
                                        ) : (
                                          <>
                                            <p className="font-medium text-sm">{feature.title}</p>
                                            {feature.description && (
                                              <p className="text-xs text-muted-foreground mt-1">{feature.description}</p>
                                            )}
                                          </>
                                        )}
                                        {feature.adminNotes && (
                                          <div className="flex items-start gap-2 mt-2 p-2 rounded bg-muted/50">
                                            <MessageSquare className="h-3 w-3 mt-0.5 text-muted-foreground" />
                                            <p className="text-xs text-muted-foreground">{feature.adminNotes}</p>
                                          </div>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-2">
                                        {feature.status === "pending" && user.role !== "admin" && !editingFeature && (
                                          <>
                                            <Button
                                              size="icon"
                                              variant="ghost"
                                              className="h-8 w-8"
                                              onClick={() => setEditingFeature({
                                                id: feature.id,
                                                name: feature.title,
                                                description: feature.description || ""
                                              })}
                                              data-testid={`button-edit-feature-${feature.id}`}
                                            >
                                              <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                              size="icon"
                                              variant="ghost"
                                              className="h-8 w-8 text-destructive hover:text-destructive"
                                              onClick={() => setDeleteConfirm({ type: "feature", id: feature.id, title: feature.title })}
                                              disabled={deleteFeatureMutation.isPending}
                                              data-testid={`button-delete-feature-${feature.id}`}
                                            >
                                              {deleteFeatureMutation.isPending ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                              ) : (
                                                <Trash2 className="h-4 w-4" />
                                              )}
                                            </Button>
                                          </>
                                        )}
                                        {user.role === "admin" ? (
                                          <Select 
                                            value={feature.status} 
                                            onValueChange={(status) => updateFeatureStatusMutation.mutate({ featureId: feature.id, status })}
                                          >
                                            <SelectTrigger className="w-[130px]" data-testid={`select-feature-status-${feature.id}`}>
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="pending">En attente</SelectItem>
                                              <SelectItem value="in_progress">En cours</SelectItem>
                                              <SelectItem value="completed">Terminé</SelectItem>
                                              <SelectItem value="blocked">Bloqué</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        ) : (
                                          <Badge variant={
                                            feature.status === "pending" ? "secondary" :
                                            feature.status === "in_progress" ? "default" :
                                            feature.status === "completed" ? "outline" : "destructive"
                                          }>
                                            {feature.status === "pending" && (
                                              <><Circle className="h-2 w-2 mr-1" /> En attente</>
                                            )}
                                            {feature.status === "in_progress" && (
                                              <><Loader2 className="h-2 w-2 mr-1 animate-spin" /> En cours</>
                                            )}
                                            {feature.status === "completed" && (
                                              <><CheckCircle2 className="h-2 w-2 mr-1" /> Terminé</>
                                            )}
                                            {feature.status === "blocked" && (
                                              <><AlertCircle className="h-2 w-2 mr-1" /> Bloqué</>
                                            )}
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-4 text-muted-foreground text-sm">
                                Aucune fonctionnalité demandée
                              </div>
                            )}
                          </div>
                        )}

                        {/* Documents toggle button */}
                        <Button
                          variant="ghost"
                          className="w-full mt-3 justify-between"
                          onClick={() => setExpandedDocuments(expandedDocuments === project.id ? null : project.id)}
                          data-testid={`button-toggle-documents-${project.id}`}
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium">Documents</span>
                          </div>
                          {expandedDocuments === project.id ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>

                        {/* Documents section - expanded */}
                        {expandedDocuments === project.id && (
                          <div className="mt-4 pt-4 border-t space-y-4">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-semibold">Documents du projet</h4>
                              {user.role === "admin" && project.status === "in_review" && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => createDocumentMutation.mutate({ projectId: project.id, type: "quote" })}
                                  disabled={createDocumentMutation.isPending}
                                  data-testid={`button-create-quote-${project.id}`}
                                >
                                  {createDocumentMutation.isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                  ) : (
                                    <Plus className="h-4 w-4 mr-2" />
                                  )}
                                  Créer un devis
                                </Button>
                              )}
                            </div>

                            {documents && documents.length > 0 ? (
                              <div className="space-y-3">
                                {documents.map((doc) => (
                                  <div 
                                    key={doc.id} 
                                    className="p-3 rounded-lg border bg-muted/30"
                                    data-testid={`document-item-${doc.id}`}
                                  >
                                    <div className="flex items-start justify-between">
                                      <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${
                                          doc.status === "draft" ? "bg-yellow-500/10" :
                                          doc.status === "awaiting_signature" ? "bg-blue-500/10" :
                                          "bg-green-500/10"
                                        }`}>
                                          {doc.status === "draft" && <FilePenLine className="h-4 w-4 text-yellow-500" />}
                                          {doc.status === "awaiting_signature" && <FileClock className="h-4 w-4 text-blue-500" />}
                                          {doc.status === "signed" && <FileCheck className="h-4 w-4 text-green-500" />}
                                        </div>
                                        <div>
                                          <p className="text-sm font-medium">
                                            Devis
                                            {doc.quoteTitle && ` - ${doc.quoteTitle}`}
                                          </p>
                                          <p className="text-xs text-muted-foreground">
                                            {doc.status === "draft" && "Brouillon - En cours d'édition"}
                                            {doc.status === "awaiting_signature" && "En attente de signature"}
                                            {doc.status === "signed" && "Signé"}
                                          </p>
                                          {doc.quoteAmount && doc.status !== "draft" && (
                                            <p className="text-sm font-medium mt-1">{doc.quoteAmount} €</p>
                                          )}
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        {/* Admin actions */}
                                        {user.role === "admin" && doc.status === "draft" && (
                                          <div className="flex items-center gap-2">
                                            <input
                                              type="file"
                                              id={`upload-quote-${doc.id}`}
                                              className="hidden"
                                              accept=".pdf,.doc,.docx"
                                              onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                  uploadQuoteMutation.mutate({ documentId: doc.id, file });
                                                }
                                              }}
                                            />
                                            <Button
                                              size="sm"
                                              variant="default"
                                              onClick={() => document.getElementById(`upload-quote-${doc.id}`)?.click()}
                                              disabled={uploadQuoteMutation.isPending || !doc.quoteTitle || !doc.quoteAmount}
                                              data-testid={`button-upload-quote-${doc.id}`}
                                            >
                                              {uploadQuoteMutation.isPending ? (
                                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                              ) : (
                                                <Upload className="h-4 w-4 mr-2" />
                                              )}
                                              Envoyer le devis
                                            </Button>
                                            <Button
                                              size="sm"
                                              variant="destructive"
                                              onClick={() => setDeleteConfirm({ type: "document", id: doc.id, title: doc.quoteTitle || "ce devis" })}
                                              disabled={deleteDocumentMutation.isPending}
                                              data-testid={`button-delete-quote-${doc.id}`}
                                            >
                                              {deleteDocumentMutation.isPending ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                              ) : (
                                                <Trash2 className="h-4 w-4" />
                                              )}
                                            </Button>
                                          </div>
                                        )}

                                        {/* Download original document */}
                                        {doc.fileName && (
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => window.open(`/api/documents/${doc.id}/download`, '_blank')}
                                            data-testid={`button-download-${doc.id}`}
                                          >
                                            <Download className="h-4 w-4 mr-2" />
                                            Télécharger
                                          </Button>
                                        )}

                                        {/* Client upload signed document */}
                                        {user.role !== "admin" && doc.status === "awaiting_signature" && (
                                          <div className="flex items-center gap-2">
                                            <input
                                              type="file"
                                              id={`upload-signed-${doc.id}`}
                                              className="hidden"
                                              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                                              onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                  uploadSignedMutation.mutate({ documentId: doc.id, file });
                                                }
                                              }}
                                            />
                                            <Button
                                              size="sm"
                                              variant="default"
                                              onClick={() => document.getElementById(`upload-signed-${doc.id}`)?.click()}
                                              disabled={uploadSignedMutation.isPending}
                                              data-testid={`button-upload-signed-${doc.id}`}
                                            >
                                              {uploadSignedMutation.isPending ? (
                                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                              ) : (
                                                <FileUp className="h-4 w-4 mr-2" />
                                              )}
                                              Envoyer signé
                                            </Button>
                                          </div>
                                        )}

                                        {/* Download signed document */}
                                        {doc.signedFileName && (
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => window.open(`/api/documents/${doc.id}/download?type=signed`, '_blank')}
                                            data-testid={`button-download-signed-${doc.id}`}
                                          >
                                            <FileCheck className="h-4 w-4 mr-2" />
                                            Signé
                                          </Button>
                                        )}
                                      </div>
                                    </div>

                                    {/* Quote editing form for admin - draft status only */}
                                    {user.role === "admin" && doc.status === "draft" && (
                                      <form
                                        className="mt-4 pt-4 border-t space-y-3"
                                        onSubmit={(e) => {
                                          e.preventDefault();
                                          const formData = new FormData(e.currentTarget);
                                          updateQuoteMutation.mutate({
                                            documentId: doc.id,
                                            data: {
                                              quoteTitle: formData.get("quoteTitle") as string,
                                              quoteDescription: formData.get("quoteDescription") as string || undefined,
                                              quoteAmount: formData.get("quoteAmount") as string,
                                              quoteValidityDays: formData.get("quoteValidityDays") as string || undefined,
                                              quoteNotes: formData.get("quoteNotes") as string || undefined,
                                            },
                                          });
                                        }}
                                        data-testid={`form-quote-${doc.id}`}
                                      >
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                          <div className="space-y-1">
                                            <Label htmlFor={`quoteTitle-${doc.id}`} className="text-xs">Titre du devis *</Label>
                                            <Input
                                              id={`quoteTitle-${doc.id}`}
                                              name="quoteTitle"
                                              defaultValue={doc.quoteTitle || ""}
                                              placeholder="Ex: Développement site vitrine"
                                              required
                                              data-testid={`input-quote-title-${doc.id}`}
                                            />
                                          </div>
                                        </div>
                                        <div className="space-y-2">
                                          <div className="flex items-center justify-between">
                                            <Label className="text-xs">Prestations</Label>
                                            <Button
                                              type="button"
                                              size="sm"
                                              variant="outline"
                                              onClick={() => {
                                                const currentItems = lineItems[doc.id] || (doc.quoteLineItems ? JSON.parse(doc.quoteLineItems) : []);
                                                setLineItems({
                                                  ...lineItems,
                                                  [doc.id]: [...currentItems, { description: "", amount: "" }]
                                                });
                                              }}
                                              data-testid={`button-add-line-item-${doc.id}`}
                                            >
                                              <Plus className="h-3 w-3 mr-1" />
                                              Ajouter
                                            </Button>
                                          </div>
                                          <div className="space-y-2">
                                            {(lineItems[doc.id] || (doc.quoteLineItems ? JSON.parse(doc.quoteLineItems) : [])).map((item: { description: string; amount: string }, index: number) => (
                                              <div key={index} className="flex gap-2 items-start">
                                                <Input
                                                  placeholder="Description de la prestation"
                                                  value={item.description}
                                                  onChange={(e) => {
                                                    const currentItems = lineItems[doc.id] || (doc.quoteLineItems ? JSON.parse(doc.quoteLineItems) : []);
                                                    const newItems = [...currentItems];
                                                    newItems[index] = { ...newItems[index], description: e.target.value };
                                                    setLineItems({ ...lineItems, [doc.id]: newItems });
                                                  }}
                                                  className="flex-1"
                                                  data-testid={`input-line-item-desc-${doc.id}-${index}`}
                                                />
                                                <Input
                                                  type="number"
                                                  placeholder="€"
                                                  value={item.amount}
                                                  onChange={(e) => {
                                                    const currentItems = lineItems[doc.id] || (doc.quoteLineItems ? JSON.parse(doc.quoteLineItems) : []);
                                                    const newItems = [...currentItems];
                                                    newItems[index] = { ...newItems[index], amount: e.target.value };
                                                    setLineItems({ ...lineItems, [doc.id]: newItems });
                                                  }}
                                                  className="w-24"
                                                  data-testid={`input-line-item-amount-${doc.id}-${index}`}
                                                />
                                                <Button
                                                  type="button"
                                                  size="icon"
                                                  variant="ghost"
                                                  onClick={() => {
                                                    const currentItems = lineItems[doc.id] || (doc.quoteLineItems ? JSON.parse(doc.quoteLineItems) : []);
                                                    const newItems = currentItems.filter((_: unknown, i: number) => i !== index);
                                                    setLineItems({ ...lineItems, [doc.id]: newItems });
                                                  }}
                                                  data-testid={`button-remove-line-item-${doc.id}-${index}`}
                                                >
                                                  <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                              </div>
                                            ))}
                                            {(lineItems[doc.id] || (doc.quoteLineItems ? JSON.parse(doc.quoteLineItems) : [])).length === 0 && (
                                              <p className="text-xs text-muted-foreground italic">Aucune prestation ajoutée</p>
                                            )}
                                          </div>
                                          {/* Total and deposit summary */}
                                          {(lineItems[doc.id] || (doc.quoteLineItems ? JSON.parse(doc.quoteLineItems) : [])).length > 0 && (
                                            <div className="border rounded-md overflow-hidden mt-2">
                                              <div className="flex justify-between items-center p-2 bg-muted/50">
                                                <span className="font-semibold text-sm">Total HT</span>
                                                <span className="font-bold text-primary">
                                                  {(() => {
                                                    const items = lineItems[doc.id] || (doc.quoteLineItems ? JSON.parse(doc.quoteLineItems) : []);
                                                    return items.reduce((sum: number, item: { amount: string }) => sum + (parseFloat(item.amount) || 0), 0).toFixed(2);
                                                  })()} €
                                                </span>
                                              </div>
                                              <div className="flex justify-between items-center p-2 gap-2">
                                                <div className="flex items-center gap-2">
                                                  <span className="text-sm">Acompte</span>
                                                  <Input
                                                    id={`quoteDepositPercent-${doc.id}`}
                                                    name="quoteDepositPercent"
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    defaultValue={doc.quoteDepositPercent || ""}
                                                    placeholder="%"
                                                    className="w-16 h-7 text-center"
                                                    data-testid={`input-quote-deposit-percent-${doc.id}`}
                                                  />
                                                  <span className="text-sm">%</span>
                                                </div>
                                                <span className="text-sm font-medium">
                                                  {(() => {
                                                    const items = lineItems[doc.id] || (doc.quoteLineItems ? JSON.parse(doc.quoteLineItems) : []);
                                                    const total = items.reduce((sum: number, item: { amount: string }) => sum + (parseFloat(item.amount) || 0), 0);
                                                    const percent = parseFloat(doc.quoteDepositPercent || "0") || 0;
                                                    return (total * percent / 100).toFixed(2);
                                                  })()} €
                                                </span>
                                              </div>
                                            </div>
                                          )}
                                          <input 
                                            type="hidden" 
                                            name="quoteLineItems" 
                                            value={JSON.stringify(lineItems[doc.id] || (doc.quoteLineItems ? JSON.parse(doc.quoteLineItems) : []))}
                                          />
                                          <input 
                                            type="hidden" 
                                            name="quoteAmount" 
                                            value={(() => {
                                              const items = lineItems[doc.id] || (doc.quoteLineItems ? JSON.parse(doc.quoteLineItems) : []);
                                              return items.reduce((sum: number, item: { amount: string }) => sum + (parseFloat(item.amount) || 0), 0).toFixed(2);
                                            })()}
                                          />
                                        </div>
                                        <div className="space-y-1">
                                          <Label htmlFor={`quoteDescription-${doc.id}`} className="text-xs">Fonctionnalités du site</Label>
                                          <Textarea
                                            id={`quoteDescription-${doc.id}`}
                                            name="quoteDescription"
                                            defaultValue={doc.quoteDescription || ""}
                                            placeholder="Liste des fonctionnalités prévues..."
                                            rows={2}
                                            data-testid={`input-quote-description-${doc.id}`}
                                          />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                          <div className="space-y-1">
                                            <Label htmlFor={`quoteValidityDays-${doc.id}`} className="text-xs">Validité (jours)</Label>
                                            <Input
                                              id={`quoteValidityDays-${doc.id}`}
                                              name="quoteValidityDays"
                                              type="number"
                                              defaultValue={doc.quoteValidityDays || "30"}
                                              placeholder="30"
                                              data-testid={`input-quote-validity-${doc.id}`}
                                            />
                                          </div>
                                          <div className="space-y-1">
                                            <Label htmlFor={`quoteNotes-${doc.id}`} className="text-xs">Notes internes</Label>
                                            <Input
                                              id={`quoteNotes-${doc.id}`}
                                              name="quoteNotes"
                                              defaultValue={doc.quoteNotes || ""}
                                              placeholder="Notes pour vous..."
                                              data-testid={`input-quote-notes-${doc.id}`}
                                            />
                                          </div>
                                        </div>
                                        <div className="flex justify-end gap-2">
                                          <Button
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            onClick={() => setPreviewQuote(doc.id)}
                                            disabled={!doc.quoteTitle || ((lineItems[doc.id] || (doc.quoteLineItems ? JSON.parse(doc.quoteLineItems) : [])).length === 0)}
                                            data-testid={`button-preview-quote-${doc.id}`}
                                          >
                                            <Eye className="h-4 w-4 mr-2" />
                                            Prévisualiser
                                          </Button>
                                          <Button
                                            type="submit"
                                            size="sm"
                                            disabled={updateQuoteMutation.isPending}
                                            data-testid={`button-save-quote-${doc.id}`}
                                          >
                                            {updateQuoteMutation.isPending ? (
                                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                            ) : (
                                              <Save className="h-4 w-4 mr-2" />
                                            )}
                                            Enregistrer
                                          </Button>
                                          <Button
                                            type="button"
                                            size="sm"
                                            variant="secondary"
                                            disabled={!doc.quoteTitle || !doc.quoteAmount}
                                            onClick={() => {
                                              window.open(`/api/documents/${doc.id}/generate-pdf`, "_blank");
                                            }}
                                            data-testid={`button-download-pdf-${doc.id}`}
                                          >
                                            <Download className="h-4 w-4 mr-2" />
                                            Télécharger PDF
                                          </Button>
                                        </div>
                                      </form>
                                    )}

                                    {/* Quote preview dialog for admin */}
                                    <Dialog open={previewQuote === doc.id} onOpenChange={(open) => !open && setPreviewQuote(null)}>
                                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid={`dialog-preview-${doc.id}`}>
                                        <DialogHeader>
                                          <DialogTitle className="text-primary">Prévisualisation du devis</DialogTitle>
                                        </DialogHeader>
                                        {(() => {
                                          const projectOwner = allUsers?.find(u => u.id === project.userId);
                                          return (
                                            <div className="space-y-4">
                                              {/* Addresses section */}
                                              <div className="grid grid-cols-2 gap-4 pb-3 border-b">
                                                <div>
                                                  <p className="text-xs text-muted-foreground mb-1">ÉMETTEUR</p>
                                                  <p className="text-sm font-semibold">{user.company}</p>
                                                  <p className="text-xs text-muted-foreground whitespace-pre-wrap">{user.address}</p>
                                                </div>
                                                <div>
                                                  <p className="text-xs text-muted-foreground mb-1">CLIENT</p>
                                                  {projectOwner ? (
                                                    <>
                                                      <p className="text-sm font-semibold">{projectOwner.company}</p>
                                                      <p className="text-xs text-muted-foreground">{projectOwner.firstName} {projectOwner.lastName}</p>
                                                      <p className="text-xs text-muted-foreground whitespace-pre-wrap">{projectOwner.billingAddress || projectOwner.address}</p>
                                                    </>
                                                  ) : (
                                                    <p className="text-xs text-muted-foreground">Information non disponible</p>
                                                  )}
                                                </div>
                                              </div>

                                              <div className="flex items-center justify-between border-b pb-3">
                                                <div>
                                                  <p className="text-xs text-muted-foreground">DEVIS</p>
                                                  <p className="text-lg font-bold">{doc.quoteTitle}</p>
                                                  <p className="text-xs text-muted-foreground">Projet: {project.title}</p>
                                                </div>
                                                <div className="text-right">
                                                  <p className="text-xs text-muted-foreground">MONTANT</p>
                                                  <p className="text-2xl font-bold text-primary">{doc.quoteAmount} €</p>
                                                  {doc.quoteDepositPercent && (
                                                    <p className="text-sm text-muted-foreground">
                                                      Acompte ({doc.quoteDepositPercent}%): {(parseFloat(doc.quoteAmount || "0") * parseFloat(doc.quoteDepositPercent) / 100).toFixed(2)} €
                                                    </p>
                                                  )}
                                                </div>
                                              </div>
                                              {/* Line items */}
                                              {doc.quoteLineItems && (() => {
                                                try {
                                                  const items = JSON.parse(doc.quoteLineItems) as Array<{ description: string; amount: string }>;
                                                  if (items.length > 0) {
                                                    return (
                                                      <div>
                                                        <p className="text-xs text-muted-foreground mb-2">PRESTATIONS</p>
                                                        <div className="border rounded-md overflow-hidden">
                                                          <div className="flex bg-muted/50 p-2 text-xs font-medium">
                                                            <span className="flex-1">Description</span>
                                                            <span className="w-24 text-right">Montant</span>
                                                          </div>
                                                          {items.map((item, idx) => (
                                                            <div key={idx} className={`flex p-2 text-sm ${idx % 2 === 0 ? "bg-background" : "bg-muted/20"}`}>
                                                              <span className="flex-1">{item.description}</span>
                                                              <span className="w-24 text-right">{item.amount} €</span>
                                                            </div>
                                                          ))}
                                                          <div className="flex p-2 bg-muted/50 font-semibold">
                                                            <span className="flex-1">Total HT</span>
                                                            <span className="w-24 text-right text-primary">{doc.quoteAmount} €</span>
                                                          </div>
                                                        </div>
                                                      </div>
                                                    );
                                                  }
                                                } catch (e) {
                                                  return null;
                                                }
                                                return null;
                                              })()}
                                              {doc.quoteDescription && (
                                                <div>
                                                  <p className="text-xs text-muted-foreground mb-1">FONCTIONNALITÉS DU SITE</p>
                                                  <p className="text-sm whitespace-pre-wrap">{doc.quoteDescription}</p>
                                                </div>
                                              )}
                                              <div className="flex justify-between text-xs text-muted-foreground pt-3 border-t">
                                                <span>Validité: {doc.quoteValidityDays || "30"} jours</span>
                                                <span>Date: {new Date().toLocaleDateString("fr-FR")}</span>
                                              </div>
                                              {doc.quoteNotes && (
                                                <div className="mt-2 p-2 bg-yellow-500/10 rounded text-xs">
                                                  <span className="font-semibold">Notes internes (non visible client):</span> {doc.quoteNotes}
                                                </div>
                                              )}
                                            </div>
                                          );
                                        })()}
                                      </DialogContent>
                                    </Dialog>

                                    {/* Show quote details for client when not draft */}
                                    {user.role !== "admin" && doc.status !== "draft" && doc.quoteDescription && (
                                      <div className="mt-3 pt-3 border-t">
                                        <p className="text-sm text-muted-foreground">{doc.quoteDescription}</p>
                                        {doc.quoteValidityDays && (
                                          <p className="text-xs text-muted-foreground mt-1">Validité: {doc.quoteValidityDays} jours</p>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-4 text-muted-foreground text-sm">
                                {project.status === "in_review" 
                                  ? "Aucun document - Un devis sera bientôt disponible" 
                                  : "Aucun document disponible"}
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                      )}
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteConfirm?.type === "feature" 
                ? `Êtes-vous sûr de vouloir supprimer la fonctionnalité "${deleteConfirm?.title}" ? Cette action est irréversible.`
                : `Êtes-vous sûr de vouloir supprimer le devis "${deleteConfirm?.title}" ? Cette action est irréversible.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteConfirm) {
                  if (deleteConfirm.type === "feature") {
                    deleteFeatureMutation.mutate(deleteConfirm.id);
                  } else {
                    deleteDocumentMutation.mutate(deleteConfirm.id);
                  }
                  setDeleteConfirm(null);
                }
              }}
              data-testid="button-confirm-delete"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
