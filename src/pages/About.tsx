import { motion } from "framer-motion";
import { ArrowLeft, Quote, Star } from "lucide-react";
import Header from "@/components/Header";

const testimonials = [
{
  name: "Sarah Mitchell",
  role: "Operations Manager, Apex Realty",
  quote:
  "We cut our admin time by 5 hours a day. The digital operator handles follow-ups, scheduling, and CRM updates — things that used to eat our mornings alive.",
  stars: 5
},
{
  name: "James Thornton",
  role: "Founder, Thornton Legal",
  quote:
  "I was sceptical about AI, but this genuinely feels like hiring a new team member. It learned our processes in days and now runs them better than we did.",
  stars: 5
},
{
  name: "Priya Kapoor",
  role: "CEO, BrightPath Education",
  quote:
  "Our response time to enquiries dropped from 4 hours to under 2 minutes. We've doubled our enrolment pipeline without adding headcount.",
  stars: 5
},
{
  name: "David Chen",
  role: "Managing Director, Chen & Associates",
  quote:
  "The onboarding was seamless. Within a week it was drafting client emails, managing calendars, and flagging tasks — all through one chat interface.",
  stars: 5
}];

const aboutPoints = [
  "No more sick days",
  "No annual leave",
  "No payroll tax or super",
  "No training time",
  "No onboarding delays",
  "No human error from fatigue",
  "No salary increases",
  "No complaints",
  "Unlimited memory",
  "Reduced overheads",
  "Faster execution",
  "Lower operating costs",
];

const About = () => {
  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      <Header />

      {/* Ambient glow effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-primary/3 blur-[100px]" />
        <div className="absolute top-1/2 left-0 h-64 w-64 rounded-full bg-primary/4 blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-4 pt-28 pb-20">
        {/* Back link */}
        <motion.a
          href="/"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-10 inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to home
        </motion.a>

        {/* Hero section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-16">

          <div className="mb-4 inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            ABOUT US
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gradient sm:text-4xl mb-5">
            We Build Digital Operators That Actually Work
          </h1>
          <div className="text-sm leading-relaxed text-muted-foreground max-w-2xl space-y-4">
            <p>Helix Solutions was founded on a simple idea: businesses shouldn't waste hours on repetitive tasks that machines can do better. We connect directly to the tools you already use and turn everyday busywork into automated workflows — so your team can focus on what actually grows the business.</p>
            <p>Instead of hiring more staff to handle admin, follow-ups, data entry, scheduling, and customer replies, we deploy AI systems that work instantly and consistently.</p>
            <p className="text-foreground font-semibold">What this means for you:</p>
            <div className="grid grid-cols-3 gap-x-6 gap-y-2">
              {aboutPoints.map((point, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  <span>{point}</span>
                </div>
              ))}
            </div>
            <p>Your digital operator works 24/7, responds in seconds, and scales with your business — without increasing your headcount.</p>
            <p>Helix Solutions replaces repetitive manual work with intelligent automation, so you can grow revenue without growing expenses.</p>
          </div>
        </motion.div>

        {/* Values */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }} className="mb-16 grid gap-4 sm:grid-cols-3">
          {[{ title: "Same-Day Demos", desc: "See results before you commit. We move fast so you can too." }, { title: "Your Tools, Connected", desc: "Email, CRM, calendar, messaging — we plug into what you already have." }, { title: "Human-Like Experience", desc: "One chat interface that feels natural. No new platforms to learn." }].map((v, i) => <div key={i} className="glass rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-foreground mb-1.5">{v.title}</h3>
              <p className="text-xs leading-relaxed text-muted-foreground">{v.desc}</p>
            </div>)}
        </motion.div>

        {/* Testimonials */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>

          <div className="mb-6 inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium text-primary">
            <Quote className="h-3 w-3" />
            TESTIMONIALS
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground mb-8">
            Built on Results, Not Promises
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            {testimonials.map((t, i) => <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.35 + i * 0.1 }} className="glass-hover rounded-2xl p-6 flex flex-col">

                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: t.stars }).map((_, j) =>
                  <Star key={j} className="h-3.5 w-3.5 fill-primary text-primary" />
                  )}
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground mb-4 flex-1">
                  "{t.quote}"
                </p>
                <div>
                  <p className="text-sm font-semibold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="mt-16 text-center">

          <a
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 glow-primary">

            Book Your Same-Day Demo
          </a>
        </motion.div>
      </div>
    </div>);

};

export default About;
