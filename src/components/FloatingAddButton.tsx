import { Link, useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMerchantContext } from "@/hooks/useMerchantContext";

export default function FloatingAddButton() {
  const { hasMerchantAccess, permissions } = useMerchantContext();
  const navigate = useNavigate();

  if (!hasMerchantAccess || !permissions.can_add_products) return null;

  return (
    <Button
      onClick={() => navigate('/merchant')}
      aria-label="إضافة منتج"
      className="fixed bottom-20 md:bottom-6 left-4 z-40 h-14 w-14 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all"
      size="icon"
    >
      <Plus className="w-6 h-6" />
    </Button>
  );
}
