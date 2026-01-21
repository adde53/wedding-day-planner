import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SupportEmailRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
  type: "bug" | "suggestion" | "other";
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, subject, message, type }: SupportEmailRequest = await req.json();

    // Validate inputs
    if (!name || !email || !subject || !message || !type) {
      return new Response(
        JSON.stringify({ error: "Alla fält måste fyllas i" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const typeLabels = {
      bug: "🐛 Buggrapport",
      suggestion: "💡 Förbättringsförslag",
      other: "📧 Övrigt",
    };

    // Send email to support
    const emailResponse = await resend.emails.send({
      from: "MittBröllop Support <support@mittbröllop.se>",
      to: ["support@mittbröllop.se"],
      reply_to: email,
      subject: `[${typeLabels[type]}] ${subject}`,
      html: `
        <h2>${typeLabels[type]}</h2>
        <p><strong>Från:</strong> ${name} (${email})</p>
        <p><strong>Ämne:</strong> ${subject}</p>
        <hr />
        <h3>Meddelande:</h3>
        <p>${message.replace(/\n/g, "<br />")}</p>
      `,
    });

    // Send confirmation to user
    await resend.emails.send({
      from: "MittBröllop <support@mittbröllop.se>",
      to: [email],
      subject: "Vi har mottagit ditt supportärende",
      html: `
        <h1>Tack för ditt meddelande, ${name}!</h1>
        <p>Vi har mottagit ditt supportärende och återkommer så snart vi kan.</p>
        <p><strong>Ämne:</strong> ${subject}</p>
        <p><strong>Typ:</strong> ${typeLabels[type]}</p>
        <hr />
        <p>Med vänliga hälsningar,<br />MittBröllop-teamet</p>
      `,
    });

    console.log("Support email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-support-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
