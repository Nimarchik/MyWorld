import { useState } from "react";
import style from "../assets/styles/index.module.css";

const stickers = Array.from(
  { length: 133 },
  (_, index) =>
    `${String(index + 1).padStart(3, "0")}.webm`
);

export default function StickerPicker({ onSelect }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={style.stickerPickerWrapper}>

      <button
        type="button"
        className={style.stickerButton}
        onClick={() => setOpen((prev) => !prev)}
      >
        🎭
      </button>

      {open && (
        <div className={style.stickerPicker}>

          <div className={style.stickerGrid}>

            {stickers.map((sticker) => {

              const url =
                `https://wakpnhcmsrvijawkfrmp.supabase.co/storage/v1/object/public/stickers/${sticker}`;

              return (
                <button
                  key={sticker}
                  type="button"
                  className={style.stickerItem}
                  onClick={() => {
                    onSelect(url);
                    setOpen(false);
                  }}
                >
                  <video
                  className={style.stickers}
                    src={url}
                    autoPlay
                    loop
                    muted
                    playsInline
                  />
                </button>
              );
            })}

          </div>

        </div>
      )}

    </div>
  );
}