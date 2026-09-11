import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods":
    "POST, OPTIONS",
};

Deno.serve(async (req) => {
  // ==============================
  // CORS
  // ==============================

  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  try {
    // ==============================
    // SUPABASE
    // ==============================

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

    // ==============================
    // WEBHOOK DATA
    // ==============================

    const payload = await req.json();

    console.log(
      "Webhook payload:",
      JSON.stringify(payload)
    );

    const record = payload.record;

    if (!record) {
      throw new Error(
        "Webhook record is missing"
      );
    }

    // ==============================
    // ПРОВЕРЯЕМ ТАБЛИЦУ
    // ==============================

    if (payload.table !== "comments") {
      return new Response(
        JSON.stringify({
          success: true,
          message:
            "Event ignored",
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

    // ==============================
    // ДАННЫЕ КОММЕНТАРИЯ
    // ==============================

    const postId =
      record.post_id;

    const commentAuthorId =
      record.author_id;

    const commentText =
      record.content;

    if (
      !postId ||
      !commentAuthorId
    ) {
      throw new Error(
        "post_id or author_id is missing"
      );
    }

    // ==============================
    // НАХОДИМ ВЛАДЕЛЬЦА ПОСТА
    // ==============================

    const { data: post, error: postError } =
      await supabase
        .from("posts")
        .select(
          "author_id"
        )
        .eq(
          "id",
          postId
        )
        .single();

    if (postError) {
      throw postError;
    }

    if (!post) {
      throw new Error(
        "Post not found"
      );
    }

    const postOwnerId =
      post.author_id;

    // ==============================
    // НЕ ОТПРАВЛЯЕМ САМОМУ СЕБЕ
    // ==============================

    if (
      postOwnerId ===
      commentAuthorId
    ) {
      return new Response(
        JSON.stringify({
          success: true,
          message:
            "User commented on own post",
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

    // ==============================
    // ПОЛУЧАЕМ ИМЯ АВТОРА
    // ==============================

    const {
      data: profile,
      error: profileError,
    } = await supabase
      .from("profiles")
      .select("name")
      .eq(
        "id",
        commentAuthorId
      )
      .single();

    if (profileError) {
      console.error(
        "Profile error:",
        profileError
      );
    }

    const authorName =
      profile?.name ||
      "Кто-то";

    // ==============================
    // ОТПРАВЛЯЕМ PUSH
    // ==============================

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
              postOwnerId,

            title:
              "💬 Новый комментарий",

            body:
              `${authorName}: ${
                commentText
                  ? commentText.slice(
                      0,
                      100
                    )
                  : "Отправил стикер ❤️"
              }`,

            url:
              "/MyWorld/Diary",
          }),
        }
      );

    const pushResult =
      await pushResponse.json();

    console.log(
      "Push result:",
      pushResult
    );

    // ==============================
    // ОТВЕТ
    // ==============================

    return new Response(
      JSON.stringify({
        success: true,

        postOwnerId,

        authorName,

        pushResult,
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
      "PUSH TRIGGER ERROR:",
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