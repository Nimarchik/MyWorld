import { supabase } from "./supabase";

export async function unlockEgg(code) {
  // Получаем пользователя
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Ищем пасхалку
  const { data: egg, error: eggError } = await supabase
    .from("easter_eggs")
    .select("*")
    .eq("code", code)
    .single();

  if (eggError || !egg) {
    console.error("Пасхалка не найдена");
    return null;
  }

  // Проверяем, не открыта ли уже
  const { data: exists } = await supabase
    .from("user_easter_eggs")
    .select("id")
    .eq("user_id", user.id)
    .eq("egg_id", egg.id)
    .maybeSingle();

  if (exists) {
    return null;
  }

  // Сохраняем
  const { error } = await supabase
    .from("user_easter_eggs")
    .insert({
      user_id: user.id,
      egg_id: egg.id,
    });

  if (error) {
    console.error(error);
    return null;
  }

  return egg;
}

export async function hasUnlockedEgg(code) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  const { data: egg } = await supabase
    .from("easter_eggs")
    .select("id")
    .eq("code", code)
    .maybeSingle();

  if (!egg) return false;

  const { data: unlocked } = await supabase
    .from("user_easter_eggs")
    .select("id")
    .eq("user_id", user.id)
    .eq("egg_id", egg.id)
    .maybeSingle();

  return !!unlocked;
}