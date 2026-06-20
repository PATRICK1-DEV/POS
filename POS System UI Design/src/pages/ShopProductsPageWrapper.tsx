import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Loader2 } from "lucide-react";
import { getUserShop } from "../lib/db";
import ShopProductsPage from "./ShopProductsPage";

export default function ShopProductsPageWrapper() {
  const navigate = useNavigate();
  const [shop, setShop] = useState<{ id: string; name: string; owner_id: string; created_at: string } | null | "loading">("loading");

  useEffect(() => {
    getUserShop().then((s) => {
      if (!s) {
        navigate("/", { replace: true });
      } else {
        setShop(s);
      }
    });
  }, [navigate]);

  if (shop === "loading") {
    return (
      <div className="size-full flex items-center justify-center bg-background">
        <Loader2 size={24} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!shop) return null;

  return <ShopProductsPage shop={shop} />;
}
