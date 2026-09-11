import webpush from "npm:web-push";
import { createClient } from "npm:@supabase/supabase-js@2";

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

    const supabaseUrl =
      Deno.env.get("SUPABASE_URL");

    const serviceRoleKey =
      Deno.env.get(
        "SUPABASE_SERVICE_ROLE_KEY"
      );

    if (
      !publicKey ||
      !privateKey ||
      !subject
    ) {
      throw new Error(
        "VAPID keys are not configured"
      );
    }

    if (
      !supabaseUrl ||
      !serviceRoleKey
    ) {
      throw new Error(
        "Supabase environment variables are missing"
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
    // SUPABASE CLIENT
    // ==========================================

    const supabase = createClient(
      supabaseUrl,
      serviceRoleKey
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
    // ПОЛУЧАЕМ ПОДПИСКИ ПОЛЬЗОВАТЕЛЯ
    // ==========================================

    const {
      data: subscriptions,
      error: subscriptionsError,
    } = await supabase
      .from("push_subscriptions")
      .select("*")
      .eq("user_id", user_id);

    if (subscriptionsError) {
      throw subscriptionsError;
    }

    console.log(
      "Subscriptions:",
      subscriptions?.length || 0
    );

    // ==========================================
    // ЕСЛИ ПОДПИСОК НЕТ
    // ==========================================

    if (
      !subscriptions ||
      subscriptions.length === 0
    ) {
      return new Response(
        JSON.stringify({
          success: true,
          message:
            "No push subscriptions found",
          sent: [],
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type":
              "application/json",
          },
        }
      );
    }

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

        console.log(
          "Push sent successfully:",
          subscription.endpoint
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

        // ==========================================
        // ОПРЕДЕЛЯЕМ HTTP STATUS
        // ==========================================

        const statusCode =
          error?.statusCode ||
          error?.status ||
          null;

        // ==========================================
        // УДАЛЯЕМ НЕРАБОЧУЮ ПОДПИСКУ
        // ==========================================

        // 404 — подписка больше не существует
        // 410 — подписка окончательно истекла

        if (
          statusCode === 404 ||
          statusCode === 410
        ) {
          console.log(
            "Removing invalid subscription:",
            subscription.endpoint
          );

          const {
            error: deleteError,
          } = await supabase
            .from(
              "push_subscriptions"
            )
            .delete()
            .eq(
              "endpoint",
              subscription.endpoint
            );

          if (deleteError) {
            console.error(
              "Failed to delete invalid subscription:",
              deleteError
            );
          } else {
            console.log(
              "Invalid subscription deleted"
            );
          }
        }

        results.push({
          success: false,

          endpoint:
            subscription.endpoint,

          statusCode,

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