/** Secure government portal URLs (separate from public rentdirect.ug auth). */
export const GOV_PORTAL = {
  login: "/government/login",
  acceptInvite: "/government/accept-invite",
  verify2fa: "/government/verify-2fa",
  home: "/government/overview",
};

export function isGovernmentPublicAuthPath(pathname) {
  return (
    pathname === GOV_PORTAL.login ||
    pathname === GOV_PORTAL.acceptInvite ||
    pathname.startsWith(`${GOV_PORTAL.acceptInvite}?`)
  );
}
