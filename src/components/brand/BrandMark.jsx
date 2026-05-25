import rentdirectLogo from "../../assets/rentdirect-logo.png";

/**
 * Official RentDirect UG brand mark (logo image).
 * Use across auth, sidebars, marketing, and receipts.
 */
export default function BrandMark({
  className = "",
  imgClassName = "h-8 w-auto max-w-[200px] object-contain",
  alt = "RentDirect UG — secure rentals, smart payments, trusted by Uganda",
}) {
  return (
    <img
      src={rentdirectLogo}
      alt={alt}
      className={`${imgClassName} ${className}`.trim()}
      decoding="async"
    />
  );
}

export { rentdirectLogo };
