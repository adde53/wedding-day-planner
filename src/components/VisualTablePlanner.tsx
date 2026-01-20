import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { 
  Plus, 
  Trash2, 
  Users, 
  Edit2, 
  Download,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Table2,
  UserMinus,
  Move
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { toPng } from "html-to-image";

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
  guests: string[];
  x: number;
  y: number;
  shape: "round" | "rectangle" | "square";
}

interface VisualTablePlannerProps {
  confirmedGuests: number;
}

const TABLE_SHAPES = [
  { id: "round", label: "Runt", icon: "⭕" },
  { id: "rectangle", label: "Rektangulärt", icon: "▭" },
  { id: "square", label: "Kvadratiskt", icon: "◻" },
];

export function VisualTablePlanner({ confirmedGuests }: VisualTablePlannerProps) {
  const { user } = useAuth();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [tables, setTables] = useState<TableData[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<TableData | null>(null);
  const [formData, setFormData] = useState({ name: "", capacity: 8, shape: "round" as "round" | "rectangle" | "square" });
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [draggedTable, setDraggedTable] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isExporting, setIsExporting] = useState(false);

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
    const stored = localStorage.getItem(`visual_tables_${user.id}`);
    if (stored) {
      setTables(JSON.parse(stored));
    }
  };

  const saveTablestoStorage = (newTables: TableData[]) => {
    if (!user) return;
    localStorage.setItem(`visual_tables_${user.id}`, JSON.stringify(newTables));
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
          ? { ...t, name: formData.name, capacity: formData.capacity, shape: formData.shape }
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
        x: 100 + Math.random() * 200,
        y: 100 + Math.random() * 200,
        shape: formData.shape,
      };
      saveTablestoStorage([...tables, newTable]);
      toast.success("Bordet har skapats");
    }

    setIsDialogOpen(false);
    setFormData({ name: "", capacity: 8, shape: "round" });
    setEditingTable(null);
  };

  const handleDeleteTable = (tableId: string) => {
    const updated = tables.filter(t => t.id !== tableId);
    saveTablestoStorage(updated);
    setSelectedTable(null);
    toast.success("Bordet har tagits bort");
  };

  const handleEditTable = (table: TableData) => {
    setEditingTable(table);
    setFormData({ name: table.name, capacity: table.capacity, shape: table.shape });
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

  const handleMouseDown = (e: React.MouseEvent, tableId: string) => {
    if (!canvasRef.current) return;
    const table = tables.find(t => t.id === tableId);
    if (!table) return;

    const rect = canvasRef.current.getBoundingClientRect();
    setDragOffset({
      x: (e.clientX - rect.left) / zoom - table.x,
      y: (e.clientY - rect.top) / zoom - table.y,
    });
    setDraggedTable(tableId);
    setSelectedTable(tableId);
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!draggedTable || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom - dragOffset.x;
    const y = (e.clientY - rect.top) / zoom - dragOffset.y;

    const updated = tables.map(t => 
      t.id === draggedTable ? { ...t, x: Math.max(0, x), y: Math.max(0, y) } : t
    );
    setTables(updated);
  }, [draggedTable, dragOffset, zoom, tables]);

  const handleMouseUp = useCallback(() => {
    if (draggedTable) {
      saveTablestoStorage(tables);
      setDraggedTable(null);
    }
  }, [draggedTable, tables, user]);

  const handleExport = async () => {
    if (!canvasRef.current) return;

    setIsExporting(true);
    setSelectedTable(null);

    // Wait for state update
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      const dataUrl = await toPng(canvasRef.current, {
        backgroundColor: "#ffffff",
        pixelRatio: 2,
        style: {
          transform: "scale(1)",
        },
      });

      const link = document.createElement("a");
      link.download = `bordsplacering-${new Date().toISOString().split("T")[0]}.png`;
      link.href = dataUrl;
      link.click();

      toast.success("Bordsplaceringen har exporterats som bild!");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Kunde inte exportera bilden");
    } finally {
      setIsExporting(false);
    }
  };

  const resetPositions = () => {
    const updated = tables.map((t, i) => ({
      ...t,
      x: 100 + (i % 4) * 200,
      y: 100 + Math.floor(i / 4) * 200,
    }));
    saveTablestoStorage(updated);
    toast.success("Positioner återställda");
  };

  const unassignedGuests = guests.filter(
    g => !tables.some(t => t.guests.includes(g.id))
  );

  const getGuestById = (id: string) => guests.find(g => g.id === id);

  const totalSeats = tables.reduce((sum, t) => sum + t.capacity, 0);
  const totalAssigned = tables.reduce((sum, t) => sum + t.guests.length, 0);

  const getTableStyle = (table: TableData) => {
    const baseSize = table.capacity <= 6 ? 120 : table.capacity <= 10 ? 150 : 180;
    
    switch (table.shape) {
      case "round":
        return {
          width: baseSize,
          height: baseSize,
          borderRadius: "50%",
        };
      case "rectangle":
        return {
          width: baseSize * 1.5,
          height: baseSize * 0.8,
          borderRadius: "12px",
        };
      case "square":
        return {
          width: baseSize,
          height: baseSize,
          borderRadius: "12px",
        };
    }
  };

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
              <Users className="w-5 h-5 text-accent" />
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

      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-2">
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setFormData({ name: "", capacity: 8, shape: "round" });
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
                    type="number"
                    min={1}
                    max={20}
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 8 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Bordsform</Label>
                  <Select 
                    value={formData.shape} 
                    onValueChange={(v: "round" | "rectangle" | "square") => setFormData({ ...formData, shape: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TABLE_SHAPES.map((shape) => (
                        <SelectItem key={shape.id} value={shape.id}>
                          {shape.icon} {shape.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
          <Button variant="outline" size="icon" onClick={() => setZoom(z => Math.min(z + 0.1, 2))}>
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setZoom(z => Math.max(z - 0.1, 0.5))}>
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={resetPositions}>
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
        <Button 
          variant="outline" 
          className="gap-2"
          onClick={handleExport}
          disabled={tables.length === 0 || isExporting}
        >
          <Download className="w-4 h-4" />
          {isExporting ? "Exporterar..." : "Exportera som bild"}
        </Button>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Unassigned guests sidebar */}
        <div className="lg:col-span-1 order-2 lg:order-1">
          <div className="bg-card rounded-xl border border-border p-4 sticky top-20">
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
                        <span className="text-xs text-muted-foreground block">
                          +1: {guest.plus_one_name}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="lg:col-span-3 order-1 lg:order-2">
          <div 
            className="bg-card rounded-xl border border-border overflow-hidden"
            style={{ minHeight: "500px" }}
          >
            {tables.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[500px] text-center p-8">
                <Table2 className="w-16 h-16 text-muted-foreground mb-4" />
                <h3 className="font-serif text-xl font-medium text-foreground mb-2">
                  Skapa ert första bord
                </h3>
                <p className="text-muted-foreground mb-4 max-w-sm">
                  Klicka på "Lägg till bord" för att börja designa er bordsplacering
                </p>
              </div>
            ) : (
              <div
                ref={canvasRef}
                className="relative bg-gradient-to-br from-sage-light/30 to-gold-light/20 cursor-move"
                style={{ 
                  minHeight: "500px",
                  transform: `scale(${zoom})`,
                  transformOrigin: "top left",
                  width: `${100 / zoom}%`,
                  height: `${500 / zoom}px`,
                }}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                {/* Grid pattern */}
                <div 
                  className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage: "radial-gradient(circle, #666 1px, transparent 1px)",
                    backgroundSize: "30px 30px",
                  }}
                />

                {tables.map((table) => {
                  const style = getTableStyle(table);
                  const isSelected = selectedTable === table.id;

                  return (
                    <div
                      key={table.id}
                      className={`absolute cursor-grab active:cursor-grabbing transition-shadow ${
                        isSelected ? "ring-2 ring-primary ring-offset-2" : ""
                      } ${!isExporting ? "hover:shadow-lg" : ""}`}
                      style={{
                        left: table.x,
                        top: table.y,
                        ...style,
                        backgroundColor: isSelected ? "hsl(var(--primary) / 0.15)" : "hsl(var(--card))",
                        border: "2px solid hsl(var(--border))",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "8px",
                      }}
                      onMouseDown={(e) => handleMouseDown(e, table.id)}
                      onClick={() => setSelectedTable(table.id)}
                    >
                      <span className="font-serif font-medium text-foreground text-sm text-center">
                        {table.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {table.guests.length}/{table.capacity}
                      </span>

                      {/* Guest names around table */}
                      {table.guests.length > 0 && (
                        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
                          <div className="flex flex-wrap justify-center gap-1 max-w-[200px]">
                            {table.guests.slice(0, 3).map((guestId) => {
                              const guest = getGuestById(guestId);
                              return guest ? (
                                <span 
                                  key={guestId}
                                  className="text-[10px] bg-background/90 px-1.5 py-0.5 rounded text-foreground"
                                >
                                  {guest.name.split(" ")[0]}
                                </span>
                              ) : null;
                            })}
                            {table.guests.length > 3 && (
                              <span className="text-[10px] bg-background/90 px-1.5 py-0.5 rounded text-muted-foreground">
                                +{table.guests.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Selected table details */}
          {selectedTable && !isExporting && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 bg-card rounded-xl border border-border p-4"
            >
              {(() => {
                const table = tables.find(t => t.id === selectedTable);
                if (!table) return null;

                return (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-serif font-medium text-foreground">{table.name}</h4>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditTable(table)}
                        >
                          <Edit2 className="w-4 h-4 mr-1" />
                          Redigera
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive"
                          onClick={() => handleDeleteTable(table.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Ta bort
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Guests at table */}
                      <div>
                        <p className="text-sm font-medium text-foreground mb-2">
                          Gäster ({table.guests.length}/{table.capacity})
                        </p>
                        <div className="space-y-1">
                          {table.guests.map((guestId) => {
                            const guest = getGuestById(guestId);
                            if (!guest) return null;
                            return (
                              <div
                                key={guestId}
                                className="flex items-center justify-between p-2 rounded-lg bg-muted/30"
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
                      </div>

                      {/* Add guest */}
                      <div>
                        <p className="text-sm font-medium text-foreground mb-2">Lägg till gäst</p>
                        {table.guests.length < table.capacity && unassignedGuests.length > 0 ? (
                          <select
                            className="w-full text-sm p-2 rounded-lg border border-border bg-background"
                            value=""
                            onChange={(e) => {
                              if (e.target.value) {
                                addGuestToTable(table.id, e.target.value);
                              }
                            }}
                          >
                            <option value="">Välj gäst...</option>
                            {unassignedGuests.map((guest) => (
                              <option key={guest.id} value={guest.id}>
                                {guest.name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            {table.guests.length >= table.capacity 
                              ? "Bordet är fullt" 
                              : "Alla gäster är placerade"}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          )}
        </div>
      </div>

      {/* Export info */}
      <div className="bg-muted/30 rounded-xl p-4 text-center">
        <p className="text-sm text-muted-foreground">
          💡 Tips: Exportera som bild och ladda upp till Vistaprint, Printler eller liknande för att göra en fin förstoring till festen!
        </p>
      </div>
    </div>
  );
}
