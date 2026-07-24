import { useState } from "react";
import { supabase } from "../lib/supabase";
import style from "../assets/styles/index.module.css";

export default function AddMemory({ user, onSaved, show }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [place, setPlace] = useState("");
  const [memoryDate, setMemoryDate] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  async function saveMemory() {
    if (!title.trim()) {
      alert("Введите название воспоминания");
      return;
    }

    setLoading(true);

    let imageUrl = null;

    // Загружаем фото
    if (image) {
      const fileExt = image.name.split(".").pop();
      const fileName = `${Date.now()}-${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("memories")
        .upload(fileName, image);

      if (uploadError) {
        alert(uploadError.message);
        setLoading(false);
        return;
      }

      const { data } = supabase.storage
        .from("memories")
        .getPublicUrl(fileName);

      imageUrl = data.publicUrl;
    }

    // Сохраняем запись
    const { error } = await supabase
      .from("memories")
      .insert({
        author_id: user.id,
        title,
        description,
        place,
        memory_date: memoryDate || null,
        image: imageUrl,
      });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    // Очистка формы
    setTitle("");
    setDescription("");
    setPlace("");
    setMemoryDate("");
    setImage(null);

    if (onSaved) {
      onSaved();
    }
  }


  const click = () => {
    saveMemory()
    !show
  }

  return (
    <div className={style.memoryForm}>
      <h2>📸 Новое воспоминание</h2>
      <div className={style.memoryInpLab}>

        <input
          className={style.input}
          placeholder="Название"
          name="name"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <label htmlFor="name" className={style.formLable}>Название</label>

      </div>


      <div className={style.memoryInpLab}>

        <input
          className={style.input}
          placeholder="Место"
          name="location"
          value={place}
          onChange={(e) => setPlace(e.target.value)}
        />
        <label htmlFor="location" className={style.formLable}>Место</label>

      </div>


      <input
        className={style.input}
        type="date"
        value={memoryDate}
        onChange={(e) => setMemoryDate(e.target.value)}
      />

      {/* <textarea
        className={style.textarea1}
        placeholder="Описание..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      /> */}

      <div className={style.textareaBorder1}>
        <div className={style.spark}></div>
        <div className={style.spark}></div>
        <div className={style.spark}></div>
        <div className={style.spark}></div>
        <textarea
          className={style.textarea2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Напиши что-нибудь..."
        />
      </div>

      <div className={style.file}>


        <input
          id="memoryImage"
          className={style.fileInput}
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
        />

        <label htmlFor="memoryImage" className={style.fileLabel}>
          📷 {image ? image.name : "Выбрать фотографию"}

        </label>
        {image && (
          <img
            className={style.previewImage}
            src={URL.createObjectURL(image)}
            alt="Preview"
          />
        )}
      </div>
      <button
        className={style.saveBtn}
        onClick={click}
        disabled={loading}
      >
        <span className={style.spn2}>
          {loading ? "Загрузка..." : "💾 Сохранить"}
        </span>
      </button>
    </div>
  );
}