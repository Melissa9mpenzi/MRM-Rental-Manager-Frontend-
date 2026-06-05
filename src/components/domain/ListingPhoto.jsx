/**
 * Listing / marketplace photo — real upload URL only; no stock villa placeholders.
 */
import { listingImageUrl } from "../../lib/mediaUrl";

export function ListingPhoto({
  path,
  alt = "",
  className = "h-full w-full object-cover",
  wrapperClassName = "",
  emptyLabel = "No photo uploaded",
}) {
  const url = listingImageUrl(path);

  if (!url) {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-1 bg-[#0d1520] px-3 text-center text-xs text-white/40 ${wrapperClassName || className}`}
      >
        <span aria-hidden>📷</span>
        {emptyLabel}
      </div>
    );
  }

  return (
    <img
      src={url}
      alt={alt}
      className={className}
      loading="lazy"
      onError={(e) => {
        e.currentTarget.style.display = "none";
        const parent = e.currentTarget.parentElement;
        if (parent && !parent.querySelector("[data-listing-photo-empty]")) {
          const note = document.createElement("div");
          note.dataset.listingPhotoEmpty = "1";
          note.className =
            "flex h-full min-h-[8rem] w-full flex-col items-center justify-center gap-1 bg-[#0d1520] px-3 text-center text-xs text-white/40";
          note.textContent = emptyLabel;
          parent.appendChild(note);
        }
      }}
    />
  );
}

export default ListingPhoto;
