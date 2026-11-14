import React, { useEffect, useState } from "react";
import { ChevronDown, ChevronRight, Compass, Layers3, MonitorCog } from "lucide-react";
import { adminWorkspaces, getAdminWorkspace } from "@shared/adminWorkspaces";
import type { DashboardSection } from "@shared/adminWorkspaces";

type AdminWorkspaceNavigationProps = {
  activeSection: DashboardSection;
  collapsed: boolean;
  onNavigate: (section: DashboardSection) => void;
};

const workspaceIcons = {
  studio: Compass,
  dev: Layers3,
  prod: MonitorCog,
};

export default function AdminWorkspaceNavigation({
  activeSection,
  collapsed,
  onNavigate,
}: AdminWorkspaceNavigationProps) {
  const activeWorkspace = getAdminWorkspace(activeSection);
  const [openWorkspace, setOpenWorkspace] = useState<string>(activeWorkspace?.id ?? "studio");

  useEffect(() => {
    if (activeWorkspace) setOpenWorkspace(activeWorkspace.id);
  }, [activeWorkspace?.id]);

  return (
    <nav aria-label="Espaces d’administration" className="space-y-2">
      {adminWorkspaces.map((workspace) => {
        const Icon = workspaceIcons[workspace.id];
        const isCurrent = activeWorkspace?.id === workspace.id;
        const isOpen = !collapsed && openWorkspace === workspace.id;
        const submenuId = `workspace-menu-${workspace.id}`;

        return (
          <section key={workspace.id} className="min-w-0">
            <button
              type="button"
              data-testid={`workspace-${workspace.id}`}
              title={collapsed ? workspace.label : undefined}
              aria-label={collapsed ? `${workspace.label} — ouvrir ${workspace.sections[0]?.label}` : undefined}
              aria-expanded={collapsed ? undefined : isOpen}
              aria-controls={collapsed ? undefined : submenuId}
              onClick={() => {
                if (collapsed) {
                  onNavigate(workspace.sections[0].id);
                  return;
                }
                setOpenWorkspace((current) => current === workspace.id ? "" : workspace.id);
                if (!isCurrent) onNavigate(workspace.sections[0].id);
              }}
              className={`group flex min-h-10 w-full items-center gap-3 rounded-md px-3 text-left text-sm transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                isCurrent
                  ? "bg-primary/10 text-primary"
                  : "text-foreground/75 hover:bg-accent hover:text-foreground"
              } ${collapsed ? "justify-center px-2" : ""}`}
            >
              <Icon aria-hidden="true" className="h-[18px] w-[18px] shrink-0" />
              {!collapsed && (
                <>
                  <span className="min-w-0 flex-1 truncate font-medium">{workspace.label}</span>
                  {isOpen ? (
                    <ChevronDown aria-hidden="true" className="h-4 w-4 shrink-0 text-muted-foreground" />
                  ) : (
                    <ChevronRight aria-hidden="true" className="h-4 w-4 shrink-0 text-muted-foreground" />
                  )}
                </>
              )}
            </button>

            {!collapsed && (
              <div id={submenuId} hidden={!isOpen} className="ml-[21px] mt-1 space-y-1 border-l border-border/70 pl-3">
                {workspace.sections.map((section) => {
                  const isActive = section.id === activeSection;
                  return (
                    <button
                      key={section.id}
                      type="button"
                      data-testid={`menu-${section.id}`}
                      aria-current={isActive ? "page" : undefined}
                      onClick={() => onNavigate(section.id)}
                      className={`flex min-h-9 w-full items-center rounded-md px-2.5 text-left text-[13px] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                        isActive
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground"
                      }`}
                    >
                      <span className="truncate">{section.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        );
      })}
    </nav>
  );
}
