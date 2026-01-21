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
  X,
  RotateCw,
  Loader2,
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
import { useSeatingTables, type TableData, type ChairData } from "@/hooks/useSeatingTables";

interface Guest {
  id: string;
  name: string;
  plus_one: boolean;
  plus_one_name: string | null;
  rsvp_status: string;
}

interface VisualTablePlannerProps {
  confirmedGuests: number;
}

const TABLE_SHAPES = [
  { id: "round", label: "Runt bord", icon: "⭕" },
  { id: "rectangle", label: "Rektangulärt", icon: "▭" },
  { id: "square", label: "Kvadratiskt", icon: "◻" },
  { id: "head", label: "Honörsbord", icon: "👑" },
  { id: "u-shape", label: "U-format bord", icon: "⊔" },
];

const CHAIR_SIZE = 32;
const CHAIR_GAP = 8;


export function VisualTablePlanner({ confirmedGuests }: VisualTablePlannerProps) {
  const { user } = useAuth();
  const canvasRef = useRef<HTMLDivElement>(null);
  const { tables, saveTables, isLoading: isLoadingTables, isSaving, generateChairPositions, getTableSizeForCapacity } = useSeatingTables();
  const [guests, setGuests] = useState<Guest[]>([]);
  const [isLoadingGuests, setIsLoadingGuests] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<TableData | null>(null);
  const [formData, setFormData] = useState({ name: "", capacity: 8, shape: "round" as TableData["shape"] });
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [selectedChair, setSelectedChair] = useState<{ tableId: string; chairIndex: number } | null>(null);
  const [draggedTable, setDraggedTable] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const [localTables, setLocalTables] = useState<TableData[]>([]);

  // Sync local tables with hook tables
  useEffect(() => {
    setLocalTables(tables);
  }, [tables]);

  useEffect(() => {
    if (user) {
      fetchGuests();
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
    setIsLoadingGuests(false);
  };

  const saveTablesHandler = useCallback((newTables: TableData[]) => {
    setLocalTables(newTables);
    saveTables(newTables);
  }, [saveTables]);

  const handleAddTable = () => {
    if (!formData.name.trim()) {
      toast.error("Ange ett namn för bordet");
      return;
    }

    if (editingTable) {
      const updated = localTables.map(t => {
        if (t.id === editingTable.id) {
          // Only regenerate chairs if shape or capacity changed
          const needsNewChairs = t.shape !== formData.shape || t.capacity !== formData.capacity;
          let newChairs = t.chairs;
          
          if (needsNewChairs) {
            newChairs = generateChairPositions(formData.shape, formData.capacity);
            // Preserve guest assignments
            const oldGuests = t.chairs.filter(c => c.guestId).map(c => c.guestId);
            oldGuests.forEach((guestId, i) => {
              if (i < newChairs.length && guestId) {
                newChairs[i].guestId = guestId;
              }
            });
          }
          
          return { 
            ...t, 
            name: formData.name, 
            capacity: formData.capacity, 
            shape: formData.shape,
            chairs: newChairs,
            guests: newChairs.filter(c => c.guestId).map(c => c.guestId as string),
          };
        }
        return t;
      });
      saveTablesHandler(updated);
      toast.success("Bordet har uppdaterats");
    } else {
      const chairs = generateChairPositions(formData.shape, formData.capacity);
      const newTable: TableData = {
        id: crypto.randomUUID(),
        name: formData.name,
        capacity: formData.capacity,
        guests: [],
        chairs,
        x: 200 + Math.random() * 150,
        y: 200 + Math.random() * 150,
        shape: formData.shape,
        rotation: 0,
      };
      saveTablesHandler([...localTables, newTable]);
      toast.success("Bordet har skapats");
    }

    setIsDialogOpen(false);
    setFormData({ name: "", capacity: 8, shape: "round" });
    setEditingTable(null);
  };

  const handleDeleteTable = (tableId: string) => {
    const updated = localTables.filter(t => t.id !== tableId);
    saveTablesHandler(updated);
    setSelectedTable(null);
    setSelectedChair(null);
    toast.success("Bordet har tagits bort");
  };

  const handleEditTable = (table: TableData) => {
    setEditingTable(table);
    setFormData({ name: table.name, capacity: table.capacity, shape: table.shape });
    setIsDialogOpen(true);
  };

  const addGuestToChair = (tableId: string, chairIndex: number, guestId: string) => {
    const updated = localTables.map(t => {
      // First remove guest from all chairs in all tables
      const newChairs = t.chairs.map(chair => 
        chair.guestId === guestId ? { ...chair, guestId: null } : chair
      );
      
      // Then add to target chair if this is the target table
      if (t.id === tableId) {
        newChairs[chairIndex] = { ...newChairs[chairIndex], guestId };
      }
      
      const newGuests = newChairs.filter(c => c.guestId).map(c => c.guestId as string);
      return { ...t, chairs: newChairs, guests: newGuests };
    });
    saveTablesHandler(updated);
    toast.success("Gäst placerad");
  };

  const removeGuestFromChair = (tableId: string, chairIndex: number) => {
    const table = localTables.find(t => t.id === tableId);
    if (!table) return;
    
    const guestId = table.chairs[chairIndex]?.guestId;
    if (!guestId) return;
    
    const updated = localTables.map(t => {
      if (t.id === tableId) {
        const newChairs = [...t.chairs];
        newChairs[chairIndex] = { ...newChairs[chairIndex], guestId: null };
        const newGuests = newChairs.filter(c => c.guestId).map(c => c.guestId as string);
        return { ...t, chairs: newChairs, guests: newGuests };
      }
      return t;
    });
    saveTablesHandler(updated);
    setSelectedChair(null);
    toast.success("Gäst borttagen från stolen");
  };

  const swapChairs = (tableId: string, fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    
    const updated = localTables.map(t => {
      if (t.id === tableId) {
        const newChairs = [...t.chairs];
        const tempGuest = newChairs[fromIndex].guestId;
        newChairs[fromIndex] = { ...newChairs[fromIndex], guestId: newChairs[toIndex].guestId };
        newChairs[toIndex] = { ...newChairs[toIndex], guestId: tempGuest };
        const newGuests = newChairs.filter(c => c.guestId).map(c => c.guestId as string);
        return { ...t, chairs: newChairs, guests: newGuests };
      }
      return t;
    });
    saveTablesHandler(updated);
    toast.success("Platser bytta");
  };

  const handleTableMouseDown = (e: React.MouseEvent, tableId: string) => {
    e.stopPropagation();
    if (!canvasRef.current) return;
    const table = localTables.find(t => t.id === tableId);
    if (!table) return;

    const rect = canvasRef.current.getBoundingClientRect();
    setDragOffset({
      x: (e.clientX - rect.left) / zoom - table.x,
      y: (e.clientY - rect.top) / zoom - table.y,
    });
    setDraggedTable(tableId);
    setSelectedTable(tableId);
  };

  const handleTableTouchStart = (e: React.TouchEvent, tableId: string) => {
    e.stopPropagation();
    if (!canvasRef.current) return;
    const table = localTables.find(t => t.id === tableId);
    if (!table) return;

    const touch = e.touches[0];
    const rect = canvasRef.current.getBoundingClientRect();
    setDragOffset({
      x: (touch.clientX - rect.left) / zoom - table.x,
      y: (touch.clientY - rect.top) / zoom - table.y,
    });
    setDraggedTable(tableId);
    setSelectedTable(tableId);
  };

  const handleChairClick = (e: React.MouseEvent, tableId: string, chairIndex: number) => {
    e.stopPropagation();
    
    // If clicking same chair that's selected, deselect
    if (selectedChair?.tableId === tableId && selectedChair?.chairIndex === chairIndex) {
      setSelectedChair(null);
      return;
    }
    
    // If we have a selected chair from same table, swap them
    if (selectedChair && selectedChair.tableId === tableId && selectedChair.chairIndex !== chairIndex) {
      swapChairs(tableId, selectedChair.chairIndex, chairIndex);
      setSelectedChair(null);
      return;
    }
    
    setSelectedTable(tableId);
    setSelectedChair({ tableId, chairIndex });
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!draggedTable || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom - dragOffset.x;
    const y = (e.clientY - rect.top) / zoom - dragOffset.y;

    setLocalTables(prev => prev.map(t => 
      t.id === draggedTable ? { ...t, x: Math.max(100, x), y: Math.max(100, y) } : t
    ));
  }, [draggedTable, dragOffset, zoom]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!draggedTable || !canvasRef.current) return;

    const touch = e.touches[0];
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (touch.clientX - rect.left) / zoom - dragOffset.x;
    const y = (touch.clientY - rect.top) / zoom - dragOffset.y;

    setLocalTables(prev => prev.map(t => 
      t.id === draggedTable ? { ...t, x: Math.max(100, x), y: Math.max(100, y) } : t
    ));
  }, [draggedTable, dragOffset, zoom]);

  const handleMouseUp = useCallback(() => {
    if (draggedTable) {
      saveTablesHandler(localTables);
      setDraggedTable(null);
    }
  }, [draggedTable, localTables, saveTablesHandler]);

  const handleCanvasClick = (e: React.MouseEvent) => {
    // Only deselect if clicking on canvas background
    if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains('canvas-bg')) {
      setSelectedTable(null);
      setSelectedChair(null);
    }
  };

  const handleExport = async () => {
    if (!canvasRef.current) return;

    setIsExporting(true);
    setSelectedTable(null);
    setSelectedChair(null);

    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      const dataUrl = await toPng(canvasRef.current, {
        backgroundColor: "#ffffff",
        pixelRatio: 2,
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
    const updated = localTables.map((t, i) => ({
      ...t,
      x: 200 + (i % 3) * 300,
      y: 200 + Math.floor(i / 3) * 300,
      rotation: 0,
    }));
    saveTablesHandler(updated);
    toast.success("Positioner återställda");
  };

  const rotateTable = (tableId: string, degrees: number) => {
    const updated = localTables.map(t => 
      t.id === tableId ? { ...t, rotation: ((t.rotation || 0) + degrees) % 360 } : t
    );
    saveTablesHandler(updated);
  };

  const unassignedGuests = guests.filter(
    g => !localTables.some(t => t.guests.includes(g.id))
  );

  const getGuestById = (id: string) => guests.find(g => g.id === id);

  const totalSeats = localTables.reduce((sum, t) => sum + t.capacity, 0);
  const totalAssigned = localTables.reduce((sum, t) => sum + t.guests.length, 0);
  const isLoading = isLoadingTables || isLoadingGuests;

  const getTableDimensions = (table: TableData) => {
    const sizeInfo = getTableSizeForCapacity(table.shape, table.capacity);
    switch (table.shape) {
      case "round": {
        const { tableRadius } = sizeInfo as { tableRadius: number; orbitRadius: number };
        return { width: tableRadius * 2, height: tableRadius * 2 };
      }
      case "head": {
        const { width, height } = sizeInfo as { width: number; height: number };
        return { width, height };
      }
      case "u-shape": {
        const { baseWidth, armHeight } = sizeInfo as { baseWidth: number; armHeight: number };
        return { width: baseWidth, height: armHeight };
      }
      case "rectangle": {
        const { width, height } = sizeInfo as { width: number; height: number };
        return { width, height };
      }
      case "square": {
        const { size } = sizeInfo as { size: number };
        return { width: size, height: size };
      }
      default:
        return { width: 100, height: 100 };
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
              <p className="text-2xl font-serif font-medium text-foreground">{localTables.length}</p>
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
                    min={2}
                    max={20}
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 8 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Bordsform</Label>
                  <Select 
                    value={formData.shape} 
                    onValueChange={(v: TableData["shape"]) => setFormData({ ...formData, shape: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background border border-border z-50">
                      {TABLE_SHAPES.map((shape) => (
                        <SelectItem key={shape.id} value={shape.id}>
                          {shape.icon} {shape.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Avbryt
                  </Button>
                  <Button type="button" onClick={handleAddTable}>
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
          disabled={localTables.length === 0 || isExporting}
        >
          <Download className="w-4 h-4" />
          {isExporting ? "Exporterar..." : "Exportera som bild"}
        </Button>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1 order-2 lg:order-1 space-y-4">
          {/* Unassigned guests */}
          <div className="bg-card rounded-xl border border-border p-4 sticky top-20">
            <h3 className="font-serif text-lg font-medium text-foreground mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Ej placerade ({unassignedGuests.length})
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {unassignedGuests.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Alla gäster är placerade!
                </p>
              ) : (
                unassignedGuests.map((guest) => (
                  <div
                    key={guest.id}
                    className={`flex items-center justify-between p-2 rounded-lg transition-colors cursor-pointer
                      ${selectedChair ? "bg-primary/10 hover:bg-primary/20" : "bg-muted/30 hover:bg-muted/50"}
                    `}
                    onClick={() => {
                      if (selectedChair) {
                        addGuestToChair(selectedChair.tableId, selectedChair.chairIndex, guest.id);
                        setSelectedChair(null);
                      } else {
                        toast.info("Välj först en stol att placera gästen på");
                      }
                    }}
                  >
                    <div>
                      <span className="text-sm font-medium text-foreground">{guest.name}</span>
                      {guest.plus_one && guest.plus_one_name && (
                        <span className="text-xs text-muted-foreground block">
                          +1: {guest.plus_one_name}
                        </span>
                      )}
                    </div>
                    {selectedChair && (
                      <span className="text-xs text-primary font-medium">+ Placera</span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Selected chair panel */}
          {selectedChair && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-xl border border-primary/30 p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-foreground">Vald stol</h4>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setSelectedChair(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              {(() => {
                const table = localTables.find(t => t.id === selectedChair.tableId);
                if (!table) return null;
                const chair = table.chairs[selectedChair.chairIndex];
                const guest = chair?.guestId ? getGuestById(chair.guestId) : null;
                
                return (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      {table.name} • Stol {selectedChair.chairIndex + 1}
                    </p>
                    {guest ? (
                      <div className="flex items-center justify-between p-2 rounded-lg bg-primary/10">
                        <span className="text-sm font-medium text-foreground">{guest.name}</span>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeGuestFromChair(selectedChair.tableId, selectedChair.chairIndex)}
                        >
                          <UserMinus className="w-4 h-4 mr-1" />
                          Ta bort
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          Klicka på en gäst ovan för att placera
                        </p>
                        {unassignedGuests.length > 0 && (
                          <select
                            className="w-full text-sm p-2 rounded-lg border border-border bg-background"
                            value=""
                            onChange={(e) => {
                              if (e.target.value) {
                                addGuestToChair(selectedChair.tableId, selectedChair.chairIndex, e.target.value);
                                setSelectedChair(null);
                              }
                            }}
                          >
                            <option value="">Välj gäst...</option>
                            {unassignedGuests.map((g) => (
                              <option key={g.id} value={g.id}>
                                {g.name}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      💡 Klicka på en annan stol för att byta plats
                    </p>
                  </div>
                );
              })()}
            </motion.div>
          )}
        </div>

        {/* Canvas */}
        <div className="lg:col-span-3 order-1 lg:order-2">
          <div 
            className="bg-card rounded-xl border border-border overflow-hidden"
            style={{ minHeight: "600px" }}
          >
            {localTables.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[600px] text-center p-8">
                <Table2 className="w-16 h-16 text-muted-foreground mb-4" />
                <h3 className="font-serif text-xl font-medium text-foreground mb-2">
                  Skapa ert första bord
                </h3>
                <p className="text-muted-foreground mb-4 max-w-sm">
                  Klicka på "Lägg till bord" för att börja
                </p>
              </div>
            ) : (
              <div
                ref={canvasRef}
                className="relative canvas-bg touch-none"
                style={{ 
                  minHeight: "600px",
                  height: `${600 / zoom}px`,
                  width: `${100 / zoom}%`,
                  transform: `scale(${zoom})`,
                  transformOrigin: "top left",
                  background: "linear-gradient(135deg, hsl(var(--sage-light) / 0.3) 0%, hsl(var(--gold-light) / 0.2) 100%)",
                }}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleMouseUp}
                onClick={handleCanvasClick}
              >
                {/* Grid */}
                <div 
                  className="absolute inset-0 pointer-events-none opacity-[0.08]"
                  style={{
                    backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
                    backgroundSize: "25px 25px",
                  }}
                />

                {localTables.map((table) => {
                  const dims = getTableDimensions(table);
                  const isSelected = selectedTable === table.id;

                  return (
                    <div
                      key={table.id}
                      className="absolute"
                      style={{
                        left: table.x,
                        top: table.y,
                        transform: `translate(-50%, -50%) rotate(${table.rotation || 0}deg)`,
                      }}
                    >
                      {/* Chairs */}
                      {table.chairs.map((chair, idx) => {
                        const guest = chair.guestId ? getGuestById(chair.guestId) : null;
                        const isChairSelected = selectedChair?.tableId === table.id && selectedChair?.chairIndex === idx;
                        
                        return (
                          <div
                            key={idx}
                            className={`absolute flex flex-col items-center cursor-pointer transition-all duration-150
                              ${isChairSelected ? "z-30 scale-110" : "z-20"}
                            `}
                            style={{
                              left: chair.position.x - CHAIR_SIZE / 2,
                              top: chair.position.y - CHAIR_SIZE / 2,
                              width: CHAIR_SIZE,
                              height: CHAIR_SIZE,
                            }}
                            onClick={(e) => handleChairClick(e, table.id, idx)}
                          >
                            <div 
                              className={`w-10 h-10 rounded-full border-2 flex items-center justify-center 
                                text-xs font-semibold shadow-md transition-all
                                ${guest 
                                  ? "bg-primary text-primary-foreground border-primary" 
                                  : "bg-background border-border text-muted-foreground hover:border-primary/50"
                                }
                                ${isChairSelected ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}
                              `}
                            >
                              {guest ? guest.name.charAt(0).toUpperCase() : idx + 1}
                            </div>
                            {guest && (
                              <span 
                                className="absolute top-full mt-0.5 text-[10px] font-medium text-foreground 
                                  bg-background/95 px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap 
                                  max-w-[70px] truncate border border-border/50"
                              >
                                {guest.name.split(" ")[0]}
                              </span>
                            )}
                          </div>
                        );
                      })}

                      {/* Table shape */}
                      <div
                        className={`cursor-grab active:cursor-grabbing transition-all
                          ${isSelected ? "ring-2 ring-primary ring-offset-2" : ""}
                          ${!isExporting ? "hover:shadow-xl" : ""}
                        `}
                        style={{
                          width: dims.width,
                          height: dims.height,
                          transform: "translate(-50%, -50%)",
                          borderRadius: table.shape === "round" ? "50%" : table.shape === "u-shape" ? 0 : "12px",
                          backgroundColor: "hsl(var(--card))",
                          border: `3px solid ${isSelected ? "hsl(var(--primary))" : "hsl(var(--border))"}`,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: isSelected ? "0 8px 30px -10px hsl(var(--primary) / 0.3)" : "0 4px 15px -5px rgba(0,0,0,0.1)",
                        }}
                        onMouseDown={(e) => handleTableMouseDown(e, table.id)}
                        onTouchStart={(e) => handleTableTouchStart(e, table.id)}
                      >
                        {table.shape === "u-shape" ? (
                          <div className="relative w-full h-full">
                            <div className="absolute left-0 top-0 w-10 h-full bg-card border-r-0" 
                              style={{ 
                                borderRadius: "12px 0 0 12px",
                                border: `3px solid ${isSelected ? "hsl(var(--primary))" : "hsl(var(--border))"}`,
                                borderRight: "none",
                              }} 
                            />
                            <div className="absolute right-0 top-0 w-10 h-full bg-card border-l-0"
                              style={{ 
                                borderRadius: "0 12px 12px 0",
                                border: `3px solid ${isSelected ? "hsl(var(--primary))" : "hsl(var(--border))"}`,
                                borderLeft: "none",
                              }} 
                            />
                            <div className="absolute left-10 right-10 bottom-0 h-8 bg-card"
                              style={{ 
                                borderRadius: "0 0 12px 12px",
                                border: `3px solid ${isSelected ? "hsl(var(--primary))" : "hsl(var(--border))"}`,
                                borderTop: "none",
                              }} 
                            />
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <span className="font-serif font-medium text-foreground text-sm">{table.name}</span>
                              <span className="text-xs text-muted-foreground">{table.guests.length}/{table.capacity}</span>
                            </div>
                          </div>
                        ) : (
                          <>
                            <span className="font-serif font-medium text-foreground text-sm text-center px-2 leading-tight">
                              {table.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {table.guests.length}/{table.capacity}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Selected table actions */}
          {selectedTable && !isExporting && !selectedChair && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 bg-card rounded-xl border border-border p-4"
            >
              {(() => {
                const table = localTables.find(t => t.id === selectedTable);
                if (!table) return null;

                return (
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-serif font-medium text-foreground">{table.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {TABLE_SHAPES.find(s => s.id === table.shape)?.label} • {table.guests.length}/{table.capacity} platser
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => rotateTable(table.id, -15)}
                        title="Rotera vänster"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => rotateTable(table.id, 15)}
                        title="Rotera höger"
                      >
                        <RotateCw className="w-4 h-4" />
                      </Button>
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
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteTable(table.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Ta bort
                      </Button>
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          )}
        </div>
      </div>

      {/* Tips */}
      <div className="bg-muted/30 rounded-xl p-4 text-center">
        <p className="text-sm text-muted-foreground">
          💡 Klicka på en stol → välj gäst från listan. Klicka på två stolar efter varandra för att byta plats!
        </p>
      </div>
    </div>
  );
}
