import { Crown, Clock } from "lucide-react";
import { motion } from "framer-motion";

interface TrialBannerProps {
  daysLeft: number;
  onUpgradeClick: () => void;
}

export function TrialBanner({ daysLeft, onUpgradeClick }: TrialBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-gold/20 via-gold/10 to-gold/20 border-b border-gold/30"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2">
        <div className="flex items-center justify-center gap-3 text-sm">
          <div className="flex items-center gap-2 text-foreground">
            <Clock className="w-4 h-4 text-gold" />
            <span>
              <strong>{daysLeft} {daysLeft === 1 ? 'dag' : 'dagar'}</strong> kvar av din gratis provperiod
            </span>
          </div>
          <button
            onClick={onUpgradeClick}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold text-white text-xs font-medium hover:bg-gold/90 transition-colors"
          >
            <Crown className="w-3 h-3" />
            Uppgradera nu
          </button>
        </div>
      </div>
    </motion.div>
  );
}
