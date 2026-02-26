import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Calendar, Rocket } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import EvolvingCharacter from "./EvolvingCharacter";

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
  const [characterColor, setCharacterColor] = useState("0 0% 10%");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [driftOffsets, setDriftOffsets] = useState<{ x: number; y: number }[]>([]);

  useEffect(() => {
    setDriftOffsets(
      Array.from({ length: 5 }, () => ({
        x: Math.random() * 6 - 3,
        y: Math.random() * 6 - 3,
      }))
    );
  }, []);

  const handleFunctionSelect = (value: string) => {
    setSelectedFunctions((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const handlePersonalitySelect = (value: string) => {
    setSelectedPersonality(value);
    const opt = PERSONALITY_OPTIONS.find((o) => o.value === value);
    if (opt) setCharacterColor(opt.color);
  };

  const canProceed = () => {
    if (step === 0) return selectedFunctions.length > 0;
    if (step === 1) return !!selectedPersonality;
    if (step === 2) return name.trim().length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && website.trim().length > 0;
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
    { title: "What do you want it to do?", subtitle: "Choose the main functions of your assistant." },
    { title: "What is its personality?", subtitle: "Choose how it should behave." },
    { title: "Almost there!", subtitle: "How should we communicate with you during setup?" },
  ];

  return (
    <div className="flex flex-col items-center w-full">
      {/* Title — shown above for steps 0-2, moved below character for step 3 */}
      {step < 2 && (
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
      )}

      {/* Steps 0 & 1: Character + Orbit */}
      {step < 2 ? (
        <div className="relative flex items-center justify-center w-full overflow-visible" style={{ height: orbitRadius * 2 + 80 }}>
          {/* Character — fades out, then unblurs back in sync with bubbles */}
          <motion.div
            key={`char-${step}`}
            className="absolute z-10 flex items-center justify-center overflow-visible"
            initial={{ filter: "blur(14px)", opacity: 0 }}
            animate={{ filter: "blur(0px)", opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8, ease: "easeOut" }}
          >
            <EvolvingCharacter
              selectionCount={selectedFunctions.length}
              color={characterColor}
            />
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
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
                    initial={{ x: 0, y: 0, opacity: 0, scale: 0.8 }}
                    animate={{ x: pos.x + drift.x, y: pos.y + drift.y, opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ delay: 0.1 + i * 0.05, duration: 0.35, ease: "easeOut" }}
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
        /* Step 2: Contact form */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm space-y-4 mb-4"
        >
          <div className="flex flex-col items-center mb-2">
            <EvolvingCharacter
              selectionCount={selectedFunctions.length}
              color={characterColor}
              scale={0.8}
            />
          </div>

          {/* Title below character, above form */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-center pb-2"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
              {stepTitles[2].title}
            </h2>
            <p className="text-sm text-muted-foreground">{stepTitles[2].subtitle}</p>
          </motion.div>

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
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">Website</label>
            <Input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="bg-background/40"
              placeholder="https://"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">Phone <span className="text-xs text-muted-foreground/60">(optional)</span></label>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
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
            {submitting ? "Submitting…" : step === 2 ? "Create Assistant" : "Next"}
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
