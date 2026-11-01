import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useForceLight } from "@/hooks/use-force-light";
import { useAuth } from "@/lib/auth";
import { Link } from "wouter";
import { useEffect, useState } from "react";
import { 
  Code2, 
  Sparkles, 
  Rocket, 
  ArrowRight, 
  Zap,
  Shield,
  House,
  ChevronRight,
  LogOut,
  Mail,
  MessageSquare,
  Send,
  Loader2,
  FileText,
  PenTool,
  CheckCircle,
  Layers,
  Settings,
  CreditCard,
  Trophy
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import SiteFooter from "@/components/site-footer";

import projectTracking from "@/assets/images/project-tracking.png";

const homeSections = [
  { id: "home-hero", label: "Accueil", icon: House },
  { id: "features", label: "Présentation", icon: Sparkles },
  { id: "services", label: "Mes services", icon: Layers },
  { id: "contact", label: "Contact", icon: Mail },
];

export default function Home() {
  useForceLight();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState(homeSections[0].id);
  const [contactOpen, setContactOpen] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const sections = homeSections
      .map(({ id }) => document.getElementById(id))
      .filter((section): section is HTMLElement => section !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        const mostVisible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (mostVisible) {
          setActiveSection(mostVisible.target.id);
        }
      },
      { rootMargin: "-25% 0px -35% 0px", threshold: [0, 0.2, 0.5, 0.75] },
    );

    sections.forEach((section) => observer.observe(section));
    const requestedSectionId = window.location.hash.slice(1);
    const hashScrollFrame = requestedSectionId
      ? window.requestAnimationFrame(() => {
          const target = document.getElementById(requestedSectionId);
          if (!target) return;

          const headerOffset = 70;
          const targetPosition = target.getBoundingClientRect().top + window.scrollY;
          window.scrollTo({
            top: Math.max(0, targetPosition - headerOffset),
            behavior: "smooth",
          });
        })
      : undefined;

    return () => {
      observer.disconnect();
      if (hashScrollFrame !== undefined) {
        window.cancelAnimationFrame(hashScrollFrame);
      }
    };
  }, []);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault();
    const el = document.getElementById(sectionId);
    if (el) {
      const headerOffset = 70;
      const elementPosition = el.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSending(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactForm)
      });
      
      if (response.ok) {
        toast({
          title: "Message envoyé",
          description: "Merci pour votre message ! Je vous répondrai dans les plus brefs délais."
        });
        setContactForm({ name: "", email: "", phone: "", subject: "", message: "" });
        setContactOpen(false);
      } else {
        const data = await response.json();
        throw new Error(data.message || "Erreur lors de l'envoi");
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'envoyer le message. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  const features = [
    {
      icon: Zap,
      title: "Performance Optimale",
      description: "Sites ultra-rapides avec les dernières technologies web"
    },
    {
      icon: Shield,
      title: "Sécurité Renforcée",
      description: "Protection avancée de vos données et de vos utilisateurs"
    },
    {
      icon: Rocket,
      title: "Déploiement Rapide",
      description: "De l'idée à la mise en ligne en un temps record"
    },
    {
      icon: Code2,
      title: "Technologies Modernes",
      description: "React, TypeScript, Node.js, Python, PostgreSQL et les frameworks les plus récents"
    },
  ];

  const workflowSteps = [
    {
      icon: FileText,
      step: 1,
      title: "Dépôt du projet",
      description: "Décrivez votre projet et vos besoins. J'étudie votre demande.",
      color: "from-cyan-500 to-blue-500"
    },
    {
      icon: PenTool,
      step: 2,
      title: "Étude & Devis",
      description: "Analyse détaillée, estimation des coûts et proposition d'un devis personnalisé.",
      color: "from-blue-500 to-indigo-500"
    },
    {
      icon: Layers,
      step: 3,
      title: "Développement",
      description: "Développement de votre projet avec suivi en temps réel des fonctionnalités.",
      color: "from-violet-500 to-purple-500"
    },
    {
      icon: Settings,
      step: 4,
      title: "Tests & Livraison",
      description: "Tests complets, ajustements finaux et mise en ligne de votre projet.",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Trophy,
      step: 5,
      title: "Projet terminé",
      description: "Votre projet est en ligne ! Support et maintenance disponibles.",
      color: "from-emerald-500 to-green-500"
    },
  ];

  const [activeStep, setActiveStep] = useState(0);

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto grid grid-cols-[auto_1fr] lg:grid-cols-[1fr_auto_1fr] items-center gap-4 px-6 py-2">
          <Link href="/" className="justify-self-start">
            <span className="text-xl md:text-2xl font-light tracking-wide bg-gradient-to-r from-primary via-cyan-400 to-primary bg-clip-text text-transparent cursor-pointer">
              Innov Studio
            </span>
          </Link>
          <nav className="hidden lg:flex items-center justify-self-center gap-6">
            <a href="/" className="text-muted-foreground hover:text-foreground transition-colors">
              Accueil
            </a>
            <a href="/site-evolutif" className="text-muted-foreground hover:text-foreground transition-colors">
              Site Web Evolutif
            </a>
            <a href="/references" className="text-muted-foreground hover:text-foreground transition-colors">
              Références
            </a>
            <a href="#contact" onClick={(e) => scrollToSection(e, "contact")} className="text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </a>
          </nav>
          <div className="flex items-center justify-self-end gap-2">
            {user ? (
              <>
                <Link href="/dashboard">
                  <Button data-testid="button-dashboard">
                    Dashboard
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  onClick={async () => {
                    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
                    logout();
                    window.location.href = "/";
                  }}
                  data-testid="button-logout-home"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Déconnexion
                </Button>
              </>
            ) : (
              <Link href="/login">
                <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-300 hover:scale-105 border-0" data-testid="button-login">
                  Connexion
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      <nav
        aria-label="Navigation entre les sections"
        className="fixed right-2 sm:right-4 top-1/2 z-40 flex -translate-y-1/2 flex-col gap-2"
      >
        {homeSections.map(({ id, label, icon: SectionIcon }) => {
          const isActive = activeSection === id;
          return (
            <button
              key={id}
              type="button"
              aria-label={`Aller à la section ${label}`}
              aria-current={isActive ? "location" : undefined}
              data-testid={`section-nav-${id}`}
              onClick={() => {
                document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className={`group relative flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-full border shadow-md backdrop-blur transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 focus-visible:ring-offset-2 ${
                isActive
                  ? "border-cyan-600 bg-cyan-600 text-white"
                  : "border-slate-300 bg-white/95 text-slate-600 hover:border-cyan-500 hover:text-cyan-700"
              }`}
            >
              <SectionIcon
                aria-hidden="true"
                className="h-4 w-4 sm:h-[18px] sm:w-[18px]"
                strokeWidth={isActive ? 2.3 : 1.8}
              />
              <span className="pointer-events-none absolute right-full mr-3 whitespace-nowrap rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                {label}
              </span>
            </button>
          );
        })}
      </nav>

      <main>
        <section id="home-hero" className="relative flex min-h-[100svh] items-center pt-32 pb-20 overflow-hidden bg-white text-slate-900">
          <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-sky-50" />
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-100/70 rounded-full blur-3xl" />

          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <div className="absolute left-[7%] top-[24%] hidden -rotate-6 xl:block">
              <div className="w-40 rounded-xl border border-sky-100/90 bg-white/80 p-3 shadow-xl shadow-sky-100/50 backdrop-blur-sm">
                <div className="flex items-center gap-1.5 border-b border-slate-100 pb-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-300/80" />
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-300/80" />
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-300/80" />
                  <span className="ml-1 text-[8px] font-medium text-slate-400">mon-site.fr</span>
                </div>
                <div className="mt-2 flex h-14 items-end rounded-lg bg-gradient-to-br from-cyan-100 to-blue-100 p-2">
                  <div className="space-y-1">
                    <div className="h-1.5 w-12 rounded-full bg-blue-500/60" />
                    <div className="h-1 w-16 rounded-full bg-white/80" />
                  </div>
                </div>
                <div className="mt-2 grid grid-cols-3 gap-1">
                  <div className="h-5 rounded bg-sky-50" />
                  <div className="h-5 rounded bg-cyan-50" />
                  <div className="h-5 rounded bg-blue-50" />
                </div>
              </div>
            </div>

            <div className="absolute right-[8%] top-[27%] hidden rotate-6 xl:block">
              <div className="w-40 rounded-xl border border-blue-100/90 bg-white/80 p-3 shadow-xl shadow-blue-100/50 backdrop-blur-sm">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[8px] font-medium text-slate-400">app.tsx</span>
                  <Code2 className="h-3.5 w-3.5 text-blue-400" />
                </div>
                <div className="space-y-2 rounded-lg bg-slate-50/90 p-2.5">
                  <div className="h-1 w-14 rounded-full bg-blue-300/80" />
                  <div className="ml-2 h-1 w-20 rounded-full bg-cyan-200" />
                  <div className="ml-2 h-1 w-16 rounded-full bg-violet-200" />
                  <div className="h-1 w-10 rounded-full bg-sky-200" />
                  <div className="ml-2 h-1 w-20 rounded-full bg-blue-200" />
                </div>
                <div className="mt-2 flex items-center gap-1.5 text-[8px] text-slate-400">
                  <Layers className="h-3 w-3 text-cyan-500/70" />
                  Interface responsive
                </div>
              </div>
            </div>

            <div className="absolute bottom-[13%] left-[16%] hidden rotate-3 2xl:block">
              <div className="flex h-24 w-40 items-center gap-2 rounded-xl border border-cyan-100/90 bg-white/80 p-3 shadow-xl shadow-cyan-100/50 backdrop-blur-sm">
                <div className="flex h-full flex-1 flex-col justify-between rounded-md bg-gradient-to-br from-sky-50 to-cyan-100 p-2">
                  <div className="h-1.5 w-9 rounded-full bg-cyan-500/50" />
                  <div className="space-y-1">
                    <div className="h-1 w-full rounded-full bg-white" />
                    <div className="h-1 w-3/4 rounded-full bg-white/80" />
                  </div>
                  <div className="h-3 w-8 rounded bg-blue-400/50" />
                </div>
                <div className="flex h-[4.5rem] w-8 flex-col items-center rounded-md border border-slate-200 bg-white p-1">
                  <div className="mt-1 h-1 w-4 rounded-full bg-slate-200" />
                  <div className="mt-2 h-5 w-full rounded-sm bg-gradient-to-b from-cyan-100 to-blue-100" />
                  <div className="mt-1 h-1 w-4 rounded-full bg-slate-100" />
                </div>
              </div>
            </div>

            <div className="absolute left-5 top-[8%] grid h-9 w-9 place-items-center rounded-xl border border-sky-100 bg-white/60 text-sky-400/60 shadow-sm xl:hidden">
              <Code2 className="h-4 w-4" />
            </div>
            <div className="absolute bottom-[7%] right-5 grid h-9 w-9 place-items-center rounded-xl border border-cyan-100 bg-white/60 text-cyan-500/60 shadow-sm xl:hidden">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          
          <div className="container relative mx-auto px-6">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 backdrop-blur px-4 py-2 mb-8">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Innovation Web & Intelligence Artificielle</span>
              </div>
              
              <h2 className="text-5xl md:text-7xl lg:text-8xl font-light tracking-wide bg-gradient-to-r from-primary via-cyan-400 to-primary bg-clip-text text-transparent mb-8">
                Innov Studio
              </h2>
              
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
                Un site web sur mesure{" "}
                <span className="bg-gradient-to-r from-primary via-cyan-400 to-primary bg-clip-text text-transparent">pour votre activité</span>
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                Démarrez avec un site professionnel et faites-le évoluer vers les outils numériques dont votre activité a besoin.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a href="#contact" onClick={(e) => scrollToSection(e, "contact")}>
                  <Button size="lg" className="gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-300 hover:scale-105 border-0" data-testid="button-start-project">
                    Démarrer un projet
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </a>
                <a href="/site-evolutif">
                  <Button size="lg" variant="outline" className="border-cyan-700/40 text-cyan-800 hover:bg-cyan-50 hover:border-cyan-700/60 transition-all duration-300" data-testid="button-discover-services">
                    Découvrir le site web évolutif
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </section>

        <div className="relative h-px">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400 to-transparent blur-md" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500 to-transparent blur-xl opacity-50" />
        </div>

        <section id="features" className="relative flex min-h-[100svh] items-center py-20 overflow-hidden bg-slate-50">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-slate-50" />
          <div className="container relative mx-auto px-6">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Pourquoi choisir{" "}
                <span className="bg-gradient-to-r from-primary via-cyan-400 to-primary bg-clip-text text-transparent">Innov Studio</span> ?
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Mon expertise technique et ma passion pour l'innovation me permettent 
                de créer des solutions web qui dépassent vos attentes.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto mb-16">
              {features.map((feature, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold">Suivi de Projet Interactif</h3>
                <p className="text-muted-foreground text-sm mt-2">
                  De la demande à la livraison, suivez chaque étape de votre projet.
                </p>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {workflowSteps.map((step, index) => {
                  const StepIcon = step.icon;
                  const isActive = activeStep === index;
                  return (
                    <div
                      key={index}
                      data-testid={`workflow-step-${step.step}`}
                      className={`relative cursor-pointer rounded-md border p-4 text-center transition-all duration-300 ${
                        isActive 
                          ? "border-cyan-500/60 bg-cyan-500/10 shadow-[0_0_15px_rgba(0,200,255,0.15)]" 
                          : "border-border/50 bg-card/50 hover:border-cyan-500/30"
                      }`}
                      onClick={() => setActiveStep(index)}
                    >
                      {index < workflowSteps.length - 1 && (
                        <div className="hidden sm:block absolute top-1/2 -right-3 -translate-y-1/2 z-10">
                          <ChevronRight className="h-4 w-4 text-cyan-500/50" />
                        </div>
                      )}
                      <div className={`mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-gradient-to-br ${step.color} transition-all duration-300 ${isActive ? "shadow-[0_0_12px_rgba(0,200,255,0.3)]" : ""}`}>
                        <StepIcon className="h-5 w-5 text-white" />
                      </div>
                      <span className={`text-[10px] font-semibold uppercase tracking-wider ${isActive ? "text-cyan-700" : "text-muted-foreground"}`}>
                        Étape {step.step}
                      </span>
                      <h4 className="text-xs font-semibold mt-1 leading-tight">{step.title}</h4>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 rounded-md border border-cyan-500/20 bg-card/60 p-4 text-center transition-all duration-300">
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">{workflowSteps[activeStep].title}</span>
                  {" — "}
                  {workflowSteps[activeStep].description}
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="relative h-px">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400 to-transparent blur-md" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500 to-transparent blur-xl opacity-50" />
        </div>

        <section id="services" className="relative flex min-h-[100svh] items-center overflow-hidden bg-white py-20">
          <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-sky-50" />
          <div className="container relative mx-auto px-6">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                Mes{" "}
                <span className="bg-gradient-to-r from-primary via-cyan-400 to-primary bg-clip-text text-transparent">
                  services
                </span>
              </h2>
              <p className="text-muted-foreground">
                Du site vitrine à l’application web métier, choisissez le point de départ adapté à votre projet et faites évoluer votre solution au fil de vos besoins.
              </p>
            </div>

            <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
              <article className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500/50 hover:shadow-lg md:p-9">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Code2 className="h-6 w-6" />
                </div>
                <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-cyan-700">
                  Présence en ligne
                </p>
                <h3 className="mb-3 text-2xl font-bold text-slate-900">Site Web Evolutif</h3>
                <p className="mb-6 text-muted-foreground">
                  Présentez votre activité et vos services avec un site professionnel, adapté aux mobiles et conçu pour faciliter les prises de contact.
                </p>
                <ul className="mb-8 space-y-2 text-sm text-slate-600">
                  <li>• Pages et contenus adaptés à votre activité</li>
                  <li>• Design responsive pour mobile et ordinateur</li>
                  <li>• Une base que vous pourrez faire évoluer</li>
                </ul>
                <a
                  href="/site-evolutif"
                  className="mt-auto inline-flex items-center gap-2 font-semibold text-cyan-800 transition-colors hover:text-blue-700"
                >
                  Découvrir le site web évolutif <ArrowRight className="h-4 w-4" />
                </a>
              </article>

              <article className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500/50 hover:shadow-lg md:p-9">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Layers className="h-6 w-6" />
                </div>
                <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-cyan-700">
                  Outil métier sur mesure
                </p>
                <h3 className="mb-3 text-2xl font-bold text-slate-900">Application web métier</h3>
                <p className="mb-6 text-muted-foreground">
                  Créez votre application métier adaptée ou faites évoluer votre site vitrine existant avec les fonctionnalités métier dont vous avez besoin.
                </p>
                <ul className="mb-8 space-y-2 text-sm text-slate-600">
                  <li>• Création de votre application web entreprise</li>
                  <li>• Évolution possible d’un site vitrine existant</li>
                  <li>• Espace client, suivi, tableaux de bord ou automatisations</li>
                </ul>
                <a
                  href="/site-evolutif#application-metier"
                  className="mt-auto inline-flex items-center gap-2 font-semibold text-cyan-800 transition-colors hover:text-blue-700"
                >
                  Voir l’évolution vers une application métier <ArrowRight className="h-4 w-4" />
                </a>
              </article>
            </div>
          </div>
        </section>

        <div className="relative h-px">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400 to-transparent blur-md" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500 to-transparent blur-xl opacity-50" />
        </div>

        <section id="contact" className="relative flex min-h-[100svh] items-center overflow-hidden py-20">
          <div className="absolute inset-0">
            <img src="/images/contact-bg.png" alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-white/90" />
          </div>
          <div className="container mx-auto px-6 relative z-10">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Me <span className="bg-gradient-to-r from-primary via-cyan-400 to-primary bg-clip-text text-transparent">Contacter</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Discutons ensemble de votre projet
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <Card className="border border-transparent bg-card overflow-visible transition-shadow duration-500 hover:border-cyan-500/50 hover:shadow-[0_0_15px_rgba(0,200,255,0.15),0_0_30px_rgba(0,200,255,0.08)]">
                <CardContent className="p-6 text-center flex flex-col items-center h-full">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
                  <Rocket className="h-6 w-6" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold mb-3">
                  Prêt à lancer votre projet ?
                </h2>
                <p className="text-muted-foreground text-sm flex-1">
                  Connectez-vous à votre espace client pour déposer les premières bases de votre projet et concrétisons ensemble vos idées.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
                  {user ? (
                    <Link href="/dashboard">
                      <Button size="lg" className="gap-2" data-testid="button-go-dashboard">
                        Accéder à mon espace
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  ) : (
                    <>
                      <Link href="/login">
                        <Button size="lg" className="gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-300 hover:scale-105 border-0" data-testid="button-login-cta">
                          Se connecter
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href="/register">
                        <Button size="lg" variant="outline" className="border-cyan-700/40 text-cyan-800 hover:bg-cyan-50 hover:border-cyan-700/60 transition-all duration-300" data-testid="button-register-cta">
                          Créer un compte
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </CardContent>
              </Card>

              <Card className="border border-transparent bg-card overflow-visible transition-shadow duration-500 hover:border-cyan-500/50 hover:shadow-[0_0_15px_rgba(0,200,255,0.15),0_0_30px_rgba(0,200,255,0.08)]">
                <CardContent className="p-6 text-center flex flex-col items-center h-full">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold mb-3">
                  Besoin de plus d'informations ?
                </h2>
                <p className="text-muted-foreground text-sm flex-1">
                  N'hésitez pas à me contacter pour discuter de votre projet ou poser vos questions.
                </p>
                <div className="mt-6">
                <Dialog open={contactOpen} onOpenChange={setContactOpen}>
                  <DialogTrigger asChild>
                    <Button size="lg" className="gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-300 hover:scale-105 border-0" data-testid="button-contact-me">
                      <Mail className="h-5 w-5" />
                      Contactez moi
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Mail className="h-5 w-5 text-primary" />
                        Formulaire de contact
                      </DialogTitle>
                      <DialogDescription>
                        Envoyez-moi un message et je vous répondrai dans les plus brefs délais.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleContactSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="contact-name">Nom complet *</Label>
                        <Input
                          id="contact-name"
                          placeholder="Votre nom"
                          value={contactForm.name}
                          onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                          data-testid="input-contact-name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contact-email">Email *</Label>
                        <Input
                          id="contact-email"
                          type="email"
                          placeholder="votre@email.com"
                          value={contactForm.email}
                          onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                          data-testid="input-contact-email"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contact-phone">Téléphone</Label>
                        <Input
                          id="contact-phone"
                          type="tel"
                          placeholder=""
                          value={contactForm.phone}
                          onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                          data-testid="input-contact-phone"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contact-subject">Sujet</Label>
                        <Input
                          id="contact-subject"
                          placeholder="Sujet de votre message"
                          value={contactForm.subject}
                          onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                          data-testid="input-contact-subject"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contact-message">Message *</Label>
                        <Textarea
                          id="contact-message"
                          placeholder="Décrivez votre projet ou posez vos questions..."
                          rows={4}
                          value={contactForm.message}
                          onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                          data-testid="input-contact-message"
                        />
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full gap-2" 
                        disabled={isSending}
                        data-testid="button-send-contact"
                      >
                        {isSending ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Envoi en cours...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4" />
                            Envoyer le message
                          </>
                        )}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
                </div>
              </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
