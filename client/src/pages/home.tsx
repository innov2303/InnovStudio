import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useForceDark } from "@/hooks/use-force-dark";
import { useAuth } from "@/lib/auth";
import { Link } from "wouter";
import { useState } from "react";
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
  Check
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
                Créons ensemble votre{" "}
                <span className="text-primary">projet Web</span> de demain
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                Studio de production web spécialisé dans les solutions d'entreprise modernes 
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
            
            <div className="grid md:grid-cols-2 gap-8">
              {serviceCategories.map((category, catIndex) => (
                <Card key={catIndex} className="border-0 bg-card overflow-visible" data-testid={`card-service-category-${catIndex}`}>
                  <CardContent className="p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="inline-flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10 text-primary flex-shrink-0">
                        <category.icon className="h-7 w-7" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{category.title}</h3>
                        <p className="text-muted-foreground text-sm mt-1">{category.description}</p>
                      </div>
                    </div>
                    <div className="space-y-5">
                      {category.items.map((item, itemIndex) => (
                        <div key={itemIndex} className="flex items-start gap-3" data-testid={`service-item-${catIndex}-${itemIndex}`}>
                          <div className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary/5 text-primary flex-shrink-0 mt-0.5">
                            <item.icon className="h-5 w-5" />
                          </div>
                          <div>
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
            <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
              <div className="text-center flex flex-col items-center">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10 text-primary mb-6">
                  <Rocket className="h-7 w-7" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold mb-4">
                  Prêt à lancer votre projet ?
                </h2>
                <p className="text-muted-foreground mb-8">
                  Connectez-vous à votre espace client pour déposer les premières bases de votre projet et concrétisons ensemble vos idées.
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

              <div className="text-center flex flex-col items-center">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10 text-primary mb-6">
                  <MessageSquare className="h-7 w-7" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold mb-4">
                  Besoin de plus d'informations ?
                </h2>
                <p className="text-muted-foreground mb-8">
                  N'hésitez pas à me contacter pour discuter de votre projet ou poser vos questions.
                </p>
                <Dialog open={contactOpen} onOpenChange={setContactOpen}>
                  <DialogTrigger asChild>
                    <Button size="lg" variant="outline" className="gap-2" data-testid="button-contact-me">
                      <Mail className="h-4 w-4" />
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
              <p>© 2026 Innov Studio By Cyril Allegret. Tous droits réservés.</p>
              <span className="hidden md:inline">·</span>
              <a href="https://www.jesuisnumerique.fr" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors" data-testid="link-partenaire-jesuisnumerique">jesuisnumerique.fr</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
