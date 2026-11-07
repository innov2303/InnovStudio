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
import GoogleCompleteProfile from "@/pages/google-complete-profile";
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

type PublicPageData = {
  html: string;
  title: string;
  bodyClass: string;
  description: string | null;
  canonical: string | null;
  styles: string | null;
};

const publicPageCache = new Map<string, PublicPageData>();
const publicPageRequests = new Map<string, Promise<PublicPageData>>();

function loadPublicPage(path: string): Promise<PublicPageData> {
  const cached = publicPageCache.get(path);
  if (cached) return Promise.resolve(cached);

  const pending = publicPageRequests.get(path);
  if (pending) return pending;

  const request = fetch(path, { headers: { Accept: "text/html" } })
    .then(async (response) => {
      if (!response.ok) throw new Error(`Page indisponible (${response.status})`);
      return new DOMParser().parseFromString(await response.text(), "text/html");
    })
    .then((page) => {
      const root = page.querySelector("#root");
      if (!root) throw new Error("Contenu de page introuvable");

      const pageData: PublicPageData = {
        html: root.innerHTML,
        title: page.title,
        bodyClass: page.body.className,
        description: page.querySelector('meta[name="description"]')?.getAttribute("content") ?? null,
        canonical: page.querySelector('link[rel="canonical"]')?.getAttribute("href") ?? null,
        styles: page.querySelector("#public-seo-page-styles")?.textContent ?? null,
      };
      publicPageCache.set(path, pageData);
      return pageData;
    })
    .finally(() => publicPageRequests.delete(path));

  publicPageRequests.set(path, request);
  return request;
}

function applyPublicPageChrome(page: PublicPageData) {
  if (page.styles !== null) {
    let activePageStyles = document.getElementById("public-seo-page-styles");
    if (!activePageStyles) {
      activePageStyles = document.createElement("style");
      activePageStyles.id = "public-seo-page-styles";
      document.head.append(activePageStyles);
    }
    activePageStyles.textContent = page.styles;
  }

  document.title = page.title;
  document.body.className = page.bodyClass;
  if (page.description) {
    document.querySelector('meta[name="description"]')?.setAttribute("content", page.description);
  }
  if (page.canonical) {
    document.querySelector('link[rel="canonical"]')?.setAttribute("href", page.canonical);
  }
}

function PublicSeoPage() {
  const [location] = useLocation();
  const bootstrap = (window as any).__PUBLIC_PAGE_BOOTSTRAP__ as
    | { path: string; html: string; bodyClass: string }
    | undefined;
  const [pageHtml, setPageHtml] = useState(
    bootstrap?.path === location
      ? bootstrap.html
      : publicPageCache.get(location)?.html ?? "",
  );

  useEffect(() => {
    let isCurrent = true;

    if (bootstrap?.path === location) {
      const initialPage: PublicPageData = {
        html: bootstrap.html,
        title: document.title,
        bodyClass: bootstrap.bodyClass,
        description: document.querySelector('meta[name="description"]')?.getAttribute("content") ?? null,
        canonical: document.querySelector('link[rel="canonical"]')?.getAttribute("href") ?? null,
        styles: document.getElementById("public-seo-page-styles")?.textContent ?? null,
      };
      publicPageCache.set(location, initialPage);
      applyPublicPageChrome(initialPage);
      (window as any).__PUBLIC_PAGE_BOOTSTRAP__ = undefined;
      return;
    }

    const cachedPage = publicPageCache.get(location);
    if (cachedPage) {
      applyPublicPageChrome(cachedPage);
      setPageHtml(cachedPage.html);
      window.scrollTo({ top: 0, behavior: "auto" });
      return () => {
        isCurrent = false;
      };
    }

    loadPublicPage(location)
      .then((page) => {
        if (!isCurrent) return;
        applyPublicPageChrome(page);
        setPageHtml(page.html);
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
    const browser = document.querySelector<HTMLElement>("[data-reference-browser]");
    if (!browser) return;

    const cleanups: Array<() => void> = [];
    const tracks = Array.from(browser.querySelectorAll<HTMLElement>("[data-reference-track]"));

    tracks.forEach((track) => {
      const slides = Array.from(track.querySelectorAll<HTMLElement>(".reference-slide"));
      if (slides.length === 0) return;

      const carousel = track.closest(".reference-section");
      const previous = carousel?.querySelector<HTMLButtonElement>("[data-reference-previous]") ?? null;
      const next = carousel?.querySelector<HTMLButtonElement>("[data-reference-next]") ?? null;
      const status = carousel?.querySelector<HTMLElement>(".reference-carousel-status") ?? null;
      let activeIndex = 0;
      let animationFrame: number | null = null;

      const syncControls = () => {
        if (previous) previous.disabled = activeIndex === 0;
        if (next) next.disabled = activeIndex === slides.length - 1;
        if (status) status.textContent = `${activeIndex + 1} sur ${slides.length}`;
      };

      const update = () => {
        if (track.clientWidth === 0) return;

        let closestIndex = 0;
        let closestDistance = Infinity;
        slides.forEach((slide, index) => {
          const distance = Math.abs(slide.offsetLeft - track.scrollLeft);
          if (distance < closestDistance) {
            closestDistance = distance;
            closestIndex = index;
          }
        });

        activeIndex = closestIndex;
        syncControls();
      };

      const move = (direction: number) => {
        const destination = Math.max(0, Math.min(slides.length - 1, activeIndex + direction));
        if (destination === activeIndex) return;

        activeIndex = destination;
        syncControls();
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        track.scrollTo({
          left: slides[destination].offsetLeft,
          behavior: reduceMotion ? "auto" : "smooth",
        });
      };

      const handleScroll = () => {
        if (animationFrame !== null) cancelAnimationFrame(animationFrame);
        animationFrame = requestAnimationFrame(update);
      };
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          move(-1);
        } else if (event.key === "ArrowRight") {
          event.preventDefault();
          move(1);
        }
      };
      const handleResize = () => requestAnimationFrame(update);
      const handlePrevious = () => move(-1);
      const handleNext = () => move(1);

      previous?.addEventListener("click", handlePrevious);
      next?.addEventListener("click", handleNext);
      track.addEventListener("scroll", handleScroll, { passive: true });
      track.addEventListener("keydown", handleKeyDown);
      window.addEventListener("resize", handleResize);
      update();

      cleanups.push(() => {
        if (animationFrame !== null) cancelAnimationFrame(animationFrame);
        previous?.removeEventListener("click", handlePrevious);
        next?.removeEventListener("click", handleNext);
        track.removeEventListener("scroll", handleScroll);
        track.removeEventListener("keydown", handleKeyDown);
        window.removeEventListener("resize", handleResize);
      });
    });

    return () => cleanups.forEach((cleanup) => cleanup());
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
    const privatePaths = ["/dashboard", "/change-password", "/reset-password", "/confirm-email-change", "/verify-email", "/google-complete-profile"];
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
    let latestNavigation = 0;

    const prefetchPublicNavigation = (event: Event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;

      const path = anchor.pathname;
      if (!publicPagePaths.has(path) || path === window.location.pathname) return;
      void loadPublicPage(path).catch(() => {});
    };

    const handleInternalNavigation = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement) || anchor.target === "_blank" || anchor.hasAttribute("download")) return;

      const path = anchor.pathname;
      if (path !== "/" && !publicPagePaths.has(path)) return;
      if (path === window.location.pathname) {
        if (anchor.hash) return;

        event.preventDefault();
        if (window.location.hash) {
          window.history.replaceState(
            window.history.state,
            "",
            `${path}${anchor.search}`,
          );
        }
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      event.preventDefault();
      const navigationId = ++latestNavigation;
      const completeNavigation = (page?: PublicPageData) => {
        if (navigationId !== latestNavigation) return;
        navigate(path);
        if (page) applyPublicPageChrome(page);
        if (anchor.hash) {
          window.history.replaceState(window.history.state, "", `${path}${anchor.search}${anchor.hash}`);
        } else {
          window.scrollTo({ top: 0, behavior: "auto" });
        }
      };

      if (publicPagePaths.has(path)) {
        void loadPublicPage(path)
          .then((page) => completeNavigation(page))
          .catch((error) => {
            if (navigationId !== latestNavigation) return;
            console.error("Navigation publique impossible:", error);
            window.location.assign(anchor.href);
          });
      } else {
        completeNavigation();
      }
    };

    document.addEventListener("pointerover", prefetchPublicNavigation);
    document.addEventListener("focusin", prefetchPublicNavigation);
    document.addEventListener("click", handleInternalNavigation);
    return () => {
      document.removeEventListener("pointerover", prefetchPublicNavigation);
      document.removeEventListener("focusin", prefetchPublicNavigation);
      document.removeEventListener("click", handleInternalNavigation);
    };
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
      <Route path="/google-complete-profile" component={GoogleCompleteProfile} />
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
