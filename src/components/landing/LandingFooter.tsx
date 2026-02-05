import { Link } from "react-router-dom";
import { Heart, MessageCircle } from "lucide-react";
import { SupportDialog } from "@/components/SupportDialog";

export function LandingFooter() {
  return (
    <footer className="bg-card/50 border-t border-border py-10 sm:py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-serif text-xl font-medium text-foreground">
              MittBröllop.se
            </span>
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-4 sm:gap-6" aria-label="Sidfot">
            <Link
              to="/guider"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Guider & Tips
            </Link>
            <Link
              to="/brollopsinfo"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Bröllopsinfo
            </Link>
            <a
              href="#funktioner"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Funktioner
            </a>
            <a
              href="#faq"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Vanliga frågor
            </a>
            <SupportDialog>
              <button className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
                <MessageCircle className="w-4 h-4" />
                Support
              </button>
            </SupportDialog>
          </nav>
          <p className="text-xs sm:text-sm text-muted-foreground text-center md:text-left">
            © 2025 MittBröllop.se
          </p>
        </div>
      </div>
    </footer>
  );
}
