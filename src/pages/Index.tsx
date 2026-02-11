import { motion } from "framer-motion";
import MigrationOnboarding from "@/components/migration/MigrationOnboarding";
import { ArrowRight } from "lucide-react";

const Index = () => {
  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Ambient glow effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-primary/3 blur-[100px]" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10 text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            Free migration assessment
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-gradient sm:text-5xl">
            Cut Your Website Costs in Half
          </h1>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">
            Tell us about your current setup and we'll create a seamless migration plan — zero downtime guaranteed.
          </p>
        </motion.div>

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
