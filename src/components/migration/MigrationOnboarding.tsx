import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Globe, ShoppingCart, FileText, Briefcase, DollarSign, Rocket } from "lucide-react";
import StepProgress from "./StepProgress";
import OptionCard from "./OptionCard";
import GlassSelect from "./GlassSelect";
import { Input } from "@/components/ui/input";

interface StepData {
  websiteType: string;
  currentPlatform: string;
  monthlyCost: string;
  monthlyVisitors: string;
  websiteUrl: string;
  timeline: string;
}

const initialData: StepData = {
  websiteType: "",
  currentPlatform: "",
  monthlyCost: "",
  monthlyVisitors: "",
  websiteUrl: "",
  timeline: "",
};

const steps = [
  { title: "What type of website do you have?", subtitle: "This helps us tailor the migration process" },
  { title: "Where is your site currently hosted?", subtitle: "Select your current platform or provider" },
  { title: "How much do you pay monthly?", subtitle: "We'll show you how much you can save" },
  { title: "Almost there! A few final details", subtitle: "Help us prepare your migration plan" },
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

  const next = () => {
    if (step < steps.length - 1) {
      setDirection(1);
      setStep(step + 1);
    } else {
      setSubmitted(true);
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
      case 0: return !!data.websiteType;
      case 1: return !!data.currentPlatform;
      case 2: return !!data.monthlyCost;
      case 3: return !!data.websiteUrl && !!data.timeline;
      default: return false;
    }
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
        <h2 className="mb-2 text-2xl font-bold text-foreground">Migration Request Submitted!</h2>
        <p className="text-muted-foreground">
          Our team will review your details and reach out within 24 hours with a custom migration plan.
        </p>
      </motion.div>
    );
  }

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="grid gap-3">
            {[
              { value: "business", label: "Business Website", desc: "Company site, portfolio", icon: <Briefcase className="h-5 w-5" /> },
              { value: "ecommerce", label: "E-Commerce Store", desc: "Online shop, product catalog", icon: <ShoppingCart className="h-5 w-5" /> },
              { value: "blog", label: "Blog / Content Site", desc: "Articles, media, news", icon: <FileText className="h-5 w-5" /> },
              
            ].map((opt) => (
              <OptionCard
                key={opt.value}
                label={opt.label}
                description={opt.desc}
                icon={opt.icon}
                selected={data.websiteType === opt.value}
                onClick={() => setData({ ...data, websiteType: opt.value })}
              />
            ))}
          </div>
        );
      case 1:
        return (
          <div className="space-y-4">
            <GlassSelect
              placeholder="Select your current platform"
              value={data.currentPlatform}
              onValueChange={(v) => setData({ ...data, currentPlatform: v })}
              options={[
                { value: "wordpress", label: "WordPress" },
                { value: "shopify", label: "Shopify" },
                { value: "wix", label: "Wix" },
                { value: "squarespace", label: "Squarespace" },
                { value: "webflow", label: "Webflow" },
                
                { value: "other", label: "Other" },
              ]}
            />
          </div>
        );
      case 2:
        return (
          <div className="grid gap-3">
            {[
              { value: "0-50", label: "$0 – $50/mo", icon: <DollarSign className="h-5 w-5" /> },
              { value: "50-100", label: "$50 – $100/mo", icon: <DollarSign className="h-5 w-5" /> },
              { value: "100-200", label: "$100 – $200/mo", icon: <DollarSign className="h-5 w-5" /> },
              { value: "200-400", label: "$200 – $400/mo", icon: <DollarSign className="h-5 w-5" /> },
              { value: "400+", label: "$400+/mo", icon: <DollarSign className="h-5 w-5" /> },
            ].map((opt) => (
              <OptionCard
                key={opt.value}
                label={opt.label}
                icon={opt.icon}
                selected={data.monthlyCost === opt.value}
                onClick={() => setData({ ...data, monthlyCost: opt.value })}
              />
            ))}
          </div>
        );
      case 3:
        return (
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Current Website URL</label>
              <Input
                placeholder="https://yourwebsite.com"
                value={data.websiteUrl}
                onChange={(e) => setData({ ...data, websiteUrl: e.target.value })}
                className="glass-hover h-12 rounded-xl border-0 text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Preferred Timeline</label>
              <GlassSelect
                placeholder="When do you need this done?"
                value={data.timeline}
                onValueChange={(v) => setData({ ...data, timeline: v })}
                options={[
                  { value: "asap", label: "As soon as possible" },
                  { value: "2weeks", label: "Within 2 weeks" },
                  { value: "1month", label: "Within a month" },
                  { value: "flexible", label: "I'm flexible" },
                ]}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Monthly Visitors (optional)</label>
              <GlassSelect
                placeholder="Estimated monthly visitors"
                value={data.monthlyVisitors}
                onValueChange={(v) => setData({ ...data, monthlyVisitors: v })}
                options={[
                  { value: "under1k", label: "Under 1,000" },
                  { value: "1k-10k", label: "1,000 – 10,000" },
                  { value: "10k-50k", label: "10,000 – 50,000" },
                  { value: "50k+", label: "50,000+" },
                ]}
              />
            </div>
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
        Find out how much money you're wasting on your website
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
              <p className="mt-1 text-sm text-muted-foreground">{steps[step].subtitle}</p>
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
          disabled={!canProceed()}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ boxShadow: canProceed() ? "0 0 20px hsl(185 70% 50% / 0.3)" : "none" }}
        >
          {step === steps.length - 1 ? "Submit" : "Continue"}
          <ArrowRight className="h-4 w-4" />
        </motion.button>
      </div>
    </div>
  );
};

export default MigrationOnboarding;
