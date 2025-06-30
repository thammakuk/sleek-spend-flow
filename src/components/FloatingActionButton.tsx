
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FloatingActionButtonProps {
  onClick: () => void;
}

export const FloatingActionButton = ({ onClick }: FloatingActionButtonProps) => {
  return (
    <Button
      onClick={onClick}
      size="lg"
      className="fixed bottom-24 right-6 z-30 h-14 w-14 rounded-full gradient-primary shadow-xl border-0 touch-target hover:scale-110 transition-transform duration-200"
    >
      <Plus className="h-6 w-6 text-white" />
    </Button>
  );
};
