import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MigrationOnboarding from "@/components/migration/MigrationOnboarding";
import { ArrowRight, ChevronDown } from "lucide-react";
import Header from "@/components/Header";

const Index = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      <Header />
      {/* Ambient glow effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-primary/3 blur-[100px]" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 text-center"
        >
          <h1 className="text-4xl font-bold tracking-tight text-gradient sm:text-5xl">
            Save 4+ Hours Daily With an AI Employee
          </h1>
        </motion.div>

        {/* Drawer toggle button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          onClick={() => setDrawerOpen(!drawerOpen)}
          className="mb-6 inline-flex items-center gap-2 rounded-full glass px-5 py-2 text-xs font-medium text-muted-foreground transition-all hover:text-foreground hover:border-primary/20"
        >
          What is an AI Employee?
          <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-300 ${drawerOpen ? "rotate-180" : ""}`} />
        </motion.button>

        {/* Expandable drawer */}
        <AnimatePresence>
          {drawerOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="w-full max-w-lg overflow-hidden mb-6"
            >
              <div className="glass rounded-2xl px-6 py-5 text-xs leading-relaxed text-muted-foreground">
                <p className="mb-3">
                  Through one chat interface, <strong className="text-foreground">automate</strong> the <strong className="text-foreground">repetitive work</strong> that slows your business down by connecting directly to the tools you already use, such as email, calendars, CRMs, and messaging apps.
                </p>
                <p className="mb-3">
                  Instead of adding another platform, our system <strong className="text-foreground">learns how your company operates</strong> and turns everyday tasks into automated workflows tailored to your needs.
                </p>
                <p>
                  The result is less time spent on admin, fewer operational bottlenecks, and more capacity for your team to focus on growth — all <strong className="text-foreground">while</strong> <strong className="text-foreground">feeling like you're talking to a human</strong>.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-lg"
        >
          <MigrationOnboarding />
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 flex items-center gap-1 text-xs text-muted-foreground"
        >
          Trusted by 2,000+ businesses
          <ArrowRight className="h-3 w-3" />
        </motion.p>
      </div>
    </div>
  );
};

export default Index;
