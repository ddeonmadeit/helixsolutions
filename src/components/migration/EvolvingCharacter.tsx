import { motion } from "framer-motion";

const STAGE_SVGS = [
  "/characters/0.svg",
  "/characters/1.svg",
  "/characters/2.svg",
  "/characters/3.svg",
  "/characters/4.svg",
  "/characters/5.svg",
];

const getStageIndex = (selectionCount: number) => Math.min(selectionCount, 5);

interface EvolvingCharacterProps {
  selectionCount: number;
  color: string;
  scale?: number;
}

const EvolvingCharacter = ({ selectionCount, color, scale = 1.4 }: EvolvingCharacterProps) => {
  const stageIndex = getStageIndex(selectionCount);
  const hslColor = `hsl(${color})`;
  const size = 100 * scale;

  return (
    <motion.div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    >
      {STAGE_SVGS.map((src, i) => (
        <motion.div
          key={i}
          className="absolute inset-0 flex items-center justify-center"
          initial={false}
          animate={{ opacity: i === stageIndex ? 1 : 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          style={{ pointerEvents: i === stageIndex ? "auto" : "none" }}
        >
          <img
            src={src}
            alt=""
            className="w-full h-full object-contain"
            style={{
              filter: `drop-shadow(0 0 12px ${hslColor})`,
              transform: "translateX(-4px)",
            }}
          />
        </motion.div>
      ))}

      {/* Glow underneath */}
      <motion.div
        className="absolute -bottom-4 left-1/2 -translate-x-1/2 rounded-full blur-xl"
        style={{
          width: 60,
          height: 12,
          backgroundColor: `hsl(${color} / 0.15)`,
        }}
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
    </motion.div>
  );
};

export default EvolvingCharacter;
