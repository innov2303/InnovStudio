import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useForceDark } from "@/hooks/use-force-dark";
import { useAuth } from "@/lib/auth";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import { 
  Code2, 
  Sparkles, 
  Palette, 
  Rocket, 
  ArrowRight, 
  Zap,
  Globe,
  Shield,
  Bot,
  ChevronRight,
  Briefcase,
  LogOut,
  Headphones,
  Server,
  Mail,
  MessageSquare,
  Send,
  Loader2,
  ShoppingCart,
  Check,
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

import heroBg from "@/assets/images/hero-bg.jpg";
import featuresBg from "@/assets/images/features-bg.jpg";
import projectTracking from "@/assets/images/project-tracking.png";

export default function Home() {
  useForceDark();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [contactOpen, setContactOpen] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });
  const [isSending, setIsSending] = useState(false);
  const [refsData, setRefsData] = useState<any[]>([]);
  const [refsTab, setRefsTab] = useState<"vitrine" | "enterprise">("vitrine");

  useEffect(() => {
    fetch("/api/references")
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setRefsData(data); })
      .catch(() => {});
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

  const serviceCategories = [
    {
      icon: Globe,
      title: "Sites Vitrines",
      description: "Des sites web élégants et performants qui mettent en valeur votre activité et captent l'attention de vos visiteurs.",
      items: [
        { icon: Palette, title: "Design UI/UX", description: "Interfaces modernes et intuitives conçues pour une expérience utilisateur optimale." },
        { icon: ShoppingCart, title: "Intégration E-commerce", description: "Boutique en ligne, catalogue produits et paiement sécurisé pour vendre directement sur votre site." },
        { icon: Headphones, title: "Support & Maintenance 7/7J", description: "Mises à jour régulières, corrections de bugs et support technique réactif." },
        { icon: Server, title: "Hébergement", description: "Hébergement sécurisé avec certificat SSL, sauvegardes automatiques et disponibilité optimale." },
      ],
    },
    {
      icon: Briefcase,
      title: "Solutions Web Entreprise",
      description: "Solutions sur mesure pour digitaliser vos processus métier et optimiser votre productivité.",
      items: [
        { icon: Palette, title: "Design UI/UX", description: "Interfaces professionnelles et ergonomiques adaptées à vos processus métier." },
        { icon: Bot, title: "Intégration IA", description: "Exploitez la puissance de l'intelligence artificielle pour automatiser et enrichir vos services." },
        { icon: Headphones, title: "Support & Maintenance 7/7J", description: "Accompagnement continu et support technique dédié pour garantir la pérennité de votre solution." },
        { icon: Server, title: "Hébergement", description: "Infrastructure performante et sécurisée pour vos applications critiques." },
      ],
    },
  ];

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
        <div className="container mx-auto flex items-center justify-between gap-4 px-6 py-2">
          <Link href="/">
            <span className="text-xl md:text-2xl font-light tracking-wide bg-gradient-to-r from-primary via-cyan-400 to-primary bg-clip-text text-transparent cursor-pointer">
              Innov Studio
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#services" onClick={(e) => scrollToSection(e, "services")} className="text-muted-foreground hover:text-foreground transition-colors">
              Services
            </a>
            <a href="#features" onClick={(e) => scrollToSection(e, "features")} className="text-muted-foreground hover:text-foreground transition-colors">
              Avantages
            </a>
            <a href="#references" onClick={(e) => scrollToSection(e, "references")} className="text-muted-foreground hover:text-foreground transition-colors">
              Références
            </a>
            <a href="#contact" onClick={(e) => scrollToSection(e, "contact")} className="text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </a>
          </nav>
          <div className="flex items-center gap-2">
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

      <main>
        <section className="relative pt-32 pb-20 overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${heroBg})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/80 to-background/70 dark:from-background/98 dark:via-background/90 dark:to-background/80" />
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          
          <div className="container relative mx-auto px-6">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 rounded-full border bg-background/50 backdrop-blur px-4 py-2 mb-8">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Innovation Web & Intelligence Artificielle</span>
              </div>
              
              <h2 className="text-5xl md:text-7xl lg:text-8xl font-light tracking-wide bg-gradient-to-r from-primary via-cyan-400 to-primary bg-clip-text text-transparent mb-8">
                Innov Studio
              </h2>
              
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
                Créons ensemble votre{" "}
                <span className="text-primary">projet Web</span> de demain
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                Studio de production web basé à Toulouse, spécialisé dans la création de sites vitrines 
                et d'applications entreprise sur mesure, enrichis par l'intelligence artificielle.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a href="#contact" onClick={(e) => scrollToSection(e, "contact")}>
                  <Button size="lg" className="gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-300 hover:scale-105 border-0" data-testid="button-start-project">
                    Démarrer un projet
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </a>
                <a href="#services" onClick={(e) => scrollToSection(e, "services")}>
                  <Button size="lg" variant="outline" className="border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10 hover:border-cyan-500/60 transition-all duration-300" data-testid="button-discover-services">
                    Découvrir mes services
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

        <section id="services" className="py-20 bg-muted/30">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Mes Services
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Des solutions digitales complètes pour accompagner votre croissance
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {serviceCategories.map((category, catIndex) => (
                <Card key={catIndex} className="border border-transparent bg-card overflow-visible transition-shadow duration-500 hover:border-cyan-500/50 hover:shadow-[0_0_15px_rgba(0,200,255,0.15),0_0_30px_rgba(0,200,255,0.08)]" data-testid={`card-service-category-${catIndex}`}>
                  <CardContent className="p-8 flex flex-col items-center text-center h-full">
                    <div className="inline-flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
                      <category.icon className="h-7 w-7" />
                    </div>
                    <h3 className="text-xl font-bold min-h-[2rem]">{category.title}</h3>
                    <p className="text-muted-foreground text-sm mt-1 mb-6 min-h-[2.5rem]">{category.description}</p>
                    <div className="space-y-5 w-full flex-1">
                      {category.items.map((item, itemIndex) => (
                        <div key={itemIndex} className="flex items-start gap-3 text-left" data-testid={`service-item-${catIndex}-${itemIndex}`}>
                          <div className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary/5 text-primary flex-shrink-0 mt-0.5">
                            <item.icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-base">{item.title}</h4>
                            <p className="text-muted-foreground text-sm mt-0.5">{item.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <div className="relative h-px">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400 to-transparent blur-md" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500 to-transparent blur-xl opacity-50" />
        </div>

        <section id="features" className="relative py-20 overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${featuresBg})` }}
          />
          <div className="absolute inset-0 bg-background/85 dark:bg-background/92" />
          <div className="container relative mx-auto px-6">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Pourquoi choisir{" "}
                <span className="text-primary">Innov Studio</span> ?
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
                      <span className={`text-[10px] font-semibold uppercase tracking-wider ${isActive ? "text-cyan-400" : "text-muted-foreground"}`}>
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

        {refsData.length > 0 && (
          <>
            <div className="relative h-px">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400 to-transparent blur-md" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500 to-transparent blur-xl opacity-50" />
            </div>

            <section id="references" className="py-20 bg-muted/30">
              <div className="container mx-auto px-6">
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    Nos <span className="text-primary">Références</span>
                  </h2>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    Découvrez une sélection de projets réalisés pour nos clients
                  </p>
                </div>

                <div className="flex justify-center gap-2 mb-10">
                  <Button
                    variant={refsTab === "vitrine" ? "default" : "outline"}
                    onClick={() => setRefsTab("vitrine")}
                    className={refsTab === "vitrine" ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-0" : "border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10"}
                    data-testid="button-refs-tab-vitrine"
                  >
                    Sites Vitrines
                  </Button>
                  <Button
                    variant={refsTab === "enterprise" ? "default" : "outline"}
                    onClick={() => setRefsTab("enterprise")}
                    className={refsTab === "enterprise" ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-0" : "border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10"}
                    data-testid="button-refs-tab-enterprise"
                  >
                    Produits Web Entreprise
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                  {refsData
                    .filter((r) => r.category === refsTab)
                    .map((ref) => (
                      <a
                        key={ref.id}
                        href={ref.url}
                        target="_blank"
                        rel="noopener"
                        className="group block"
                        data-testid={`card-ref-${ref.id}`}
                      >
                        <Card className="border border-transparent bg-card overflow-hidden transition-all duration-500 hover:border-cyan-500/50 hover:shadow-[0_0_15px_rgba(0,200,255,0.15),0_0_30px_rgba(0,200,255,0.08)] hover:scale-[1.02]">
                          <div className="relative aspect-[16/10] bg-muted overflow-hidden">
                            <img
                              src={`https://image.thum.io/get/width/600/crop/400/${ref.url}`}
                              alt={ref.title}
                              className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          </div>
                          <CardContent className="p-4">
                            <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">{ref.title}</h3>
                            {ref.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2">{ref.description}</p>
                            )}
                            <div className="flex items-center gap-1 mt-2 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                              <Globe className="h-3 w-3" />
                              Visiter le site
                              <ArrowRight className="h-3 w-3" />
                            </div>
                          </CardContent>
                        </Card>
                      </a>
                    ))}
                  {refsData.filter((r) => r.category === refsTab).length === 0 && (
                    <p className="text-muted-foreground text-center col-span-full py-8">Aucune référence dans cette catégorie pour le moment</p>
                  )}
                </div>
              </div>
            </section>
          </>
        )}

        <div className="relative h-px">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400 to-transparent blur-md" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500 to-transparent blur-xl opacity-50" />
        </div>

        <section id="contact" className="py-12 bg-muted/30">
          <div className="container mx-auto px-6">
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
                        <Button size="lg" variant="outline" className="border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10 hover:border-cyan-500/60 transition-all duration-300" data-testid="button-register-cta">
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

      <footer className="border-t py-4">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <span className="text-xl font-light tracking-wide bg-gradient-to-r from-primary via-cyan-400 to-primary bg-clip-text text-transparent">
              Innov Studio
            </span>
            <div className="flex flex-col md:flex-row items-center gap-2 text-sm text-muted-foreground">
              <p>© 2026 Innov Studio By Cyril Allegret · Création de sites web à Toulouse. Tous droits réservés.</p>
              <span className="hidden md:inline">·</span>
              <a href="https://www.jesuisnumerique.fr" target="_blank" rel="noopener" className="hover:text-foreground transition-colors" data-testid="link-partenaire-jesuisnumerique">jesuisnumerique.fr</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
