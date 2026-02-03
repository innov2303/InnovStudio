import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/lib/auth";
import { Link } from "wouter";
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
  ChevronRight
} from "lucide-react";

import heroBg from "@/assets/images/hero-bg.jpg";
import featuresBg from "@/assets/images/features-bg.jpg";
import projectTracking from "@/assets/images/project-tracking.png";

export default function Home() {
  const { user } = useAuth();

  const services = [
    {
      icon: Globe,
      title: "Sites Vitrines",
      description: "Des sites web élégants et performants qui mettent en valeur votre activité et captent l'attention de vos visiteurs."
    },
    {
      icon: Code2,
      title: "Applications Web Entreprise",
      description: "Solutions sur mesure pour digitaliser vos processus métier et optimiser votre productivité."
    },
    {
      icon: Bot,
      title: "Intégration IA",
      description: "Exploitez la puissance de l'intelligence artificielle pour automatiser et enrichir vos services."
    },
    {
      icon: Palette,
      title: "Design UI/UX",
      description: "Interfaces modernes et intuitives conçues pour offrir une expérience utilisateur exceptionnelle."
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
            <a href="#services" className="text-muted-foreground hover:text-foreground transition-colors">
              Services
            </a>
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
              Avantages
            </a>
            <a href="#contact" className="text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {user ? (
              <Link href="/dashboard">
                <Button data-testid="button-dashboard">
                  Dashboard
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button data-testid="button-login">
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
              
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
                Créons ensemble le{" "}
                <span className="text-primary">digital</span> de demain
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                Studio de production web spécialisé dans les applications entreprise modernes 
                et les sites vitrines haut de gamme, enrichis par l'intelligence artificielle.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a href="#contact">
                  <Button size="lg" className="gap-2" data-testid="button-start-project">
                    Démarrer un projet
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </a>
                <a href="#services">
                  <Button size="lg" variant="outline" data-testid="button-discover-services">
                    Découvrir mes services
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </section>

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
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {services.map((service, index) => (
                <Card key={index} className="group hover-elevate border-0 bg-card">
                  <CardContent className="p-6">
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <service.icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{service.title}</h3>
                    <p className="text-muted-foreground text-sm">{service.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="relative py-20 overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${featuresBg})` }}
          />
          <div className="absolute inset-0 bg-background/85 dark:bg-background/92" />
          <div className="container relative mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Pourquoi choisir{" "}
                  <span className="text-primary">Innov Studio</span> ?
                </h2>
                <p className="text-muted-foreground mb-8">
                  Mon expertise technique et ma passion pour l'innovation me permettent 
                  de créer des solutions web qui dépassent vos attentes.
                </p>
                
                <div className="space-y-6">
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
              </div>
              
              <div className="relative">
                <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent p-8">
                  <div className="h-full w-full rounded-xl bg-card border flex flex-col items-center justify-center p-6">
                    <div className="text-center mb-4">
                      <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <Rocket className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold mb-1">Suivi de Projet en Temps Réel</h3>
                      <p className="text-muted-foreground text-xs">
                        Suivez l'avancement et validez chaque étape de développement.
                      </p>
                    </div>
                    <div className="w-full rounded-lg overflow-hidden border">
                      <img 
                        src={projectTracking} 
                        alt="Exemple de suivi de projet" 
                        className="w-full h-auto object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="py-20 bg-muted/30">
          <div className="container mx-auto px-6">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Prêt à lancer votre projet ?
              </h2>
              <p className="text-muted-foreground mb-8">
                Connectez-vous à votre espace client pour déposer les premières bases de votre projet et concrétiser vos idées.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
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
                      <Button size="lg" className="gap-2" data-testid="button-login-cta">
                        Se connecter
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href="/register">
                      <Button size="lg" variant="outline" data-testid="button-register-cta">
                        Créer un compte
                      </Button>
                    </Link>
                  </>
                )}
              </div>
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
            <p className="text-sm text-muted-foreground">
              © 2026 Innov Studio By Cyril Allegret. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
