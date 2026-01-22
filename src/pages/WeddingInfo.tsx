import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import {
  Heart,
  Calculator,
  Users,
  MapPin,
  Cake,
  Camera,
  Music,
  Flower2,
  Car,
  Utensils,
  Wine,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  PiggyBank,
  Calendar,
  Globe,
  ArrowRight,
  Lightbulb
} from "lucide-react";

const WeddingInfo = () => {
  const { user } = useAuth();

  const costCategories = [
    {
      icon: MapPin,
      title: "Lokal & Venue",
      avgCost: "30 000 - 80 000 kr",
      percentage: "25-35%",
      description: "Lokalkostnaden är ofta den största utgiften. Priset varierar kraftigt beroende på säsong, dag och typ av lokal.",
      tips: [
        "Boka 12-18 månader i förväg för populära datum",
        "Fredagar och söndagar är ofta billigare än lördagar",
        "Vinter- och vårbröllopp kan ge betydande rabatter",
        "Fråga om all-inclusive-paket som kan spara pengar"
      ],
      details: "En typisk festlokal i Stockholm kostar 15 000-50 000 kr, medan lantliga gårdar kan kosta 20 000-100 000 kr beroende på storlek och faciliteter."
    },
    {
      icon: Utensils,
      title: "Mat & Catering",
      avgCost: "400 - 1 200 kr/person",
      percentage: "20-30%",
      description: "Matkostnaden beror på antal rätter, kvalitet på råvaror och typ av servering.",
      tips: [
        "Bufféer är ofta billigare än sittande middagar",
        "Välj säsongens råvaror för bättre priser",
        "Be om smakprovning innan ni bokar",
        "Räkna med 10% extra för personalens mat"
      ],
      details: "En trerätters sittande middag kostar i snitt 600-900 kr per person. Lägg till 150-300 kr för fördrinks och kvällsmat."
    },
    {
      icon: Wine,
      title: "Dryck & Alkohol",
      avgCost: "200 - 500 kr/person",
      percentage: "8-12%",
      description: "Dryckkostnaden varierar mycket beroende på gästernas vanor och typ av dryck.",
      tips: [
        "Köp dryck själva om lokalen tillåter",
        "Välj husviner istället för specifika märken",
        "Räkna med 1 flaska vin per 2 personer till middagen",
        "Erbjud alkoholfria alternativ för alla"
      ],
      details: "Budget: 200 kr/person (öl, vin, läsk). Medium: 350 kr/person (cocktails, bättre viner). Premium: 500+ kr/person (champagne, premium spirits)."
    },
    {
      icon: Camera,
      title: "Fotograf & Video",
      avgCost: "15 000 - 40 000 kr",
      percentage: "8-12%",
      description: "En av de viktigaste investeringarna - bilderna är det som finns kvar efter bröllopet.",
      tips: [
        "Se igenom fotografens tidigare arbeten noggrant",
        "Fråga hur många redigerade bilder som ingår",
        "Överväg om ni vill ha video också",
        "Boka populära fotografer 12+ månader i förväg"
      ],
      details: "Halvdagsfotografering (4-6 timmar): 12 000-20 000 kr. Heldagsfotografering: 20 000-35 000 kr. Videograf: 15 000-30 000 kr extra."
    },
    {
      icon: Flower2,
      title: "Blommor & Dekoration",
      avgCost: "8 000 - 25 000 kr",
      percentage: "5-10%",
      description: "Buketter, bordsdekoration, ceremonibågar och övrig blomsterarrangemang.",
      tips: [
        "Välj säsongens blommor för bättre priser",
        "Återanvänd ceremonidekorationer på festen",
        "Överväg torkade blommor eller grönt",
        "DIY-dekoration kan spara mycket pengar"
      ],
      details: "Brudbukett: 1 500-4 000 kr. Brudgummens corsage: 200-400 kr. Bordsdekoration: 300-800 kr per bord. Ceremoniblommor: 3 000-8 000 kr."
    },
    {
      icon: Music,
      title: "Musik & Underhållning",
      avgCost: "10 000 - 35 000 kr",
      percentage: "5-10%",
      description: "DJ, liveband, eller musiker för ceremoni och fest.",
      tips: [
        "DJ är generellt billigare än liveband",
        "Be om att höra demo eller se live",
        "Diskutera låtval och stil i förväg",
        "Boka duktiga band 8-12 månader i förväg"
      ],
      details: "DJ (kväll): 8 000-15 000 kr. Liveband (3-5 pers): 20 000-45 000 kr. Ceremonimusiker: 3 000-8 000 kr. Kvällsunderhållning: 5 000-15 000 kr."
    },
    {
      icon: Cake,
      title: "Bröllopstårta",
      avgCost: "3 000 - 12 000 kr",
      percentage: "2-4%",
      description: "Traditionell bröllopstårta eller alternativ som dessertbord.",
      tips: [
        "Räkna med 1 bit per gäst + lite extra",
        "Fondanttårtor är ofta dyrare",
        "Överväg en mindre tårta + dessertbord",
        "Beställ 2-3 månader i förväg"
      ],
      details: "Enkel tårta (50 pers): 3 000-5 000 kr. Designtårta (50 pers): 6 000-10 000 kr. Dessertbord (50 pers): 4 000-8 000 kr."
    },
    {
      icon: Car,
      title: "Transport",
      avgCost: "3 000 - 15 000 kr",
      percentage: "2-5%",
      description: "Transport för brudpar och eventuellt gäster.",
      tips: [
        "Vintage-bilar kostar mer än moderna",
        "Samordna gästtransport för att spara",
        "Överväg att hyra en minibuss",
        "Kolla avstånd mellan vigsel och fest"
      ],
      details: "Vintage-bil med chaufför: 5 000-12 000 kr. Modern lyxbil: 3 000-6 000 kr. Gästbuss: 4 000-10 000 kr."
    }
  ];

  const budgetTiers = [
    {
      title: "Budgetbröllop",
      range: "50 000 - 100 000 kr",
      guests: "30-50 gäster",
      description: "Ett intimt och personligt bröllop med fokus på det viktigaste",
      features: [
        "Enklare lokal eller hemma hos",
        "Buffé eller grillmiddag",
        "DJ eller Spotify-lista",
        "Vänner som fotografer",
        "DIY-dekoration"
      ]
    },
    {
      title: "Mellanbröllop",
      range: "150 000 - 250 000 kr",
      guests: "60-100 gäster",
      description: "Ett traditionellt bröllop med de flesta önskade elementen",
      features: [
        "Trevlig lokal med helpension",
        "Sittande trerättersmiddag",
        "Professionell DJ",
        "Professionell fotograf",
        "Floristblommor"
      ]
    },
    {
      title: "Lyxbröllop",
      range: "300 000 - 500 000+ kr",
      guests: "100-150+ gäster",
      description: "Ett storslaget bröllop utan kompromisser",
      features: [
        "Exklusiv lokal eller destination",
        "Gourmetmiddag med vinpaket",
        "Liveband + DJ",
        "Foto + video hela dagen",
        "Fullständig eventplanering"
      ]
    }
  ];

  const weddingStats = [
    { label: "Genomsnittlig kostnad i Sverige", value: "200 000 kr" },
    { label: "Vanligaste antalet gäster", value: "70-80 personer" },
    { label: "Populäraste månaden", value: "Augusti" },
    { label: "Genomsnittlig planeringstid", value: "12-18 månader" },
    { label: "Andel som går över budget", value: "45%" },
    { label: "Vanligaste dagen", value: "Lördag" }
  ];

  const checklistCategories = [
    {
      timeframe: "12+ månader innan",
      tasks: [
        "Sätt budget och börja spara",
        "Välj datum och säsong",
        "Boka lokal/venue",
        "Boka fotograf",
        "Börja gästlistan"
      ]
    },
    {
      timeframe: "9-12 månader innan",
      tasks: [
        "Boka catering/mat",
        "Boka musik/underhållning",
        "Välj bröllopskläder",
        "Boka vigselförrättare",
        "Skicka save-the-dates"
      ]
    },
    {
      timeframe: "6-9 månader innan",
      tasks: [
        "Boka florist",
        "Beställ tårta",
        "Planera smekmånad",
        "Boka transport",
        "Välj vigselringar"
      ]
    },
    {
      timeframe: "3-6 månader innan",
      tasks: [
        "Skicka inbjudningar",
        "Planera bordsplacering",
        "Boka frisör och makeup",
        "Ordna övernattning för gäster",
        "Planera ceremonin"
      ]
    },
    {
      timeframe: "1-3 månader innan",
      tasks: [
        "Slutför gästlistan",
        "Provsmaka maten",
        "Hämta ut bröllopskläder",
        "Skriv tal och löften",
        "Gör detaljschema"
      ]
    },
    {
      timeframe: "Sista veckan",
      tasks: [
        "Bekräfta alla bokningar",
        "Packa för smekmånaden",
        "Förbered kontanter för dricks",
        "Delegera uppgifter",
        "Vila och njut!"
      ]
    }
  ];

  const websiteFeatures = [
    {
      title: "Digital OSA/RSVP",
      description: "Låt gäster svara på inbjudan digitalt. Samla enkelt in kostpreferenser, allergier och +1-information."
    },
    {
      title: "Praktisk information",
      description: "Dela vägbeskrivningar, parkeringsinfo, klädkod och hotellförslag på ett ställe."
    },
    {
      title: "Bildgalleri",
      description: "Visa förlovningsbilder och samla bröllopsgästernas foton efter festen."
    },
    {
      title: "Vårt kärlekshistoria",
      description: "Berätta er historia för gästerna - från första dejten till förlovningen."
    },
    {
      title: "Schema för dagen",
      description: "Ge gästerna en tydlig överblick över bröllopsdagens program."
    },
    {
      title: "Önskelista-länkar",
      description: "Länka till era önskelistor så gästerna enkelt kan hitta presentidéer."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-rose-50/30 to-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <Heart className="w-6 h-6 text-primary" fill="currentColor" />
              <span className="font-serif text-xl font-medium text-foreground">
                MittBröllop.se
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/guider" className="hidden sm:block">
                <Button variant="outline" className="border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 hover:border-primary/50 gap-2">
                  <Lightbulb className="w-4 h-4" />
                  Guider & Tips
                </Button>
              </Link>
              {user ? (
                <Link to="/dashboard">
                  <Button className="bg-primary hover:bg-primary/90">
                    Min planering
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/auth" className="hidden sm:block">
                    <Button variant="ghost">Logga in</Button>
                  </Link>
                  <Link to="/auth">
                    <Button className="bg-primary hover:bg-primary/90">
                      Kom igång gratis
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Calculator className="w-4 h-4" />
              Komplett guide till bröllopskostnader
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-foreground mb-6 leading-tight">
              Vad kostar ett bröllop i Sverige 2026?
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Allt du behöver veta om bröllopskostnader, budget, planering och hur du skapar ditt drömbroröllop utan att spräcka plånboken.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-12 px-4 bg-card/50">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
          >
            {weddingStats.map((stat, index) => (
              <Card key={index} className="text-center border-primary/10 bg-background/80">
                <CardContent className="pt-6">
                  <p className="text-2xl font-bold text-primary mb-1">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Budget Tiers */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-serif font-medium text-foreground mb-4">
              Tre vanliga budgetnivåer
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Bröllop finns i alla storlekar. Här är en översikt över vad du kan förvänta dig i olika prisklasser.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {budgetTiers.map((tier, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`h-full border-primary/10 ${index === 1 ? 'ring-2 ring-primary/30 shadow-lg' : ''}`}>
                  <CardHeader>
                    {index === 1 && (
                      <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full w-fit mb-2">
                        Vanligast
                      </span>
                    )}
                    <CardTitle className="font-serif text-xl">{tier.title}</CardTitle>
                    <p className="text-2xl font-bold text-primary">{tier.range}</p>
                    <p className="text-sm text-muted-foreground">{tier.guests}</p>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{tier.description}</p>
                    <ul className="space-y-2">
                      {tier.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Cost Categories */}
      <section className="py-16 px-4 bg-card/30">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-serif font-medium text-foreground mb-4">
              Detaljerad kostnadsguide
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Utforska varje kategori för att förstå vad som påverkar kostnaderna och hur du kan spara pengar.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {costCategories.map((category, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="h-full border-primary/10 hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <category.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="font-serif text-lg mb-1">{category.title}</CardTitle>
                        <div className="flex flex-wrap gap-2 text-sm">
                          <span className="text-primary font-semibold">{category.avgCost}</span>
                          <span className="text-muted-foreground">({category.percentage} av budget)</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground text-sm">{category.description}</p>
                    <p className="text-sm bg-muted/50 p-3 rounded-lg">{category.details}</p>
                    <div>
                      <p className="text-sm font-medium mb-2 flex items-center gap-2">
                        <PiggyBank className="w-4 h-4 text-primary" />
                        Spartips:
                      </p>
                      <ul className="space-y-1">
                        {category.tips.map((tip, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-primary">•</span>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Checklist Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-serif font-medium text-foreground mb-4">
              Komplett bröllopschecklista
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              En tidslinje med allt du behöver göra från förlovning till bröllopsdag.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {checklistCategories.map((category, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full border-primary/10">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-primary" />
                      <CardTitle className="font-serif text-lg">{category.timeframe}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {category.tasks.map((task, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{task}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link to={user ? "/dashboard?tab=checklist" : "/auth?redirect=checklist"}>
              <Button size="lg" className="gap-2">
                Använd vår interaktiva checklista
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Guest Count Guide */}
      <section className="py-16 px-4 bg-card/30">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Card className="border-primary/10">
              <CardHeader className="text-center">
                <Users className="w-12 h-12 text-primary mx-auto mb-4" />
                <CardTitle className="font-serif text-2xl md:text-3xl">
                  Hur många gäster ska ni bjuda?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-muted-foreground text-center max-w-2xl mx-auto">
                  Antalet gäster påverkar nästan alla kostnader. Här är några saker att tänka på när ni sätter gästlistan.
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-medium flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      Kostnad per gäst
                    </h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• <strong>Mat & dryck:</strong> 600-1 500 kr/person</li>
                      <li>• <strong>Inbjudningar:</strong> 30-100 kr/person</li>
                      <li>• <strong>Bordsdekoration:</strong> 50-150 kr/person</li>
                      <li>• <strong>Gåvor till gäster:</strong> 30-100 kr/person</li>
                      <li>• <strong>Totalt rörligt:</strong> ~700-1 800 kr/person</li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium flex items-center gap-2">
                      <PiggyBank className="w-5 h-5 text-primary" />
                      Exempel på besparingar
                    </h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• 100 → 80 gäster: Spara ~15 000-35 000 kr</li>
                      <li>• 80 → 60 gäster: Spara ~15 000-35 000 kr</li>
                      <li>• 60 → 40 gäster: Spara ~15 000-35 000 kr</li>
                      <li>• Överväg ett intimt bröllop för stora besparingar</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">💡 Tips för gästlistan</h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Räkna med 10-15% avbokningar när ni planerar</li>
                    <li>• Överväg en A- och B-lista om ni har platsbegränsning</li>
                    <li>• Plus-ones kan snabbt fördubbla gästantalet</li>
                    <li>• Barn tar ofta halva portioner men full plats</li>
                  </ul>
                </div>

                <div className="text-center">
                  <Link to={user ? "/dashboard?tab=guests" : "/auth?redirect=guests"}>
                    <Button variant="outline" className="gap-2">
                      Hantera din gästlista
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Wedding Website Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Globe className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-3xl md:text-4xl font-serif font-medium text-foreground mb-4">
              Skapa en bröllopshemsida
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              En digital bröllopshemsida gör det enkelt för gästerna att hitta information och OSA. 
              Dessutom sparar du pengar på trycksaker!
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {websiteFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full border-primary/10 hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="font-serif text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <Link to={user ? "/dashboard?tab=website" : "/auth?redirect=website"}>
              <Button size="lg" className="gap-2">
                <Sparkles className="w-4 h-4" />
                Skapa din bröllopshemsida
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Calculator Promo */}
      <section className="py-16 px-4 bg-gradient-to-br from-primary/5 via-primary/10 to-rose-100/30">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Calculator className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-3xl md:text-4xl font-serif font-medium text-foreground mb-4">
              Beräkna din bröllopskostnad
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              Använd våra smarta kalkylatorer för att beräkna mat, dryck och få en överblick 
              över din totala bröllopsbudget.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={user ? "/dashboard?tab=calculator" : "/auth?redirect=calculator"}>
                <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto">
                  Dryckeskalkylator
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to={user ? "/dashboard?tab=budget" : "/auth?redirect=budget"}>
                <Button size="lg" className="gap-2 w-full sm:w-auto">
                  Budgetverktyget
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Heart className="w-12 h-12 text-primary mx-auto mb-6" fill="currentColor" />
            <h2 className="text-3xl md:text-4xl font-serif font-medium text-foreground mb-4">
              Redo att börja planera?
            </h2>
            <p className="text-muted-foreground mb-8">
              Skapa ett gratis konto och få tillgång till våra verktyg för budget, gästlista, 
              checklista och mycket mer.
            </p>
            <Link to="/auth">
              <Button size="lg" className="bg-primary hover:bg-primary/90 gap-2">
                <Sparkles className="w-4 h-4" />
                Kom igång gratis
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border/50 bg-card/30">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-primary" fill="currentColor" />
              <span className="font-serif text-lg">MittBröllop.se</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link to="/" className="hover:text-primary transition-colors">
                Hem
              </Link>
              <Link to="/guider" className="hover:text-primary transition-colors">
                Guider & Tips
              </Link>
              <Link to="/dashboard" className="hover:text-primary transition-colors">
                Dashboard
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 MittBröllop.se
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default WeddingInfo;
