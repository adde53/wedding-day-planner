import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  UserPlus, 
  Check, 
  X, 
  Clock, 
  Edit2, 
  Trash2, 
  ChevronDown,
  ChevronUp,
  Search,
  Utensils,
  Download,
  Upload,
  Key,
  Copy
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { exportGuestsToExcel } from "@/utils/exportGuests";

interface Guest {
  id: string;
  name: string;
  dietary_restrictions: string | null;
  plus_one: boolean;
  plus_one_name: string | null;
  rsvp_status: "pending" | "confirmed" | "declined";
  notes: string | null;
  access_code: string | null;
}

interface GuestListProps {
  onGuestStatsChange?: (confirmed: number, declined: number, pending: number, total: number) => void;
}

export function GuestList({ onGuestStatsChange }: GuestListProps) {
  const { user } = useAuth();
  const [guests, setGuests] = useState<Guest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    dietary_restrictions: "",
    plus_one: false,
    plus_one_name: "",
    rsvp_status: "pending" as "pending" | "confirmed" | "declined",
    notes: "",
  });

  useEffect(() => {
    if (user) {
      fetchGuests();
    }
  }, [user]);

  useEffect(() => {
    // Count guests + their plus-ones per status
    const confirmedGuests = guests.filter(g => g.rsvp_status === "confirmed");
    const declinedGuests = guests.filter(g => g.rsvp_status === "declined");
    const pendingGuests = guests.filter(g => g.rsvp_status === "pending");
    
    const confirmed = confirmedGuests.length + confirmedGuests.filter(g => g.plus_one).length;
    const declined = declinedGuests.length + declinedGuests.filter(g => g.plus_one).length;
    const pending = pendingGuests.length + pendingGuests.filter(g => g.plus_one).length;
    const totalInvited = guests.length + guests.filter(g => g.plus_one).length;
    
    onGuestStatsChange?.(confirmed, declined, pending, totalInvited);
  }, [guests, onGuestStatsChange]);

  const fetchGuests = async () => {
    if (!user) return;
    
    setIsLoading(true);
    const { data, error } = await supabase
      .from("guests")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Kunde inte hämta gästlistan");
      console.error(error);
    } else {
      setGuests(data as Guest[]);
    }
    setIsLoading(false);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      dietary_restrictions: "",
      plus_one: false,
      plus_one_name: "",
      rsvp_status: "pending",
      notes: "",
    });
    setEditingGuest(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const guestData = {
      ...formData,
      user_id: user.id,
      dietary_restrictions: formData.dietary_restrictions || null,
      plus_one_name: formData.plus_one ? formData.plus_one_name || null : null,
      notes: formData.notes || null,
      rsvp_date: formData.rsvp_status !== "pending" ? new Date().toISOString() : null,
    };

    if (editingGuest) {
      const { error } = await supabase
        .from("guests")
        .update(guestData)
        .eq("id", editingGuest.id);

      if (error) {
        toast.error("Kunde inte uppdatera gästen");
        console.error(error);
      } else {
        toast.success("Gästen har uppdaterats");
        fetchGuests();
      }
    } else {
      const { error } = await supabase
        .from("guests")
        .insert(guestData);

      if (error) {
        toast.error("Kunde inte lägga till gästen");
        console.error(error);
      } else {
        toast.success("Gästen har lagts till");
        fetchGuests();
      }
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (guest: Guest) => {
    setEditingGuest(guest);
    setFormData({
      name: guest.name,
      dietary_restrictions: guest.dietary_restrictions || "",
      plus_one: guest.plus_one,
      plus_one_name: guest.plus_one_name || "",
      rsvp_status: guest.rsvp_status,
      notes: guest.notes || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("guests")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Kunde inte ta bort gästen");
      console.error(error);
    } else {
      toast.success("Gästen har tagits bort");
      fetchGuests();
    }
  };

  const handleStatusChange = async (id: string, status: "pending" | "confirmed" | "declined") => {
    const { error } = await supabase
      .from("guests")
      .update({ 
        rsvp_status: status,
        rsvp_date: status !== "pending" ? new Date().toISOString() : null
      })
      .eq("id", id);

    if (error) {
      toast.error("Kunde inte uppdatera status");
      console.error(error);
    } else {
      fetchGuests();
    }
  };

  const generateAccessCode = async (guestId: string) => {
    // Call the database function to generate a unique code
    const { data, error } = await supabase
      .rpc("generate_access_code");

    if (error) {
      toast.error("Kunde inte generera kod");
      console.error(error);
      return;
    }

    // Update the guest with the new code
    const { error: updateError } = await supabase
      .from("guests")
      .update({ access_code: data })
      .eq("id", guestId);

    if (updateError) {
      toast.error("Kunde inte spara koden");
      console.error(updateError);
    } else {
      toast.success("Åtkomstkod genererad!");
      fetchGuests();
    }
  };

  const generateAllAccessCodes = async () => {
    const guestsWithoutCode = guests.filter(g => !g.access_code);
    
    for (const guest of guestsWithoutCode) {
      await generateAccessCode(guest.id);
    }
    
    if (guestsWithoutCode.length > 0) {
      toast.success(`${guestsWithoutCode.length} åtkomstkoder genererade!`);
    } else {
      toast.info("Alla gäster har redan en kod");
    }
  };

  const copyAccessCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Kod kopierad!");
  };

  const handleCsvImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());
    
    const names: { name: string; plus_one: boolean; plus_one_name: string | null }[] = [];
    
    for (const line of lines) {
      // Split by comma and find the last non-empty cell (the name column)
      const cells = line.split(',');
      const rawName = cells.map(c => c.trim()).filter(Boolean).pop();
      if (!rawName) continue;
      
      // Skip if name is in parentheses (like "(Andreas)" - couple names)
      const isParenthesized = rawName.startsWith('(') && rawName.endsWith(')');
      const cleanName = isParenthesized ? rawName.slice(1, -1) : rawName;
      
      if (!cleanName) continue;

      // Check for plus one pattern: "Name (+PlusOneName)" or "Name +1"
      const plusOneMatch = cleanName.match(/^(.+?)\s*\(\+\s*(.+?)\)$/);
      const plusOneSimple = cleanName.match(/^(.+?)\s*\+1$/);
      
      if (plusOneMatch) {
        names.push({ name: plusOneMatch[1].trim(), plus_one: true, plus_one_name: plusOneMatch[2].trim() });
      } else if (plusOneSimple) {
        names.push({ name: plusOneSimple[1].trim(), plus_one: true, plus_one_name: null });
      } else {
        names.push({ name: cleanName.trim(), plus_one: false, plus_one_name: null });
      }
    }

    if (names.length === 0) {
      toast.error("Inga gäster hittades i filen");
      return;
    }

    // Insert all guests
    const guestsToInsert = names.map(g => ({
      user_id: user.id,
      name: g.name,
      plus_one: g.plus_one,
      plus_one_name: g.plus_one_name,
      rsvp_status: 'pending',
    }));

    const { error } = await supabase.from("guests").insert(guestsToInsert);
    
    if (error) {
      toast.error("Kunde inte importera gäster");
      console.error(error);
    } else {
      toast.success(`${names.length} gäster importerade!`);
      fetchGuests();
    }
    
    // Reset file input
    e.target.value = '';
  };

  // Statistics
  const confirmedCount = guests.filter(g => g.rsvp_status === "confirmed").length;
  const declinedCount = guests.filter(g => g.rsvp_status === "declined").length;
  const pendingCount = guests.filter(g => g.rsvp_status === "pending").length;
  const confirmedPlusOnes = guests.filter(g => g.rsvp_status === "confirmed" && g.plus_one).length;
  const totalAttending = confirmedCount + confirmedPlusOnes;

  // Filtered guests
  const filteredGuests = guests.filter(guest => {
    const matchesSearch = guest.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "all" || guest.rsvp_status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const statusConfig = {
    confirmed: { icon: Check, color: "text-green-600 bg-green-100", label: "Bekräftat" },
    declined: { icon: X, color: "text-red-600 bg-red-100", label: "Avböjt" },
    pending: { icon: Clock, color: "text-amber-600 bg-amber-100", label: "Väntar" },
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse text-muted-foreground">Laddar gästlista...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl p-4 border border-border"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-serif font-medium text-foreground">{totalAttending}</p>
              <p className="text-sm text-muted-foreground">Kommer</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-xl p-4 border border-border"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Check className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-serif font-medium text-foreground">{confirmedCount}</p>
              <p className="text-sm text-muted-foreground">Bekräftat</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-xl p-4 border border-border"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-serif font-medium text-foreground">{pendingCount}</p>
              <p className="text-sm text-muted-foreground">Väntar</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-xl p-4 border border-border"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <X className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-serif font-medium text-foreground">{declinedCount}</p>
              <p className="text-sm text-muted-foreground">Avböjt</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Sök gäster..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Filtrera" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alla</SelectItem>
              <SelectItem value="confirmed">Bekräftat</SelectItem>
              <SelectItem value="pending">Väntar</SelectItem>
              <SelectItem value="declined">Avböjt</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => exportGuestsToExcel(guests)}
            disabled={guests.length === 0}
          >
            <Download className="w-4 h-4" />
            Exportera
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => document.getElementById('csv-import')?.click()}
          >
            <Upload className="w-4 h-4" />
            Importera CSV
          </Button>
          <input
            id="csv-import"
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleCsvImport}
          />
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <UserPlus className="w-4 h-4" />
              Lägg till gäst
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="font-serif">
                {editingGuest ? "Redigera gäst" : "Lägg till ny gäst"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Namn *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Förnamn Efternamn"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dietary">Allergier / Kostpreferenser</Label>
                <Input
                  id="dietary"
                  value={formData.dietary_restrictions}
                  onChange={(e) => setFormData({ ...formData, dietary_restrictions: e.target.value })}
                  placeholder="T.ex. vegetarian, nötallergi..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">RSVP Status</Label>
                <Select 
                  value={formData.rsvp_status} 
                  onValueChange={(value: "pending" | "confirmed" | "declined") => 
                    setFormData({ ...formData, rsvp_status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Väntar på svar</SelectItem>
                    <SelectItem value="confirmed">Bekräftat</SelectItem>
                    <SelectItem value="declined">Avböjt</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="plus_one"
                  checked={formData.plus_one}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, plus_one: checked as boolean })
                  }
                />
                <Label htmlFor="plus_one">Har en +1</Label>
              </div>
              {formData.plus_one && (
                <div className="space-y-2">
                  <Label htmlFor="plus_one_name">+1 Namn</Label>
                  <Input
                    id="plus_one_name"
                    value={formData.plus_one_name}
                    onChange={(e) => setFormData({ ...formData, plus_one_name: e.target.value })}
                    placeholder="Partnerns namn"
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="notes">Anteckningar</Label>
                <Input
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Ev. anteckningar..."
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Avbryt
                </Button>
                <Button type="submit">
                  {editingGuest ? "Spara ändringar" : "Lägg till"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Guest List */}
      {filteredGuests.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-card rounded-xl p-12 border border-border text-center"
        >
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-serif text-xl font-medium text-foreground mb-2">
            {guests.length === 0 ? "Inga gäster ännu" : "Inga gäster matchar sökningen"}
          </h3>
          <p className="text-muted-foreground mb-4">
            {guests.length === 0 
              ? "Lägg till era gäster för att spåra RSVP-svar"
              : "Försök med en annan sökning eller filter"
            }
          </p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filteredGuests.map((guest, index) => {
              const StatusIcon = statusConfig[guest.rsvp_status].icon;
              const isExpanded = expandedId === guest.id;

              return (
                <motion.div
                  key={guest.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-card rounded-xl border border-border overflow-hidden"
                >
                  <div 
                    className="p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => setExpandedId(isExpanded ? null : guest.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${statusConfig[guest.rsvp_status].color}`}>
                          <StatusIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground">{guest.name}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span className={`px-2 py-0.5 rounded-full text-xs ${statusConfig[guest.rsvp_status].color}`}>
                              {statusConfig[guest.rsvp_status].label}
                            </span>
                            {guest.plus_one && (
                              <span className="text-xs">+1 {guest.plus_one_name && `(${guest.plus_one_name})`}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="hidden sm:flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`h-8 w-8 p-0 ${guest.rsvp_status === 'confirmed' ? 'bg-green-100' : ''}`}
                            onClick={(e) => { e.stopPropagation(); handleStatusChange(guest.id, 'confirmed'); }}
                          >
                            <Check className="w-4 h-4 text-green-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`h-8 w-8 p-0 ${guest.rsvp_status === 'declined' ? 'bg-red-100' : ''}`}
                            onClick={(e) => { e.stopPropagation(); handleStatusChange(guest.id, 'declined'); }}
                          >
                            <X className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-border"
                      >
                        <div className="p-4 space-y-3 bg-muted/20">
                          {guest.dietary_restrictions && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Utensils className="w-4 h-4" />
                              <span>Allergier: {guest.dietary_restrictions}</span>
                            </div>
                          )}
                          {guest.notes && (
                            <p className="text-sm text-muted-foreground italic">
                              "{guest.notes}"
                            </p>
                          )}
                          <div className="flex justify-between items-center pt-2">
                            <div className="flex gap-1 sm:hidden">
                              <Button
                                variant="ghost"
                                size="sm"
                                className={`h-8 ${guest.rsvp_status === 'confirmed' ? 'bg-green-100' : ''}`}
                                onClick={() => handleStatusChange(guest.id, 'confirmed')}
                              >
                                <Check className="w-4 h-4 text-green-600 mr-1" />
                                Bekräfta
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className={`h-8 ${guest.rsvp_status === 'declined' ? 'bg-red-100' : ''}`}
                                onClick={() => handleStatusChange(guest.id, 'declined')}
                              >
                                <X className="w-4 h-4 text-red-600 mr-1" />
                                Avböj
                              </Button>
                            </div>
                            <div className="flex gap-2 ml-auto">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(guest)}
                              >
                                <Edit2 className="w-4 h-4 mr-1" />
                                Redigera
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                onClick={() => handleDelete(guest.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
