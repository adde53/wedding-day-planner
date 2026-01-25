import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Trash2, 
  Users, 
  Edit2, 
  Check, 
  X,
  Table2,
  UserPlus,
  UserMinus
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface Guest {
  id: string;
  name: string;
  plus_one: boolean;
  plus_one_name: string | null;
  rsvp_status: string;
}

interface TableData {
  id: string;
  name: string;
  capacity: number;
  guests: string[]; // guest IDs
}

interface TablePlannerProps {
  confirmedGuests: number;
}

export function TablePlanner({ confirmedGuests }: TablePlannerProps) {
  const { user } = useAuth();
  const [tables, setTables] = useState<TableData[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<TableData | null>(null);
  const [formData, setFormData] = useState({ name: "", capacity: 8 });

  useEffect(() => {
    if (user) {
      fetchGuests();
      loadTablesFromStorage();
    }
  }, [user]);

  const fetchGuests = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from("guests")
      .select("id, name, plus_one, plus_one_name, rsvp_status")
      .eq("user_id", user.id)
      .eq("rsvp_status", "confirmed");

    if (error) {
      console.error(error);
    } else {
      setGuests(data || []);
    }
    setIsLoading(false);
  };

  const loadTablesFromStorage = () => {
    if (!user) return;
    const stored = localStorage.getItem(`tables_${user.id}`);
    if (stored) {
      setTables(JSON.parse(stored));
    }
  };

  const saveTablestoStorage = (newTables: TableData[]) => {
    if (!user) return;
    localStorage.setItem(`tables_${user.id}`, JSON.stringify(newTables));
    setTables(newTables);
  };

  const handleAddTable = () => {
    if (!formData.name.trim()) {
      toast.error("Ange ett namn för bordet");
      return;
    }

    if (editingTable) {
      const updated = tables.map(t => 
        t.id === editingTable.id 
          ? { ...t, name: formData.name, capacity: formData.capacity }
          : t
      );
      saveTablestoStorage(updated);
      toast.success("Bordet har uppdaterats");
    } else {
      const newTable: TableData = {
        id: crypto.randomUUID(),
        name: formData.name,
        capacity: formData.capacity,
        guests: [],
      };
      saveTablestoStorage([...tables, newTable]);
      toast.success("Bordet har skapats");
    }

    setIsDialogOpen(false);
    setFormData({ name: "", capacity: 8 });
    setEditingTable(null);
  };

  const handleDeleteTable = (tableId: string) => {
    const updated = tables.filter(t => t.id !== tableId);
    saveTablestoStorage(updated);
    toast.success("Bordet har tagits bort");
  };

  const handleEditTable = (table: TableData) => {
    setEditingTable(table);
    setFormData({ name: table.name, capacity: table.capacity });
    setIsDialogOpen(true);
  };

  const addGuestToTable = (tableId: string, guestId: string) => {
    const updated = tables.map(t => {
      if (t.id === tableId) {
        if (t.guests.length >= t.capacity) {
          toast.error("Bordet är fullt");
          return t;
        }
        if (!t.guests.includes(guestId)) {
          return { ...t, guests: [...t.guests, guestId] };
        }
      }
      return t;
    });
    saveTablestoStorage(updated);
  };

  const removeGuestFromTable = (tableId: string, guestId: string) => {
    const updated = tables.map(t => {
      if (t.id === tableId) {
        return { ...t, guests: t.guests.filter(g => g !== guestId) };
      }
      return t;
    });
    saveTablestoStorage(updated);
  };

  // Get guests not assigned to any table
  const unassignedGuests = guests.filter(
    g => !tables.some(t => t.guests.includes(g.id))
  );

  const getGuestById = (id: string) => guests.find(g => g.id === id);

  const totalSeats = tables.reduce((sum, t) => sum + t.capacity, 0);
  const totalAssigned = tables.reduce((sum, t) => sum + t.guests.length, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse text-muted-foreground">Laddar...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Table2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-serif font-medium text-foreground">{tables.length}</p>
              <p className="text-sm text-muted-foreground">Bord</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-sage-light flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-serif font-medium text-foreground">{totalSeats}</p>
              <p className="text-sm text-muted-foreground">Platser</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gold-light flex items-center justify-center">
              <Check className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-serif font-medium text-foreground">{totalAssigned}</p>
              <p className="text-sm text-muted-foreground">Placerade</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
              <Users className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-serif font-medium text-foreground">{unassignedGuests.length}</p>
              <p className="text-sm text-muted-foreground">Ej placerade</p>
            </div>
          </div>
        </div>
      </div>

      {/* Add table button */}
      <div className="flex justify-end">
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setFormData({ name: "", capacity: 8 });
            setEditingTable(null);
          }
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Lägg till bord
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="font-serif">
                {editingTable ? "Redigera bord" : "Lägg till nytt bord"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="table-name">Bordets namn</Label>
                <Input
                  id="table-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="T.ex. Bord 1, Bröllopsparet..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacity">Antal platser</Label>
                <Input
                  id="capacity"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={formData.capacity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value.replace(/\D/g, '')) || 1;
                    setFormData({ ...formData, capacity: Math.min(20, Math.max(1, val)) });
                  }}
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Avbryt
                </Button>
                <Button onClick={handleAddTable}>
                  {editingTable ? "Spara" : "Lägg till"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Unassigned guests */}
        <div className="lg:col-span-1">
          <div className="bg-card rounded-xl border border-border p-4">
            <h3 className="font-serif text-lg font-medium text-foreground mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Ej placerade ({unassignedGuests.length})
            </h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {unassignedGuests.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Alla bekräftade gäster är placerade!
                </p>
              ) : (
                unassignedGuests.map((guest) => (
                  <div
                    key={guest.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <span className="text-sm font-medium text-foreground">{guest.name}</span>
                      {guest.plus_one && guest.plus_one_name && (
                        <span className="text-xs text-muted-foreground ml-2">
                          +1 ({guest.plus_one_name})
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Tables */}
        <div className="lg:col-span-2">
          {tables.length === 0 ? (
            <div className="bg-card rounded-xl border border-border p-12 text-center">
              <Table2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-serif text-xl font-medium text-foreground mb-2">
                Inga bord ännu
              </h3>
              <p className="text-muted-foreground">
                Skapa bord för att börja placera era gäster
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              <AnimatePresence mode="popLayout">
                {tables.map((table) => (
                  <motion.div
                    key={table.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-card rounded-xl border border-border p-4"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-serif font-medium text-foreground">{table.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          {table.guests.length} / {table.capacity} platser
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEditTable(table)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleDeleteTable(table.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Guests at this table */}
                    <div className="space-y-2 mb-4">
                      {table.guests.map((guestId) => {
                        const guest = getGuestById(guestId);
                        if (!guest) return null;
                        return (
                          <div
                            key={guestId}
                            className="flex items-center justify-between p-2 rounded-lg bg-primary/5"
                          >
                            <span className="text-sm text-foreground">{guest.name}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => removeGuestFromTable(table.id, guestId)}
                            >
                              <UserMinus className="w-3 h-3" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>

                    {/* Add guest dropdown */}
                    {table.guests.length < table.capacity && unassignedGuests.length > 0 && (
                      <div className="border-t border-border pt-3">
                        <select
                          className="w-full text-sm p-2 rounded-lg border border-border bg-background"
                          value=""
                          onChange={(e) => {
                            if (e.target.value) {
                              addGuestToTable(table.id, e.target.value);
                            }
                          }}
                        >
                          <option value="">+ Lägg till gäst</option>
                          {unassignedGuests.map((guest) => (
                            <option key={guest.id} value={guest.id}>
                              {guest.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
