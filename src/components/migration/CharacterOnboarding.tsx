import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Calendar, Rocket } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

const FUNCTION_OPTIONS = [
  { value: "emails", label: "Send Emails" },
  { value: "meetings", label: "Book Meetings" },
  { value: "crm", label: "Manage CRM" },
  { value: "support", label: "Handle Support" },
  { value: "automate", label: "Automate Tasks" },
];

const PERSONALITY_OPTIONS = [
  { value: "professional", label: "Professional", color: "210 70% 50%" },
  { value: "friendly", label: "Friendly", color: "145 60% 45%" },
  { value: "playful", label: "Playful", color: "270 60% 55%" },
  { value: "direct", label: "Direct", color: "0 65% 50%" },
  { value: "calm", label: "Calm", color: "175 55% 45%" },
];

const BASE_HEIGHT = 40;
const HEIGHT_PER_SELECTION = 8;
const MAX_HEIGHT = 80;

// Orbit positions for 5 items around center
const getOrbitPositions = (count: number, radius: number) => {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * 2 * Math.PI - Math.PI / 2;
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
    };
  });
};

const CharacterOnboarding = () => {
  const [step, setStep] = useState(0);
  const [selectedFunctions, setSelectedFunctions] = useState<string[]>([]);
  const [selectedPersonality, setSelectedPersonality] = useState<string | null>(null);
  const [characterHeight, setCharacterHeight] = useState(BASE_HEIGHT);
  const [characterColor, setCharacterColor] = useState("0 0% 10%");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [driftOffsets, setDriftOffsets] = useState<{ x: number; y: number }[]>([]);

  // Generate random drift offsets on mount
  useEffect(() => {
    setDriftOffsets(
      Array.from({ length: 5 }, () => ({
        x: Math.random() * 6 - 3,
        y: Math.random() * 6 - 3,
      }))
    );
  }, []);

  const handleFunctionSelect = (value: string) => {
    setSelectedFunctions((prev) => {
      const next = prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value];
      const newHeight = Math.min(BASE_HEIGHT + next.length * HEIGHT_PER_SELECTION, MAX_HEIGHT);
      setCharacterHeight(newHeight);
      return next;
    });
  };

  const handlePersonalitySelect = (value: string) => {
    setSelectedPersonality(value);
    const opt = PERSONALITY_OPTIONS.find((o) => o.value === value);
    if (opt) setCharacterColor(opt.color);
  };

  const canProceed = () => {
    if (step === 0) return selectedFunctions.length > 0;
    if (step === 1) return !!selectedPersonality;
    if (step === 2) return name.trim().length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    return false;
  };

  const buildCalUrl = () => {
    const base = "https://cal.com/helix-solutions/demo";
    const params = new URLSearchParams();
    if (selectedFunctions.length > 0) params.set("metadata[function]", selectedFunctions.join(","));
    if (selectedPersonality) params.set("metadata[personality]", selectedPersonality);
    return `${base}?${params.toString()}`;
  };

  const handleNext = async () => {
    if (step < 2) {
      setStep(step + 1);
    } else {
      setSubmitting(true);
      try {
        const body = {
          timeSinks: selectedFunctions,
          timeSinksOther: "",
          businessType: selectedPersonality || "",
          businessTypeOther: "",
          currentSoftware: [],
          name,
          email,
        };
        const { error: migError } = await supabase.functions.invoke("send-migration-emails", { body });
        if (migError) throw migError;

        const calUrl = buildCalUrl();
        const { error: tyError } = await supabase.functions.invoke("send-thankyou-email", {
          body: { name, email, calUrl },
        });
        if (tyError) throw tyError;

        setSubmitted(true);
      } catch (err: any) {
        console.error("Submission error:", err);
        toast.error("Something went wrong. Please try again.");
      } finally {
        setSubmitting(false);
      }
    }
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col items-center text-center py-8"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10"
        >
          <Rocket className="h-8 w-8 text-primary" />
        </motion.div>
        <h2 className="mb-2 text-2xl font-bold text-foreground">One last step!</h2>
        <p className="text-muted-foreground mb-6">
          Book your same-day demo to see your custom AI assistant in action.
        </p>
        <motion.a
          href={buildCalUrl()}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => {
            if (typeof window !== "undefined" && (window as any).fbq) {
              (window as any).fbq("track", "Lead");
            }
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground transition-all"
          style={{ boxShadow: "0 0 20px hsl(185 70% 50% / 0.3)" }}
        >
          <Calendar className="h-4 w-4" />
          Book Your Demo
          <ArrowRight className="h-4 w-4" />
        </motion.a>
      </motion.div>
    );
  }

  const currentOptions = step === 0 ? FUNCTION_OPTIONS : step === 1 ? PERSONALITY_OPTIONS : [];
  const orbitRadius = typeof window !== "undefined" && window.innerWidth < 640 ? 120 : 160;
  const positions = getOrbitPositions(currentOptions.length, orbitRadius);

  const stepTitles = [
    { title: "What do you want it to do?", subtitle: "Choose the main function's of your assistant." },
    { title: "What is its personality?", subtitle: "Choose how it should behave." },
    { title: "Almost there!", subtitle: "Where should we send your demo details?" },
  ];

  return (
    <div className="flex flex-col items-center w-full">
      {/* Title */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="text-center mb-8"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            {stepTitles[step].title}
          </h2>
          <p className="text-sm text-muted-foreground">{stepTitles[step].subtitle}</p>
        </motion.div>
      </AnimatePresence>

      {/* Character + Orbit Area */}
      {step < 2 ? (
        <div className="relative flex items-center justify-center w-full" style={{ height: orbitRadius * 2 + 80 }}>
          {/* Character */}
          <motion.div
            className="absolute z-10 flex flex-col items-center"
            animate={{
              scale: [1, 1.04, 1],
            }}
            transition={{
              duration: 0.5,
              ease: "easeInOut",
              times: [0, 0.5, 1],
            }}
            key={`char-${characterHeight}-${characterColor}`}
          >
            {/* Star Head */}
            <motion.svg
              viewBox="0 0 60 60"
              style={{ width: 40, height: 40 }}
              layout
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              <motion.polygon
                points={(() => {
                  const cx = 30, cy = 30, spikes = 8, outerR = 28, innerR = 14;
                  return Array.from({ length: spikes * 2 }, (_, i) => {
                    const r = i % 2 === 0 ? outerR : innerR;
                    const angle = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2;
                    return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
                  }).join(" ");
                })()}
                fill={`hsl(${characterColor})`}
              />
            </motion.svg>
            {/* Body with Arms */}
            <div className="relative flex items-start justify-center -mt-1">
              {/* Left Arm */}
              <motion.div
                className="rounded-full"
                style={{
                  width: 8,
                  backgroundColor: `hsl(${characterColor})`,
                  borderRadius: 4,
                  marginTop: 4,
                  marginRight: -2,
                }}
                animate={{ height: Math.max(characterHeight * 0.45, 16) }}
                transition={{ duration: 0.5, type: "spring", stiffness: 150, damping: 15 }}
              />
              {/* Torso */}
              <motion.div
                className="rounded-b-2xl rounded-t-lg"
                style={{
                  width: 24,
                  backgroundColor: `hsl(${characterColor})`,
                  boxShadow: `0 0 30px hsl(${characterColor} / 0.2)`,
                }}
                animate={{ height: characterHeight }}
                transition={{ duration: 0.5, type: "spring", stiffness: 150, damping: 15 }}
              />
              {/* Right Arm */}
              <motion.div
                className="rounded-full"
                style={{
                  width: 8,
                  backgroundColor: `hsl(${characterColor})`,
                  borderRadius: 4,
                  marginTop: 4,
                  marginLeft: -2,
                }}
                animate={{ height: Math.max(characterHeight * 0.45, 16) }}
                transition={{ duration: 0.5, type: "spring", stiffness: 150, damping: 15 }}
              />
            </div>
            {/* Legs */}
            <div className="flex gap-1.5 -mt-0.5">
              <motion.div
                className="rounded-b-lg"
                style={{
                  width: 8,
                  backgroundColor: `hsl(${characterColor})`,
                }}
                animate={{ height: Math.max(characterHeight * 0.35, 12) }}
                transition={{ duration: 0.5, type: "spring", stiffness: 150, damping: 15 }}
              />
              <motion.div
                className="rounded-b-lg"
                style={{
                  width: 8,
                  backgroundColor: `hsl(${characterColor})`,
                }}
                animate={{ height: Math.max(characterHeight * 0.35, 12) }}
                transition={{ duration: 0.5, type: "spring", stiffness: 150, damping: 15 }}
              />
            </div>
            {/* Glow underneath */}
            <motion.div
              className="absolute -bottom-4 rounded-full blur-xl"
              style={{
                width: 60,
                height: 12,
                backgroundColor: `hsl(${characterColor} / 0.15)`,
              }}
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </motion.div>

          {/* Orbiting Options */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              {currentOptions.map((opt, i) => {
                const pos = positions[i];
                const drift = driftOffsets[i] || { x: 0, y: 0 };
                const isSelected =
                  step === 0
                    ? selectedFunctions.includes(opt.value)
                    : selectedPersonality === opt.value;

                return (
                  <motion.button
                    key={opt.value}
                    className={`absolute px-4 py-2.5 rounded-full text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                      isSelected
                        ? "bg-primary text-primary-foreground shadow-lg"
                        : "glass text-muted-foreground hover:text-foreground hover:border-primary/30"
                    }`}
                    style={{
                      ...(isSelected
                        ? { boxShadow: `0 0 24px hsl(${step === 1 ? (PERSONALITY_OPTIONS.find(p => p.value === opt.value)?.color || "185 70% 50%") : "185 70% 50%"} / 0.3)` }
                        : {}),
                    }}
                    initial={{
                      x: 0,
                      y: 0,
                      opacity: 0,
                    }}
                    animate={{
                      x: pos.x + drift.x,
                      y: pos.y + drift.y,
                      opacity: 1,
                    }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{
                      delay: i * 0.06,
                      duration: 0.5,
                      ease: "easeOut",
                    }}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() =>
                      step === 0
                        ? handleFunctionSelect(opt.value)
                        : handlePersonalitySelect(opt.value)
                    }
                  >
                    {opt.label}
                  </motion.button>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      ) : (
        /* Step 3: Contact form */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm space-y-4 mb-4"
        >
          {/* Show the character small above the form */}
          <div className="flex justify-center mb-6">
            <div className="flex flex-col items-center">
              <svg viewBox="0 0 60 60" style={{ width: 28, height: 28 }}>
                <polygon
                  points={(() => {
                    const cx = 30, cy = 30, spikes = 8, outerR = 28, innerR = 14;
                    return Array.from({ length: spikes * 2 }, (_, i) => {
                      const r = i % 2 === 0 ? outerR : innerR;
                      const angle = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2;
                      return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
                    }).join(" ");
                  })()}
                  fill={`hsl(${characterColor})`}
                />
              </svg>
              <div className="relative flex items-start justify-center -mt-0.5">
                <div className="rounded-full" style={{ width: 5, height: 20, backgroundColor: `hsl(${characterColor})`, marginTop: 2, marginRight: -1, borderRadius: 3 }} />
                <div className="rounded-b-xl rounded-t-md" style={{ width: 16, height: 44, backgroundColor: `hsl(${characterColor})` }} />
                <div className="rounded-full" style={{ width: 5, height: 20, backgroundColor: `hsl(${characterColor})`, marginTop: 2, marginLeft: -1, borderRadius: 3 }} />
              </div>
              <div className="flex gap-1 -mt-0.5">
                <div className="rounded-b-md" style={{ width: 6, height: 10, backgroundColor: `hsl(${characterColor})` }} />
                <div className="rounded-b-md" style={{ width: 6, height: 10, backgroundColor: `hsl(${characterColor})` }} />
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">Full Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-background/40"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-background/40"
            />
          </div>
        </motion.div>
      )}

      {/* Next Button */}
      <AnimatePresence>
        {canProceed() && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
            onClick={handleNext}
            disabled={submitting}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="mt-4 flex items-center gap-2 rounded-xl bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground transition-all disabled:opacity-40"
            style={{ boxShadow: "0 0 20px hsl(185 70% 50% / 0.3)" }}
          >
            {submitting ? "Submitting…" : step === 2 ? "Submit" : "Next"}
            {!submitting && <ArrowRight className="h-4 w-4" />}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Back link */}
      {step > 0 && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setStep(step - 1)}
          className="mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back
        </motion.button>
      )}
    </div>
  );
};

export default CharacterOnboarding;
