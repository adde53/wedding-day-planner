import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface ChairData {
  guestId: string | null;
  position: { x: number; y: number };
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
  rotation: number;
}

const CHAIR_SIZE = 32;
const CHAIR_GAP = 8;

// Calculate table size based on capacity
const getTableSizeForCapacity = (shape: TableData["shape"], capacity: number) => {
  const chairSpacing = CHAIR_SIZE + CHAIR_GAP;
  
  switch (shape) {
    case "round": {
      const minCircumference = capacity * chairSpacing;
      const orbitRadius = minCircumference / (2 * Math.PI);
      const tableRadius = Math.max(40, orbitRadius - CHAIR_SIZE / 2 - 10);
      return { tableRadius, orbitRadius: Math.max(orbitRadius, tableRadius + CHAIR_SIZE / 2 + 10) };
    }
    case "rectangle": {
      const seatsPerSide = Math.ceil(capacity / 2);
      const width = Math.max(100, seatsPerSide * chairSpacing);
      const height = 50;
      return { width, height };
    }
    case "square": {
      const perSide = Math.ceil(capacity / 4);
      const size = Math.max(60, perSide * chairSpacing);
      return { size };
    }
    case "head": {
      const width = Math.max(120, capacity * chairSpacing);
      return { width, height: 35 };
    }
    case "u-shape": {
      const baseSeats = Math.ceil(capacity * 0.5);
      const armSeats = Math.ceil(capacity * 0.25);
      const baseWidth = Math.max(150, baseSeats * chairSpacing);
      const armHeight = Math.max(80, armSeats * chairSpacing);
      return { baseWidth, armHeight };
    }
    default:
      return { tableRadius: 50, orbitRadius: 80 };
  }
};

// Generate chair positions based on table shape
const generateChairPositions = (shape: TableData["shape"], capacity: number): ChairData[] => {
  const chairs: ChairData[] = [];
  const chairSpacing = CHAIR_SIZE + CHAIR_GAP;
  
  if (shape === "round") {
    const { orbitRadius } = getTableSizeForCapacity(shape, capacity);
    for (let i = 0; i < capacity; i++) {
      const angle = ((360 / capacity) * i - 90) * (Math.PI / 180);
      chairs.push({
        guestId: null,
        position: {
          x: Math.cos(angle) * (orbitRadius as number),
          y: Math.sin(angle) * (orbitRadius as number),
        },
      });
    }
  } else if (shape === "head") {
    const { width: tableWidth, height: tableHeight } = getTableSizeForCapacity(shape, capacity) as { width: number; height: number };
    const totalWidth = capacity * chairSpacing;
    const startX = -totalWidth / 2 + chairSpacing / 2;
    for (let i = 0; i < capacity; i++) {
      chairs.push({
        guestId: null,
        position: {
          x: startX + i * chairSpacing,
          y: -tableHeight / 2 - CHAIR_SIZE / 2 - 8,
        },
      });
    }
  } else if (shape === "u-shape") {
    const { baseWidth, armHeight } = getTableSizeForCapacity(shape, capacity) as { baseWidth: number; armHeight: number };
    const leftArm = Math.ceil(capacity * 0.25);
    const rightArm = Math.ceil(capacity * 0.25);
    const base = capacity - leftArm - rightArm;
    
    const armSpacing = armHeight / (Math.max(leftArm, rightArm) + 1);
    const baseSpacing = baseWidth / (base + 1);
    
    for (let i = 0; i < leftArm; i++) {
      chairs.push({
        guestId: null,
        position: {
          x: -baseWidth / 2 - CHAIR_SIZE / 2 - 10,
          y: -armHeight / 2 + armSpacing * (i + 1),
        },
      });
    }
    for (let i = 0; i < rightArm; i++) {
      chairs.push({
        guestId: null,
        position: {
          x: baseWidth / 2 + CHAIR_SIZE / 2 + 10,
          y: -armHeight / 2 + armSpacing * (i + 1),
        },
      });
    }
    for (let i = 0; i < base; i++) {
      chairs.push({
        guestId: null,
        position: {
          x: -baseWidth / 2 + baseSpacing * (i + 1),
          y: armHeight / 2 + CHAIR_SIZE / 2 + 10,
        },
      });
    }
  } else if (shape === "rectangle") {
    const { width: tableWidth, height: tableHeight } = getTableSizeForCapacity(shape, capacity) as { width: number; height: number };
    const topCount = Math.ceil(capacity / 2);
    const bottomCount = capacity - topCount;
    
    const topTotalWidth = topCount * chairSpacing;
    const bottomTotalWidth = bottomCount * chairSpacing;
    
    const topStartX = -topTotalWidth / 2 + chairSpacing / 2;
    for (let i = 0; i < topCount; i++) {
      chairs.push({
        guestId: null,
        position: {
          x: topStartX + i * chairSpacing,
          y: -tableHeight / 2 - CHAIR_SIZE / 2 - 8,
        },
      });
    }
    
    const bottomStartX = -bottomTotalWidth / 2 + chairSpacing / 2;
    for (let i = 0; i < bottomCount; i++) {
      chairs.push({
        guestId: null,
        position: {
          x: bottomStartX + i * chairSpacing,
          y: tableHeight / 2 + CHAIR_SIZE / 2 + 8,
        },
      });
    }
  } else {
    const { size: tableSize } = getTableSizeForCapacity(shape, capacity) as { size: number };
    const perSide = Math.ceil(capacity / 4);
    
    let chairIdx = 0;
    const sides = ["top", "right", "bottom", "left"];
    
    for (const side of sides) {
      if (chairIdx >= capacity) break;
      const count = Math.min(perSide, capacity - chairIdx);
      const sideWidth = count * chairSpacing;
      const startPos = -sideWidth / 2 + chairSpacing / 2;
      
      for (let i = 0; i < count && chairIdx < capacity; i++) {
        let x = 0, y = 0;
        const offset = startPos + i * chairSpacing;
        const edgeDist = tableSize / 2 + CHAIR_SIZE / 2 + 8;
        
        if (side === "top") {
          x = offset;
          y = -edgeDist;
        } else if (side === "right") {
          x = edgeDist;
          y = offset;
        } else if (side === "bottom") {
          x = offset;
          y = edgeDist;
        } else {
          x = -edgeDist;
          y = offset;
        }
        chairs.push({ guestId: null, position: { x, y } });
        chairIdx++;
      }
    }
  }
  
  return chairs;
};

export function useSeatingTables() {
  const { user } = useAuth();
  const [tables, setTables] = useState<TableData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch tables and chairs from database
  const fetchTables = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      // Fetch tables
      const { data: tablesData, error: tablesError } = await supabase
        .from("seating_tables")
        .select("*")
        .eq("user_id", user.id);

      if (tablesError) throw tablesError;

      if (!tablesData || tablesData.length === 0) {
        // Check if there's data in localStorage to migrate
        const stored = localStorage.getItem(`visual_tables_v3_${user.id}`);
        if (stored) {
          const localTables = JSON.parse(stored) as TableData[];
          await migrateFromLocalStorage(localTables);
          return;
        }
        setTables([]);
        setIsLoading(false);
        return;
      }

      // Fetch chairs for all tables
      const tableIds = tablesData.map(t => t.id);
      const { data: chairsData, error: chairsError } = await supabase
        .from("seating_chairs")
        .select("*")
        .in("table_id", tableIds);

      if (chairsError) throw chairsError;

      // Reconstruct TableData objects
      const reconstructedTables: TableData[] = tablesData.map(table => {
        const tableChairs = chairsData?.filter(c => c.table_id === table.id) || [];
        const chairs = generateChairPositions(table.shape as TableData["shape"], table.capacity);
        
        // Apply guest assignments from database
        tableChairs.forEach(dbChair => {
          if (dbChair.chair_index < chairs.length) {
            chairs[dbChair.chair_index].guestId = dbChair.guest_id;
          }
        });

        return {
          id: table.id,
          name: table.name,
          capacity: table.capacity,
          shape: table.shape as TableData["shape"],
          x: table.position_x,
          y: table.position_y,
          rotation: table.rotation,
          chairs,
          guests: chairs.filter(c => c.guestId).map(c => c.guestId as string),
        };
      });

      setTables(reconstructedTables);
    } catch (error) {
      console.error("Error fetching tables:", error);
      toast.error("Kunde inte ladda bordsplaceringen");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Migrate data from localStorage to database
  const migrateFromLocalStorage = async (localTables: TableData[]) => {
    if (!user) return;

    try {
      for (const table of localTables) {
        // Insert table
        const { data: insertedTable, error: tableError } = await supabase
          .from("seating_tables")
          .insert({
            id: table.id,
            user_id: user.id,
            name: table.name,
            capacity: table.capacity,
            shape: table.shape,
            position_x: table.x,
            position_y: table.y,
            rotation: table.rotation,
          })
          .select()
          .single();

        if (tableError) throw tableError;

        // Insert chairs with guest assignments
        const chairInserts = table.chairs
          .map((chair, index) => ({
            table_id: insertedTable.id,
            chair_index: index,
            guest_id: chair.guestId,
          }))
          .filter(c => c.guest_id !== null);

        if (chairInserts.length > 0) {
          const { error: chairsError } = await supabase
            .from("seating_chairs")
            .insert(chairInserts);

          if (chairsError) throw chairsError;
        }
      }

      // Clear localStorage after successful migration
      localStorage.removeItem(`visual_tables_v3_${user.id}`);
      toast.success("Din bordsplacering har synkroniserats!");
      
      // Fetch the migrated data
      await fetchTables();
    } catch (error) {
      console.error("Error migrating tables:", error);
      toast.error("Kunde inte migrera bordsplacering");
      setIsLoading(false);
    }
  };

  // Save tables to database
  const saveTables = useCallback(async (newTables: TableData[]) => {
    if (!user) return;
    
    setTables(newTables);
    setIsSaving(true);

    try {
      // Get current tables from database
      const { data: existingTables } = await supabase
        .from("seating_tables")
        .select("id")
        .eq("user_id", user.id);

      const existingIds = new Set(existingTables?.map(t => t.id) || []);
      const newIds = new Set(newTables.map(t => t.id));

      // Delete removed tables
      const deletedIds = [...existingIds].filter(id => !newIds.has(id));
      if (deletedIds.length > 0) {
        await supabase
          .from("seating_tables")
          .delete()
          .in("id", deletedIds);
      }

      // Upsert tables and chairs
      for (const table of newTables) {
        const isNew = !existingIds.has(table.id);

        if (isNew) {
          // Insert new table
          const { error: tableError } = await supabase
            .from("seating_tables")
            .insert({
              id: table.id,
              user_id: user.id,
              name: table.name,
              capacity: table.capacity,
              shape: table.shape,
              position_x: table.x,
              position_y: table.y,
              rotation: table.rotation,
            });

          if (tableError) throw tableError;
        } else {
          // Update existing table
          const { error: tableError } = await supabase
            .from("seating_tables")
            .update({
              name: table.name,
              capacity: table.capacity,
              shape: table.shape,
              position_x: table.x,
              position_y: table.y,
              rotation: table.rotation,
            })
            .eq("id", table.id);

          if (tableError) throw tableError;
        }

        // Delete existing chair assignments for this table
        await supabase
          .from("seating_chairs")
          .delete()
          .eq("table_id", table.id);

        // Insert new chair assignments
        const chairInserts = table.chairs
          .map((chair, index) => ({
            table_id: table.id,
            chair_index: index,
            guest_id: chair.guestId,
          }))
          .filter(c => c.guest_id !== null);

        if (chairInserts.length > 0) {
          const { error: chairsError } = await supabase
            .from("seating_chairs")
            .insert(chairInserts);

          if (chairsError) throw chairsError;
        }
      }
    } catch (error) {
      console.error("Error saving tables:", error);
      toast.error("Kunde inte spara bordsplaceringen");
    } finally {
      setIsSaving(false);
    }
  }, [user]);

  // Initial fetch
  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  return {
    tables,
    setTables,
    saveTables,
    isLoading,
    isSaving,
    generateChairPositions,
    getTableSizeForCapacity,
    refetch: fetchTables,
  };
}

export type { TableData, ChairData };
