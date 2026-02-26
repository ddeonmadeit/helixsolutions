import { motion } from "framer-motion";
import helixLogo from "@/assets/helix-logo.png";

interface EvolvingCharacterProps {
  stage: number; // 0-10
  color: string; // HSL values like "210 70% 50%"
}

// Lerp helper
const lerp = (a: number, b: number, t: number) => a + (b - a) * Math.min(Math.max(t, 0), 1);

const EvolvingCharacter = ({ stage, color }: EvolvingCharacterProps) => {
  const t = stage / 10; // 0 to 1 normalized

  // Progressive measurements
  const headSize = lerp(28, 52, t);
  const logoSize = lerp(16, 32, t);
  const bodyWidth = lerp(16, 44, t);
  const bodyHeight = lerp(20, 85, t);
  const armWidth = lerp(4, 12, t);
  const armHeight = lerp(14, 45, t);
  const armAngle = lerp(20, 8, t); // Starts more angled, gets straighter
  const legWidth = lerp(5, 12, t);
  const legHeight = lerp(10, 35, t);
  const legGap = lerp(2, 6, t);

  // Shoulder pads appear at stage 3+
  const showShoulderPads = stage >= 3;
  const shoulderPadSize = lerp(0, 18, (stage - 3) / 7);
  const shoulderPadOffset = lerp(0, 8, (stage - 3) / 7);

  // Extra shoulder spikes at stage 6+
  const showSpikes = stage >= 6;
  const spikeHeight = lerp(0, 22, (stage - 6) / 4);
  const spikeWidth = lerp(0, 6, (stage - 6) / 4);

  // Extra arms at stage 8+
  const showExtraArms = stage >= 8;
  const extraArmHeight = lerp(0, 30, (stage - 8) / 2);
  const extraArmWidth = lerp(0, 8, (stage - 8) / 2);

  // Chest plate at stage 5+
  const showChestPlate = stage >= 5;
  const chestWidth = lerp(0, bodyWidth * 0.7, (stage - 5) / 5);
  const chestHeight = lerp(0, bodyHeight * 0.3, (stage - 5) / 5);

  // Hand/fist size
  const showHands = stage >= 2;
  const handSize = lerp(0, armWidth * 1.4, (stage - 2) / 8);

  // Foot size
  const showFeet = stage >= 4;
  const footWidth = lerp(0, legWidth * 1.6, (stage - 4) / 6);
  const footHeight = lerp(0, 6, (stage - 4) / 6);

  const transition = { duration: 0.6, ease: "easeOut" as const };
  const fillColor = `hsl(${color})`;
  const glowColor = `hsl(${color} / 0.25)`;

  return (
    <div className="flex flex-col items-center relative">
      {/* Shoulder Spikes */}
      {showSpikes && (
        <div className="flex items-end justify-center absolute" style={{ top: headSize - 6, zIndex: 1 }}>
          {/* Left spikes */}
          <motion.div
            className="flex gap-0.5 items-end"
            style={{ marginRight: bodyWidth / 2 + shoulderPadSize - 2 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={transition}
          >
            <motion.div
              style={{ backgroundColor: fillColor, borderRadius: 2, transformOrigin: "bottom center", rotate: 25 }}
              animate={{ width: spikeWidth * 0.7, height: spikeHeight * 0.7 }}
              transition={transition}
            />
            <motion.div
              style={{ backgroundColor: fillColor, borderRadius: 2, transformOrigin: "bottom center", rotate: 12 }}
              animate={{ width: spikeWidth, height: spikeHeight }}
              transition={transition}
            />
          </motion.div>
          {/* Right spikes */}
          <motion.div
            className="flex gap-0.5 items-end"
            style={{ marginLeft: bodyWidth / 2 + shoulderPadSize - 2 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={transition}
          >
            <motion.div
              style={{ backgroundColor: fillColor, borderRadius: 2, transformOrigin: "bottom center", rotate: -12 }}
              animate={{ width: spikeWidth, height: spikeHeight }}
              transition={transition}
            />
            <motion.div
              style={{ backgroundColor: fillColor, borderRadius: 2, transformOrigin: "bottom center", rotate: -25 }}
              animate={{ width: spikeWidth * 0.7, height: spikeHeight * 0.7 }}
              transition={transition}
            />
          </motion.div>
        </div>
      )}

      {/* Head */}
      <motion.div
        className="relative flex items-center justify-center rounded-full z-10"
        style={{ backgroundColor: fillColor }}
        animate={{ width: headSize, height: headSize }}
        transition={transition}
      >
        {/* Logo face */}
        <motion.img
          src={helixLogo}
          alt="Helix"
          className="pointer-events-none"
          style={{ filter: "brightness(2)" }}
          animate={{ width: logoSize, height: logoSize }}
          transition={transition}
        />
      </motion.div>

      {/* Upper body area with arms */}
      <div className="relative flex items-start justify-center -mt-1" style={{ zIndex: 5 }}>
        {/* Extra left arm (stage 8+) */}
        {showExtraArms && (
          <div className="flex flex-col items-center" style={{ marginRight: -2, marginTop: 8 }}>
            <motion.div
              style={{
                backgroundColor: fillColor,
                borderRadius: extraArmWidth / 2,
                transformOrigin: "top center",
                rotate: 30,
              }}
              initial={{ height: 0, width: 0 }}
              animate={{ height: extraArmHeight, width: extraArmWidth }}
              transition={transition}
            />
            {showHands && (
              <motion.div
                className="rounded-full -mt-1"
                style={{ backgroundColor: fillColor, rotate: 30 }}
                animate={{ width: handSize * 0.8, height: handSize * 0.8 }}
                transition={transition}
              />
            )}
          </div>
        )}

        {/* Left arm */}
        <div className="flex flex-col items-center" style={{ marginRight: -3, marginTop: 2 }}>
          <motion.div
            style={{
              backgroundColor: fillColor,
              borderRadius: armWidth / 2,
              transformOrigin: "top center",
              rotate: armAngle,
              transition: "background-color 0.5s ease",
            }}
            animate={{ width: armWidth, height: armHeight }}
            transition={transition}
          />
          {showHands && (
            <motion.div
              className="rounded-full -mt-1"
              style={{ backgroundColor: fillColor }}
              animate={{ width: handSize, height: handSize }}
              transition={transition}
            />
          )}
        </div>

        {/* Torso */}
        <div className="relative flex flex-col items-center">
          {/* Shoulder pads */}
          {showShoulderPads && (
            <div className="absolute flex justify-between" style={{ top: -2, width: bodyWidth + shoulderPadSize * 2 + shoulderPadOffset }}>
              <motion.div
                className="rounded-t-lg rounded-b-sm"
                style={{ backgroundColor: fillColor }}
                initial={{ width: 0, height: 0 }}
                animate={{ width: shoulderPadSize, height: shoulderPadSize * 0.6 }}
                transition={transition}
              />
              <motion.div
                className="rounded-t-lg rounded-b-sm"
                style={{ backgroundColor: fillColor }}
                initial={{ width: 0, height: 0 }}
                animate={{ width: shoulderPadSize, height: shoulderPadSize * 0.6 }}
                transition={transition}
              />
            </div>
          )}

          <motion.div
            className="rounded-b-2xl rounded-t-lg relative overflow-hidden"
            style={{
              backgroundColor: fillColor,
              boxShadow: `0 0 30px ${glowColor}`,
              transition: "background-color 0.5s ease",
            }}
            animate={{ width: bodyWidth, height: bodyHeight }}
            transition={transition}
          >
            {/* Chest plate detail */}
            {showChestPlate && (
              <motion.div
                className="absolute rounded-md"
                style={{
                  backgroundColor: `hsl(${color} / 0.3)`,
                  top: "15%",
                  left: "50%",
                  transform: "translateX(-50%)",
                }}
                initial={{ width: 0, height: 0 }}
                animate={{ width: chestWidth, height: chestHeight }}
                transition={transition}
              />
            )}
          </motion.div>
        </div>

        {/* Right arm */}
        <div className="flex flex-col items-center" style={{ marginLeft: -3, marginTop: 2 }}>
          <motion.div
            style={{
              backgroundColor: fillColor,
              borderRadius: armWidth / 2,
              transformOrigin: "top center",
              rotate: -armAngle,
              transition: "background-color 0.5s ease",
            }}
            animate={{ width: armWidth, height: armHeight }}
            transition={transition}
          />
          {showHands && (
            <motion.div
              className="rounded-full -mt-1"
              style={{ backgroundColor: fillColor }}
              animate={{ width: handSize, height: handSize }}
              transition={transition}
            />
          )}
        </div>

        {/* Extra right arm (stage 8+) */}
        {showExtraArms && (
          <div className="flex flex-col items-center" style={{ marginLeft: -2, marginTop: 8 }}>
            <motion.div
              style={{
                backgroundColor: fillColor,
                borderRadius: extraArmWidth / 2,
                transformOrigin: "top center",
                rotate: -30,
              }}
              initial={{ height: 0, width: 0 }}
              animate={{ height: extraArmHeight, width: extraArmWidth }}
              transition={transition}
            />
            {showHands && (
              <motion.div
                className="rounded-full -mt-1"
                style={{ backgroundColor: fillColor, rotate: -30 }}
                animate={{ width: handSize * 0.8, height: handSize * 0.8 }}
                transition={transition}
              />
            )}
          </div>
        )}
      </div>

      {/* Legs */}
      <div className="flex -mt-1" style={{ gap: legGap }}>
        {/* Left leg */}
        <div className="flex flex-col items-center">
          <motion.div
            className="rounded-b-lg"
            style={{ backgroundColor: fillColor }}
            animate={{ width: legWidth, height: legHeight }}
            transition={transition}
          />
          {showFeet && (
            <motion.div
              className="rounded-b-md rounded-r-md -mt-0.5"
              style={{ backgroundColor: fillColor, marginLeft: -footWidth * 0.3 }}
              initial={{ width: 0, height: 0 }}
              animate={{ width: footWidth, height: footHeight }}
              transition={transition}
            />
          )}
        </div>

        {/* Right leg */}
        <div className="flex flex-col items-center">
          <motion.div
            className="rounded-b-lg"
            style={{ backgroundColor: fillColor }}
            animate={{ width: legWidth, height: legHeight }}
            transition={transition}
          />
          {showFeet && (
            <motion.div
              className="rounded-b-md rounded-l-md -mt-0.5"
              style={{ backgroundColor: fillColor, marginRight: -footWidth * 0.3 }}
              initial={{ width: 0, height: 0 }}
              animate={{ width: footWidth, height: footHeight }}
              transition={transition}
            />
          )}
        </div>
      </div>

      {/* Ground glow */}
      <motion.div
        className="absolute -bottom-4 rounded-full blur-xl"
        style={{ backgroundColor: `hsl(${color} / 0.15)` }}
        animate={{
          width: lerp(40, 100, t),
          height: 12,
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{ duration: 3, repeat: Infinity }}
      />
    </div>
  );
};

export default EvolvingCharacter;
