import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods":
    "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  try {
    // ==========================================
    // SUPABASE
    // ==========================================

    const supabaseUrl =
      Deno.env.get("SUPABASE_URL");

    const serviceRoleKey =
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error(
        "Supabase environment variables are missing"
      );
    }

    const supabase = createClient(
      supabaseUrl,
      serviceRoleKey
    );

    // ==========================================
    // WEBHOOK DATA
    // ==========================================

    const payload = await req.json();

    console.log(
      "New post webhook:",
      JSON.stringify(payload)
    );

    const record = payload.record;

    if (!record) {
      throw new Error(
        "Webhook record is missing"
      );
    }

    // ==========================================
    // ДАННЫЕ НОВОЙ ЗАПИСИ
    // ==========================================

    const postAuthorId =
      record.author_id;

    const postContent =
      record.content;

    if (!postAuthorId) {
      throw new Error(
        "author_id is missing"
      );
    }

    // ==========================================
    // НАХОДИМ АВТОРА
    // ==========================================

    const {
      data: authorProfile,
      error: authorError,
    } = await supabase
      .from("profiles")
      .select("name")
      .eq("id", postAuthorId)
      .single();

    if (authorError) {
      throw authorError;
    }

    const authorName =
      authorProfile?.name ||
      "Кто-то";

    // ==========================================
    // НАХОДИМ ДРУГИХ ПОЛЬЗОВАТЕЛЕЙ
    // ==========================================

    const {
      data: users,
      error: usersError,
    } = await supabase
      .from("profiles")
      .select("id")
      .neq("id", postAuthorId);

    if (usersError) {
      throw usersError;
    }

    if (!users || users.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "No users to notify",
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
    // ТЕКСТ УВЕДОМЛЕНИЯ
    // ==========================================

    let preview =
      postContent ||
      "Создана новая запись ❤️";

    if (preview.length > 100) {
      preview =
        preview.slice(0, 100) +
        "...";
    }

    // ==========================================
    // ОТПРАВЛЯЕМ PUSH
    // ==========================================

    const results = [];

    for (const user of users) {
      try {
        const pushResponse =
          await fetch(
            `${supabaseUrl}/functions/v1/send-push`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${serviceRoleKey}`,
              },

              body: JSON.stringify({
                user_id:
                  user.id,

                title:
                  "💭 Новая запись в дневнике",

                body:
                  `${authorName}: ${preview}`,

                url:
                  "/MyWorld/Diary",
              }),
            }
          );

        const pushResult =
          await pushResponse.json();

        results.push({
          user_id:
            user.id,

          success:
            pushResponse.ok,

          result:
            pushResult,
        });

      } catch (error) {
        console.error(
          "Push error:",
          error
        );

        results.push({
          user_id:
            user.id,

          success: false,

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
        author: authorName,
        results,
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
      "PUSH NEW POST ERROR:",
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