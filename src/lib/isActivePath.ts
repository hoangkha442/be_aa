import { useLocation } from "react-router-dom";

export function useActivePath() {
  const { pathname } = useLocation();

  const normalize = (p: string) => (p.length > 1 ? p.replace(/\/+$/, "") : p);

  const isActiveExact = (path: string) => normalize(pathname) === normalize(path);

  const isActivePrefix = (path: string) => {
    const cur = normalize(pathname);
    const target = normalize(path);
    return cur === target || cur.startsWith(target + "/");
  };

  return { pathname, isActiveExact, isActivePrefix };
}
