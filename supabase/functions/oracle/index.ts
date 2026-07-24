import OpenAI from "npm:openai";

const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY"),
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  try {
    const {
      mode,
      zodiac,
      myZodiac,
      partnerZodiac,
    } = await req.json();

    let prompt = "";

    if (mode === "couple") {
      prompt = `
Ты — загадочный мистический Оракул.

Создай красивое предсказание для пары.

Первый знак зодиака:
${myZodiac}

Второй знак зодиака:
${partnerZodiac}

Правила:
- максимум 3 предложения;
- никаких болезней, смертей, войн, измен и негатива;
- каждый ответ должен быть уникальным;
- не используй шаблонные фразы;
- можно с юмором и с матами.
`;
    } else {
      prompt = `
Ты — загадочный мистический Оракул.

Создай уникальное предсказание дня для человека со знаком зодиака "${zodiac}".

Правила:
- максимум 2 предложения;
- никаких болезней, смертей, войн и катастроф;
- каждый ответ должен быть уникальным;
- можно с юмором и с матами.

`;
    }

    const response = await openai.responses.create({
      model: "gpt-5-mini",
      input: prompt,
    });

    return new Response(
      JSON.stringify({
        prediction: response.output_text,
      }),
      {
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.error(error);

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
        headers: corsHeaders,
      }
    );
  }
});