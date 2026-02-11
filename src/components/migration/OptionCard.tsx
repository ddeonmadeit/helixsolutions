import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface OptionCardProps {
  label: string;
  description?: string;
  icon?: React.ReactNode;
  selected: boolean;
  onClick: () => void;
}

const OptionCard = ({ label, description, icon, selected, onClick }: OptionCardProps) => {
  return (
    <motion.button
      onClick={onClick}
      className={`relative w-full text-left rounded-xl p-4 transition-all duration-300 ${
        selected ? "glass-selected" : "glass-hover"
      }`}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <div className="flex items-center gap-3">
        {icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground">{label}</p>
          {description && (
            <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        <div
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
            selected
              ? "border-primary bg-primary text-primary-foreground"
              : "border-muted-foreground/30"
          }`}
        >
          {selected && <Check className="h-3 w-3" />}
        </div>
      </div>
    </motion.button>
  );
};

export default OptionCard;
