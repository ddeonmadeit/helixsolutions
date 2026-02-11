import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface GlassSelectProps {
  placeholder: string;
  options: { value: string; label: string }[];
  value: string;
  onValueChange: (value: string) => void;
}

const GlassSelect = ({ placeholder, options, value, onValueChange }: GlassSelectProps) => {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="glass-hover h-12 rounded-xl border-0 text-foreground focus:ring-1 focus:ring-primary">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="glass rounded-xl border-0">
        {options.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            className="rounded-lg text-foreground focus:bg-primary/10 focus:text-foreground"
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default GlassSelect;
