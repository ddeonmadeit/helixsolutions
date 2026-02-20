import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, FileText, PenLine, CreditCard, Loader2, ChevronDown, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "react-router-dom";

// Steps
const STEPS = [
  { id: 1, label: "Review Contract", icon: FileText },
  { id: 2, label: "Sign Agreement", icon: PenLine },
  { id: 3, label: "Pay Deposit", icon: CreditCard },
];

// Contract PDF public URL — update after uploading to backend storage
const CONTRACT_PDF_URL = "/contract.pdf";

const Tier1 = () => {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const status = searchParams.get("status");

  const [step, setStep] = useState(1);
  const [contractScrolled, setContractScrolled] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const [signature, setSignature] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [pdfExpanded, setPdfExpanded] = useState(true);
  const contractRef = useRef<HTMLDivElement>(null);

  const handleContractScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const atBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 60;
    if (atBottom) setContractScrolled(true);
  };

  const canProceedFromStep1 = acknowledged;
  const canProceedFromStep2 = signature.trim().length >= 2 && email.trim().includes("@");

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-tier1-checkout", {
        body: { email },
      });
      if (error || !data?.url) throw new Error(error?.message || "Failed to create checkout session");
      window.open(data.url, "_blank");
    } catch (err: any) {
      toast({
        title: "Checkout Error",
        description: err.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const successMessage =
    status === "success"
      ? "✅ Payment received! Your deposit and subscription are confirmed. We'll be in touch shortly."
      : null;

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary/5 blur-[140px]" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-primary/3 blur-[100px]" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium text-primary">
            <Lock className="h-3 w-3" />
            PRIVATE ONBOARDING
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gradient sm:text-4xl">
            Helix Solutions — Tier 1
          </h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
            Complete the steps below to finalise your agreement and get started.
          </p>
        </motion.div>

        {/* Success banner */}
        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-8 w-full max-w-2xl glass rounded-2xl px-6 py-4 text-sm text-primary border border-primary/30"
            >
              {successMessage}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step progress */}
        <div className="mb-8 flex items-center gap-0 w-full max-w-2xl">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const done = step > s.id;
            const active = step === s.id;
            return (
              <div key={s.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-300 ${
                      done
                        ? "bg-primary border-primary text-primary-foreground"
                        : active
                        ? "border-primary text-primary glass"
                        : "border-border text-muted-foreground glass"
                    }`}
                  >
                    {done ? <CheckCircle className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                  </div>
                  <span className={`mt-1.5 text-[10px] font-medium ${active ? "text-primary" : done ? "text-foreground" : "text-muted-foreground"}`}>
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`h-px flex-1 mb-5 transition-all duration-300 ${step > s.id ? "bg-primary/60" : "bg-border"}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Step panels */}
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait">
            {/* ── Step 1: Review Contract ── */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                className="glass rounded-2xl p-6"
              >
                <h2 className="text-lg font-semibold mb-1">Review Your Contract</h2>
                <p className="text-xs text-muted-foreground mb-4">
                  Read the full agreement below before proceeding. Scroll to the bottom to continue.
                </p>

                {/* PDF viewer / placeholder */}
                <div className="mb-4">
                  <button
                    onClick={() => setPdfExpanded(!pdfExpanded)}
                    className="flex w-full items-center justify-between rounded-xl glass px-4 py-3 text-sm font-medium text-foreground mb-2"
                  >
                    <span className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      Helix Solutions — Service Agreement
                    </span>
                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${pdfExpanded ? "rotate-180" : ""}`} />
                  </button>

                  <AnimatePresence>
                    {pdfExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        {CONTRACT_PDF_URL ? (
                          <div className="rounded-xl border border-border/50 bg-black/20 p-6 flex flex-col items-center justify-center gap-4" style={{ minHeight: "180px" }}>
                            <FileText className="h-10 w-10 text-primary/60" />
                            <div className="text-center">
                              <p className="text-sm font-medium text-foreground mb-1">Helix Solutions — Service Agreement</p>
                              <p className="text-xs text-muted-foreground mb-4">Open the PDF to read the full agreement, then check the box below to confirm you've read it.</p>
                              <a
                                href={CONTRACT_PDF_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => setTimeout(() => setContractScrolled(true), 1000)}
                                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:brightness-110 transition-all"
                              >
                                <FileText className="h-4 w-4" />
                                Open Contract PDF ↗
                              </a>
                            </div>
                          </div>
                        ) : (
                          <div
                            ref={contractRef}
                            onScroll={handleContractScroll}
                            className="rounded-xl border border-border/50 bg-black/20 overflow-y-auto p-5 text-xs text-muted-foreground leading-relaxed space-y-3"
                            style={{ height: "420px" }}
                          >
                            <p className="text-foreground font-semibold text-sm">SERVICE AGREEMENT — HELIX SOLUTIONS</p>
                            <p><strong className="text-foreground">1. Parties.</strong> This Agreement is between Helix Solutions ("Provider") and the client ("Client") who signs below.</p>
                            <p><strong className="text-foreground">2. Services.</strong> Provider will deliver AI workflow automation and integration services as discussed and agreed in the onboarding consultation ("Services").</p>
                            <p><strong className="text-foreground">3. Fees.</strong> Client agrees to pay a one-time setup deposit of AUD $500 and a monthly subscription fee of AUD $100 per month, commencing from the date of this Agreement.</p>
                            <p><strong className="text-foreground">4. Term.</strong> This Agreement commences on the date of signature and continues on a month-to-month basis until terminated by either party with 30 days written notice.</p>
                            <p><strong className="text-foreground">5. Deliverables.</strong> Provider will deliver agreed automations, integrations, and support within timeframes specified during onboarding. Delays caused by Client will not be the responsibility of Provider.</p>
                            <p><strong className="text-foreground">6. Intellectual Property.</strong> All custom workflows, automations, and configurations created by Provider remain the property of Provider until all outstanding fees are paid in full.</p>
                            <p><strong className="text-foreground">7. Confidentiality.</strong> Both parties agree to keep the terms of this Agreement and any shared business information confidential.</p>
                            <p><strong className="text-foreground">8. Limitation of Liability.</strong> Provider's total liability is limited to the fees paid in the most recent 30-day period. Provider is not liable for indirect, incidental, or consequential damages.</p>
                            <p><strong className="text-foreground">9. Governing Law.</strong> This Agreement is governed by the laws of Australia.</p>
                            <p><strong className="text-foreground">10. Entire Agreement.</strong> This document constitutes the entire agreement between the parties and supersedes all prior discussions or agreements.</p>
                            <p className="pt-4 text-muted-foreground/60 italic">— End of Agreement —</p>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Acknowledge checkbox */}
                <label className="flex items-start gap-3 cursor-pointer group mb-6">
                  <div
                    onClick={() => setAcknowledged(!acknowledged)}
                    className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border transition-all cursor-pointer ${
                      acknowledged ? "border-primary bg-primary" : "border-border glass"
                    }`}
                  >
                    {acknowledged && (
                      <svg className="h-3 w-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                    I have read and understood the terms of the Helix Solutions Service Agreement and agree to be bound by them.
                  </span>
                </label>

                <button
                  disabled={!canProceedFromStep1}
                  onClick={() => setStep(2)}
                  className={`w-full rounded-xl py-3 text-sm font-semibold transition-all duration-200 ${
                    canProceedFromStep1
                      ? "bg-primary text-primary-foreground hover:brightness-110"
                      : "bg-muted text-muted-foreground cursor-not-allowed"
                  }`}
                >
                  {!acknowledged ? "Please acknowledge above" : "Continue to Sign →"}
                </button>
              </motion.div>
            )}

            {/* ── Step 2: Sign ── */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                className="glass rounded-2xl p-6"
              >
                <h2 className="text-lg font-semibold mb-1">Sign the Agreement</h2>
                <p className="text-xs text-muted-foreground mb-5">
                  Type your full legal name and email to confirm your identity and sign the agreement.
                </p>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Full Legal Name</label>
                    <input
                      type="text"
                      value={signature}
                      onChange={(e) => setSignature(e.target.value)}
                      placeholder="e.g. Jane Smith"
                      className="w-full rounded-xl glass border border-border/50 bg-transparent px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full rounded-xl glass border border-border/50 bg-transparent px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-colors"
                    />
                  </div>
                </div>

                {/* Signature preview */}
                {signature.trim().length >= 2 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mb-6 rounded-xl border border-primary/20 bg-primary/5 px-5 py-4"
                  >
                    <p className="text-[10px] text-muted-foreground mb-1">Electronic Signature</p>
                    <p className="font-serif text-2xl text-primary italic">{signature}</p>
                  </motion.div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 rounded-xl py-3 text-sm font-medium glass border border-border/50 text-muted-foreground hover:text-foreground transition-all"
                  >
                    ← Back
                  </button>
                  <button
                    disabled={!canProceedFromStep2}
                    onClick={() => setStep(3)}
                    className={`flex-[2] rounded-xl py-3 text-sm font-semibold transition-all duration-200 ${
                      canProceedFromStep2
                        ? "bg-primary text-primary-foreground hover:brightness-110"
                        : "bg-muted text-muted-foreground cursor-not-allowed"
                    }`}
                  >
                    Continue to Payment →
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── Step 3: Payment ── */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                className="glass rounded-2xl p-6"
              >
                <h2 className="text-lg font-semibold mb-1">Complete Payment</h2>
                <p className="text-xs text-muted-foreground mb-6">
                  Signed as <span className="text-foreground font-medium">{signature}</span> · {email}
                </p>

                {/* Summary */}
                <div className="glass rounded-xl p-5 border border-border/50 mb-6 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Setup Deposit <span className="text-[10px]">(one-time)</span></span>
                    <span className="font-semibold text-foreground">$500 AUD</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Monthly Subscription</span>
                    <span className="font-semibold text-foreground">$100 AUD/mo</span>
                  </div>
                  <div className="h-px bg-border/50" />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Due today</span>
                    <span className="font-bold text-primary">$600 AUD</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground/60">Then $100 AUD/month · cancel anytime with 30 days notice</p>
                </div>

                <button
                  onClick={() => handleCheckout()}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground hover:brightness-110 transition-all disabled:opacity-60 disabled:cursor-not-allowed mb-6"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                  Pay $600 AUD &amp; Start Subscription →
                </button>

                <button
                  onClick={() => setStep(2)}
                  className="w-full rounded-xl py-2.5 text-xs font-medium glass border border-border/50 text-muted-foreground hover:text-foreground transition-all"
                >
                  ← Back to Signature
                </button>

                <p className="mt-4 text-center text-[10px] text-muted-foreground/50 flex items-center justify-center gap-1">
                  <Lock className="h-2.5 w-2.5" /> Secured by Stripe · Apple Pay supported
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Tier1;
