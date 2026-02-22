import { motion } from "framer-motion";
import { ArrowLeft, Quote, Star } from "lucide-react";
import Header from "@/components/Header";

const testimonials = [
  {
    name: "Sarah Mitchell",
    role: "Operations Manager, Apex Realty",
    quote:
      "We cut our admin time by 5 hours a day. The digital operator handles follow-ups, scheduling, and CRM updates — things that used to eat our mornings alive.",
    stars: 5,
  },
  {
    name: "James Thornton",
    role: "Founder, Thornton Legal",
    quote:
      "I was sceptical about AI, but this genuinely feels like hiring a new team member. It learned our processes in days and now runs them better than we did.",
    stars: 5,
  },
  {
    name: "Priya Kapoor",
    role: "CEO, BrightPath Education",
    quote:
      "Our response time to enquiries dropped from 4 hours to under 2 minutes. We've doubled our enrolment pipeline without adding headcount.",
    stars: 5,
  },
  {
    name: "David Chen",
    role: "Managing Director, Chen & Associates",
    quote:
      "The onboarding was seamless. Within a week it was drafting client emails, managing calendars, and flagging tasks — all through one chat interface.",
    stars: 5,
  },
];

const Testimonials = () => {
  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      <Header />

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-primary/3 blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-4 pt-28 pb-20">
        <motion.a
          href="/"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-10 inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to home
        </motion.a>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium text-primary">
            <Quote className="h-3 w-3" />
            TESTIMONIALS
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gradient sm:text-4xl mb-5">
            Built on Results, Not Promises
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground max-w-2xl mb-10">
            Don't just take our word for it.
            <br />
            Hear from the businesses that transformed their operations with a digital operator.
          </p>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 + i * 0.1 }}
              className="glass-hover rounded-2xl p-6 flex flex-col"
            >
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: t.stars }).map((_, j) => (
                  <Star key={j} className="h-3.5 w-3.5 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground mb-4 flex-1">
                "{t.quote}"
              </p>
              <div>
                <p className="text-sm font-semibold text-foreground">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-16 text-center"
        >
          <a
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 glow-primary"
          >
            Book Your Same-Day Demo
          </a>
        </motion.div>
      </div>
    </div>
  );
};

export default Testimonials;
