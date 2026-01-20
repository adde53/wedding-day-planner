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

interface ChairData {
  guestId: string | null;
  angle: number; // Angle around the table (for round) or position index
}

interface TableData {
  id: string;
  name: string;
  capacity: number;
  guests: string[];
  chairs: ChairData[];
  x: number;
  y: number;
  shape: "round" | "rectangle" | "square" | "head" | "u-shape";
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

// Generate initial chair positions based on table shape and capacity
const generateChairPositions = (shape: TableData["shape"], capacity: number): ChairData[] => {
  const chairs: ChairData[] = [];
  
  for (let i = 0; i < capacity; i++) {
    if (shape === "round") {
      // Distribute chairs evenly around the circle
      chairs.push({ guestId: null, angle: (360 / capacity) * i - 90 });
    } else if (shape === "head" || shape === "rectangle") {
      // For head table, all chairs on one side
      if (shape === "head") {
        chairs.push({ guestId: null, angle: i }); // Position index for linear layout
      } else {
        // Rectangle: distribute on long sides
        chairs.push({ guestId: null, angle: i });
      }
    } else if (shape === "u-shape") {
      // U-shape: chairs on outside of U
      chairs.push({ guestId: null, angle: i });
    } else {
      // Square: distribute on all sides
      chairs.push({ guestId: null, angle: i });
    }
  }
  
  return chairs;
};

export function VisualTablePlanner({ confirmedGuests }: VisualTablePlannerProps) {
  const { user } = useAuth();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [tables, setTables] = useState<TableData[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<TableData | null>(null);
  const [formData, setFormData] = useState({ name: "", capacity: 8, shape: "round" as TableData["shape"] });
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [selectedChair, setSelectedChair] = useState<{ tableId: string; chairIndex: number } | null>(null);
  const [draggedTable, setDraggedTable] = useState<string | null>(null);
  const [draggedChair, setDraggedChair] = useState<{ tableId: string; chairIndex: number } | null>(null);
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
    const stored = localStorage.getItem(`visual_tables_v2_${user.id}`);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Migrate old format if needed
      const migrated = parsed.map((t: TableData) => ({
        ...t,
        chairs: t.chairs || generateChairPositions(t.shape, t.capacity),
      }));
      setTables(migrated);
    }
  };

  const saveTablestoStorage = (newTables: TableData[]) => {
    if (!user) return;
    localStorage.setItem(`visual_tables_v2_${user.id}`, JSON.stringify(newTables));
    setTables(newTables);
  };

  const handleAddTable = () => {
    if (!formData.name.trim()) {
      toast.error("Ange ett namn för bordet");
      return;
    }

    if (editingTable) {
      const updated = tables.map(t => {
        if (t.id === editingTable.id) {
          const newChairs = generateChairPositions(formData.shape, formData.capacity);
          // Preserve existing guest assignments if capacity allows
          const oldGuests = t.chairs.filter(c => c.guestId).map(c => c.guestId);
          oldGuests.forEach((guestId, i) => {
            if (i < newChairs.length && guestId) {
              newChairs[i].guestId = guestId;
            }
          });
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
      saveTablestoStorage(updated);
      toast.success("Bordet har uppdaterats");
    } else {
      const chairs = generateChairPositions(formData.shape, formData.capacity);
      const newTable: TableData = {
        id: crypto.randomUUID(),
        name: formData.name,
        capacity: formData.capacity,
        guests: [],
        chairs,
        x: 150 + Math.random() * 200,
        y: 150 + Math.random() * 200,
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
    setSelectedChair(null);
    toast.success("Bordet har tagits bort");
  };

  const handleEditTable = (table: TableData) => {
    setEditingTable(table);
    setFormData({ name: table.name, capacity: table.capacity, shape: table.shape });
    setIsDialogOpen(true);
  };

  const addGuestToChair = (tableId: string, chairIndex: number, guestId: string) => {
    const updated = tables.map(t => {
      if (t.id === tableId) {
        const newChairs = [...t.chairs];
        // Remove guest from any other chair first
        newChairs.forEach((chair, i) => {
          if (chair.guestId === guestId) {
            newChairs[i] = { ...chair, guestId: null };
          }
        });
        newChairs[chairIndex] = { ...newChairs[chairIndex], guestId };
        const newGuests = newChairs.filter(c => c.guestId).map(c => c.guestId as string);
        return { ...t, chairs: newChairs, guests: newGuests };
      } else {
        // Remove from other tables too
        const newChairs = t.chairs.map(chair => 
          chair.guestId === guestId ? { ...chair, guestId: null } : chair
        );
        const newGuests = newChairs.filter(c => c.guestId).map(c => c.guestId as string);
        return { ...t, chairs: newChairs, guests: newGuests };
      }
    });
    saveTablestoStorage(updated);
  };

  const removeGuestFromChair = (tableId: string, chairIndex: number) => {
    const updated = tables.map(t => {
      if (t.id === tableId) {
        const newChairs = [...t.chairs];
        newChairs[chairIndex] = { ...newChairs[chairIndex], guestId: null };
        const newGuests = newChairs.filter(c => c.guestId).map(c => c.guestId as string);
        return { ...t, chairs: newChairs, guests: newGuests };
      }
      return t;
    });
    saveTablestoStorage(updated);
    setSelectedChair(null);
  };

  const swapChairs = (tableId: string, fromIndex: number, toIndex: number) => {
    const updated = tables.map(t => {
      if (t.id === tableId) {
        const newChairs = [...t.chairs];
        const temp = newChairs[fromIndex].guestId;
        newChairs[fromIndex] = { ...newChairs[fromIndex], guestId: newChairs[toIndex].guestId };
        newChairs[toIndex] = { ...newChairs[toIndex], guestId: temp };
        const newGuests = newChairs.filter(c => c.guestId).map(c => c.guestId as string);
        return { ...t, chairs: newChairs, guests: newGuests };
      }
      return t;
    });
    saveTablestoStorage(updated);
  };

  const handleTableMouseDown = (e: React.MouseEvent, tableId: string) => {
    e.stopPropagation();
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
    setSelectedChair(null);
  };

  const handleChairClick = (e: React.MouseEvent, tableId: string, chairIndex: number) => {
    e.stopPropagation();
    
    if (draggedChair && draggedChair.tableId === tableId) {
      // Swap chairs
      swapChairs(tableId, draggedChair.chairIndex, chairIndex);
      setDraggedChair(null);
    } else {
      setSelectedTable(tableId);
      setSelectedChair({ tableId, chairIndex });
    }
  };

  const handleChairDragStart = (e: React.MouseEvent, tableId: string, chairIndex: number) => {
    e.stopPropagation();
    setDraggedChair({ tableId, chairIndex });
    setSelectedChair({ tableId, chairIndex });
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!draggedTable || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom - dragOffset.x;
    const y = (e.clientY - rect.top) / zoom - dragOffset.y;

    const updated = tables.map(t => 
      t.id === draggedTable ? { ...t, x: Math.max(50, x), y: Math.max(50, y) } : t
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
    setSelectedChair(null);

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
      x: 150 + (i % 3) * 280,
      y: 150 + Math.floor(i / 3) * 280,
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

  // Render chairs based on table shape
  const renderChairs = (table: TableData) => {
    const { shape, chairs, capacity } = table;
    
    if (shape === "round") {
      return renderRoundTableChairs(table, chairs);
    } else if (shape === "head") {
      return renderHeadTableChairs(table, chairs);
    } else if (shape === "u-shape") {
      return renderUShapeChairs(table, chairs);
    } else if (shape === "rectangle") {
      return renderRectangleChairs(table, chairs);
    } else {
      return renderSquareChairs(table, chairs);
    }
  };

  const renderRoundTableChairs = (table: TableData, chairs: ChairData[]) => {
    const tableRadius = table.capacity <= 6 ? 50 : table.capacity <= 10 ? 65 : 80;
    const chairRadius = 22;
    const orbitRadius = tableRadius + chairRadius + 8;

    return chairs.map((chair, index) => {
      const angle = (chair.angle * Math.PI) / 180;
      const x = Math.cos(angle) * orbitRadius;
      const y = Math.sin(angle) * orbitRadius;
      const guest = chair.guestId ? getGuestById(chair.guestId) : null;
      const isSelected = selectedChair?.tableId === table.id && selectedChair?.chairIndex === index;
      const isDragging = draggedChair?.tableId === table.id && draggedChair?.chairIndex === index;

      return (
        <div
          key={index}
          className={`absolute flex flex-col items-center justify-center transition-all cursor-pointer
            ${isSelected ? "z-20" : "z-10"}
            ${isDragging ? "opacity-50" : ""}
          `}
          style={{
            left: `calc(50% + ${x}px - ${chairRadius}px)`,
            top: `calc(50% + ${y}px - ${chairRadius}px)`,
            width: chairRadius * 2,
            height: chairRadius * 2,
          }}
          onClick={(e) => handleChairClick(e, table.id, index)}
          onMouseDown={(e) => handleChairDragStart(e, table.id, index)}
        >
          {/* Chair visual */}
          <div 
            className={`w-9 h-9 rounded-full border-2 flex items-center justify-center text-[10px] font-medium shadow-sm
              ${guest 
                ? "bg-primary/20 border-primary text-primary" 
                : "bg-muted border-border text-muted-foreground"
              }
              ${isSelected ? "ring-2 ring-primary ring-offset-1" : ""}
              hover:scale-110 transition-transform
            `}
          >
            {guest ? guest.name.charAt(0).toUpperCase() : index + 1}
          </div>
          {/* Guest name label */}
          {guest && (
            <span className="absolute -bottom-4 text-[9px] font-medium text-foreground bg-background/90 px-1 rounded whitespace-nowrap max-w-[60px] truncate">
              {guest.name.split(" ")[0]}
            </span>
          )}
        </div>
      );
    });
  };

  const renderHeadTableChairs = (table: TableData, chairs: ChairData[]) => {
    const tableWidth = Math.max(200, table.capacity * 45);
    const chairSize = 36;
    const spacing = tableWidth / (chairs.length + 1);

    return chairs.map((chair, index) => {
      const guest = chair.guestId ? getGuestById(chair.guestId) : null;
      const isSelected = selectedChair?.tableId === table.id && selectedChair?.chairIndex === index;
      const isDragging = draggedChair?.tableId === table.id && draggedChair?.chairIndex === index;

      return (
        <div
          key={index}
          className={`absolute flex flex-col items-center transition-all cursor-pointer
            ${isSelected ? "z-20" : "z-10"}
            ${isDragging ? "opacity-50" : ""}
          `}
          style={{
            left: `${spacing * (index + 1) - chairSize / 2}px`,
            top: `-${chairSize + 10}px`,
            width: chairSize,
          }}
          onClick={(e) => handleChairClick(e, table.id, index)}
          onMouseDown={(e) => handleChairDragStart(e, table.id, index)}
        >
          <div 
            className={`w-9 h-9 rounded-full border-2 flex items-center justify-center text-[10px] font-medium shadow-sm
              ${guest 
                ? "bg-primary/20 border-primary text-primary" 
                : "bg-muted border-border text-muted-foreground"
              }
              ${isSelected ? "ring-2 ring-primary ring-offset-1" : ""}
              hover:scale-110 transition-transform
            `}
          >
            {guest ? guest.name.charAt(0).toUpperCase() : index + 1}
          </div>
          {guest && (
            <span className="absolute top-10 text-[9px] font-medium text-foreground bg-background/90 px-1 rounded whitespace-nowrap max-w-[60px] truncate">
              {guest.name.split(" ")[0]}
            </span>
          )}
        </div>
      );
    });
  };

  const renderUShapeChairs = (table: TableData, chairs: ChairData[]) => {
    const armLength = 100;
    const baseWidth = Math.max(180, (table.capacity - 4) * 40);
    const chairSize = 36;
    
    // Distribute chairs: 2 on each arm, rest on the base
    const leftArmCount = Math.min(2, Math.floor(chairs.length / 4));
    const rightArmCount = Math.min(2, Math.floor(chairs.length / 4));
    const baseCount = chairs.length - leftArmCount - rightArmCount;

    return chairs.map((chair, index) => {
      const guest = chair.guestId ? getGuestById(chair.guestId) : null;
      const isSelected = selectedChair?.tableId === table.id && selectedChair?.chairIndex === index;
      const isDragging = draggedChair?.tableId === table.id && draggedChair?.chairIndex === index;

      let x = 0, y = 0;
      
      if (index < leftArmCount) {
        // Left arm (outside)
        x = -chairSize - 10;
        y = 20 + index * 50;
      } else if (index < leftArmCount + rightArmCount) {
        // Right arm (outside)
        x = baseWidth + 10;
        y = 20 + (index - leftArmCount) * 50;
      } else {
        // Base (bottom, outside)
        const baseIndex = index - leftArmCount - rightArmCount;
        const spacing = baseWidth / (baseCount + 1);
        x = spacing * (baseIndex + 1) - chairSize / 2;
        y = armLength + 10;
      }

      return (
        <div
          key={index}
          className={`absolute flex flex-col items-center transition-all cursor-pointer
            ${isSelected ? "z-20" : "z-10"}
            ${isDragging ? "opacity-50" : ""}
          `}
          style={{
            left: `${x}px`,
            top: `${y}px`,
            width: chairSize,
          }}
          onClick={(e) => handleChairClick(e, table.id, index)}
          onMouseDown={(e) => handleChairDragStart(e, table.id, index)}
        >
          <div 
            className={`w-9 h-9 rounded-full border-2 flex items-center justify-center text-[10px] font-medium shadow-sm
              ${guest 
                ? "bg-primary/20 border-primary text-primary" 
                : "bg-muted border-border text-muted-foreground"
              }
              ${isSelected ? "ring-2 ring-primary ring-offset-1" : ""}
              hover:scale-110 transition-transform
            `}
          >
            {guest ? guest.name.charAt(0).toUpperCase() : index + 1}
          </div>
          {guest && (
            <span className="absolute top-10 text-[9px] font-medium text-foreground bg-background/90 px-1 rounded whitespace-nowrap max-w-[60px] truncate">
              {guest.name.split(" ")[0]}
            </span>
          )}
        </div>
      );
    });
  };

  const renderRectangleChairs = (table: TableData, chairs: ChairData[]) => {
    const tableWidth = 180;
    const tableHeight = 80;
    const chairSize = 36;
    const halfChairs = Math.ceil(chairs.length / 2);

    return chairs.map((chair, index) => {
      const guest = chair.guestId ? getGuestById(chair.guestId) : null;
      const isSelected = selectedChair?.tableId === table.id && selectedChair?.chairIndex === index;
      const isDragging = draggedChair?.tableId === table.id && draggedChair?.chairIndex === index;

      const isTop = index < halfChairs;
      const posIndex = isTop ? index : index - halfChairs;
      const spacing = tableWidth / (halfChairs + 1);

      return (
        <div
          key={index}
          className={`absolute flex flex-col items-center transition-all cursor-pointer
            ${isSelected ? "z-20" : "z-10"}
            ${isDragging ? "opacity-50" : ""}
          `}
          style={{
            left: `${spacing * (posIndex + 1) - chairSize / 2}px`,
            top: isTop ? `-${chairSize + 8}px` : `${tableHeight + 8}px`,
            width: chairSize,
          }}
          onClick={(e) => handleChairClick(e, table.id, index)}
          onMouseDown={(e) => handleChairDragStart(e, table.id, index)}
        >
          <div 
            className={`w-9 h-9 rounded-full border-2 flex items-center justify-center text-[10px] font-medium shadow-sm
              ${guest 
                ? "bg-primary/20 border-primary text-primary" 
                : "bg-muted border-border text-muted-foreground"
              }
              ${isSelected ? "ring-2 ring-primary ring-offset-1" : ""}
              hover:scale-110 transition-transform
            `}
          >
            {guest ? guest.name.charAt(0).toUpperCase() : index + 1}
          </div>
          {guest && (
            <span className={`absolute ${isTop ? "top-10" : "-top-4"} text-[9px] font-medium text-foreground bg-background/90 px-1 rounded whitespace-nowrap max-w-[60px] truncate`}>
              {guest.name.split(" ")[0]}
            </span>
          )}
        </div>
      );
    });
  };

  const renderSquareChairs = (table: TableData, chairs: ChairData[]) => {
    const tableSize = 100;
    const chairSize = 36;
    const sidesCount = Math.ceil(chairs.length / 4);

    return chairs.map((chair, index) => {
      const guest = chair.guestId ? getGuestById(chair.guestId) : null;
      const isSelected = selectedChair?.tableId === table.id && selectedChair?.chairIndex === index;
      const isDragging = draggedChair?.tableId === table.id && draggedChair?.chairIndex === index;

      const side = Math.floor(index / sidesCount);
      const posInSide = index % sidesCount;
      const spacing = tableSize / (sidesCount + 1);

      let x = 0, y = 0;
      switch (side) {
        case 0: // Top
          x = spacing * (posInSide + 1) - chairSize / 2;
          y = -chairSize - 8;
          break;
        case 1: // Right
          x = tableSize + 8;
          y = spacing * (posInSide + 1) - chairSize / 2;
          break;
        case 2: // Bottom
          x = spacing * (posInSide + 1) - chairSize / 2;
          y = tableSize + 8;
          break;
        case 3: // Left
          x = -chairSize - 8;
          y = spacing * (posInSide + 1) - chairSize / 2;
          break;
      }

      return (
        <div
          key={index}
          className={`absolute flex items-center justify-center transition-all cursor-pointer
            ${isSelected ? "z-20" : "z-10"}
            ${isDragging ? "opacity-50" : ""}
          `}
          style={{
            left: `${x}px`,
            top: `${y}px`,
            width: chairSize,
            height: chairSize,
          }}
          onClick={(e) => handleChairClick(e, table.id, index)}
          onMouseDown={(e) => handleChairDragStart(e, table.id, index)}
        >
          <div 
            className={`w-9 h-9 rounded-full border-2 flex items-center justify-center text-[10px] font-medium shadow-sm
              ${guest 
                ? "bg-primary/20 border-primary text-primary" 
                : "bg-muted border-border text-muted-foreground"
              }
              ${isSelected ? "ring-2 ring-primary ring-offset-1" : ""}
              hover:scale-110 transition-transform
            `}
          >
            {guest ? guest.name.charAt(0).toUpperCase() : index + 1}
          </div>
        </div>
      );
    });
  };

  const getTableDimensions = (table: TableData) => {
    const { shape, capacity } = table;
    
    switch (shape) {
      case "round": {
        const size = capacity <= 6 ? 100 : capacity <= 10 ? 130 : 160;
        return { width: size, height: size, borderRadius: "50%" };
      }
      case "head": {
        const width = Math.max(200, capacity * 45);
        return { width, height: 50, borderRadius: "8px" };
      }
      case "u-shape": {
        const baseWidth = Math.max(180, (capacity - 4) * 40);
        return { width: baseWidth, height: 120, borderRadius: "0" };
      }
      case "rectangle": {
        return { width: 180, height: 80, borderRadius: "12px" };
      }
      case "square": {
        return { width: 100, height: 100, borderRadius: "12px" };
      }
      default:
        return { width: 120, height: 120, borderRadius: "50%" };
    }
  };

  const renderTableShape = (table: TableData) => {
    const dims = getTableDimensions(table);
    const isSelected = selectedTable === table.id;

    if (table.shape === "u-shape") {
      const armWidth = 40;
      const baseHeight = 40;
      const armHeight = dims.height - baseHeight;
      
      return (
        <div className="relative" style={{ width: dims.width, height: dims.height }}>
          {/* Left arm */}
          <div 
            className={`absolute left-0 top-0 bg-card border-2 ${isSelected ? "border-primary" : "border-border"}`}
            style={{ width: armWidth, height: armHeight + baseHeight, borderRadius: "8px 0 0 8px" }}
          />
          {/* Right arm */}
          <div 
            className={`absolute right-0 top-0 bg-card border-2 ${isSelected ? "border-primary" : "border-border"}`}
            style={{ width: armWidth, height: armHeight + baseHeight, borderRadius: "0 8px 8px 0" }}
          />
          {/* Base connecting the arms */}
          <div 
            className={`absolute bottom-0 bg-card border-2 ${isSelected ? "border-primary" : "border-border"}`}
            style={{ 
              left: armWidth - 2, 
              width: dims.width - (armWidth * 2) + 4, 
              height: baseHeight,
              borderRadius: "0 0 8px 8px",
              borderTop: "none",
            }}
          />
          {/* Center label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="font-serif font-medium text-foreground text-sm">{table.name}</span>
            <span className="text-xs text-muted-foreground">{table.guests.length}/{table.capacity}</span>
          </div>
        </div>
      );
    }

    return (
      <div
        className={`bg-card border-2 flex flex-col items-center justify-center
          ${isSelected ? "border-primary shadow-lg" : "border-border"}
        `}
        style={{
          width: dims.width,
          height: dims.height,
          borderRadius: dims.borderRadius,
        }}
      >
        <span className="font-serif font-medium text-foreground text-sm text-center px-2">
          {table.name}
        </span>
        <span className="text-xs text-muted-foreground">
          {table.guests.length}/{table.capacity}
        </span>
      </div>
    );
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
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => {
                      if (selectedChair) {
                        addGuestToChair(selectedChair.tableId, selectedChair.chairIndex, guest.id);
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
                      <span className="text-xs text-primary">Klicka för att placera</span>
                    )}
                  </div>
                ))
              )}
            </div>
            {selectedChair && (
              <p className="text-xs text-muted-foreground mt-4 text-center">
                Välj en gäst för att placera på stol {selectedChair.chairIndex + 1}
              </p>
            )}
          </div>
        </div>

        {/* Canvas */}
        <div className="lg:col-span-3 order-1 lg:order-2">
          <div 
            className="bg-card rounded-xl border border-border overflow-hidden"
            style={{ minHeight: "600px" }}
          >
            {tables.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[600px] text-center p-8">
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
                  minHeight: "600px",
                  transform: `scale(${zoom})`,
                  transformOrigin: "top left",
                  width: `${100 / zoom}%`,
                  height: `${600 / zoom}px`,
                }}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={() => {
                  handleMouseUp();
                  setDraggedChair(null);
                }}
                onClick={() => {
                  if (!draggedTable) {
                    setSelectedTable(null);
                    setSelectedChair(null);
                  }
                }}
              >
                {/* Grid pattern */}
                <div 
                  className="absolute inset-0 opacity-10 pointer-events-none"
                  style={{
                    backgroundImage: "radial-gradient(circle, #666 1px, transparent 1px)",
                    backgroundSize: "30px 30px",
                  }}
                />

                {tables.map((table) => {
                  const dims = getTableDimensions(table);
                  const padding = 60; // Space for chairs

                  return (
                    <div
                      key={table.id}
                      className={`absolute cursor-grab active:cursor-grabbing transition-shadow
                        ${!isExporting ? "hover:shadow-lg" : ""}
                      `}
                      style={{
                        left: table.x - padding,
                        top: table.y - padding,
                        width: dims.width + padding * 2,
                        height: dims.height + padding * 2,
                        paddingLeft: padding,
                        paddingTop: padding,
                      }}
                      onMouseDown={(e) => handleTableMouseDown(e, table.id)}
                    >
                      {/* Table shape */}
                      {renderTableShape(table)}
                      
                      {/* Chairs */}
                      <div 
                        className="absolute"
                        style={{
                          left: table.shape === "u-shape" ? 0 : 0,
                          top: table.shape === "u-shape" ? 0 : 0,
                          width: dims.width,
                          height: dims.height,
                        }}
                      >
                        {renderChairs(table)}
                      </div>
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
                      <div>
                        <h4 className="font-serif font-medium text-foreground">{table.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {TABLE_SHAPES.find(s => s.id === table.shape)?.label} • {table.guests.length}/{table.capacity} platser
                        </p>
                      </div>
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

                    {/* Selected chair info */}
                    {selectedChair && selectedChair.tableId === table.id && (
                      <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                        <p className="text-sm font-medium text-foreground mb-2">
                          Stol {selectedChair.chairIndex + 1}
                        </p>
                        {table.chairs[selectedChair.chairIndex]?.guestId ? (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-foreground">
                              {getGuestById(table.chairs[selectedChair.chairIndex].guestId!)?.name}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeGuestFromChair(table.id, selectedChair.chairIndex)}
                            >
                              <UserMinus className="w-4 h-4 mr-1" />
                              Ta bort
                            </Button>
                          </div>
                        ) : (
                          <div>
                            <p className="text-sm text-muted-foreground mb-2">Välj en gäst från listan till vänster</p>
                            {unassignedGuests.length > 0 && (
                              <select
                                className="w-full text-sm p-2 rounded-lg border border-border bg-background"
                                value=""
                                onChange={(e) => {
                                  if (e.target.value) {
                                    addGuestToChair(table.id, selectedChair.chairIndex, e.target.value);
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
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* All guests at table */}
                    <div>
                      <p className="text-sm font-medium text-foreground mb-2">
                        Placerade gäster
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {table.chairs.filter(c => c.guestId).map((chair, idx) => {
                          const guest = getGuestById(chair.guestId!);
                          if (!guest) return null;
                          const chairIndex = table.chairs.findIndex(c => c.guestId === chair.guestId);
                          return (
                            <div
                              key={idx}
                              className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-sm"
                            >
                              <span className="text-xs text-muted-foreground">{chairIndex + 1}.</span>
                              <span className="text-foreground">{guest.name}</span>
                            </div>
                          );
                        })}
                        {table.guests.length === 0 && (
                          <p className="text-sm text-muted-foreground">Inga gäster placerade ännu</p>
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

      {/* Tips */}
      <div className="bg-muted/30 rounded-xl p-4 text-center">
        <p className="text-sm text-muted-foreground">
          💡 Tips: Klicka på en stol för att placera en gäst. Dra i stolarna för att byta plats med varandra!
        </p>
      </div>
    </div>
  );
}
