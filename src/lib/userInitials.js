/** Display initials from a full name (max 2 chars). */
export function userInitials(name) {
  return (name || "?")
    .split(/\s+/)
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
