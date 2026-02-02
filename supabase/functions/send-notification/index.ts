import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

interface SendNotificationRequest {
  userId: string;
  type: string;
  title: string;
  body?: string;
  link?: string;
  metadata?: Record<string, unknown>;
  channels?: ("in_app" | "email" | "push")[];
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const payload: SendNotificationRequest = await req.json();
    const { userId, type, title, body, link, metadata, channels = ["in_app"] } = payload;

    console.log(`[send-notification] Sending to user ${userId}:`, { type, title });

    // Verificar preferências do usuário
    const { data: preferences } = await supabase
      .from("notification_preferences")
      .select("*")
      .eq("user_id", userId)
      .eq("notification_type", type);

    const userPrefs = new Map(
      (preferences || []).map((p) => [p.channel, p])
    );

    const channelsSent: string[] = [];
    const results: Record<string, string> = {};

    for (const channel of channels) {
      const pref = userPrefs.get(channel);
      
      // Se não há preferência definida, usar padrão (habilitado)
      const isEnabled = pref ? pref.is_enabled : true;
      const frequency = pref?.frequency || "each";

      if (!isEnabled) {
        console.log(`[send-notification] Channel ${channel} disabled for user`);
        results[channel] = "disabled";
        continue;
      }

      if (frequency === "never") {
        console.log(`[send-notification] Frequency set to never for ${channel}`);
        results[channel] = "never";
        continue;
      }

      if (channel === "in_app") {
        // Inserir notificação no banco
        const { error } = await supabase.from("notifications").insert({
          user_id: userId,
          notification_type: type,
          title,
          body,
          link,
          metadata,
          channels_sent: ["in_app"],
        });

        if (error) {
          console.error("[send-notification] Error inserting notification:", error);
          results[channel] = `error: ${error.message}`;
        } else {
          channelsSent.push("in_app");
          results[channel] = "sent";
        }
      }

      if (channel === "email" && frequency === "each") {
        // Buscar email do usuário
        const { data: profile } = await supabase
          .from("profiles")
          .select("email, full_name")
          .eq("id", userId)
          .single();

        if (profile?.email) {
          // Por enquanto apenas log - implementar Resend/SendGrid depois
          console.log(`[send-notification] Would send email to: ${profile.email}`);
          console.log(`[send-notification] Subject: ${title}`);
          console.log(`[send-notification] Body: ${body}`);
          
          // TODO: Integrar com Resend ou outro serviço de email
          // await sendEmail({ to: profile.email, subject: title, body });
          
          channelsSent.push("email");
          results[channel] = "sent_log_only";
        } else {
          results[channel] = "no_email";
        }
      }

      if (channel === "email" && (frequency === "daily" || frequency === "weekly" || frequency === "monthly")) {
        // Agendar para batch
        const { error } = await supabase.from("notifications").insert({
          user_id: userId,
          notification_type: type,
          title,
          body,
          link,
          metadata,
          scheduled_for: getNextBatchTime(frequency),
          channels_sent: [],
        });

        if (error) {
          results[channel] = `error: ${error.message}`;
        } else {
          results[channel] = `scheduled_${frequency}`;
        }
      }

      if (channel === "push") {
        // TODO: Implementar push notification via FCM/OneSignal
        console.log(`[send-notification] Push not implemented yet`);
        results[channel] = "not_implemented";
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        channelsSent,
        results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[send-notification] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function getNextBatchTime(frequency: string): string {
  const now = new Date();
  
  switch (frequency) {
    case "daily":
      // Próximo dia às 9h
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0);
      return tomorrow.toISOString();

    case "weekly":
      // Próxima segunda às 9h
      const nextMonday = new Date(now);
      nextMonday.setDate(nextMonday.getDate() + (8 - nextMonday.getDay()) % 7);
      nextMonday.setHours(9, 0, 0, 0);
      return nextMonday.toISOString();

    case "monthly":
      // Primeiro dia do próximo mês às 9h
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1, 9, 0, 0, 0);
      return nextMonth.toISOString();

    default:
      return now.toISOString();
  }
}
