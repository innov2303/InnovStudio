export type DashboardSection =
  | "dashboard" | "profile" | "projects" | "documents" | "services"
  | "subscription_settings" | "users" | "references" | "logs" | "analytics" | "seo"
  | "innov_dev" | "innov_dev_modules" | "innov_prod";

export type AdminWorkspaceId = "studio" | "dev" | "prod";

export type AdminWorkspace = {
  id: AdminWorkspaceId;
  label: string;
  description: string;
  sections: { id: DashboardSection; label: string }[];
};

export const adminWorkspaces: AdminWorkspace[] = [
  {
    id: "studio",
    label: "Innov Studio",
    description: "Gestion de votre activité",
    sections: [
      { id: "dashboard", label: "Tableau de bord" },
      { id: "profile", label: "Mon profil" },
      { id: "projects", label: "Gestion des projets" },
      { id: "documents", label: "Abonnements" },
      { id: "subscription_settings", label: "Gérer les abonnements" },
      { id: "users", label: "Utilisateurs" },
      { id: "references", label: "Références" },
      { id: "seo", label: "Agent SEO" },
      { id: "logs", label: "Logs" },
      { id: "analytics", label: "Analytics" },
    ],
  },
  {
    id: "dev",
    label: "Innov Studio Dev",
    description: "Création de sites clients",
    sections: [
      { id: "innov_dev", label: "Création de sites" },
      { id: "innov_dev_modules", label: "Modules et addons" },
    ],
  },
  {
    id: "prod",
    label: "Innov Studio Prod",
    description: "Suivi des sites clients",
    sections: [{ id: "innov_prod", label: "Sites clients" }],
  },
];

export function getAdminWorkspace(section: DashboardSection): AdminWorkspace | undefined {
  return adminWorkspaces.find((workspace) => workspace.sections.some((item) => item.id === section));
}

export function resolveDashboardSection(value: string | null, isAdmin: boolean): DashboardSection {
  const allowed = isAdmin
    ? adminWorkspaces.flatMap((workspace) => workspace.sections.map((item) => item.id))
    : ["dashboard", "profile", "projects", "documents", "services"];
  return value && allowed.includes(value as DashboardSection) ? value as DashboardSection : "dashboard";
}
