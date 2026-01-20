import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Wine, Beer, GlassWater, Sparkles, Users, Calculator, Calendar, Coins } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { sv } from "date-fns/locale";

interface DrinkCalculatorProps {
  confirmedGuests: number;
  weddingDate?: Date;
}

interface DrinkResult {
  champagne: number;
  wine: number;
  beer: number;
  softDrinks: number;
  water: number;
}

interface PriceEstimate {
  low: number;
  medium: number;
  high: number;
}

// Price per unit in SEK
const prices = {
  champagne: { low: 80, medium: 150, high: 350 },
  wine: { low: 60, medium: 120, high: 250 },
  beer: { low: 12, medium: 20, high: 35 },
  softDrinks: { low: 15, medium: 25, high: 40 },
  water: { low: 10, medium: 20, high: 35 },
};

export function DrinkCalculator({ confirmedGuests, weddingDate }: DrinkCalculatorProps) {
  const [guestCount, setGuestCount] = useState(confirmedGuests);
  const [partyDuration, setPartyDuration] = useState(6);
  const [drinkingLevel, setDrinkingLevel] = useState<"light" | "moderate" | "heavy">("moderate");
  const [nonDrinkerPercent, setNonDrinkerPercent] = useState(20);
  const [results, setResults] = useState<DrinkResult | null>(null);
  const [priceEstimate, setPriceEstimate] = useState<PriceEstimate | null>(null);

  // Calculate days until wedding
  const today = new Date();
  const daysUntilWedding = weddingDate 
    ? Math.ceil((weddingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  // Sync with confirmed guests
  useEffect(() => {
    if (confirmedGuests > 0) {
      setGuestCount(confirmedGuests);
    }
  }, [confirmedGuests]);

  // Calculate drinks and prices
  useEffect(() => {
    const drinkers = Math.ceil(guestCount * (1 - nonDrinkerPercent / 100));
    const nonDrinkers = guestCount - drinkers;

    const drinksPerHour = {
      light: 0.75,
      moderate: 1,
      heavy: 1.5,
    };

    const totalDrinksPerDrinker = partyDuration * drinksPerHour[drinkingLevel];

    const champagnePerPerson = 1;
    const remainingDrinks = Math.max(0, totalDrinksPerDrinker - 1);
    const winePerPerson = remainingDrinks * 0.6;
    const beerPerPerson = remainingDrinks * 0.4;

    const champagneBottles = Math.ceil((drinkers * champagnePerPerson) / 6);
    const wineBottles = Math.ceil((drinkers * winePerPerson) / 5);
    const beerCans = Math.ceil(drinkers * beerPerPerson);
    const softDrinkBottles = Math.ceil((nonDrinkers * 3) / 6);
    const waterBottles = Math.ceil((guestCount * 0.5) / 1.5);

    const drinkResults = {
      champagne: champagneBottles,
      wine: wineBottles,
      beer: beerCans,
      softDrinks: softDrinkBottles,
      water: waterBottles,
    };

    setResults(drinkResults);

    // Calculate price estimates
    const calcPrice = (tier: "low" | "medium" | "high") => {
      return (
        drinkResults.champagne * prices.champagne[tier] +
        drinkResults.wine * prices.wine[tier] +
        drinkResults.beer * prices.beer[tier] +
        drinkResults.softDrinks * prices.softDrinks[tier] +
        drinkResults.water * prices.water[tier]
      );
    };

    setPriceEstimate({
      low: calcPrice("low"),
      medium: calcPrice("medium"),
      high: calcPrice("high"),
    });
  }, [guestCount, partyDuration, drinkingLevel, nonDrinkerPercent]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("sv-SE", {
      style: "currency",
      currency: "SEK",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="space-y-6">
      {/* Countdown & guest info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {weddingDate && daysUntilWedding !== null && daysUntilWedding > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gold-light rounded-xl p-4 flex items-center gap-3"
          >
            <Calendar className="w-5 h-5 text-accent" />
            <div>
              <p className="text-sm font-medium text-foreground">
                {daysUntilWedding} dagar kvar
              </p>
              <p className="text-xs text-muted-foreground">
                {format(weddingDate, "d MMMM yyyy", { locale: sv })}
              </p>
            </div>
          </motion.div>
        )}
        {confirmedGuests > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-primary/10 rounded-xl p-4 flex items-center gap-3"
          >
            <Users className="w-5 h-5 text-primary" />
            <p className="text-sm text-foreground">
              <span className="font-medium">{confirmedGuests} bekräftade gäster</span> från er gästlista
            </p>
          </motion.div>
        )}
      </div>

      {/* Calculator inputs */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl p-6 border border-border space-y-6">
          <h3 className="font-serif text-lg font-medium text-foreground flex items-center gap-2">
            <Calculator className="w-5 h-5 text-primary" />
            Inställningar
          </h3>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="guests">Antal gäster</Label>
              <Input
                id="guests"
                type="number"
                min={1}
                value={guestCount}
                onChange={(e) => setGuestCount(Math.max(1, parseInt(e.target.value) || 1))}
              />
            </div>

            <div className="space-y-2">
              <Label>Festens längd: {partyDuration} timmar</Label>
              <Slider
                value={[partyDuration]}
                onValueChange={(value) => setPartyDuration(value[0])}
                min={2}
                max={12}
                step={1}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="drinking-level">Dryckesnivå</Label>
              <Select value={drinkingLevel} onValueChange={(v: "light" | "moderate" | "heavy") => setDrinkingLevel(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Lätt (0.75 drinkar/timme)</SelectItem>
                  <SelectItem value="moderate">Måttligt (1 drink/timme)</SelectItem>
                  <SelectItem value="heavy">Generöst (1.5 drinkar/timme)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Icke-drickande gäster: {nonDrinkerPercent}%</Label>
              <Slider
                value={[nonDrinkerPercent]}
                onValueChange={(value) => setNonDrinkerPercent(value[0])}
                min={0}
                max={100}
                step={5}
              />
            </div>
          </div>
        </div>

        {/* Results */}
        {results && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-card rounded-xl p-6 border border-border"
          >
            <h3 className="font-serif text-lg font-medium text-foreground flex items-center gap-2 mb-6">
              <Sparkles className="w-5 h-5 text-gold" />
              Rekommendation
            </h3>

            <div className="space-y-4">
              <DrinkRow
                icon={<Sparkles className="w-5 h-5" />}
                label="Champagne/Bubbel"
                value={results.champagne}
                unit="flaskor"
                color="bg-gold-light text-accent"
              />
              <DrinkRow
                icon={<Wine className="w-5 h-5" />}
                label="Vin"
                value={results.wine}
                unit="flaskor"
                color="bg-primary/10 text-primary"
              />
              <DrinkRow
                icon={<Beer className="w-5 h-5" />}
                label="Öl"
                value={results.beer}
                unit="burkar/flaskor"
                color="bg-gold-light text-accent"
              />
              <DrinkRow
                icon={<GlassWater className="w-5 h-5" />}
                label="Läsk (1.5L)"
                value={results.softDrinks}
                unit="flaskor"
                color="bg-muted text-muted-foreground"
              />
              <DrinkRow
                icon={<GlassWater className="w-5 h-5" />}
                label="Vatten (1.5L)"
                value={results.water}
                unit="flaskor"
                color="bg-muted text-muted-foreground"
              />
            </div>
          </motion.div>
        )}
      </div>

      {/* Price estimates */}
      {priceEstimate && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl p-6 border border-border"
        >
          <h3 className="font-serif text-lg font-medium text-foreground flex items-center gap-2 mb-6">
            <Coins className="w-5 h-5 text-gold" />
            Prisestimat
          </h3>

          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-xl bg-sage-light/50 border border-sage/30">
              <p className="text-xs text-muted-foreground mb-1">Budgetvänligt</p>
              <p className="text-2xl font-serif font-medium text-foreground">
                {formatPrice(priceEstimate.low)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Systembolaget basic</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-gold-light border border-gold/30">
              <p className="text-xs text-muted-foreground mb-1">Mellanpris</p>
              <p className="text-2xl font-serif font-medium text-foreground">
                {formatPrice(priceEstimate.medium)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Bra kvalitet</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-primary/10 border border-primary/30">
              <p className="text-xs text-muted-foreground mb-1">Premium</p>
              <p className="text-2xl font-serif font-medium text-foreground">
                {formatPrice(priceEstimate.high)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Lyxigare val</p>
            </div>
          </div>

          <p className="mt-4 text-xs text-muted-foreground text-center">
            * Priserna är uppskattningar baserade på Systembolagets priser
          </p>
        </motion.div>
      )}
    </div>
  );
}

function DrinkRow({
  icon,
  label,
  value,
  unit,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  unit: string;
  color: string;
}) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center`}>
          {icon}
        </div>
        <span className="font-medium text-foreground">{label}</span>
      </div>
      <div className="text-right">
        <span className="text-xl font-serif font-medium text-foreground">{value}</span>
        <span className="text-sm text-muted-foreground ml-1">{unit}</span>
      </div>
    </div>
  );
}
