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
  Shield,
  Loader2,
  LayoutDashboard,
  FolderKanban,
  FileText,
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
  Check,
  Globe,
  Server,
  Package,
  BarChart3,
  TrendingUp
} from "lucide-react";
import type { User as UserType, Project, CreateProjectData, ProjectFeature, CreateFeatureData, ProjectDocument, Subscription } from "@shared/schema";
import { createProjectSchema, createFeatureSchema } from "@shared/schema";

type SubscriptionOffer = {
  name: string;
  price: string;
  description: string;
};
import { FileUp, Download, Upload, FilePenLine, FileCheck, FileClock, Save, Eye, X as XIcon, Send, PenLine, CreditCard, Settings, RotateCcw } from "lucide-react";
import { SignaturePad } from "@/components/signature-pad";

type MenuSection = "dashboard" | "profile" | "projects" | "documents" | "services" | "subscription_settings" | "users" | "logs" | "analytics";

import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, PieChart, Pie } from "recharts";

function AnalyticsLineChart({ data }: { data: { date: string; count: number }[] }) {
  const formatted = data.map(d => ({
    date: new Date(d.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }),
    Visites: d.count,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={formatted}>
        <defs>
          <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "6px",
            color: "hsl(var(--foreground))",
          }}
        />
        <Area type="monotone" dataKey="Visites" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorVisits)" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { user, logout, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState<MenuSection>("dashboard");
  const [logFilter, setLogFilter] = useState<string>("all");
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
  const [signDocumentId, setSignDocumentId] = useState<string | null>(null);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [clientSignature, setClientSignature] = useState<string | null>(null);
  const [bonPourAccord, setBonPourAccord] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editProfileData, setEditProfileData] = useState({
    company: "",
    address: "",
    postalCode: "",
    city: "",
    billingAddress: "",
    billingPostalCode: "",
    billingCity: "",
    sameAsBilling: false,
  });
  const [showEmailChangeDialog, setShowEmailChangeDialog] = useState(false);
  const [newEmailValue, setNewEmailValue] = useState("");

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

  // Handle payment success/cancel from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    const projectId = urlParams.get('project');
    
    if (paymentStatus) {
      if (paymentStatus === 'success') {
        toast({
          title: "Paiement réussi",
          description: "Votre acompte a bien été reçu. Votre projet va démarrer prochainement.",
        });
        queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      } else if (paymentStatus === 'cancelled') {
        toast({
          title: "Paiement annulé",
          description: "Le paiement a été annulé. Vous pouvez réessayer à tout moment.",
          variant: "destructive",
        });
      }
      // Remove query params from URL without reloading
      window.history.replaceState({}, '', '/dashboard');
    }
    
    // Handle subscription success/cancel
    const subscriptionSuccess = urlParams.get('subscription_success');
    const subscriptionCancelled = urlParams.get('subscription_cancelled');
    
    if (subscriptionSuccess === 'true') {
      toast({
        title: "Abonnement activé",
        description: "Votre abonnement a été créé avec succès. La facture est disponible dans les documents du projet.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      window.history.replaceState({}, '', '/dashboard');
    } else if (subscriptionCancelled === 'true') {
      toast({
        title: "Abonnement annulé",
        description: "La souscription a été annulée. Vous pouvez réessayer à tout moment.",
        variant: "destructive",
      });
      window.history.replaceState({}, '', '/dashboard');
    }
  }, [toast]);

  // Collapse all projects by default when they load
  const [initialCollapseApplied, setInitialCollapseApplied] = useState(false);

  const { data: allUsers, isLoading: usersLoading } = useQuery<UserType[]>({
    queryKey: ["/api/users"],
    enabled: user?.role === "admin",
  });

  type SecurityLog = {
    id: string;
    type: string;
    userId: string | null;
    email: string | null;
    ipAddress: string | null;
    userAgent: string | null;
    details: string | null;
    createdAt: string;
  };

  const { data: securityLogs, isLoading: securityLogsLoading } = useQuery<SecurityLog[]>({
    queryKey: ["/api/admin/security-logs"],
    enabled: user?.role === "admin" && activeSection === "logs",
  });

  const [analyticsDays, setAnalyticsDays] = useState(30);

  type AnalyticsData = {
    visitsPerDay: { date: string; count: number }[];
    trafficSources: { source: string; count: number }[];
    topPages: { path: string; count: number }[];
    totalVisits: number;
    days: number;
  };

  const { data: analyticsData, isLoading: analyticsLoading } = useQuery<AnalyticsData>({
    queryKey: ["/api/analytics/stats", analyticsDays],
    queryFn: async () => {
      const res = await fetch(`/api/analytics/stats?days=${analyticsDays}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch analytics");
      return res.json();
    },
    enabled: user?.role === "admin" && activeSection === "analytics",
  });

  type RevenueData = { month: string; invoices: number; subscriptions: number; total: number };
  type ProjectStatusData = { status: string; count: number };

  const { data: revenueData } = useQuery<RevenueData[]>({
    queryKey: ["/api/analytics/revenue", analyticsDays],
    queryFn: async () => {
      const months = analyticsDays <= 30 ? 6 : analyticsDays <= 90 ? 12 : 24;
      const res = await fetch(`/api/analytics/revenue?months=${months}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch revenue");
      return res.json();
    },
    enabled: user?.role === "admin" && activeSection === "analytics",
  });

  const { data: projectStatusData } = useQuery<ProjectStatusData[]>({
    queryKey: ["/api/analytics/project-status"],
    enabled: user?.role === "admin" && activeSection === "analytics",
  });

  const { data: projects, isLoading: projectsLoading, refetch: refetchProjects } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
    enabled: !!user,
  });

  // Subscriptions queries
  const { data: subscriptionOffers } = useQuery<Record<string, SubscriptionOffer>>({
    queryKey: ["/api/subscriptions/offers"],
    enabled: !!user,
  });

  const { data: subscriptions, isLoading: subscriptionsLoading, refetch: refetchSubscriptions } = useQuery<Subscription[]>({
    queryKey: ["/api/subscriptions"],
    enabled: !!user,
  });

  // Subscription state
  const [selectedOffer, setSelectedOffer] = useState<string | null>(null);
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);
  const [selectedProjectForSubscription, setSelectedProjectForSubscription] = useState<string>("");
  
  // Admin subscription management
  type SubscriptionOfferFull = { id: string; name: string; price: string; description: string; discountPercent: string | null; stripeProductId: string | null; stripePriceId: string | null };
  const { data: subscriptionOffersList, refetch: refetchOffers } = useQuery<SubscriptionOfferFull[]>({
    queryKey: ["/api/subscriptions/offers/list"],
    enabled: !!user && user.role === "admin",
  });
  const [editingOfferPrices, setEditingOfferPrices] = useState<Record<string, string>>({});
  const [editingDiscountPercent, setEditingDiscountPercent] = useState<Record<string, string>>({});

  const updateOfferPriceMutation = useMutation({
    mutationFn: async ({ id, price, discountPercent }: { id: string; price?: string; discountPercent?: string }) => {
      const body = id.startsWith("pack_") ? { discountPercent } : { price };
      const response = await apiRequest("PATCH", `/api/subscriptions/offers/${id}`, body);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Offre mise à jour", description: "L'offre a été modifiée avec succès" });
      refetchOffers();
      queryClient.invalidateQueries({ queryKey: ["/api/subscriptions/offers"] });
    },
    onError: () => {
      toast({ title: "Erreur", description: "Impossible de mettre à jour l'offre", variant: "destructive" });
    },
  });

  const deleteOfferMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/subscriptions/offers/${id}`);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Offre supprimée", description: "L'offre a été supprimée avec succès" });
      refetchOffers();
      queryClient.invalidateQueries({ queryKey: ["/api/subscriptions/offers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/subscription-offers"] });
    },
    onError: (error: Error) => {
      toast({ title: "Erreur", description: error.message || "Impossible de supprimer l'offre", variant: "destructive" });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/users/${id}`);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Utilisateur supprimé", description: "L'utilisateur et toutes ses données ont été supprimés" });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
    },
    onError: (error: Error) => {
      toast({ title: "Erreur", description: error.message || "Impossible de supprimer l'utilisateur", variant: "destructive" });
    },
  });

  const syncStripeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/subscriptions/offers/sync-stripe");
      return response.json();
    },
    onSuccess: (data) => {
      toast({ title: "Synchronisation terminée", description: "Les offres ont été synchronisées avec Stripe" });
      refetchOffers();
    },
    onError: () => {
      toast({ title: "Erreur", description: "Impossible de synchroniser avec Stripe", variant: "destructive" });
    },
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
      projectType: "site_vitrine",
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

  // Deposit payment mutation
  const payDepositMutation = useMutation({
    mutationFn: async (projectId: string) => {
      const response = await apiRequest("POST", `/api/projects/${projectId}/pay-deposit`);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de l'initialisation du paiement",
        variant: "destructive",
      });
    },
  });

  // Final payment mutation
  const payFinalMutation = useMutation({
    mutationFn: async (projectId: string) => {
      const response = await apiRequest("POST", `/api/projects/${projectId}/pay-final`);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de l'initialisation du paiement",
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
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: "feature" | "document" | "project" | "offer"; id: string; title: string } | null>(null);

  // Documents state and queries
  const [expandedDocuments, setExpandedDocuments] = useState<string | null>(null);
  const [previewQuote, setPreviewQuote] = useState<string | null>(null);
  const [lineItems, setLineItems] = useState<Record<string, Array<{ description: string; amount: string }>>>({});
  const [depositPercents, setDepositPercents] = useState<Record<string, string>>({});

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
    mutationFn: async ({ documentId, data }: { documentId: string; data: { quoteTitle: string; quoteDescription?: string; quoteLineItems?: string; quoteAmount: string; quoteDepositPercent?: string; quoteValidityDays?: string; quoteNotes?: string } }) => {
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

  const sendQuoteMutation = useMutation({
    mutationFn: async (documentId: string) => {
      const response = await fetch(`/api/documents/${documentId}/send`, {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.json();
        if (error.requiresSignature) {
          throw new Error("REQUIRES_SIGNATURE:" + error.message);
        }
        throw new Error(error.message || "Erreur lors de l'envoi");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Devis envoyé",
        description: "Le devis a été envoyé au client pour signature.",
      });
      refetchDocuments();
      refetchProjects();
    },
    onError: (error: Error) => {
      if (error.message.startsWith("REQUIRES_SIGNATURE:")) {
        toast({
          title: "Signature requise",
          description: "Veuillez enregistrer votre signature dans Mon Profil avant d'envoyer un devis.",
          variant: "destructive",
        });
        setActiveSection("profile");
      } else {
        toast({
          title: "Erreur",
          description: error.message || "Erreur lors de l'upload",
          variant: "destructive",
        });
      }
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

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { company: string; address: string; postalCode: string; city: string; billingAddress?: string; billingPostalCode?: string; billingCity?: string; sameAsBilling?: boolean }) => {
      const response = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erreur lors de la mise à jour");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été mises à jour avec succès.",
      });
      setShowEditProfile(false);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la mise à jour",
        variant: "destructive",
      });
    },
  });

  const requestPasswordChangeMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/auth/request-password-change", {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erreur");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Email envoyé",
        description: "Un lien de modification a été envoyé à votre adresse email.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de l'envoi",
        variant: "destructive",
      });
    },
  });

  const requestEmailChangeMutation = useMutation({
    mutationFn: async (newEmail: string) => {
      const response = await fetch("/api/auth/request-email-change", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ newEmail }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erreur");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Email envoyé",
        description: "Un lien de confirmation a été envoyé à votre adresse email actuelle.",
      });
      setShowEmailChangeDialog(false);
      setNewEmailValue("");
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de l'envoi",
        variant: "destructive",
      });
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async (projectId: string) => {
      const response = await fetch(`/api/projects/${projectId}`, {
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
        title: "Projet supprimé",
        description: "Le projet a été supprimé.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la suppression",
        variant: "destructive",
      });
    },
  });

  // Subscription mutations - redirect to Stripe checkout
  const createSubscriptionMutation = useMutation({
    mutationFn: async ({ projectId, offerType }: { projectId: string; offerType: string }) => {
      const response = await apiRequest("POST", "/api/subscriptions/checkout", { projectId, offerType });
      return response.json();
    },
    onSuccess: (data: { url: string }) => {
      // Redirect to Stripe checkout
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la création de l'abonnement",
        variant: "destructive",
      });
    },
  });

  const cancelSubscriptionMutation = useMutation({
    mutationFn: async (subscriptionId: string) => {
      const response = await fetch(`/api/subscriptions/${subscriptionId}/cancel`, {
        method: "PATCH",
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erreur lors de l'annulation");
      }
      return response.json();
    },
    onSuccess: (data) => {
      const endDate = (data as any)?.currentPeriodEnd 
        ? new Date((data as any).currentPeriodEnd).toLocaleDateString('fr-FR')
        : null;
      toast({
        title: "Résiliation programmée",
        description: endDate 
          ? `Votre abonnement sera résilié le ${endDate}.`
          : "L'abonnement a été annulé.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/subscriptions"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de l'annulation",
        variant: "destructive",
      });
    },
  });

  const reactivateSubscriptionMutation = useMutation({
    mutationFn: async (subscriptionId: string) => {
      const response = await apiRequest("PATCH", `/api/subscriptions/${subscriptionId}/reactivate`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erreur lors de la réactivation");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Abonnement réactivé",
        description: "La résiliation a été annulée. Votre abonnement continue normalement.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/subscriptions"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la réactivation",
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

  const signElectronicMutation = useMutation({
    mutationFn: async ({ documentId, signature }: { documentId: string; signature: string }) => {
      const response = await apiRequest("POST", `/api/documents/${documentId}/sign-electronic`, { signature });
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Document signé",
        description: "Votre signature électronique a été enregistrée avec succès.",
      });
      setSignDocumentId(null);
      setClientSignature(null);
      refetchDocuments();
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la signature",
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

  const saveSignatureMutation = useMutation({
    mutationFn: async (signature: string) => {
      await apiRequest("POST", "/api/auth/save-signature", { signature });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Signature enregistrée",
        description: "Votre signature sera intégrée dans les prochains devis.",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer la signature.",
        variant: "destructive",
      });
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
    ...(user.role !== "admin" ? [{ id: "documents" as MenuSection, label: "Mes abonnements actifs", icon: FileText }] : []),
    ...(user.role !== "admin" ? [{ id: "services" as MenuSection, label: "Services additionnels", icon: Package }] : []),
    ...(user.role === "admin" ? [{ id: "documents" as MenuSection, label: "Abonnements", icon: FileText }] : []),
    ...(user.role === "admin" ? [{ id: "subscription_settings" as MenuSection, label: "Gérer les abonnements", icon: Settings }] : []),
    ...(user.role === "admin" ? [{ id: "users" as MenuSection, label: "Utilisateurs", icon: Users }] : []),
    ...(user.role === "admin" ? [{ id: "logs" as MenuSection, label: "Logs", icon: Shield }] : []),
    ...(user.role === "admin" ? [{ id: "analytics" as MenuSection, label: "Analytics", icon: BarChart3 }] : []),
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
              {/* Stats for regular users */}
              {user.role !== "admin" && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Projets actifs</CardTitle>
                      <FolderKanban className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold" data-testid="stat-active-projects">
                        {projects?.filter(p => p.status !== "completed").length || 0}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {projects?.filter(p => p.status !== "completed").length === 0 
                          ? "Aucun projet en cours" 
                          : `sur ${projects?.length || 0} projet(s) total`}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Projets terminés</CardTitle>
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold" data-testid="stat-completed-projects">
                        {projects?.filter(p => p.status === "completed").length || 0}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Projets livrés
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Abonnements actifs</CardTitle>
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold" data-testid="stat-active-subscriptions">
                        {subscriptions?.filter(s => s.status === "active").length || 0}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {subscriptions?.filter(s => s.status === "active" && s.cancelAtPeriodEnd).length 
                          ? `${subscriptions.filter(s => s.status === "active" && s.cancelAtPeriodEnd).length} en cours de résiliation`
                          : "Abonnements en cours"}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Paiements en attente</CardTitle>
                      <Receipt className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold" data-testid="stat-pending-payments">
                        {projects?.filter(p => p.status === "awaiting_deposit" || p.status === "awaiting_final_payment").length || 0}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {projects?.filter(p => p.status === "awaiting_deposit" || p.status === "awaiting_final_payment").length === 0 
                          ? "Aucun paiement en attente" 
                          : "À régler"}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Stats for admin */}
              {user.role === "admin" && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Projets en cours</CardTitle>
                      <FolderKanban className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold" data-testid="stat-admin-active-projects">
                        {projects?.filter(p => p.status !== "completed" && p.status !== "submitted").length || 0}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {projects?.filter(p => p.status === "submitted").length || 0} nouvelle(s) demande(s)
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Utilisateurs</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold" data-testid="stat-users">{allUsers?.filter(u => u.role !== "admin").length || 0}</div>
                      <p className="text-xs text-muted-foreground">Clients enregistrés</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Abonnements actifs</CardTitle>
                      <CreditCard className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold" data-testid="stat-admin-subscriptions">
                        {subscriptions?.filter(s => s.status === "active").length || 0}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {(() => {
                          const activeSubsTotal = subscriptions?.filter(s => s.status === "active")
                            .reduce((sum, s) => sum + parseFloat(s.monthlyPrice || "0"), 0) || 0;
                          return `${activeSubsTotal.toFixed(2)} €/mois`;
                        })()}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Actions requises</CardTitle>
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold" data-testid="stat-admin-actions">
                        {(projects?.filter(p => p.status === "submitted" || p.status === "review").length || 0)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Projets à traiter
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Additional stats row for admin */}
              {user.role === "admin" && (
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Projets terminés</CardTitle>
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold" data-testid="stat-admin-completed">
                        {projects?.filter(p => p.status === "completed").length || 0}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        sur {projects?.length || 0} projet(s) total
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">En attente de paiement</CardTitle>
                      <Receipt className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold" data-testid="stat-admin-awaiting-payment">
                        {projects?.filter(p => p.status === "awaiting_deposit" || p.status === "awaiting_final_payment").length || 0}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {projects?.filter(p => p.status === "awaiting_deposit").length || 0} acompte(s), {projects?.filter(p => p.status === "awaiting_final_payment").length || 0} règlement(s)
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Statut</CardTitle>
                      <Shield className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                      <Badge className="bg-primary">Administrateur</Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        Accès complet
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}
              
              <Card>
                <CardHeader>
                  <CardTitle>Bienvenue, {user.firstName} !</CardTitle>
                  <CardDescription>
                    {user.role === "admin" 
                      ? "Gérez les projets, utilisateurs et abonnements depuis votre espace administrateur."
                      : "Utilisez le menu à gauche pour naviguer dans votre espace client."}
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
                <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-2">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Entreprise & Adresses</CardTitle>
                      <CardDescription>Informations de facturation</CardDescription>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditProfileData({
                        company: user.company,
                        address: user.address,
                        postalCode: user.postalCode || "",
                        city: user.city || "",
                        billingAddress: user.billingAddress || "",
                        billingPostalCode: user.billingPostalCode || "",
                        billingCity: user.billingCity || "",
                        sameAsBilling: user.sameAsBilling || false,
                      });
                      setShowEditProfile(true);
                    }}
                    data-testid="button-edit-profile"
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Modifier
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Entreprise</p>
                    <p className="text-lg font-semibold" data-testid="text-company">{user.company}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Adresse principale</p>
                    <p className="text-sm" data-testid="text-address">{user.address}</p>
                    <p className="text-sm" data-testid="text-postal-city">
                      {user.postalCode} {user.city}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Adresse de facturation</p>
                    <p className="text-sm" data-testid="text-billing-address">
                      {user.sameAsBilling ? user.address : user.billingAddress}
                    </p>
                    <p className="text-sm" data-testid="text-billing-postal-city">
                      {user.sameAsBilling 
                        ? `${user.postalCode} ${user.city}` 
                        : `${user.billingPostalCode} ${user.billingCity}`}
                    </p>
                    {user.sameAsBilling && (
                      <Badge variant="secondary" className="mt-2">
                        Identique à l'adresse principale
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Sécurité</CardTitle>
                    <CardDescription>Gérer votre mot de passe et email</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Email actuel</p>
                    <p className="text-sm font-medium" data-testid="text-email">{user.email}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => requestPasswordChangeMutation.mutate()}
                      disabled={requestPasswordChangeMutation.isPending}
                      data-testid="button-request-password-change"
                    >
                      {requestPasswordChangeMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      Modifier le mot de passe par email
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setShowEmailChangeDialog(true)}
                      data-testid="button-change-email"
                    >
                      Modifier l'adresse email
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {user?.role === "admin" && (
                <Card className="md:col-span-2">
                  <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Pencil className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Signature électronique</CardTitle>
                      <CardDescription>Votre signature sera intégrée dans les devis générés</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <SignaturePad 
                      existingSignature={user?.signature}
                      onSave={(signature) => saveSignatureMutation.mutate(signature)}
                      isPending={saveSignatureMutation.isPending}
                    />
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Edit Profile Dialog */}
          <Dialog open={showEditProfile} onOpenChange={setShowEditProfile}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Modifier mes informations</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  updateProfileMutation.mutate(editProfileData);
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="edit-company">Entreprise</Label>
                  <Input
                    id="edit-company"
                    value={editProfileData.company}
                    onChange={(e) => setEditProfileData({ ...editProfileData, company: e.target.value })}
                    placeholder="Nom de l'entreprise"
                    data-testid="input-edit-company"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-address">Adresse principale</Label>
                  <Input
                    id="edit-address"
                    value={editProfileData.address}
                    onChange={(e) => setEditProfileData({ ...editProfileData, address: e.target.value })}
                    placeholder="Adresse"
                    data-testid="input-edit-address"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-postal-code">Code postal</Label>
                    <Input
                      id="edit-postal-code"
                      value={editProfileData.postalCode}
                      onChange={(e) => setEditProfileData({ ...editProfileData, postalCode: e.target.value })}
                      placeholder="75001"
                      data-testid="input-edit-postal-code"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-city">Ville</Label>
                    <Input
                      id="edit-city"
                      value={editProfileData.city}
                      onChange={(e) => setEditProfileData({ ...editProfileData, city: e.target.value })}
                      placeholder="Paris"
                      data-testid="input-edit-city"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="edit-same-billing"
                    checked={editProfileData.sameAsBilling}
                    onChange={(e) => setEditProfileData({ ...editProfileData, sameAsBilling: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300"
                    data-testid="checkbox-edit-same-billing"
                  />
                  <Label htmlFor="edit-same-billing" className="text-sm font-normal cursor-pointer">
                    Adresse de facturation identique
                  </Label>
                </div>
                {!editProfileData.sameAsBilling && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="edit-billing-address">Adresse de facturation</Label>
                      <Input
                        id="edit-billing-address"
                        value={editProfileData.billingAddress}
                        onChange={(e) => setEditProfileData({ ...editProfileData, billingAddress: e.target.value })}
                        placeholder="Adresse de facturation"
                        data-testid="input-edit-billing-address"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-billing-postal-code">Code postal</Label>
                        <Input
                          id="edit-billing-postal-code"
                          value={editProfileData.billingPostalCode}
                          onChange={(e) => setEditProfileData({ ...editProfileData, billingPostalCode: e.target.value })}
                          placeholder="75001"
                          data-testid="input-edit-billing-postal-code"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-billing-city">Ville</Label>
                        <Input
                          id="edit-billing-city"
                          value={editProfileData.billingCity}
                          onChange={(e) => setEditProfileData({ ...editProfileData, billingCity: e.target.value })}
                          placeholder="Paris"
                          data-testid="input-edit-billing-city"
                        />
                      </div>
                    </div>
                  </>
                )}
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setShowEditProfile(false)}>
                    Annuler
                  </Button>
                  <Button type="submit" disabled={updateProfileMutation.isPending} data-testid="button-save-profile">
                    {updateProfileMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Enregistrer
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* Email Change Dialog */}
          <Dialog open={showEmailChangeDialog} onOpenChange={setShowEmailChangeDialog}>
            <DialogContent className="sm:max-w-[400px]">
              <DialogHeader>
                <DialogTitle>Modifier l'adresse email</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (newEmailValue) {
                    requestEmailChangeMutation.mutate(newEmailValue);
                  }
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="new-email">Nouvelle adresse email</Label>
                  <Input
                    id="new-email"
                    type="email"
                    value={newEmailValue}
                    onChange={(e) => setNewEmailValue(e.target.value)}
                    placeholder="nouveau@email.com"
                    data-testid="input-new-email"
                  />
                  <p className="text-xs text-muted-foreground">
                    Un email de confirmation sera envoyé à votre adresse actuelle.
                  </p>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setShowEmailChangeDialog(false)}>
                    Annuler
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={requestEmailChangeMutation.isPending || !newEmailValue}
                    data-testid="button-confirm-email-change"
                  >
                    {requestEmailChangeMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Envoyer la confirmation
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

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
                          name="projectType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Type de projet</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-project-type">
                                    <SelectValue placeholder="Sélectionnez le type de projet" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="site_vitrine">Site Vitrine</SelectItem>
                                  <SelectItem value="app_enterprise">Application Web Entreprise</SelectItem>
                                </SelectContent>
                              </Select>
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
                            <div className="flex items-center gap-2 flex-wrap">
                              <CardTitle className="text-lg">{project.title}</CardTitle>
                              <Badge variant="outline" className="text-xs" data-testid={`badge-project-type-${project.id}`}>
                                {(project as any).projectType === "app_enterprise" ? "Application Web" : "Site Vitrine"}
                              </Badge>
                            </div>
                            {!collapsedProjects.has(project.id) && (
                              <CardDescription className="mt-1">
                                {project.businessSector} • {project.designStyle}
                              </CardDescription>
                            )}
                            {/* Mini progress bar when collapsed */}
                            {collapsedProjects.has(project.id) && project.status !== "cancelled" && (
                              <div className="mt-2 flex items-center gap-3">
                                <div className="flex-1">
                                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-gradient-to-r from-primary via-cyan-400 to-primary transition-all duration-500 ease-out"
                                      style={{ 
                                        width: project.status === "pending" ? "0%" :
                                               project.status === "in_review" ? "14%" :
                                               project.status === "awaiting_signature" ? "28%" :
                                               project.status === "awaiting_deposit" ? "35%" :
                                               project.status === "approved" ? "42%" :
                                               project.status === "in_progress_1" ? "57%" :
                                               project.status === "in_progress_2" ? "71%" :
                                               project.status === "awaiting_final_payment" ? "85%" :
                                               project.status === "in_progress" ? "71%" : "100%"
                                      }}
                                    />
                                  </div>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {project.status === "pending" && "Déposé"}
                                  {project.status === "in_review" && "Étude"}
                                  {project.status === "awaiting_signature" && "Signature"}
                                  {project.status === "awaiting_deposit" && "Attente acompte"}
                                  {project.status === "approved" && "Validé"}
                                  {project.status === "in_progress_1" && "Phase 1"}
                                  {project.status === "in_progress_2" && "Phase 2"}
                                  {project.status === "awaiting_final_payment" && "Règlement"}
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
                                <SelectItem value="awaiting_signature">En attente de signature</SelectItem>
                                <SelectItem value="awaiting_deposit">Attente de l'acompte</SelectItem>
                                <SelectItem value="approved">Validé</SelectItem>
                                <SelectItem value="in_progress_1">En cours - Phase 1</SelectItem>
                                <SelectItem value="in_progress_2">En cours - Phase 2</SelectItem>
                                <SelectItem value="awaiting_final_payment">Règlement total</SelectItem>
                                <SelectItem value="completed">Terminé</SelectItem>
                                <SelectItem value="cancelled">Annulé</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Badge variant={
                                project.status === "pending" ? "secondary" :
                                project.status === "awaiting_signature" ? "default" :
                                project.status === "awaiting_deposit" ? "default" :
                                project.status === "in_progress_1" ? "default" :
                                project.status === "in_progress_2" ? "default" :
                                project.status === "awaiting_final_payment" ? "default" :
                                project.status === "completed" ? "outline" : "secondary"
                              }>
                                {project.status === "pending" && "En attente"}
                                {project.status === "in_review" && "En cours d'étude"}
                                {project.status === "awaiting_signature" && "En attente de signature"}
                                {project.status === "awaiting_deposit" && "Attente de l'acompte"}
                                {project.status === "approved" && "Acompte reçu"}
                                {project.status === "in_progress_1" && "En cours - Phase 1"}
                                {project.status === "in_progress_2" && "En cours - Phase 2"}
                                {project.status === "awaiting_final_payment" && "Règlement total"}
                                {project.status === "completed" && "Terminé"}
                                {project.status === "cancelled" && "Annulé"}
                              </Badge>
                              {!["approved", "in_progress_1", "in_progress_2", "awaiting_final_payment", "completed"].includes(project.status) && (
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDeleteConfirm({ type: "project", id: project.id, title: project.title });
                                  }}
                                  disabled={deleteProjectMutation.isPending}
                                  data-testid={`button-delete-project-${project.id}`}
                                >
                                  {deleteProjectMutation.isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                </Button>
                              )}
                            </div>
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
                                {project.status === "in_review" && "14%"}
                                {project.status === "awaiting_signature" && "28%"}
                                {project.status === "awaiting_deposit" && "35%"}
                                {project.status === "approved" && "42%"}
                                {project.status === "in_progress_1" && "57%"}
                                {project.status === "in_progress_2" && "71%"}
                                {project.status === "awaiting_final_payment" && "85%"}
                                {project.status === "in_progress" && "71%"}
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
                                           project.status === "in_review" ? "14%" :
                                           project.status === "awaiting_signature" ? "28%" :
                                           project.status === "awaiting_deposit" ? "35%" :
                                           project.status === "approved" ? "42%" :
                                           project.status === "in_progress_1" ? "57%" :
                                           project.status === "in_progress_2" ? "71%" :
                                           project.status === "awaiting_final_payment" ? "85%" :
                                           project.status === "in_progress" ? "71%" : "100%"
                                  }}
                                />
                              </div>
                              {/* Step indicators */}
                              <div className="flex justify-between mt-3">
                                {[
                                  { key: "pending", label: "Déposé" },
                                  { key: "in_review", label: "Étude" },
                                  { key: "awaiting_signature", label: "Signature" },
                                  { key: "approved", label: "Validé" },
                                  { key: "in_progress_1", label: "Phase 1" },
                                  { key: "in_progress_2", label: "Phase 2" },
                                  { key: "awaiting_final_payment", label: "Règlement" },
                                  { key: "completed", label: "Terminé" }
                                ].map((step, index) => {
                                  const visualSteps = ["pending", "in_review", "awaiting_signature", "approved", "in_progress_1", "in_progress_2", "awaiting_final_payment", "completed"];
                                  const stepIndex = visualSteps.indexOf(step.key);
                                  const statusOrder = ["pending", "in_review", "awaiting_signature", "awaiting_deposit", "approved", "in_progress_1", "in_progress_2", "awaiting_final_payment", "completed"];
                                  const currentStatusIndex = statusOrder.indexOf(project.status);
                                  const stepStatusIndex = statusOrder.indexOf(step.key);
                                  const isCompleted = stepStatusIndex < currentStatusIndex;
                                  const isCurrent = step.key === project.status || (project.status === "awaiting_deposit" && step.key === "awaiting_signature");
                                  
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
                                          <span className="text-xs font-medium">{stepIndex + 1}</span>
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

                        {/* Deposit payment button for users */}
                        {project.status === "awaiting_deposit" && user.role !== "admin" && (
                          <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                            <div className="flex items-start gap-3">
                              <div className="p-2 rounded-full bg-primary/20">
                                <CreditCard className="h-5 w-5 text-primary" />
                              </div>
                              <div className="flex-1">
                                <h4 className="text-sm font-semibold text-primary">Paiement de l'acompte requis</h4>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Votre devis a été signé. Veuillez procéder au paiement de l'acompte pour démarrer votre projet.
                                </p>
                                <Button
                                  className="mt-3"
                                  onClick={() => payDepositMutation.mutate(project.id)}
                                  disabled={payDepositMutation.isPending}
                                  data-testid={`button-pay-deposit-${project.id}`}
                                >
                                  {payDepositMutation.isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                  ) : (
                                    <CreditCard className="h-4 w-4 mr-2" />
                                  )}
                                  Payer l'acompte
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Final payment button for users */}
                        {project.status === "awaiting_final_payment" && user.role !== "admin" && (
                          <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                            <div className="flex items-start gap-3">
                              <div className="p-2 rounded-full bg-green-500/20">
                                <CreditCard className="h-5 w-5 text-green-600" />
                              </div>
                              <div className="flex-1">
                                <h4 className="text-sm font-semibold text-green-600">Règlement total du projet</h4>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Votre projet est terminé. Veuillez procéder au paiement du solde restant pour finaliser votre commande.
                                </p>
                                <Button
                                  className="mt-3 bg-green-600 hover:bg-green-700"
                                  onClick={() => payFinalMutation.mutate(project.id)}
                                  disabled={payFinalMutation.isPending}
                                  data-testid={`button-pay-final-${project.id}`}
                                >
                                  {payFinalMutation.isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                  ) : (
                                    <CreditCard className="h-4 w-4 mr-2" />
                                  )}
                                  Payer le solde
                                </Button>
                              </div>
                            </div>
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
                              {user.role !== "admin" && project.status !== "completed" && (
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

                            {/* Add feature form (client only, not for completed projects) */}
                            {showFeatureForm === project.id && user.role !== "admin" && project.status !== "completed" && (
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
                                          (doc.type === "invoice" || doc.type === "subscription_invoice") ? "bg-emerald-500/10" :
                                          doc.status === "draft" ? "bg-yellow-500/10" :
                                          doc.status === "awaiting_signature" ? "bg-blue-500/10" :
                                          "bg-green-500/10"
                                        }`}>
                                          {(doc.type === "invoice" || doc.type === "subscription_invoice") && <Receipt className="h-4 w-4 text-emerald-500" />}
                                          {doc.type !== "invoice" && doc.type !== "subscription_invoice" && doc.status === "draft" && <FilePenLine className="h-4 w-4 text-yellow-500" />}
                                          {doc.type !== "invoice" && doc.type !== "subscription_invoice" && doc.status === "awaiting_signature" && <FileClock className="h-4 w-4 text-blue-500" />}
                                          {doc.type !== "invoice" && doc.type !== "subscription_invoice" && doc.status === "signed" && <FileCheck className="h-4 w-4 text-green-500" />}
                                        </div>
                                        <div>
                                          <p className="text-sm font-medium">
                                            {(doc.type === "invoice" || doc.type === "subscription_invoice") ? doc.quoteTitle : "Devis"}
                                            {doc.type !== "invoice" && doc.type !== "subscription_invoice" && doc.quoteTitle && ` - ${doc.quoteTitle}`}
                                          </p>
                                          <p className="text-xs text-muted-foreground">
                                            {(doc.type === "invoice" || doc.type === "subscription_invoice") && doc.status === "paid" && "Payée"}
                                            {doc.type !== "invoice" && doc.type !== "subscription_invoice" && doc.status === "draft" && "Brouillon - En cours d'édition"}
                                            {doc.type !== "invoice" && doc.type !== "subscription_invoice" && doc.status === "awaiting_signature" && "En attente de signature"}
                                            {doc.type !== "invoice" && doc.type !== "subscription_invoice" && doc.status === "signed" && "Signé"}
                                          </p>
                                          {doc.quoteAmount && (doc.status !== "draft" || doc.type === "invoice" || doc.type === "subscription_invoice") && (
                                            <p className="text-sm font-medium mt-1">{doc.quoteAmount} €</p>
                                          )}
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        {/* Admin actions */}
                                        {user.role === "admin" && doc.status === "draft" && (
                                          <div className="flex items-center gap-2">
                                            {!user.signature && (
                                              <div className="flex items-center gap-1 text-amber-500 text-xs">
                                                <AlertCircle className="h-3 w-3" />
                                                <span>Signature requise</span>
                                              </div>
                                            )}
                                            <Button
                                              size="sm"
                                              variant="default"
                                              onClick={() => sendQuoteMutation.mutate(doc.id)}
                                              disabled={sendQuoteMutation.isPending || !doc.quoteTitle || !doc.quoteAmount}
                                              data-testid={`button-send-quote-${doc.id}`}
                                            >
                                              {sendQuoteMutation.isPending ? (
                                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                              ) : (
                                                <Send className="h-4 w-4 mr-2" />
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


                                        {/* Client preview and download quote */}
                                        {user.role !== "admin" && doc.status === "awaiting_signature" && (
                                          <div className="flex flex-col gap-3">
                                            <div className="flex items-center gap-2">
                                              <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => setPreviewQuote(previewQuote === doc.id ? null : doc.id)}
                                                data-testid={`button-client-preview-${doc.id}`}
                                              >
                                                <Eye className="h-4 w-4 mr-1" />
                                                Prévisualiser
                                              </Button>
                                              <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => {
                                                  window.open(`/api/documents/${doc.id}/generate-pdf`, "_blank");
                                                }}
                                                data-testid={`button-client-download-${doc.id}`}
                                              >
                                                <Download className="h-4 w-4 mr-1" />
                                                Télécharger
                                              </Button>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <Button
                                                size="sm"
                                                variant="default"
                                                onClick={() => setSignDocumentId(doc.id)}
                                                disabled={signElectronicMutation.isPending}
                                                data-testid={`button-sign-electronic-${doc.id}`}
                                              >
                                                <PenLine className="h-4 w-4 mr-2" />
                                                Signer électroniquement
                                              </Button>
                                              <span className="text-xs text-muted-foreground">ou</span>
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
                                                variant="outline"
                                                onClick={() => document.getElementById(`upload-signed-${doc.id}`)?.click()}
                                                disabled={uploadSignedMutation.isPending}
                                                data-testid={`button-upload-signed-${doc.id}`}
                                              >
                                                {uploadSignedMutation.isPending ? (
                                                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                ) : (
                                                  <FileUp className="h-4 w-4 mr-2" />
                                                )}
                                                Envoyer PDF signé
                                              </Button>
                                            </div>
                                          </div>
                                        )}

                                        {/* Preview and download for signed documents */}
                                        {doc.type !== "invoice" && doc.type !== "subscription_invoice" && doc.status === "signed" && (
                                          <div className="flex items-center gap-2">
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              onClick={() => setPreviewQuote(previewQuote === doc.id ? null : doc.id)}
                                              data-testid={`button-preview-signed-${doc.id}`}
                                            >
                                              <Eye className="h-4 w-4 mr-1" />
                                              Prévisualiser
                                            </Button>
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              onClick={() => window.open(`/api/documents/${doc.id}/generate-pdf`, '_blank')}
                                              data-testid={`button-download-pdf-signed-${doc.id}`}
                                            >
                                              <Download className="h-4 w-4 mr-1" />
                                              Télécharger
                                            </Button>
                                            {doc.signedFileName && (
                                              <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => window.open(`/api/documents/${doc.id}/download?type=signed`, '_blank')}
                                                data-testid={`button-download-signed-${doc.id}`}
                                              >
                                                <FileCheck className="h-4 w-4 mr-1" />
                                                Fichier signé
                                              </Button>
                                            )}
                                          </div>
                                        )}

                                        {/* Download button for invoices */}
                                        {(doc.type === "invoice" || doc.type === "subscription_invoice") && (
                                          <Button
                                            size="sm"
                                            variant="default"
                                            className="bg-emerald-600 hover:bg-emerald-700"
                                            onClick={() => window.open(`/api/documents/${doc.id}/generate-invoice-pdf`, '_blank')}
                                            data-testid={`button-download-invoice-${doc.id}`}
                                          >
                                            <Download className="h-4 w-4 mr-1" />
                                            Télécharger
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
                                          const currentLineItems = lineItems[doc.id] || (doc.quoteLineItems ? JSON.parse(doc.quoteLineItems) : []);
                                          const totalAmount = currentLineItems.reduce((sum: number, item: { amount: string }) => sum + (parseFloat(item.amount) || 0), 0).toFixed(2);
                                          const currentDepositPercent = depositPercents[doc.id] ?? doc.quoteDepositPercent ?? "";
                                          updateQuoteMutation.mutate({
                                            documentId: doc.id,
                                            data: {
                                              quoteTitle: formData.get("quoteTitle") as string,
                                              quoteDescription: formData.get("quoteDescription") as string || undefined,
                                              quoteLineItems: JSON.stringify(currentLineItems),
                                              quoteAmount: totalAmount,
                                              quoteDepositPercent: currentDepositPercent || undefined,
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
                                                    value={depositPercents[doc.id] ?? doc.quoteDepositPercent ?? ""}
                                                    onChange={(e) => setDepositPercents({ ...depositPercents, [doc.id]: e.target.value })}
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
                                                    const percent = parseFloat(depositPercents[doc.id] ?? doc.quoteDepositPercent ?? "0") || 0;
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
                                            Télécharger
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
                                          const projectOwner = user.role === "admin" 
                                            ? allUsers?.find(u => u.id === project.userId)
                                            : user;
                                          const adminInfo = user.role === "admin" ? user : null;
                                          return (
                                            <div className="space-y-4">
                                              {/* Addresses section */}
                                              <div className="grid grid-cols-2 gap-4 pb-3 border-b">
                                                <div>
                                                  <p className="text-xs text-muted-foreground mb-1">ÉMETTEUR</p>
                                                  <p className="text-sm font-semibold">Innov Studio</p>
                                                  {adminInfo && (
                                                    <p className="text-xs text-muted-foreground whitespace-pre-wrap">{adminInfo.address}</p>
                                                  )}
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
                                              {user.role === "admin" && doc.quoteNotes && (
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

          {/* Subscriptions Section */}
          {activeSection === "documents" && (
            <div className="space-y-6">
              {/* Admin View - All active subscriptions grouped by project */}
              {user.role === "admin" ? (
                <Card>
                  <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle>Abonnements</CardTitle>
                      <CardDescription>Liste de tous les projets avec abonnements actifs</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {subscriptionsLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    ) : subscriptions && subscriptions.filter(s => s.status === "active").length > 0 ? (
                      <div className="space-y-4">
                        {/* Group subscriptions by project */}
                        {Array.from(new Set(subscriptions.filter(s => s.status === "active").map(s => s.projectId))).map(projectId => {
                          const project = projects?.find(p => p.id === projectId);
                          const projectUser = allUsers?.find(u => u.id === project?.userId);
                          const projectSubscriptions = subscriptions.filter(s => s.projectId === projectId && s.status === "active");
                          
                          return (
                            <div key={projectId} className="border rounded-lg p-4 space-y-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h3 className="font-semibold text-lg">{project?.title || "Projet inconnu"}</h3>
                                  <p className="text-sm text-muted-foreground">
                                    Client : {projectUser?.firstName} {projectUser?.lastName} ({projectUser?.company || "N/A"})
                                  </p>
                                </div>
                                <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                                  {projectSubscriptions.length} abonnement{projectSubscriptions.length > 1 ? "s" : ""}
                                </Badge>
                              </div>
                              <div className="grid gap-2">
                                {projectSubscriptions.map(subscription => {
                                  const offerInfo = subscriptionOffers?.[subscription.offerType as keyof typeof subscriptionOffers];
                                  return (
                                    <div 
                                      key={subscription.id}
                                      className="flex items-center justify-between p-3 bg-muted/30 rounded-md"
                                    >
                                      <div className="flex items-center gap-3">
                                        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                                          subscription.offerType === "maintenance" ? "bg-blue-500/10" :
                                          subscription.offerType === "hosting" ? "bg-purple-500/10" :
                                          "bg-primary/10"
                                        }`}>
                                          {subscription.offerType === "maintenance" && <Zap className="h-4 w-4 text-blue-500" />}
                                          {subscription.offerType === "hosting" && <Building2 className="h-4 w-4 text-purple-500" />}
                                          {subscription.offerType === "pack" && <Shield className="h-4 w-4 text-primary" />}
                                        </div>
                                        <div>
                                          <p className="font-medium text-sm">{offerInfo?.name || subscription.offerType}</p>
                                          <p className="text-xs text-muted-foreground">
                                            Depuis le {subscription.startDate ? new Date(subscription.startDate).toLocaleDateString('fr-FR') : 'N/A'}
                                          </p>
                                        </div>
                                      </div>
                                      <p className="font-semibold">{subscription.monthlyPrice}€/mois</p>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">Aucun abonnement actif</p>
                        <p className="text-sm text-muted-foreground mt-1">Les abonnements des clients apparaîtront ici</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
              <>
              {/* User View - Active Subscriptions Only */}
              <Card>
                <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Mes abonnements actifs</CardTitle>
                    <CardDescription>Gérez vos abonnements en cours</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  {subscriptionsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : subscriptions && subscriptions.filter(s => s.status === "active").length > 0 ? (
                    <div className="space-y-6">
                      {(() => {
                        const activeSubscriptions = subscriptions.filter(s => s.status === "active");
                        const vitrineSubs = activeSubscriptions.filter(s => s.offerType.includes("vitrine"));
                        const enterpriseSubs = activeSubscriptions.filter(s => s.offerType.includes("enterprise"));

                        const renderSubscriptionItem = (subscription: Subscription) => {
                          const project = projects?.find(p => p.id === subscription.projectId);
                          const offerInfo = subscriptionOffers?.[subscription.offerType as keyof typeof subscriptionOffers];
                          const isVitrine = subscription.offerType.includes("vitrine");
                          return (
                            <div 
                              key={subscription.id} 
                              className="flex flex-wrap items-center justify-between gap-4 p-4 border rounded-md"
                              data-testid={`subscription-${subscription.id}`}
                            >
                              <div className="flex items-center gap-4">
                                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${isVitrine ? "bg-blue-500/10" : "bg-purple-500/10"}`}>
                                  {subscription.offerType.includes("hosting") && <Server className={`h-5 w-5 ${isVitrine ? "text-blue-500" : "text-purple-500"}`} />}
                                  {subscription.offerType.includes("maintenance") && <Zap className={`h-5 w-5 ${isVitrine ? "text-blue-500" : "text-purple-500"}`} />}
                                  {subscription.offerType.includes("pack") && <Package className={`h-5 w-5 ${isVitrine ? "text-blue-500" : "text-purple-500"}`} />}
                                </div>
                                <div>
                                  <p className="font-medium">{offerInfo?.name || subscription.offerType}</p>
                                  <p className="text-sm text-muted-foreground">Projet : {project?.title || "Projet inconnu"}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <p className="font-semibold">{subscription.monthlyPrice}€/mois</p>
                                  {(subscription as any).cancelAtPeriodEnd ? (
                                    <div>
                                      <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-500/20">Résiliation en cours</Badge>
                                      {(subscription as any).currentPeriodEnd && (
                                        <p className="text-xs text-muted-foreground mt-1">Fin le {new Date((subscription as any).currentPeriodEnd).toLocaleDateString('fr-FR')}</p>
                                      )}
                                    </div>
                                  ) : (
                                    <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">Actif</Badge>
                                  )}
                                </div>
                                {!(subscription as any).cancelAtPeriodEnd ? (
                                  <Button variant="ghost" size="icon" onClick={() => cancelSubscriptionMutation.mutate(subscription.id)} disabled={cancelSubscriptionMutation.isPending} data-testid={`button-cancel-subscription-${subscription.id}`}>
                                    {cancelSubscriptionMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4 text-destructive" />}
                                  </Button>
                                ) : (
                                  <Button variant="outline" size="sm" onClick={() => reactivateSubscriptionMutation.mutate(subscription.id)} disabled={reactivateSubscriptionMutation.isPending} data-testid={`button-reactivate-subscription-${subscription.id}`}>
                                    {reactivateSubscriptionMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <RotateCcw className="h-4 w-4 mr-1" />}
                                    Annuler résiliation
                                  </Button>
                                )}
                              </div>
                            </div>
                          );
                        };

                        return (
                          <>
                            {vitrineSubs.length > 0 && (
                              <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                  <Globe className="h-4 w-4 text-blue-500" />
                                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Site Vitrine</h4>
                                </div>
                                {vitrineSubs.map(renderSubscriptionItem)}
                              </div>
                            )}
                            {enterpriseSubs.length > 0 && (
                              <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                  <Building2 className="h-4 w-4 text-purple-500" />
                                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Application Web Entreprise</h4>
                                </div>
                                {enterpriseSubs.map(renderSubscriptionItem)}
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">Aucun abonnement actif</p>
                      <p className="text-sm text-muted-foreground mt-1">Choisissez une offre ci-dessus pour commencer</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Cancelled/Expired Subscriptions */}
              {subscriptions && subscriptions.filter(s => s.status !== "active").length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Historique des abonnements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {subscriptions.filter(s => s.status !== "active").map((subscription) => {
                        const project = projects?.find(p => p.id === subscription.projectId);
                        const offerInfo = subscriptionOffers?.[subscription.offerType as keyof typeof subscriptionOffers];
                        return (
                          <div 
                            key={subscription.id} 
                            className="flex items-center justify-between p-3 border rounded-lg opacity-60"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                                {subscription.offerType.includes("hosting") && <Server className="h-4 w-4" />}
                                {subscription.offerType.includes("maintenance") && <Zap className="h-4 w-4" />}
                                {subscription.offerType.includes("pack") && <Package className="h-4 w-4" />}
                              </div>
                              <div>
                                <p className="text-sm font-medium">{offerInfo?.name || subscription.offerType}</p>
                                <p className="text-xs text-muted-foreground">Projet : {project?.title || "Projet inconnu"}</p>
                              </div>
                            </div>
                            <Badge variant="secondary">
                              {subscription.status === "cancelled" ? "Annulé" : "Expiré"}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
              </>
              )}
            </div>
          )}

          {/* Services additionnels - Subscription Offers */}
          {activeSection === "services" && (
            <div className="space-y-8">
              {/* Site Vitrine Category */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                    <Globe className="h-4 w-4 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Site Vitrine</h3>
                    <p className="text-sm text-muted-foreground">Offres d'hébergement et maintenance pour votre site vitrine</p>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <Card className="flex flex-col">
                    <CardHeader>
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 mb-2">
                        <Server className="h-5 w-5 text-blue-500" />
                      </div>
                      <CardTitle className="text-lg">{subscriptionOffers?.hosting_vitrine?.name || "Hébergement Site Vitrine"}</CardTitle>
                      <CardDescription>{subscriptionOffers?.hosting_vitrine?.description || "Hébergement sécurisé pour votre site vitrine"}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col flex-1">
                      <div className="text-3xl font-bold mb-4">{subscriptionOffers?.hosting_vitrine?.price || "39"}€<span className="text-lg font-normal text-muted-foreground">/mois</span></div>
                      <ul className="space-y-2 text-sm text-muted-foreground mb-6 flex-1">
                        <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" />Hébergement haute disponibilité</li>
                        <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" />Certificat SSL inclus</li>
                        <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" />Sauvegardes quotidiennes</li>
                        <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" />Protection DDoS</li>
                      </ul>
                      <Button 
                        className="w-full mt-auto" 
                        onClick={() => {
                          setSelectedOffer("hosting_vitrine");
                          setShowSubscriptionDialog(true);
                        }}
                        data-testid="button-select-hosting-vitrine"
                      >
                        Souscrire
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="flex flex-col">
                    <CardHeader>
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 mb-2">
                        <Zap className="h-5 w-5 text-blue-500" />
                      </div>
                      <CardTitle className="text-lg">{subscriptionOffers?.maintenance_vitrine?.name || "Support & Maintenance 7/7j"}</CardTitle>
                      <CardDescription>{subscriptionOffers?.maintenance_vitrine?.description || "Support technique 7j/7 pour votre site vitrine"}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col flex-1">
                      <div className="text-3xl font-bold mb-4">{subscriptionOffers?.maintenance_vitrine?.price || "69"}€<span className="text-lg font-normal text-muted-foreground">/mois</span></div>
                      <ul className="space-y-2 text-sm text-muted-foreground mb-6 flex-1">
                        <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" />Mises à jour de sécurité</li>
                        <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" />Correction de bugs</li>
                        <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" />Support technique 7j/7</li>
                        <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" />Rapport mensuel</li>
                      </ul>
                      <Button 
                        className="w-full mt-auto" 
                        onClick={() => {
                          setSelectedOffer("maintenance_vitrine");
                          setShowSubscriptionDialog(true);
                        }}
                        data-testid="button-select-maintenance-vitrine"
                      >
                        Souscrire
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="relative border-blue-500/50 flex flex-col">
                    <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs px-3 py-1 rounded-bl-lg font-medium">
                      Recommandé
                    </div>
                    <CardHeader>
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 mb-2">
                        <Package className="h-5 w-5 text-blue-500" />
                      </div>
                      <CardTitle className="text-lg">{subscriptionOffers?.pack_vitrine?.name || "Pack Site Vitrine"}</CardTitle>
                      <CardDescription>{subscriptionOffers?.pack_vitrine?.description || "Hébergement + Support & Maintenance 7/7j"}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col flex-1">
                      <div className="text-3xl font-bold mb-1">{subscriptionOffers?.pack_vitrine?.price || "89"}€<span className="text-lg font-normal text-muted-foreground">/mois</span></div>
                      <p className="text-sm text-green-600 mb-4">Économisez {Math.round((parseFloat(subscriptionOffers?.hosting_vitrine?.price || "39") + parseFloat(subscriptionOffers?.maintenance_vitrine?.price || "69")) - parseFloat(subscriptionOffers?.pack_vitrine?.price || "89"))}€/mois</p>
                      <ul className="space-y-2 text-sm text-muted-foreground mb-6 flex-1">
                        <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" />Hébergement inclus</li>
                        <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" />Support & Maintenance 7/7j</li>
                        <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" />Support prioritaire</li>
                        <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" />Tarif préférentiel</li>
                      </ul>
                      <Button 
                        className="w-full mt-auto" 
                        onClick={() => {
                          setSelectedOffer("pack_vitrine");
                          setShowSubscriptionDialog(true);
                        }}
                        data-testid="button-select-pack-vitrine"
                      >
                        Souscrire
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="border-t pt-8" />

              {/* Application Web Entreprise Category */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10">
                    <Building2 className="h-4 w-4 text-purple-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Application Web Entreprise</h3>
                    <p className="text-sm text-muted-foreground">Offres haute performance pour votre application web sur mesure</p>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <Card className="flex flex-col">
                    <CardHeader>
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 mb-2">
                        <Server className="h-5 w-5 text-purple-500" />
                      </div>
                      <CardTitle className="text-lg">{subscriptionOffers?.hosting_enterprise?.name || "Hébergement Application Web"}</CardTitle>
                      <CardDescription>{subscriptionOffers?.hosting_enterprise?.description || "Hébergement haute performance pour votre application"}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col flex-1">
                      <div className="text-3xl font-bold mb-4">{subscriptionOffers?.hosting_enterprise?.price || "79"}€<span className="text-lg font-normal text-muted-foreground">/mois</span></div>
                      <ul className="space-y-2 text-sm text-muted-foreground mb-6 flex-1">
                        <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" />Hébergement haute performance</li>
                        <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" />Certificat SSL inclus</li>
                        <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" />Sauvegardes quotidiennes</li>
                        <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" />Protection DDoS avancée</li>
                      </ul>
                      <Button 
                        className="w-full mt-auto" 
                        onClick={() => {
                          setSelectedOffer("hosting_enterprise");
                          setShowSubscriptionDialog(true);
                        }}
                        data-testid="button-select-hosting-enterprise"
                      >
                        Souscrire
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="flex flex-col">
                    <CardHeader>
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 mb-2">
                        <Zap className="h-5 w-5 text-purple-500" />
                      </div>
                      <CardTitle className="text-lg">{subscriptionOffers?.maintenance_enterprise?.name || "Support & Maintenance 7/7j"}</CardTitle>
                      <CardDescription>{subscriptionOffers?.maintenance_enterprise?.description || "Support technique 7j/7 pour votre application"}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col flex-1">
                      <div className="text-3xl font-bold mb-4">{subscriptionOffers?.maintenance_enterprise?.price || "129"}€<span className="text-lg font-normal text-muted-foreground">/mois</span></div>
                      <ul className="space-y-2 text-sm text-muted-foreground mb-6 flex-1">
                        <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" />Mises à jour de sécurité</li>
                        <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" />Correction de bugs</li>
                        <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" />Support technique 7j/7</li>
                        <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" />Monitoring continu</li>
                      </ul>
                      <Button 
                        className="w-full mt-auto" 
                        onClick={() => {
                          setSelectedOffer("maintenance_enterprise");
                          setShowSubscriptionDialog(true);
                        }}
                        data-testid="button-select-maintenance-enterprise"
                      >
                        Souscrire
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="relative border-purple-500/50 flex flex-col">
                    <div className="absolute top-0 right-0 bg-purple-500 text-white text-xs px-3 py-1 rounded-bl-lg font-medium">
                      Recommandé
                    </div>
                    <CardHeader>
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 mb-2">
                        <Package className="h-5 w-5 text-purple-500" />
                      </div>
                      <CardTitle className="text-lg">{subscriptionOffers?.pack_enterprise?.name || "Pack Application Web"}</CardTitle>
                      <CardDescription>{subscriptionOffers?.pack_enterprise?.description || "Hébergement + Support & Maintenance 7/7j"}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col flex-1">
                      <div className="text-3xl font-bold mb-1">{subscriptionOffers?.pack_enterprise?.price || "179"}€<span className="text-lg font-normal text-muted-foreground">/mois</span></div>
                      <p className="text-sm text-green-600 mb-4">Économisez {Math.round((parseFloat(subscriptionOffers?.hosting_enterprise?.price || "79") + parseFloat(subscriptionOffers?.maintenance_enterprise?.price || "129")) - parseFloat(subscriptionOffers?.pack_enterprise?.price || "179"))}€/mois</p>
                      <ul className="space-y-2 text-sm text-muted-foreground mb-6 flex-1">
                        <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" />Hébergement haute performance</li>
                        <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" />Support & Maintenance 7/7j</li>
                        <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" />Support prioritaire</li>
                        <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" />Tarif préférentiel</li>
                      </ul>
                      <Button 
                        className="w-full mt-auto" 
                        onClick={() => {
                          setSelectedOffer("pack_enterprise");
                          setShowSubscriptionDialog(true);
                        }}
                        data-testid="button-select-pack-enterprise"
                      >
                        Souscrire
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {/* Subscription Dialog */}
          <Dialog open={showSubscriptionDialog} onOpenChange={setShowSubscriptionDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Choisir un projet</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Sélectionnez le projet auquel vous souhaitez associer cet abonnement :
                </p>
                {(() => {
                const isVitrineOffer = selectedOffer?.includes("vitrine");
                const requiredProjectType = isVitrineOffer ? "site_vitrine" : "app_enterprise";
                const compatibleProjects = projects?.filter(
                  (p) => (p as any).projectType === requiredProjectType
                ) || [];
                return compatibleProjects.length > 0 ? (
                  <>
                    <p className="text-xs text-muted-foreground">
                      Seuls les projets de type <strong>{isVitrineOffer ? "Site Vitrine" : "Application Web Entreprise"}</strong> sont affichés.
                    </p>
                    <Select value={selectedProjectForSubscription} onValueChange={setSelectedProjectForSubscription}>
                      <SelectTrigger data-testid="select-project-for-subscription">
                        <SelectValue placeholder="Sélectionnez un projet" />
                      </SelectTrigger>
                      <SelectContent>
                        {compatibleProjects.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setShowSubscriptionDialog(false);
                          setSelectedOffer(null);
                          setSelectedProjectForSubscription("");
                        }}
                      >
                        Annuler
                      </Button>
                      <Button
                        onClick={() => {
                          if (selectedOffer && selectedProjectForSubscription) {
                            createSubscriptionMutation.mutate({
                              projectId: selectedProjectForSubscription,
                              offerType: selectedOffer,
                            });
                          }
                        }}
                        disabled={!selectedProjectForSubscription || createSubscriptionMutation.isPending}
                        data-testid="button-confirm-subscription"
                      >
                        {createSubscriptionMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <CreditCard className="h-4 w-4 mr-2" />
                        )}
                        Payer et s'abonner
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground mb-4">
                      {projects && projects.length > 0 
                        ? `Vous n'avez aucun projet de type "${isVitrineOffer ? "Site Vitrine" : "Application Web Entreprise"}" compatible avec cette offre.`
                        : "Vous n'avez pas encore de projets."
                      }
                    </p>
                    <Button 
                      onClick={() => {
                        setShowSubscriptionDialog(false);
                        setActiveSection("projects");
                        setShowProjectForm(true);
                      }}
                    >
                      Créer un projet
                    </Button>
                  </div>
                );
              })()}
              </div>
            </DialogContent>
          </Dialog>

          {/* Subscription Settings Section (Admin only) */}
          {activeSection === "subscription_settings" && user.role === "admin" && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Settings className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Gérer les abonnements</CardTitle>
                    <CardDescription>Modifier les prix et synchroniser avec Stripe</CardDescription>
                  </div>
                </div>
                <Button
                  onClick={() => syncStripeMutation.mutate()}
                  disabled={syncStripeMutation.isPending}
                  data-testid="button-sync-stripe"
                >
                  {syncStripeMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <CreditCard className="h-4 w-4 mr-2" />
                  )}
                  Synchroniser avec Stripe
                </Button>
              </CardHeader>
              <CardContent>
                {subscriptionOffersList ? (
                  <div className="space-y-4">
                    {subscriptionOffersList.map(offer => {
                      const isPack = offer.id.startsWith("pack_");
                      const category = offer.id.replace("pack_", "").replace("hosting_", "").replace("maintenance_", "");
                      const hostingOffer = subscriptionOffersList.find(o => o.id === `hosting_${category}`);
                      const maintenanceOffer = subscriptionOffersList.find(o => o.id === `maintenance_${category}`);
                      const currentDiscount = editingDiscountPercent[offer.id] ?? offer.discountPercent ?? "0";
                      const baseTotal = hostingOffer && maintenanceOffer ? parseFloat(hostingOffer.price) + parseFloat(maintenanceOffer.price) : 0;
                      const calculatedPackPrice = isPack ? (baseTotal * (1 - parseFloat(currentDiscount) / 100)).toFixed(2).replace(/\.00$/, "") : "";

                      return (
                        <div key={offer.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                              offer.id.includes("vitrine") ? "bg-blue-500/10" : "bg-purple-500/10"
                            }`}>
                              {offer.id.includes("hosting") && <Server className={`h-5 w-5 ${offer.id.includes("vitrine") ? "text-blue-500" : "text-purple-500"}`} />}
                              {offer.id.includes("maintenance") && <Zap className={`h-5 w-5 ${offer.id.includes("vitrine") ? "text-blue-500" : "text-purple-500"}`} />}
                              {offer.id.includes("pack") && <Package className={`h-5 w-5 ${offer.id.includes("vitrine") ? "text-blue-500" : "text-purple-500"}`} />}
                            </div>
                            <div>
                              <p className="font-medium">{offer.name}</p>
                              <p className="text-sm text-muted-foreground">{offer.description}</p>
                              {isPack && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  Base : {hostingOffer?.price || "?"}€ + {maintenanceOffer?.price || "?"}€ = {baseTotal}€
                                  {" → "}<span className="font-medium text-green-600">{calculatedPackPrice}€/mois</span>
                                </p>
                              )}
                              {offer.stripeProductId && (
                                <Badge variant="outline" className="mt-1 text-xs bg-green-500/10 text-green-600 border-green-500/20">
                                  Synchro Stripe
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {isPack ? (
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  step="1"
                                  min="0"
                                  max="100"
                                  className="w-20 text-right"
                                  value={currentDiscount}
                                  onChange={(e) => setEditingDiscountPercent(prev => ({ ...prev, [offer.id]: e.target.value }))}
                                  data-testid={`input-discount-${offer.id}`}
                                />
                                <span className="text-muted-foreground">%</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  step="0.01"
                                  className="w-24 text-right"
                                  value={editingOfferPrices[offer.id] ?? offer.price}
                                  onChange={(e) => setEditingOfferPrices(prev => ({ ...prev, [offer.id]: e.target.value }))}
                                  data-testid={`input-price-${offer.id}`}
                                />
                                <span className="text-muted-foreground">€/mois</span>
                              </div>
                            )}
                            <Button
                              size="sm"
                              onClick={() => {
                                if (isPack) {
                                  updateOfferPriceMutation.mutate({ id: offer.id, discountPercent: currentDiscount });
                                } else {
                                  const newPrice = editingOfferPrices[offer.id] ?? offer.price;
                                  updateOfferPriceMutation.mutate({ id: offer.id, price: newPrice });
                                }
                              }}
                              disabled={updateOfferPriceMutation.isPending || (isPack ? (editingDiscountPercent[offer.id] ?? offer.discountPercent ?? "0") === (offer.discountPercent ?? "0") : (editingOfferPrices[offer.id] ?? offer.price) === offer.price)}
                              data-testid={`button-save-price-${offer.id}`}
                            >
                              {updateOfferPriceMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Save className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => setDeleteConfirm({ type: "offer", id: offer.id, title: offer.name })}
                              data-testid={`button-delete-offer-${offer.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                )}
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
                          <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
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
                            <td className="py-3 px-4 text-right">
                              {u.role !== "admin" && (
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="text-destructive"
                                  data-testid={`button-delete-user-${u.id}`}
                                  onClick={() => setDeleteUserId(u.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
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

          {/* Security Logs Section (Admin only) */}
          {activeSection === "analytics" && user.role === "admin" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <BarChart3 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Analytics</h2>
                    <p className="text-sm text-muted-foreground">Statistiques de fréquentation de votre site</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Select value={String(analyticsDays)} onValueChange={(v) => setAnalyticsDays(Number(v))}>
                    <SelectTrigger className="w-[160px]" data-testid="select-analytics-period">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 derniers jours</SelectItem>
                      <SelectItem value="30">30 derniers jours</SelectItem>
                      <SelectItem value="90">90 derniers jours</SelectItem>
                      <SelectItem value="365">12 derniers mois</SelectItem>
                    </SelectContent>
                  </Select>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="default" data-testid="button-clear-analytics">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Réinitialiser
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Réinitialiser les données de visite</AlertDialogTitle>
                        <AlertDialogDescription>
                          Cette action supprimera toutes les données de visites (graphiques de connexion, sources de trafic, pages visitées). Cette action est irréversible.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                          data-testid="button-confirm-clear-analytics"
                          onClick={async () => {
                            try {
                              await apiRequest("DELETE", "/api/analytics/visits");
                              queryClient.invalidateQueries({ queryKey: ["/api/analytics/stats"] });
                              queryClient.invalidateQueries({ queryKey: ["/api/analytics/revenue"] });
                              queryClient.invalidateQueries({ queryKey: ["/api/analytics/project-status"] });
                              toast({ title: "Données de visites réinitialisées" });
                            } catch {
                              toast({ title: "Erreur lors de la réinitialisation", variant: "destructive" });
                            }
                          }}
                        >
                          Confirmer
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>

              {analyticsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : analyticsData ? (
                <>
                  <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Visites totales</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold" data-testid="stat-total-visits">{analyticsData.totalVisits}</div>
                        <p className="text-xs text-muted-foreground">sur {analyticsDays} jour(s)</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Moyenne/jour</CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold" data-testid="stat-avg-visits">
                          {analyticsDays > 0 ? (analyticsData.totalVisits / analyticsDays).toFixed(1) : 0}
                        </div>
                        <p className="text-xs text-muted-foreground">visites par jour</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Sources de trafic</CardTitle>
                        <Globe className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold" data-testid="stat-sources-count">{analyticsData.trafficSources.length}</div>
                        <p className="text-xs text-muted-foreground">sources différentes</p>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Visites par jour</CardTitle>
                      <CardDescription>Nombre de visites quotidiennes sur votre site</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {analyticsData.visitsPerDay.length > 0 ? (
                        <div className="h-[300px]" data-testid="chart-visits-per-day">
                          <AnalyticsLineChart data={analyticsData.visitsPerDay} />
                        </div>
                      ) : (
                        <p className="text-center text-muted-foreground py-8">Aucune donnée pour cette période</p>
                      )}
                    </CardContent>
                  </Card>

                  <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Sources de trafic</CardTitle>
                        <CardDescription>D'o&ugrave; viennent vos visiteurs</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {analyticsData.trafficSources.length > 0 ? (
                          <div className="space-y-3" data-testid="list-traffic-sources">
                            {analyticsData.trafficSources.map((s, i) => {
                              const maxCount = analyticsData.trafficSources[0]?.count || 1;
                              const percentage = analyticsData.totalVisits > 0 ? ((s.count / analyticsData.totalVisits) * 100).toFixed(1) : "0";
                              const isSearchEngine = ["Google", "Bing", "Yahoo", "DuckDuckGo"].includes(s.source);
                              return (
                                <div key={i} className="space-y-1">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm flex items-center gap-2">
                                      {isSearchEngine && <Globe className="h-3 w-3 text-primary" />}
                                      {s.source}
                                    </span>
                                    <span className="text-sm text-muted-foreground">{s.count} ({percentage}%)</span>
                                  </div>
                                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                                    <div
                                      className={`h-full rounded-full ${isSearchEngine ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                                      style={{ width: `${(s.count / maxCount) * 100}%` }}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-center text-muted-foreground py-4">Aucune source de trafic</p>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Pages les plus visitées</CardTitle>
                        <CardDescription>Top 10 des pages par nombre de visites</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {analyticsData.topPages.length > 0 ? (
                          <div className="space-y-3" data-testid="list-top-pages">
                            {analyticsData.topPages.map((p, i) => {
                              const maxCount = analyticsData.topPages[0]?.count || 1;
                              const pageName = p.path === "/" ? "Accueil" : p.path === "/login" ? "Connexion" : p.path === "/register" ? "Inscription" : p.path === "/dashboard" ? "Dashboard" : p.path;
                              return (
                                <div key={i} className="space-y-1">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-mono text-xs">{pageName}</span>
                                    <span className="text-sm text-muted-foreground">{p.count}</span>
                                  </div>
                                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                                    <div
                                      className="h-full rounded-full bg-primary/60"
                                      style={{ width: `${(p.count / maxCount) * 100}%` }}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-center text-muted-foreground py-4">Aucune page visitée</p>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Revenue Charts */}
                  {(() => {
                    const statusLabels: Record<string, string> = {
                      pending: 'Déposé',
                      in_review: 'Étude',
                      awaiting_signature: 'Signature',
                      awaiting_deposit: 'Acompte',
                      approved: 'Validé',
                      in_progress: 'En cours',
                      in_progress_1: 'Phase 1',
                      in_progress_2: 'Phase 2',
                      awaiting_final_payment: 'Règlement',
                      completed: 'Terminé',
                      cancelled: 'Annulé',
                    };
                    const statusColors: Record<string, string> = {
                      pending: 'hsl(220, 13%, 60%)',
                      in_review: 'hsl(45, 93%, 47%)',
                      awaiting_signature: 'hsl(25, 95%, 53%)',
                      awaiting_deposit: 'hsl(280, 65%, 60%)',
                      approved: 'hsl(142, 71%, 45%)',
                      in_progress: 'hsl(200, 95%, 50%)',
                      in_progress_1: 'hsl(200, 80%, 55%)',
                      in_progress_2: 'hsl(200, 65%, 60%)',
                      awaiting_final_payment: 'hsl(38, 92%, 50%)',
                      completed: 'hsl(142, 76%, 36%)',
                      cancelled: 'hsl(0, 84%, 60%)',
                    };

                    const formatMonth = (m: string) => {
                      const [year, month] = m.split('-');
                      const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
                      return `${months[parseInt(month) - 1]} ${year.slice(2)}`;
                    };

                    const tooltipStyle = {
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                      color: "hsl(var(--foreground))",
                    };

                    return (
                      <>
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base">Chiffre d'affaires total</CardTitle>
                            <CardDescription>Évolution mensuelle (factures + abonnements)</CardDescription>
                          </CardHeader>
                          <CardContent>
                            {revenueData && revenueData.length > 0 ? (
                              <div className="h-[300px]" data-testid="chart-revenue-total">
                                <ResponsiveContainer width="100%" height="100%">
                                  <AreaChart data={revenueData.map(d => ({ ...d, month: formatMonth(d.month) }))}>
                                    <defs>
                                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0} />
                                      </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                    <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `${v}€`} />
                                    <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`${value.toFixed(2)} €`, undefined]} />
                                    <Area type="monotone" dataKey="total" name="Total" stroke="hsl(142, 71%, 45%)" fillOpacity={1} fill="url(#colorTotal)" strokeWidth={2} />
                                  </AreaChart>
                                </ResponsiveContainer>
                              </div>
                            ) : (
                              <p className="text-center text-muted-foreground py-8">Aucune donnée de chiffre d'affaires</p>
                            )}
                          </CardContent>
                        </Card>

                        <div className="grid gap-6 md:grid-cols-2">
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-base">Factures projets</CardTitle>
                              <CardDescription>Revenus mensuels des factures</CardDescription>
                            </CardHeader>
                            <CardContent>
                              {revenueData && revenueData.length > 0 ? (
                                <div className="h-[250px]" data-testid="chart-revenue-invoices">
                                  <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={revenueData.map(d => ({ ...d, month: formatMonth(d.month) }))}>
                                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                      <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                                      <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `${v}€`} />
                                      <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`${value.toFixed(2)} €`, undefined]} />
                                      <Bar dataKey="invoices" name="Factures" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                  </ResponsiveContainer>
                                </div>
                              ) : (
                                <p className="text-center text-muted-foreground py-6">Aucune facture</p>
                              )}
                            </CardContent>
                          </Card>

                          <Card>
                            <CardHeader>
                              <CardTitle className="text-base">Abonnements</CardTitle>
                              <CardDescription>Revenus mensuels récurrents</CardDescription>
                            </CardHeader>
                            <CardContent>
                              {revenueData && revenueData.length > 0 ? (
                                <div className="h-[250px]" data-testid="chart-revenue-subscriptions">
                                  <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={revenueData.map(d => ({ ...d, month: formatMonth(d.month) }))}>
                                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                      <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                                      <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `${v}€`} />
                                      <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`${value.toFixed(2)} €`, undefined]} />
                                      <Bar dataKey="subscriptions" name="Abonnements" fill="hsl(280, 65%, 60%)" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                  </ResponsiveContainer>
                                </div>
                              ) : (
                                <p className="text-center text-muted-foreground py-6">Aucun abonnement</p>
                              )}
                            </CardContent>
                          </Card>
                        </div>

                        {/* Project Status Distribution */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base">Suivi des projets</CardTitle>
                            <CardDescription>Répartition des projets par statut</CardDescription>
                          </CardHeader>
                          <CardContent>
                            {projectStatusData && projectStatusData.length > 0 ? (
                              <div className="grid gap-6 md:grid-cols-2 items-center">
                                <div className="h-[280px]" data-testid="chart-project-status">
                                  <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                      <Pie
                                        data={projectStatusData.map(d => ({ ...d, name: statusLabels[d.status] || d.status }))}
                                        dataKey="count"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={100}
                                        innerRadius={50}
                                        paddingAngle={2}
                                        label={({ name, count }) => `${name} (${count})`}
                                      >
                                        {projectStatusData.map((d, index) => (
                                          <Cell key={index} fill={statusColors[d.status] || 'hsl(var(--muted-foreground))'} />
                                        ))}
                                      </Pie>
                                      <Tooltip contentStyle={tooltipStyle} />
                                    </PieChart>
                                  </ResponsiveContainer>
                                </div>
                                <div className="space-y-2" data-testid="list-project-status">
                                  {projectStatusData.map((d, i) => (
                                    <div key={i} className="flex items-center justify-between py-1.5 px-3 rounded-md bg-muted/30">
                                      <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: statusColors[d.status] || 'hsl(var(--muted-foreground))' }} />
                                        <span className="text-sm">{statusLabels[d.status] || d.status}</span>
                                      </div>
                                      <span className="text-sm font-medium">{d.count}</span>
                                    </div>
                                  ))}
                                  <div className="flex items-center justify-between py-1.5 px-3 rounded-md bg-muted/50 border-t mt-2">
                                    <span className="text-sm font-medium">Total</span>
                                    <span className="text-sm font-bold">{projectStatusData.reduce((acc, d) => acc + d.count, 0)}</span>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <p className="text-center text-muted-foreground py-8">Aucun projet</p>
                            )}
                          </CardContent>
                        </Card>
                      </>
                    );
                  })()}
                </>
              ) : (
                <p className="text-center text-muted-foreground py-8">Aucune donnée analytics disponible</p>
              )}
            </div>
          )}

          {activeSection === "logs" && user.role === "admin" && (() => {
            const logCategories = [
              { key: "all", label: "Tout" },
              { key: "auth", label: "Authentification", types: ["login_success", "login_failed", "register", "rate_limit_exceeded"] },
              { key: "users", label: "Utilisateurs", types: ["user_deleted", "password_reset_request", "password_changed"] },
              { key: "projects", label: "Projets", types: ["project_created", "project_status_changed", "project_deleted"] },
              { key: "features", label: "Fonctionnalités", types: ["feature_created", "feature_status_changed", "feature_deleted"] },
              { key: "documents", label: "Documents", types: ["document_created", "document_sent", "document_signed", "document_signed_electronic", "document_deleted"] },
              { key: "payments", label: "Paiements", types: ["payment_deposit_initiated", "payment_final_initiated"] },
              { key: "subscriptions", label: "Abonnements", types: ["subscription_cancelled", "subscription_reactivated", "subscription_deleted"] },
            ];
            const logTypeLabels: Record<string, string> = {
              login_success: 'Connexion',
              login_failed: 'Échec connexion',
              register: 'Inscription',
              password_reset_request: 'Demande MDP',
              password_changed: 'MDP modifié',
              rate_limit_exceeded: 'Rate limit',
              user_deleted: 'Utilisateur supprimé',
              project_created: 'Projet créé',
              project_status_changed: 'Statut projet',
              project_deleted: 'Projet supprimé',
              feature_created: 'Fonctionnalité créée',
              feature_status_changed: 'Statut fonctionnalité',
              feature_deleted: 'Fonctionnalité supprimée',
              document_created: 'Document créé',
              document_sent: 'Devis envoyé',
              document_signed: 'Document signé',
              document_signed_electronic: 'Signature électronique',
              document_deleted: 'Document supprimé',
              payment_deposit_initiated: 'Paiement acompte',
              payment_final_initiated: 'Paiement final',
              subscription_cancelled: 'Abonnement résilié',
              subscription_reactivated: 'Abonnement réactivé',
              subscription_deleted: 'Abonnement supprimé',
            };
            const activeCategory = logCategories.find(c => c.key === logFilter);
            const filteredLogs = securityLogs?.filter(log => {
              if (logFilter === "all") return true;
              return activeCategory?.types?.includes(log.type);
            }) || [];
            const getCategoryCount = (cat: typeof logCategories[0]) => {
              if (cat.key === "all") return securityLogs?.length || 0;
              return securityLogs?.filter(log => cat.types?.includes(log.type)).length || 0;
            };

            return (
              <Card>
                <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Logs</CardTitle>
                    <CardDescription>Historique de toutes les activités</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4" data-testid="log-category-filters">
                    {logCategories.map(cat => (
                      <Button
                        key={cat.key}
                        variant={logFilter === cat.key ? "default" : "outline"}
                        size="sm"
                        onClick={() => setLogFilter(cat.key)}
                        data-testid={`button-log-filter-${cat.key}`}
                      >
                        {cat.label}
                        <span className="ml-1.5 text-xs opacity-70">({getCategoryCount(cat)})</span>
                      </Button>
                    ))}
                  </div>
                  {securityLogsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : filteredLogs.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Type</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Email</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">IP</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Détails</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredLogs.map((log) => (
                            <tr key={log.id} className="border-b last:border-0" data-testid={`row-log-${log.id}`}>
                              <td className="py-3 px-4">
                                <span className="text-sm">
                                  {new Date(log.createdAt).toLocaleString('fr-FR')}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <Badge variant={
                                  ['login_failed', 'rate_limit_exceeded', 'user_deleted', 'project_deleted', 'feature_deleted', 'document_deleted', 'subscription_deleted', 'subscription_cancelled'].includes(log.type) ? 'destructive' :
                                  ['login_success', 'document_signed', 'document_signed_electronic', 'payment_deposit_initiated', 'payment_final_initiated'].includes(log.type) ? 'default' :
                                  ['register', 'project_created', 'feature_created', 'document_created'].includes(log.type) ? 'secondary' :
                                  'outline'
                                }>
                                  {logTypeLabels[log.type] || log.type}
                                </Badge>
                              </td>
                              <td className="py-3 px-4">
                                <span className="text-sm">{log.email || '-'}</span>
                              </td>
                              <td className="py-3 px-4">
                                <span className="text-sm font-mono text-xs">{log.ipAddress || '-'}</span>
                              </td>
                              <td className="py-3 px-4">
                                <span className="text-sm text-muted-foreground">{log.details || '-'}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      Aucun log dans cette catégorie
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })()}

        </main>
      </div>

      {/* Client Electronic Signature Dialog */}
      <Dialog open={!!signDocumentId} onOpenChange={(open) => {
        if (!open) {
          setSignDocumentId(null);
          setClientSignature(null);
          setBonPourAccord(false);
        }
      }}>
        <DialogContent className="max-w-md" data-testid="dialog-sign-electronic">
          <DialogHeader>
            <DialogTitle className="text-primary">Signature électronique</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Dessinez votre signature ci-dessous pour signer le devis électroniquement.
            </p>
            <SignaturePad
              existingSignature={null}
              onSave={(signature) => setClientSignature(signature)}
              isPending={false}
              saveButtonText="Valider ma signature"
            />
            {clientSignature && (
              <div className="space-y-4 pt-4 border-t">
                <label className="flex items-start gap-3 cursor-pointer" data-testid="label-bon-pour-accord">
                  <input
                    type="checkbox"
                    checked={bonPourAccord}
                    onChange={(e) => setBonPourAccord(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-border"
                    data-testid="checkbox-bon-pour-accord"
                  />
                  <span className="text-sm">
                    J'ajoute la mention <strong>&laquo; Bon pour accord &raquo;</strong> et je confirme accepter les termes de ce devis.
                  </span>
                </label>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => { setClientSignature(null); setBonPourAccord(false); }}
                    data-testid="button-reset-signature"
                  >
                    Recommencer
                  </Button>
                  <Button
                    onClick={() => {
                      if (signDocumentId && clientSignature) {
                        signElectronicMutation.mutate({ documentId: signDocumentId, signature: clientSignature });
                      }
                    }}
                    disabled={signElectronicMutation.isPending || !bonPourAccord}
                    data-testid="button-confirm-signature"
                  >
                    {signElectronicMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Check className="h-4 w-4 mr-2" />
                    )}
                    Confirmer la signature
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteConfirm?.type === "feature" 
                ? `Êtes-vous sûr de vouloir supprimer la fonctionnalité "${deleteConfirm?.title}" ? Cette action est irréversible.`
                : deleteConfirm?.type === "offer"
                ? `Êtes-vous sûr de vouloir supprimer l'offre "${deleteConfirm?.title}" ? Cette action est irréversible.`
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
                  } else if (deleteConfirm.type === "document") {
                    deleteDocumentMutation.mutate(deleteConfirm.id);
                  } else if (deleteConfirm.type === "project") {
                    deleteProjectMutation.mutate(deleteConfirm.id);
                  } else if (deleteConfirm.type === "offer") {
                    deleteOfferMutation.mutate(deleteConfirm.id);
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

      <AlertDialog open={!!deleteUserId} onOpenChange={(open) => { if (!open) setDeleteUserId(null); }}>
        <AlertDialogContent data-testid="dialog-delete-user">
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cet utilisateur ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Tous les projets, fonctionnalités, documents et abonnements de cet utilisateur seront définitivement supprimés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete-user">Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete-user"
              onClick={() => {
                if (deleteUserId) {
                  deleteUserMutation.mutate(deleteUserId);
                  setDeleteUserId(null);
                }
              }}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
