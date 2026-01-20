import { supabase } from "@/integrations/supabase/client";

export async function addBudgetItem(
  userId: string,
  name: string,
  category: string,
  estimatedCost: number
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("budget_items")
      .insert({
        user_id: userId,
        name,
        category,
        estimated_cost: estimatedCost,
        actual_cost: 0,
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error adding budget item:", error);
    return false;
  }
}
