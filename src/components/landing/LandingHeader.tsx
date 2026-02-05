import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Heart, Lightbulb, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

export function LandingHeader() {
  const auth = useAuth();
  const { user } = auth;

  const handleLogout = async () => {
    try {
      const fn = (auth as any).logout ?? (auth as any).signOut ?? (auth as any).logOut;
      if (typeof fn === "function") await fn();
    } catch (e) {
      console.error("Logout failed", e);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
      <div className="max-w-6xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 sm:gap-3"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-md shadow-primary/20">
              <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
            </div>
            <h1 className="font-serif text-base sm:text-xl font-medium text-foreground">
              MittBröllop
            </h1>
          </motion.div>
          <nav className="flex items-center gap-1 sm:gap-2">
            <Link to="/guider">
              <Button variant="ghost" size="sm" className="gap-1 text-xs sm:text-sm px-2 sm:px-3">
                <Lightbulb className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Guider</span>
              </Button>
            </Link>
            {user ? (
              <>
                <Link to="/dashboard">
                  <Button size="sm" className="bg-primary text-xs sm:text-sm px-2.5 sm:px-4">
                    <span className="hidden xs:inline">Dashboard</span>
                    <span className="xs:hidden">Planera</span>
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" className="px-2" onClick={handleLogout}>
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <>
                <Link to="/auth" className="hidden xs:block">
                  <Button variant="ghost" size="sm" className="text-xs sm:text-sm px-2 sm:px-3">
                    Logga in
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button size="sm" className="bg-primary text-xs sm:text-sm px-2.5 sm:px-4">
                    <span className="hidden xs:inline">Kom igång</span>
                    <span className="xs:hidden">Skapa konto</span>
                  </Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
