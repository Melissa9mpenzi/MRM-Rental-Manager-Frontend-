/** Official-style Google / Apple marks for social sign-in buttons. */
export function GoogleBrandIcon({ className = "h-5 w-5", title = "Google" }) {
  return (
    <img
      src="/icons/google.svg"
      alt=""
      aria-hidden={title ? undefined : true}
      title={title}
      className={className}
      width={20}
      height={20}
      draggable={false}
    />
  );
}

export function AppleBrandIcon({ className = "h-5 w-5", title = "Apple" }) {
  return (
    <img
      src="/icons/apple.svg"
      alt=""
      aria-hidden={title ? undefined : true}
      title={title}
      className={className}
      width={20}
      height={20}
      draggable={false}
    />
  );
}
