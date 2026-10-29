import { useEffect, useRef, useState } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth";
import Home from "@/pages/home";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Dashboard from "@/pages/dashboard";
import ChangePassword from "@/pages/change-password";
import VerifyEmail from "@/pages/verify-email";
import ForgotPassword from "@/pages/forgot-password";
import ResetPassword from "@/pages/reset-password";
import ConfirmEmailChange from "@/pages/confirm-email-change";
import NotFound from "@/pages/not-found";

const publicPagePaths = new Set([
  "/site-evolutif",
  "/application-web-entreprise",
  "/creation-site-web",
  "/references",
]);

function PublicSeoPage() {
  const [location] = useLocation();
  const bootstrap = (window as any).__PUBLIC_PAGE_BOOTSTRAP__ as
    | { path: string; html: string; bodyClass: string }
    | undefined;
  const [pageHtml, setPageHtml] = useState(
    bootstrap?.path === location ? bootstrap.html : "",
  );

  useEffect(() => {
    let isCurrent = true;

    if (bootstrap?.path === location) {
      document.body.className = bootstrap.bodyClass;
      (window as any).__PUBLIC_PAGE_BOOTSTRAP__ = undefined;
      return;
    }

    setPageHtml("");
    fetch(location, { headers: { Accept: "text/html" } })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Page indisponible (${response.status})`);
        return new DOMParser().parseFromString(await response.text(), "text/html");
      })
      .then((page) => {
        if (!isCurrent) return;
        const root = page.querySelector("#root");
        if (!root) throw new Error("Contenu de page introuvable");

        const nextPageStyles = page.querySelector("#public-seo-page-styles");
        if (nextPageStyles) {
          let activePageStyles = document.getElementById("public-seo-page-styles");
          if (!activePageStyles) {
            activePageStyles = document.createElement("style");
            activePageStyles.id = "public-seo-page-styles";
            document.head.append(activePageStyles);
          }
          activePageStyles.textContent = nextPageStyles.textContent;
        }

        document.title = page.title;
        document.body.className = page.body.className;
        const description = page.querySelector('meta[name="description"]')?.getAttribute("content");
        if (description) {
          document.querySelector('meta[name="description"]')?.setAttribute("content", description);
        }
        const canonical = page.querySelector('link[rel="canonical"]')?.getAttribute("href");
        if (canonical) {
          document.querySelector('link[rel="canonical"]')?.setAttribute("href", canonical);
        }

        setPageHtml(root.innerHTML);
        window.scrollTo({ top: 0, behavior: "auto" });
      })
      .catch((error) => {
        if (isCurrent) {
          console.error("Navigation publique impossible:", error);
          window.location.assign(location);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [location]);

  useEffect(() => {
    const browser = document.querySelector("[data-reference-browser]");
    const tabList = browser?.querySelector("[data-reference-tabs]");
    const tabs = Array.from(browser?.querySelectorAll<HTMLElement>("[data-reference-tab]") ?? []);
    const sections = Array.from(browser?.querySelectorAll<HTMLElement>("[data-reference-category]") ?? []);
    if (!browser || !tabList || tabs.length === 0 || sections.length === 0) return;

    const setCategory = (category: string) => {
      tabs.forEach((tab) => {
        tab.setAttribute("aria-pressed", String(tab.dataset.referenceTab === category));
      });
      sections.forEach((section) => {
        section.hidden = category !== "all" && section.dataset.referenceCategory !== category;
      });
    };
    const listeners = tabs.map((tab) => {
      const listener = () => setCategory(tab.dataset.referenceTab || "all");
      tab.addEventListener("click", listener);
      return { tab, listener };
    });
    setCategory("all");
    tabList.removeAttribute("hidden");

    return () => listeners.forEach(({ tab, listener }) => tab.removeEventListener("click", listener));
  }, [pageHtml]);

  return pageHtml
    ? <div dangerouslySetInnerHTML={{ __html: pageHtml }} />
    : <main aria-live="polite" className="min-h-screen p-8 text-center text-muted-foreground">Chargement…</main>;
}

function PageTracker() {
  const [location] = useLocation();
  const lastTracked = useRef("");
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (user) return;
    const privatePaths = ["/dashboard", "/change-password", "/reset-password", "/confirm-email-change", "/verify-email"];
    if (privatePaths.some(p => location.startsWith(p))) return;
    if (location === lastTracked.current) return;
    const timer = setTimeout(() => {
      lastTracked.current = location;
      fetch("/api/analytics/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          path: location,
          referrer: document.referrer || "",
        }),
      }).catch(() => {});
    }, 500);
    return () => clearTimeout(timer);
  }, [location, user, isLoading]);

  return null;
}

function Router() {
  const [location, navigate] = useLocation();

  useEffect(() => {
    const handleInternalNavigation = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement) || anchor.target === "_blank" || anchor.hasAttribute("download")) return;

      const path = anchor.pathname;
      if (path !== "/" && !publicPagePaths.has(path)) return;
      if (path === window.location.pathname && !anchor.hash) return;
      if (path === window.location.pathname && anchor.hash) return;

      event.preventDefault();
      navigate(path);
      if (anchor.hash) {
        window.history.replaceState(window.history.state, "", `${path}${anchor.search}${anchor.hash}`);
      } else {
        window.scrollTo({ top: 0, behavior: "auto" });
      }
    };

    document.addEventListener("click", handleInternalNavigation);
    return () => document.removeEventListener("click", handleInternalNavigation);
  }, [navigate]);

  useEffect(() => {
    if (location === "/") {
      document.body.classList.remove("site-evolution");
      document.getElementById("public-seo-page-styles")?.remove();
    }
  }, [location]);

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/site-evolutif" component={PublicSeoPage} />
      <Route path="/application-web-entreprise" component={PublicSeoPage} />
      <Route path="/creation-site-web" component={PublicSeoPage} />
      <Route path="/references" component={PublicSeoPage} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/change-password" component={ChangePassword} />
      <Route path="/verify-email" component={VerifyEmail} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/confirm-email-change" component={ConfirmEmailChange} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <PageTracker />
          <Toaster />
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
