import { Button } from "@/components/ui/button";
import { readReturnTo } from "@/utils/returnTo";
import { useLocation, useNavigate } from "react-router-dom";

export default function BackButton({ fallback = -1 }: { fallback?: number }) {
  const nav = useNavigate();
  const loc = useLocation();
  const ret = readReturnTo(loc.search);

  return (
    <Button
      variant="outline"
      className="border-slate-300"
      onClick={() => {
        if (ret) nav(decodeURIComponent(ret));
        else nav(fallback);
      }}
    >
      Quay lại
    </Button>
  );
}
