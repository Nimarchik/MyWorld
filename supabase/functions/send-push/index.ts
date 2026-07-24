import webpush from "npm:web-push";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods":
    "POST, OPTIONS",
};

Deno.serve(async (req) => {
  // ==========================================
  // CORS
  // ==========================================

  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  try {
    // ==========================================
    // ENV
    // ==========================================

    const publicKey =
      Deno.env.get("VAPID_PUBLIC_KEY");

    const privateKey =
      Deno.env.get("VAPID_PRIVATE_KEY");

    const subject =
      Deno.env.get("VAPID_SUBJECT");

    if (
      !publicKey ||
      !privateKey ||
      !subject
    ) {
      throw new Error(
        "VAPID keys are not configured"
      );
    }

    // ==========================================
    // VAPID
    // ==========================================

    webpush.setVapidDetails(
      subject,
      publicKey,
      privateKey
    );

    // ==========================================
    // BODY
    // ==========================================

    const {
      user_id,
      title,
      body,
      url,
    } = await req.json();

    if (!user_id) {
      throw new Error(
        "user_id is required"
      );
    }

    // ==========================================
    // SUPABASE
    // ==========================================

    const supabaseUrl =
      Deno.env.get(
        "SUPABASE_URL"
      );

    const serviceRoleKey =
      Deno.env.get(
        "SUPABASE_SERVICE_ROLE_KEY"
      );

    if (
      !supabaseUrl ||
      !serviceRoleKey
    ) {
      throw new Error(
        "Supabase environment variables are missing"
      );
    }

    // ==========================================
    // ПОЛУЧАЕМ ПОДПИСКИ ПОЛЬЗОВАТЕЛЯ
    // ==========================================

    const response =
      await fetch(
        `${supabaseUrl}/rest/v1/push_subscriptions?user_id=eq.${user_id}&select=*`,
        {
          headers: {
            apikey:
              serviceRoleKey,

            Authorization:
              `Bearer ${serviceRoleKey}`,
          },
        }
      );

    if (!response.ok) {
      throw new Error(
        `Failed to load subscriptions: ${response.status}`
      );
    }

    const subscriptions =
      await response.json();

    console.log(
      "Subscriptions:",
      subscriptions.length
    );

    // ==========================================
    // ОТПРАВЛЯЕМ PUSH
    // ==========================================

    const results = [];

    for (
      const subscription
      of subscriptions
    ) {
      try {
        const pushSubscription = {
          endpoint:
            subscription.endpoint,

          keys: {
            p256dh:
              subscription.p256dh,

            auth:
              subscription.auth,
          },
        };

        const result =
          await webpush.sendNotification(
            pushSubscription,
            JSON.stringify({
              title:
                title ||
                "❤️ Nimarchik & Monorochka",

              body:
                body ||
                "У тебя новое уведомление ❤️",

              url:
                url ||
                "/MyWorld/",
            })
          );

        results.push({
          success: true,
          endpoint:
            subscription.endpoint,
          statusCode:
            result.statusCode,
        });

      } catch (error) {
        console.error(
          "Push error:",
          error
        );

        results.push({
          success: false,
          endpoint:
            subscription.endpoint,
          error:
            error instanceof Error
              ? error.message
              : String(error),
        });
      }
    }

    // ==========================================
    // ОТВЕТ
    // ==========================================

    return new Response(
      JSON.stringify({
        success: true,
        sent: results,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type":
            "application/json",
        },
      }
    );

  } catch (error) {
    console.error(
      "SEND PUSH ERROR:",
      error
    );

    return new Response(
      JSON.stringify({
        success: false,

        error:
          error instanceof Error
            ? error.message
            : String(error),
      }),
      {
        status: 500,

        headers: {
          ...corsHeaders,
          "Content-Type":
            "application/json",
        },
      }
    );
  }
});