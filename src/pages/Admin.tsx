import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Heart, Users, Shield, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Admin() {
  const { user, isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      navigate("/dashboard");
    }
  }, [user, isAdmin, isLoading, navigate]);

  if (isLoading || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Laddar...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-subtle">
      <header className="bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-sage-gradient flex items-center justify-center shadow-sm">
                  <Heart className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="font-serif text-xl font-medium text-foreground">
                  Admin Panel
                </span>
              </Link>
            </div>
            <Link to="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Tillbaka
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="bg-card rounded-2xl p-8 shadow-sm border border-border">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-xl bg-sage-light flex items-center justify-center">
                <Shield className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h1 className="font-serif text-2xl font-medium text-foreground">
                  Administratörspanel
                </h1>
                <p className="text-muted-foreground">
                  Hantera användare och inställningar
                </p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 rounded-xl bg-muted/30 border border-border">
                <Users className="w-8 h-8 text-primary mb-4" />
                <h3 className="font-serif text-lg font-medium text-foreground mb-2">
                  Användarhantering
                </h3>
                <p className="text-sm text-muted-foreground">
                  Se och hantera alla registrerade användare.
                </p>
              </div>
              
              <div className="p-6 rounded-xl bg-muted/30 border border-border">
                <Shield className="w-8 h-8 text-gold mb-4" />
                <h3 className="font-serif text-lg font-medium text-foreground mb-2">
                  Rollhantering
                </h3>
                <p className="text-sm text-muted-foreground">
                  Tilldela och hantera användarroller.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
