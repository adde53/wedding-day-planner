import { motion } from "framer-motion";
import { Heart, Menu, X, LogOut, Shield, Users, Crown } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { usePremium } from "@/hooks/usePremium";

interface DashboardHeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  guestCount?: { confirmed: number; total: number };
}

const tabs = [
  { id: "overview", label: "Översikt", premium: false },
  { id: "guests", label: "Gästlista", premium: false },
  { id: "tables", label: "Bord", premium: true },
  { id: "checklist", label: "Checklista", premium: false },
  { id: "budget", label: "Budget", premium: false },
  { id: "timeline", label: "Tidslinje", premium: false },
  { id: "food", label: "Mat", premium: true },
  { id: "drinks", label: "Drycker", premium: true },
  { id: "settings", label: "Inställningar", premium: false },
];

interface DashboardHeaderPropsExtended extends DashboardHeaderProps {
  onPremiumClick?: (featureName: string) => void;
  isPremium?: boolean;
}

export function DashboardHeader({ activeTab, onTabChange, guestCount, onPremiumClick, isPremium }: DashboardHeaderPropsExtended) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { signOut, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleTabClick = (tab: typeof tabs[0]) => {
    if (tab.premium && !isPremium) {
      onPremiumClick?.(tab.label);
    } else {
      onTabChange(tab.id);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-background/70 backdrop-blur-lg border-b border-border/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-md shadow-primary/20">
                <Heart className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="font-serif text-xl font-medium text-foreground">
                MittBröllop.se
              </h1>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5",
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
                )}
              >
                {tab.label}
                {tab.premium && !isPremium && (
                  <Crown className="w-3.5 h-3.5 text-gold" />
                )}
              </button>
            ))}
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-2">
            {isAdmin && (
              <Link
                to="/admin"
                className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              >
                <Shield className="w-5 h-5" />
              </Link>
            )}
            <button
              onClick={handleSignOut}
              className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5 text-foreground" />
            ) : (
              <Menu className="w-5 h-5 text-foreground" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden py-4 border-t border-border"
          >
            <div className="flex flex-col gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    handleTabClick(tab);
                    setMobileMenuOpen(false);
                  }}
                  className={cn(
                    "px-4 py-3 rounded-lg text-sm font-medium transition-all text-left flex items-center justify-between",
                    activeTab === tab.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  {tab.label}
                  {tab.premium && !isPremium && (
                    <Crown className="w-3 h-3 text-gold" />
                  )}
                </button>
              ))}
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted text-left flex items-center gap-2"
                >
                  <Shield className="w-4 h-4" />
                  Admin
                </Link>
              )}
              <button
                onClick={handleSignOut}
                className="px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted text-left flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logga ut
              </button>
            </div>
          </motion.nav>
        )}
      </div>
    </header>
  );
}
