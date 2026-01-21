import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Globe, Eye, EyeOff, Save, Upload, Trash2, Plus, 
  Palette, Type, Calendar, MapPin, Heart, Image, 
  FileText, Link2, Copy, Check, ExternalLink, Settings2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useWeddingWebsite, WeddingWebsite } from "@/hooks/useWeddingWebsite";
import { useProfile } from "@/hooks/useProfile";
import { cn } from "@/lib/utils";

const THEMES = [
  { id: "classic", name: "Klassisk", description: "Elegant och tidlös" },
  { id: "modern", name: "Modern", description: "Ren och minimalistisk" },
  { id: "romantic", name: "Romantisk", description: "Mjuk och drömlik" },
  { id: "rustic", name: "Rustik", description: "Varm och naturlig" },
  { id: "bohemian", name: "Bohemisk", description: "Fri och artistisk" },
];

const FONTS = [
  { id: "serif", name: "Serif", preview: "DM Serif Display" },
  { id: "sans", name: "Sans-serif", preview: "DM Sans" },
  { id: "script", name: "Handskrift", preview: "Pacifico" },
];

const COLOR_PRESETS = [
  { primary: "#D4A574", secondary: "#8B7355", name: "Guld & Taupe" },
  { primary: "#4A7C59", secondary: "#2D4A3E", name: "Grön & Skog" },
  { primary: "#8B5A6B", secondary: "#5A3A4B", name: "Dusty Rose" },
  { primary: "#6B8E9F", secondary: "#4A6B7C", name: "Havsblå" },
  { primary: "#9B7BB8", secondary: "#6B4B88", name: "Lavendel" },
  { primary: "#C17E61", secondary: "#8B5A41", name: "Terrakotta" },
];

export function WeddingWebsiteBuilder() {
  const { website, photos, isLoading, isSaving, createWebsite, updateWebsite, togglePublish, uploadPhoto, addPhoto, removePhoto } = useWeddingWebsite();
  const { profile } = useProfile();
  const [activeTab, setActiveTab] = useState("info");
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState<Partial<WeddingWebsite>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const couplePhotoRef = useRef<HTMLInputElement>(null);

  // Initialize form data when website loads
  useState(() => {
    if (website) {
      setFormData({
        couple_names: website.couple_names,
        couple_description: website.couple_description,
        couple_photo_url: website.couple_photo_url,
        wedding_date: website.wedding_date,
        ceremony_time: website.ceremony_time,
        ceremony_location: website.ceremony_location,
        ceremony_address: website.ceremony_address,
        reception_location: website.reception_location,
        reception_address: website.reception_address,
        theme: website.theme,
        primary_color: website.primary_color,
        secondary_color: website.secondary_color,
        font_family: website.font_family,
        our_story: website.our_story,
        additional_info: website.additional_info,
      });
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-muted-foreground">Laddar...</div>
      </div>
    );
  }

  if (!website) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-2xl p-12 text-center border border-border"
      >
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Globe className="w-10 h-10 text-primary" />
        </div>
        <h2 className="font-serif text-2xl font-medium text-foreground mb-3">
          Skapa er bröllopshemsida
        </h2>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          Bygg en vacker hemsida där era gäster kan hitta all information om ert bröllop 
          och svara på inbjudan med sin personliga kod.
        </p>
        <Button size="lg" onClick={createWebsite} className="gap-2">
          <Plus className="w-5 h-5" />
          Skapa hemsida
        </Button>
      </motion.div>
    );
  }

  const websiteUrl = `${window.location.origin}/w/${website.slug}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(websiteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    await updateWebsite(formData);
  };

  const handleCouplePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = await uploadPhoto(file);
    if (url) {
      setFormData(prev => ({ ...prev, couple_photo_url: url }));
      await updateWebsite({ couple_photo_url: url });
    }
  };

  const handleGalleryPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      const url = await uploadPhoto(file);
      if (url) {
        await addPhoto(url);
      }
    }
  };

  const handleColorPreset = (preset: typeof COLOR_PRESETS[0]) => {
    setFormData(prev => ({ 
      ...prev, 
      primary_color: preset.primary, 
      secondary_color: preset.secondary 
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-2xl p-6 border border-border"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Globe className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-medium text-foreground">
                Er bröllopshemsida
              </h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link2 className="w-4 h-4" />
                <span className="truncate max-w-[200px] md:max-w-none">{websiteUrl}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleCopyLink}
              className="gap-2"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "Kopierad!" : "Kopiera länk"}
            </Button>
            
            <a 
              href={websiteUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex"
            >
              <Button variant="outline" size="sm" className="gap-2">
                <ExternalLink className="w-4 h-4" />
                Förhandsgranska
              </Button>
            </a>
            
            <div className="flex items-center gap-2 pl-3 border-l border-border">
              <Switch
                checked={website.is_published}
                onCheckedChange={togglePublish}
              />
              <span className="text-sm font-medium">
                {website.is_published ? "Publicerad" : "Utkast"}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Editor Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card rounded-2xl border border-border overflow-hidden"
      >
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="border-b border-border px-6 pt-4">
            <TabsList className="bg-transparent gap-1 p-0">
              <TabsTrigger value="info" className="gap-2 data-[state=active]:bg-primary/10">
                <Heart className="w-4 h-4" />
                Information
              </TabsTrigger>
              <TabsTrigger value="design" className="gap-2 data-[state=active]:bg-primary/10">
                <Palette className="w-4 h-4" />
                Design
              </TabsTrigger>
              <TabsTrigger value="photos" className="gap-2 data-[state=active]:bg-primary/10">
                <Image className="w-4 h-4" />
                Bildgalleri
              </TabsTrigger>
              <TabsTrigger value="content" className="gap-2 data-[state=active]:bg-primary/10">
                <FileText className="w-4 h-4" />
                Innehåll
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="p-6">
            <TabsContent value="info" className="mt-0 space-y-6">
              {/* Couple Info */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="couple_names">Era namn</Label>
                    <Input
                      id="couple_names"
                      placeholder="Anna & Erik"
                      value={formData.couple_names || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, couple_names: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="couple_description">Om oss (kort beskrivning)</Label>
                    <Textarea
                      id="couple_description"
                      placeholder="Berätta lite om er själva..."
                      rows={4}
                      value={formData.couple_description || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, couple_description: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div>
                  <Label>Parets foto</Label>
                  <div 
                    onClick={() => couplePhotoRef.current?.click()}
                    className={cn(
                      "mt-2 border-2 border-dashed border-border rounded-xl h-48 flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors overflow-hidden",
                      formData.couple_photo_url && "border-solid border-primary/20"
                    )}
                  >
                    {formData.couple_photo_url ? (
                      <img 
                        src={formData.couple_photo_url} 
                        alt="Parets foto" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center text-muted-foreground">
                        <Upload className="w-8 h-8 mx-auto mb-2" />
                        <p className="text-sm">Klicka för att ladda upp</p>
                      </div>
                    )}
                  </div>
                  <input
                    ref={couplePhotoRef}
                    type="file"
                    accept="image/*"
                    onChange={handleCouplePhotoUpload}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Wedding Details */}
              <div className="pt-6 border-t border-border">
                <h3 className="font-serif text-lg font-medium text-foreground mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Bröllopsdetaljer
                </h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="wedding_date">Bröllopsdatum</Label>
                    <Input
                      id="wedding_date"
                      type="date"
                      value={formData.wedding_date || profile?.wedding_date || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, wedding_date: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="ceremony_time">Tid för vigsel</Label>
                    <Input
                      id="ceremony_time"
                      type="time"
                      value={formData.ceremony_time || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, ceremony_time: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              {/* Locations */}
              <div className="pt-6 border-t border-border">
                <h3 className="font-serif text-lg font-medium text-foreground mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Platser
                </h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-foreground">Vigsel</h4>
                    <div>
                      <Label htmlFor="ceremony_location">Platsnamn</Label>
                      <Input
                        id="ceremony_location"
                        placeholder="T.ex. Stockholms Stadshus"
                        value={formData.ceremony_location || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, ceremony_location: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="ceremony_address">Adress</Label>
                      <Input
                        id="ceremony_address"
                        placeholder="Hantverkargatan 1, Stockholm"
                        value={formData.ceremony_address || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, ceremony_address: e.target.value }))}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-foreground">Fest</h4>
                    <div>
                      <Label htmlFor="reception_location">Platsnamn</Label>
                      <Input
                        id="reception_location"
                        placeholder="T.ex. Grand Hôtel"
                        value={formData.reception_location || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, reception_location: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="reception_address">Adress</Label>
                      <Input
                        id="reception_address"
                        placeholder="Södra Blasieholmshamnen 8, Stockholm"
                        value={formData.reception_address || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, reception_address: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="design" className="mt-0 space-y-6">
              {/* Theme Selection */}
              <div>
                <Label className="text-base">Välj tema</Label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-3">
                  {THEMES.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => setFormData(prev => ({ ...prev, theme: theme.id }))}
                      className={cn(
                        "p-4 rounded-xl border-2 text-left transition-all hover-lift",
                        (formData.theme || website.theme) === theme.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <div className="font-medium text-foreground mb-1">{theme.name}</div>
                      <div className="text-xs text-muted-foreground">{theme.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Presets */}
              <div className="pt-6 border-t border-border">
                <Label className="text-base">Färgpalett</Label>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mt-3">
                  {COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => handleColorPreset(preset)}
                      className={cn(
                        "p-3 rounded-xl border-2 transition-all hover-lift",
                        formData.primary_color === preset.primary
                          ? "border-primary"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <div className="flex gap-1 mb-2">
                        <div 
                          className="w-6 h-6 rounded-full" 
                          style={{ backgroundColor: preset.primary }}
                        />
                        <div 
                          className="w-6 h-6 rounded-full" 
                          style={{ backgroundColor: preset.secondary }}
                        />
                      </div>
                      <div className="text-xs font-medium text-foreground">{preset.name}</div>
                    </button>
                  ))}
                </div>
                
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label htmlFor="primary_color">Primär färg</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="primary_color"
                        type="color"
                        value={formData.primary_color || "#D4A574"}
                        onChange={(e) => setFormData(prev => ({ ...prev, primary_color: e.target.value }))}
                        className="w-12 h-10 p-1 cursor-pointer"
                      />
                      <Input
                        value={formData.primary_color || "#D4A574"}
                        onChange={(e) => setFormData(prev => ({ ...prev, primary_color: e.target.value }))}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="secondary_color">Sekundär färg</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="secondary_color"
                        type="color"
                        value={formData.secondary_color || "#8B7355"}
                        onChange={(e) => setFormData(prev => ({ ...prev, secondary_color: e.target.value }))}
                        className="w-12 h-10 p-1 cursor-pointer"
                      />
                      <Input
                        value={formData.secondary_color || "#8B7355"}
                        onChange={(e) => setFormData(prev => ({ ...prev, secondary_color: e.target.value }))}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Font Selection */}
              <div className="pt-6 border-t border-border">
                <Label className="text-base">Typsnitt</Label>
                <div className="grid grid-cols-3 gap-3 mt-3">
                  {FONTS.map((font) => (
                    <button
                      key={font.id}
                      onClick={() => setFormData(prev => ({ ...prev, font_family: font.id }))}
                      className={cn(
                        "p-4 rounded-xl border-2 text-left transition-all",
                        (formData.font_family || website.font_family) === font.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <div 
                        className="text-xl mb-1 text-foreground"
                        style={{ fontFamily: font.preview }}
                      >
                        Aa
                      </div>
                      <div className="text-sm font-medium text-foreground">{font.name}</div>
                    </button>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="photos" className="mt-0 space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <Label className="text-base">Bildgalleri</Label>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => fileInputRef.current?.click()}
                    className="gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Lägg till bilder
                  </Button>
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleGalleryPhotoUpload}
                  className="hidden"
                />

                {photos.length === 0 ? (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-border rounded-xl p-12 text-center cursor-pointer hover:border-primary/50 transition-colors"
                  >
                    <Image className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      Klicka för att ladda upp bilder till ert galleri
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {photos.map((photo) => (
                      <div 
                        key={photo.id} 
                        className="relative group rounded-xl overflow-hidden aspect-square"
                      >
                        <img 
                          src={photo.photo_url} 
                          alt={photo.caption || "Bröllopsbild"} 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => removePhoto(photo.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-square rounded-xl border-2 border-dashed border-border flex items-center justify-center hover:border-primary/50 transition-colors"
                    >
                      <Plus className="w-8 h-8 text-muted-foreground" />
                    </button>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="content" className="mt-0 space-y-6">
              <div>
                <Label htmlFor="our_story">Vår historia</Label>
                <Textarea
                  id="our_story"
                  placeholder="Berätta hur ni träffades, hur ni blev förlovade..."
                  rows={6}
                  value={formData.our_story || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, our_story: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Dela er kärlekshistoria med gästerna
                </p>
              </div>

              <div>
                <Label htmlFor="additional_info">Praktisk information</Label>
                <Textarea
                  id="additional_info"
                  placeholder="Information om boende, transport, klädkod, önskelista..."
                  rows={6}
                  value={formData.additional_info || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, additional_info: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Allt gästerna behöver veta
                </p>
              </div>
            </TabsContent>
          </div>

          {/* Save Button */}
          <div className="border-t border-border p-6 flex justify-end">
            <Button 
              onClick={handleSave} 
              disabled={isSaving}
              className="gap-2"
            >
              <Save className="w-4 h-4" />
              {isSaving ? "Sparar..." : "Spara ändringar"}
            </Button>
          </div>
        </Tabs>
      </motion.div>
    </div>
  );
}
