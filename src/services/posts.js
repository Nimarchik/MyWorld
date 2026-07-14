import { supabase } from "../lib/supabase";

export async function getPosts() {
  const { data, error } = await supabase
    .from("posts")
    .select(`
      *,
      profiles(name)
    `)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data;
}

export async function createPost(authorId, content, category = "thought") {
  const { error } = await supabase
    .from("posts")
    .insert({
      author_id: authorId,
      content,
      category,
    });

  if (error) throw error;
}