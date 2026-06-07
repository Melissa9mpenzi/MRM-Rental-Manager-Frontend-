/**
 * Poll until Privy reports an authenticated session (used after login() resolves).
 * @param {{ current: { authenticated: boolean, user: object | null } }} sessionRef
 */
export function waitForPrivySession(sessionRef, maxMs = 45_000) {
  return new Promise((resolve) => {
    const start = Date.now();
    const tick = () => {
      const { authenticated, user } = sessionRef.current;
      if (authenticated || user?.id) {
        resolve(true);
        return;
      }
      if (Date.now() - start > maxMs) {
        resolve(false);
        return;
      }
      setTimeout(tick, 200);
    };
    tick();
  });
}

export function isPrivySessionActive({ authenticated, user }) {
  return Boolean(authenticated || user?.id);
}
