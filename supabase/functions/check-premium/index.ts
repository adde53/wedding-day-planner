import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-PREMIUM] ${step}${detailsStr}`);
};

// Product IDs for all features
const PRODUCT_IDS: Record<string, string> = {
  premium_package: "prod_TudCRh0hxEuFg2",
  drink_calculator: "prod_TudX2skted9fth",
  food_calculator: "prod_TudYBI9qnd1Rgj",
  table_planner: "prod_TudYgmi3aUWvXH",
  excel_export: "prod_TudZ0e4I5yPH4V",
  wedding_website: "prod_TudaHx71rtD8q2",
};

// Features included in premium package
const PACKAGE_FEATURES = [
  "drink_calculator",
  "food_calculator",
  "table_planner",
  "excel_export",
  "wedding_website",
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    logStep("Authenticating user with token");

    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // First, check database for purchased features
    const { data: purchases, error: purchasesError } = await supabaseClient
      .from("user_purchases")
      .select("feature_id")
      .eq("user_id", user.id);

    const purchasedFeatures: string[] = [];
    
    if (!purchasesError && purchases) {
      for (const purchase of purchases) {
        if (purchase.feature_id === "premium_package") {
          // Premium package unlocks all features
          purchasedFeatures.push(...PACKAGE_FEATURES);
        } else {
          purchasedFeatures.push(purchase.feature_id);
        }
      }
    }
    logStep("Database purchases checked", { purchasedFeatures });

    // Also check Stripe for any payments not yet recorded
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });

    if (customers.data.length > 0) {
      const customerId = customers.data[0].id;
      logStep("Found Stripe customer", { customerId });

      // Check for successful checkout sessions with our products
      const sessions = await stripe.checkout.sessions.list({
        customer: customerId,
        status: "complete",
        limit: 100,
      });

      for (const session of sessions.data) {
        if (session.payment_status === "paid" && session.metadata?.feature_id) {
          const featureId = session.metadata.feature_id;
          
          // Record purchase if not already in database
          if (!purchasedFeatures.includes(featureId)) {
            const { error: insertError } = await supabaseClient
              .from("user_purchases")
              .upsert({
                user_id: user.id,
                feature_id: featureId,
                stripe_payment_id: session.payment_intent as string,
                purchased_at: new Date(session.created * 1000).toISOString(),
              }, { onConflict: "user_id,feature_id" });

            if (!insertError) {
              if (featureId === "premium_package") {
                purchasedFeatures.push(...PACKAGE_FEATURES);
              } else {
                purchasedFeatures.push(featureId);
              }
              logStep("Recorded new purchase from Stripe", { featureId });
            }
          }
        }
      }

      // Check for legacy active subscription (for existing subscribers)
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: "active",
        limit: 1,
      });

      if (subscriptions.data.length > 0) {
        logStep("Active subscription found - granting all features");
        purchasedFeatures.push(...PACKAGE_FEATURES);
      }

      // Check for legacy one-time payments (199 SEK)
      const paymentIntents = await stripe.paymentIntents.list({
        customer: customerId,
        limit: 20,
      });

      const legacyPayment = paymentIntents.data.find(
        (pi: { status: string; amount: number; currency: string }) => 
          pi.status === "succeeded" && pi.amount === 19900 && pi.currency === "sek"
      );

      if (legacyPayment) {
        logStep("Legacy one-time payment found - granting all features");
        purchasedFeatures.push(...PACKAGE_FEATURES);
      }
    }

    // Deduplicate features
    const uniqueFeatures = [...new Set(purchasedFeatures)];
    const isPremium = uniqueFeatures.length > 0;

    logStep("Final result", { isPremium, features: uniqueFeatures });

    return new Response(JSON.stringify({ 
      isPremium,
      purchasedFeatures: uniqueFeatures,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
