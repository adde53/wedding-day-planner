import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  UtensilsCrossed, 
  Users, 
  Calculator,
  Salad,
  Beef,
  Fish,
  Cake,
  Coins,
  PlusCircle
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { addBudgetItem } from "@/utils/budgetUtils";
import { toast } from "sonner";

interface FoodCalculatorProps {
  confirmedGuests: number;
}

interface FoodResult {
  starters: { portions: number; kg: number };
  mainCourse: { portions: number; kg: number };
  sides: { portions: number; kg: number };
  dessert: { portions: number; kg: number };
  bread: { pieces: number };
}

interface PriceEstimate {
  low: number;
  medium: number;
  high: number;
}

export function FoodCalculator({ confirmedGuests }: FoodCalculatorProps) {
  const { user } = useAuth();
  const [guestCount, setGuestCount] = useState(confirmedGuests);
  const [mealType, setMealType] = useState<"buffet" | "sitdown" | "cocktail">("sitdown");
  const [courses, setCourses] = useState(3);
  const [results, setResults] = useState<FoodResult | null>(null);
  const [priceEstimate, setPriceEstimate] = useState<PriceEstimate | null>(null);
  const [addingToBudget, setAddingToBudget] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("sv-SE", {
      style: "currency",
      currency: "SEK",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleAddToBudget = async (priceTier: "low" | "medium" | "high") => {
    if (!user || !priceEstimate) return;
    
    setAddingToBudget(true);
    const tierNames = { low: "budget", medium: "mellan", high: "premium" };
    const amount = priceEstimate[priceTier];
    
    const success = await addBudgetItem(
      user.id,
      `Catering (${tierNames[priceTier]})`,
      "Mat & Dryck",
      amount
    );

    if (success) {
      toast.success(`${formatPrice(amount)} tillagt i budgeten för mat!`);
    } else {
      toast.error("Kunde inte lägga till i budgeten");
    }
    setAddingToBudget(false);
  };

  useEffect(() => {
    if (confirmedGuests > 0) {
      setGuestCount(confirmedGuests);
    }
  }, [confirmedGuests]);

  useEffect(() => {
    // Calculate food amounts
    const portionMultiplier = {
      buffet: 1.2,
      sitdown: 1.0,
      cocktail: 0.6,
    };

    const multiplier = portionMultiplier[mealType];

    // Starters: ~100g per person
    const starterPortions = courses >= 2 ? guestCount : 0;
    const starterKg = (starterPortions * 0.1 * multiplier);

    // Main course: ~200g meat/fish + 150g sides per person
    const mainPortions = guestCount;
    const mainKg = (mainPortions * 0.2 * multiplier);
    const sidesKg = (mainPortions * 0.15 * multiplier);

    // Dessert: ~150g per person
    const dessertPortions = courses >= 3 ? guestCount : 0;
    const dessertKg = (dessertPortions * 0.15 * multiplier);

    // Bread: 2 pieces per person
    const breadPieces = Math.ceil(guestCount * 2 * multiplier);

    setResults({
      starters: { portions: starterPortions, kg: Math.ceil(starterKg * 10) / 10 },
      mainCourse: { portions: mainPortions, kg: Math.ceil(mainKg * 10) / 10 },
      sides: { portions: mainPortions, kg: Math.ceil(sidesKg * 10) / 10 },
      dessert: { portions: dessertPortions, kg: Math.ceil(dessertKg * 10) / 10 },
      bread: { pieces: breadPieces },
    });

    // Price estimates per person (SEK)
    const pricePerPerson = {
      buffet: { low: 350, medium: 550, high: 850 },
      sitdown: { low: 500, medium: 750, high: 1200 },
      cocktail: { low: 250, medium: 400, high: 650 },
    };

    const prices = pricePerPerson[mealType];
    setPriceEstimate({
      low: prices.low * guestCount,
      medium: prices.medium * guestCount,
      high: prices.high * guestCount,
    });
  }, [guestCount, mealType, courses]);


  return (
    <div className="space-y-6">
      {/* Guest sync info */}
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

      <div className="grid md:grid-cols-2 gap-6">
        {/* Settings */}
        <div className="bg-card rounded-xl p-6 border border-border space-y-6">
          <h3 className="font-serif text-lg font-medium text-foreground flex items-center gap-2">
            <Calculator className="w-5 h-5 text-primary" />
            Inställningar
          </h3>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="food-guests">Antal gäster</Label>
              <Input
                id="food-guests"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={guestCount}
                onChange={(e) => setGuestCount(Math.max(1, parseInt(e.target.value.replace(/\D/g, '')) || 1))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="meal-type">Serveringstyp</Label>
              <Select value={mealType} onValueChange={(v: "buffet" | "sitdown" | "cocktail") => setMealType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sitdown">Sittande middag</SelectItem>
                  <SelectItem value="buffet">Buffé</SelectItem>
                  <SelectItem value="cocktail">Cocktailmingel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Antal rätter: {courses}</Label>
              <Slider
                value={[courses]}
                onValueChange={(value) => setCourses(value[0])}
                min={1}
                max={5}
                step={1}
              />
              <p className="text-xs text-muted-foreground">
                {courses === 1 && "Endast huvudrätt"}
                {courses === 2 && "Förrätt + huvudrätt"}
                {courses === 3 && "Förrätt, huvudrätt, dessert"}
                {courses === 4 && "Förrätt, mellanrätt, huvudrätt, dessert"}
                {courses === 5 && "Full meny med ostbricka"}
              </p>
            </div>
          </div>
        </div>

        {/* Food results */}
        {results && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-card rounded-xl p-6 border border-border"
          >
            <h3 className="font-serif text-lg font-medium text-foreground flex items-center gap-2 mb-6">
              <UtensilsCrossed className="w-5 h-5 text-primary" />
              Matmängder
            </h3>

            <div className="space-y-4">
              {courses >= 2 && (
                <FoodRow
                  icon={<Salad className="w-5 h-5" />}
                  label="Förrätt"
                  value={`${results.starters.kg} kg`}
                  subtext={`${results.starters.portions} portioner`}
                  color="bg-sage-light text-primary"
                />
              )}
              <FoodRow
                icon={<Beef className="w-5 h-5" />}
                label="Huvudrätt (kött/fisk)"
                value={`${results.mainCourse.kg} kg`}
                subtext={`${results.mainCourse.portions} portioner`}
                color="bg-primary/10 text-primary"
              />
              <FoodRow
                icon={<Fish className="w-5 h-5" />}
                label="Tillbehör"
                value={`${results.sides.kg} kg`}
                subtext="potatis, grönsaker, sås"
                color="bg-gold-light text-accent"
              />
              {courses >= 3 && (
                <FoodRow
                  icon={<Cake className="w-5 h-5" />}
                  label="Dessert"
                  value={`${results.dessert.kg} kg`}
                  subtext={`${results.dessert.portions} portioner`}
                  color="bg-muted text-muted-foreground"
                />
              )}
              <FoodRow
                icon={<UtensilsCrossed className="w-5 h-5" />}
                label="Bröd"
                value={`${results.bread.pieces} st`}
                subtext="baguetter/kuvertbröd"
                color="bg-taupe-light text-taupe"
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
            Prisestimat för catering
          </h3>

          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-xl bg-sage-light/50 border border-sage/30">
              <p className="text-xs text-muted-foreground mb-1">Budgetvänligt</p>
              <p className="text-2xl font-serif font-medium text-foreground">
                {formatPrice(priceEstimate.low)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                ~{formatPrice(priceEstimate.low / guestCount)}/person
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3 gap-1"
                onClick={() => handleAddToBudget("low")}
                disabled={addingToBudget}
              >
                <PlusCircle className="w-3 h-3" />
                Till budget
              </Button>
            </div>
            <div className="text-center p-4 rounded-xl bg-gold-light border border-gold/30">
              <p className="text-xs text-muted-foreground mb-1">Mellanpris</p>
              <p className="text-2xl font-serif font-medium text-foreground">
                {formatPrice(priceEstimate.medium)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                ~{formatPrice(priceEstimate.medium / guestCount)}/person
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3 gap-1"
                onClick={() => handleAddToBudget("medium")}
                disabled={addingToBudget}
              >
                <PlusCircle className="w-3 h-3" />
                Till budget
              </Button>
            </div>
            <div className="text-center p-4 rounded-xl bg-primary/10 border border-primary/30">
              <p className="text-xs text-muted-foreground mb-1">Premium</p>
              <p className="text-2xl font-serif font-medium text-foreground">
                {formatPrice(priceEstimate.high)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                ~{formatPrice(priceEstimate.high / guestCount)}/person
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3 gap-1"
                onClick={() => handleAddToBudget("high")}
                disabled={addingToBudget}
              >
                <PlusCircle className="w-3 h-3" />
                Till budget
              </Button>
            </div>
          </div>

          <p className="mt-4 text-xs text-muted-foreground text-center">
            * Priserna är uppskattningar baserade på genomsnittliga cateringpriser i Sverige
          </p>
        </motion.div>
      )}
    </div>
  );
}

function FoodRow({
  icon,
  label,
  value,
  subtext,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtext: string;
  color: string;
}) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center`}>
          {icon}
        </div>
        <div>
          <span className="font-medium text-foreground">{label}</span>
          <p className="text-xs text-muted-foreground">{subtext}</p>
        </div>
      </div>
      <span className="text-xl font-serif font-medium text-foreground">{value}</span>
    </div>
  );
}
