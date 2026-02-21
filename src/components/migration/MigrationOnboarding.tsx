import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Building2, Stethoscope, Scale, Megaphone, Store, Home, MoreHorizontal, Rocket, Clock, MessageSquare, Calendar, Mail, FileText, Briefcase, ShoppingBag, Wrench, User } from "lucide-react";
import StepProgress from "./StepProgress";
import OptionCard from "./OptionCard";
import GlassSelect from "./GlassSelect";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface StepData {
  timeSinks: string[];
  timeSinksOther: string;
  businessType: string;
  businessTypeOther: string;
  currentSoftware: string[];
  name: string;
  email: string;
}

const initialData: StepData = {
  timeSinks: [],
  timeSinksOther: "",
  businessType: "",
  businessTypeOther: "",
  currentSoftware: [],
  name: "",
  email: "",
};

const steps = [
  { title: "If you had an assistant, what would they do for you?" },
  { title: "What best describes your business?" },
  { title: "What software are you currently using?" },
  { title: "Find out how many hours you could save per week:" },
];

const slideVariants = {
  enter: (direction: number) => ({ x: direction > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction < 0 ? 80 : -80, opacity: 0 }),
};

const MigrationOnboarding = () => {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(0);
  const [data, setData] = useState<StepData>(initialData);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const next = async () => {
    if (step < steps.length - 1) {
      setDirection(1);
      setStep(step + 1);
    } else {
      setSubmitting(true);
      try {
        const { error } = await supabase.functions.invoke("send-migration-emails", {
          body: data,
        });
        if (error) throw error;
        setSubmitted(true);
      } catch (err: any) {
        console.error("Submission error:", err);
        toast.error("Something went wrong. Please try again.");
      } finally {
        setSubmitting(false);
      }
    }
  };

  const prev = () => {
    if (step > 0) {
      setDirection(-1);
      setStep(step - 1);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 0: return data.timeSinks.length > 0 && (!data.timeSinks.includes("other") || data.timeSinksOther.trim().length > 0);
      case 1: return !!data.businessType && (data.businessType !== "other" || data.businessTypeOther.trim().length > 0);
      case 2: return data.currentSoftware.length > 0;
      case 3: return !!data.name.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email);
      default: return false;
    }
  };

  const buildCalUrl = () => {
    const base = "https://cal.com/helix-solutions/demo";
    const params = new URLSearchParams();
    if (data.timeSinks.length > 0) params.set("metadata[timeSinks]", data.timeSinks.join(", "));
    if (data.businessType) params.set("metadata[businessType]", data.businessType);
    if (data.currentSoftware.length > 0) params.set("metadata[currentSoftware]", data.currentSoftware.join(", "));
    return `${base}?${params.toString()}`;
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass glow-primary mx-auto w-full max-w-lg rounded-2xl p-10 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10"
        >
          <Rocket className="h-8 w-8 text-primary" />
        </motion.div>
        <h2 className="mb-2 text-2xl font-bold text-foreground">One last step!</h2>
        <p className="text-muted-foreground mb-6">
          Book your same-day demo to see your custom AI employee in action.
        </p>
        <motion.a
          href={buildCalUrl()}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => {
            if (typeof window !== 'undefined' && (window as any).fbq) {
              (window as any).fbq('track', 'Lead');
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

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="grid gap-3">
            <p className="text-xs text-muted-foreground mb-1">Select all that apply</p>
            {[
              { value: "emails-messages", label: "Manage My Emails & Messages", icon: <Mail className="h-5 w-5" /> },
              { value: "follow-ups", label: "Follow Up My Leads & Customers", icon: <MessageSquare className="h-5 w-5" /> },
              { value: "admin-ops", label: "Handle Admin & Operations", icon: <FileText className="h-5 w-5" /> },
              { value: "team-coordination", label: "Coordinate My Team", icon: <Calendar className="h-5 w-5" /> },
              { value: "overworked", label: "Book & Manage My Calendar", icon: <Clock className="h-5 w-5" /> },
              { value: "other", label: "Other", icon: <MoreHorizontal className="h-5 w-5" /> },
            ].map((opt) => (
              <OptionCard
                key={opt.value}
                label={opt.label}
                icon={opt.icon}
                selected={data.timeSinks.includes(opt.value)}
                onClick={() => {
                  const timeSinks = data.timeSinks.includes(opt.value)
                    ? data.timeSinks.filter((v) => v !== opt.value)
                    : [...data.timeSinks, opt.value];
                  setData({ ...data, timeSinks });
                }}
              />
            ))}
            <AnimatePresence>
              {data.timeSinks.includes("other") && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Input
                    placeholder=""
                    value={data.timeSinksOther}
                    onChange={(e) => setData({ ...data, timeSinksOther: e.target.value })}
                    className="bg-background/40 mt-1"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      case 1:
        return (
          <div className="grid gap-3">
            {[
              { value: "agency", label: "Agency / Marketing / Creative", icon: <Megaphone className="h-5 w-5" /> },
              { value: "ecommerce", label: "Ecommerce Brand", icon: <ShoppingBag className="h-5 w-5" /> },
              { value: "service", label: "Service Business", icon: <Wrench className="h-5 w-5" /> },
              { value: "consultant", label: "Consultant / Freelancer", icon: <User className="h-5 w-5" /> },
              { value: "other", label: "Other", icon: <MoreHorizontal className="h-5 w-5" /> },
            ].map((opt) => (
              <OptionCard
                key={opt.value}
                label={opt.label}
                icon={opt.icon}
                selected={data.businessType === opt.value}
                onClick={() => setData({ ...data, businessType: opt.value })}
              />
            ))}
            <AnimatePresence>
              {data.businessType === "other" && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Input
                    placeholder=""
                    value={data.businessTypeOther}
                    onChange={(e) => setData({ ...data, businessTypeOther: e.target.value })}
                    className="bg-background/40 mt-1"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      case 2:
        return (
          <div className="grid gap-3">
            <p className="text-xs text-muted-foreground mb-1">Select all that apply</p>
            {[
              { value: "chatgpt", label: "ChatGPT" },
              { value: "zoho", label: "Zoho" },
              { value: "hubspot", label: "HubSpot" },
              { value: "trello", label: "Trello" },
              { value: "klaviyo", label: "Klaviyo" },
              { value: "myob", label: "MYOB" },
            ].map((opt) => (
              <OptionCard
                key={opt.value}
                label={opt.label}
                selected={data.currentSoftware.includes(opt.value)}
                onClick={() => {
                  const currentSoftware = data.currentSoftware.includes(opt.value)
                    ? data.currentSoftware.filter((v) => v !== opt.value)
                    : [...data.currentSoftware, opt.value];
                  setData({ ...data, currentSoftware });
                }}
              />
            ))}
          </div>
        );
      case 3:
        return (
          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Your Name</label>
              <Input
                placeholder="Jane Smith"
                value={data.name}
                onChange={(e) => setData({ ...data, name: e.target.value })}
                className="bg-background/40"
              />
            </div>
            <div className="grid gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Email Address</label>
              <Input
                type="email"
                placeholder="jane@company.com"
                value={data.email}
                onChange={(e) => setData({ ...data, email: e.target.value })}
                className="bg-background/40"
              />
            </div>
            <p className="text-xs text-muted-foreground">See how many hours you could be saving:</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="mx-auto w-full max-w-lg space-y-8">
      <StepProgress currentStep={step} totalSteps={steps.length} />

      <p className="mt-3 text-center text-xs sm:text-base text-muted-foreground">
        Find out how many hours we can save you a week
      </p>

      <div className="glass glow-primary rounded-2xl p-8">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="mb-6">
              <h2 className="text-xl font-bold text-foreground">{steps[step].title}</h2>
            </div>
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex justify-between">
        <button
          onClick={prev}
          disabled={step === 0}
          className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-0"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <motion.button
          onClick={next}
          disabled={!canProceed() || submitting}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ boxShadow: canProceed() ? "0 0 20px hsl(185 70% 50% / 0.3)" : "none" }}
        >
          {submitting ? "Submitting…" : step === steps.length - 1 ? "Submit" : "Continue"}
          {!submitting && <ArrowRight className="h-4 w-4" />}
        </motion.button>
      </div>
    </div>
  );
};

export default MigrationOnboarding;
