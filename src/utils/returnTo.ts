export function makeReturnTo(pathname: string, search: string) {
  return encodeURIComponent(pathname + search);
}
export function readReturnTo(search: string) {
  const p = new URLSearchParams(search);
  return p.get("return_to");
}
