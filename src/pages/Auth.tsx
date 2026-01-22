import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Heart, Mail, Lock, User, ArrowRight, Sparkles, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function Auth() {
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp, user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  // Get redirect tab from URL params
  const redirectTab = searchParams.get("redirect");
  
  const getRedirectUrl = () => {
    if (redirectTab) {
      return `/dashboard?tab=${redirectTab}`;
    }
    return "/dashboard";
  };

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      navigate(getRedirectUrl());
    }
  }, [user, authLoading, navigate, redirectTab]);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`,
      });
      if (error) throw error;
      toast({
        title: "E-post skickad!",
        description: "Kolla din inkorg för att återställa lösenordet.",
      });
      setMode("login");
    } catch (error: any) {
      toast({
        title: "Något gick fel",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (mode === "login") {
        const { error } = await signIn(email, password);
        if (error) throw error;
        toast({
          title: "Välkommen tillbaka!",
          description: "Du är nu inloggad.",
        });
        navigate(getRedirectUrl());
      } else if (mode === "signup") {
        const { error } = await signUp(email, password, fullName);
        if (error) throw error;
        toast({
          title: "Konto skapat!",
          description: "Välkommen till MittBröllop.se.",
        });
        navigate(getRedirectUrl());
      }
    } catch (error: any) {
      toast({
        title: "Något gick fel",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getHeading = () => {
    switch (mode) {
      case "login":
        return { title: "Välkommen tillbaka", subtitle: "Logga in för att fortsätta planera" };
      case "signup":
        return { title: "Skapa ditt konto", subtitle: "Börja planera ert drömbröllop idag" };
      case "forgot":
        return { title: "Glömt lösenord?", subtitle: "Ange din e-post så skickar vi en återställningslänk" };
    }
  };

  const heading = getHeading();

  return (
    <div className="min-h-screen bg-subtle flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-sage-gradient flex items-center justify-center shadow-md">
              <Heart className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="font-serif text-2xl font-medium text-foreground">
              MittBröllop.se
            </h1>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2 className="font-serif text-3xl font-medium text-foreground mb-2">
              {heading.title}
            </h2>
            <p className="text-muted-foreground">
              {heading.subtitle}
            </p>
          </div>

          {/* Forgot Password Form */}
          {mode === "forgot" ? (
            <form onSubmit={handleForgotPassword} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground font-medium">
                  E-postadress
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="din@email.se"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-11 h-12 bg-card border-border focus:border-primary"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-md"
              >
                {isLoading ? "Skickar..." : "Skicka återställningslänk"}
              </Button>

              <button
                type="button"
                onClick={() => setMode("login")}
                className="w-full flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Tillbaka till inloggning
              </button>
            </form>
          ) : (
            <>
              {/* Login/Signup Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {mode === "signup" && (
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-foreground font-medium">
                      Ditt namn
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="Anna Andersson"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="pl-11 h-12 bg-card border-border focus:border-primary"
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground font-medium">
                    E-postadress
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="din@email.se"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-11 h-12 bg-card border-border focus:border-primary"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-foreground font-medium">
                      Lösenord
                    </Label>
                    {mode === "login" && (
                      <button
                        type="button"
                        onClick={() => setMode("forgot")}
                        className="text-sm text-primary hover:underline"
                      >
                        Glömt lösenord?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-11 h-12 bg-card border-border focus:border-primary"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-md"
                >
                  {isLoading ? (
                    "Vänta..."
                  ) : (
                    <>
                      {mode === "login" ? "Logga in" : "Skapa konto"}
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>

              {/* Toggle */}
              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => setMode(mode === "login" ? "signup" : "login")}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {mode === "login" ? (
                    <>
                      Har du inget konto?{" "}
                      <span className="text-primary font-medium">Skapa ett här</span>
                    </>
                  ) : (
                    <>
                      Har du redan ett konto?{" "}
                      <span className="text-primary font-medium">Logga in</span>
                    </>
                  )}
                </button>
              </div>
            </>
          )}

          {/* Free features note */}
          <div className="mt-8 p-4 rounded-xl bg-sage-light border border-sage/20">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  Gratis att komma igång
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Checklista, budget och tidslinje ingår utan kostnad.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right side - Visual */}
      <div className="hidden lg:flex flex-1 items-center justify-center bg-sage-gradient p-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-lg text-center"
        >
          <div className="w-20 h-20 rounded-2xl bg-primary-foreground/20 flex items-center justify-center mx-auto mb-8">
            <Heart className="w-10 h-10 text-primary-foreground" />
          </div>
          <h2 className="font-serif text-4xl font-medium text-primary-foreground mb-4">
            Planera med glädje
          </h2>
          <p className="text-primary-foreground/80 text-lg leading-relaxed">
            Håll koll på varje detalj inför er stora dag. 
            Från budget till gästlista – allt på ett ställe.
          </p>
          
          <div className="mt-12 grid grid-cols-3 gap-6">
            {[
              { number: "16+", label: "Uppgifter" },
              { number: "100%", label: "Gratis start" },
              { number: "∞", label: "Möjligheter" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
                className="text-center"
              >
                <p className="text-3xl font-serif font-medium text-primary-foreground">
                  {stat.number}
                </p>
                <p className="text-sm text-primary-foreground/70 mt-1">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
