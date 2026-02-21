import { motion } from "framer-motion";
import { ArrowLeft, Shield } from "lucide-react";
import Header from "@/components/Header";

const sections = [
  {
    title: "Privacy Policy",
    content: `We take your privacy seriously. We collect only the information necessary to deliver our services — such as your name, email, and business details submitted through our forms. We do not sell or share your personal data with third parties for marketing purposes. Data is stored securely and retained only for as long as needed to fulfil the purposes outlined here.`,
  },
  {
    title: "Data Security",
    content: `All data is encrypted in transit and at rest. We use industry-standard security measures to protect your information, including secure cloud infrastructure, access controls, and regular security audits. In the event of a data breach, affected users will be notified promptly in accordance with applicable regulations.`,
  },
  {
    title: "Terms of Service",
    content: `By using our services, you agree to these terms. We provide AI-powered automation solutions on a subscription basis. We reserve the right to modify pricing and features with reasonable notice. You retain ownership of your data at all times. Either party may terminate the agreement with 30 days' written notice.`,
  },
  {
    title: "Cookie Policy",
    content: `Our website uses essential cookies to ensure proper functionality and analytics cookies to help us understand how visitors interact with the site. You can manage your cookie preferences through your browser settings. We do not use cookies for third-party advertising.`,
  },
];

const Policies = () => {
  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      <Header />

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-primary/3 blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-3xl px-4 pt-28 pb-20">
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
          className="mb-12"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium text-primary">
            <Shield className="h-3 w-3" />
            POLICIES
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gradient sm:text-4xl mb-5">
            Our Policies
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground max-w-2xl">
            Transparency matters. Here's how we handle your data, our terms, and what you can expect from us.
          </p>
        </motion.div>

        <div className="space-y-4">
          {sections.map((section, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 + i * 0.1 }}
              className="glass rounded-2xl p-6"
            >
              <h2 className="text-sm font-semibold text-foreground mb-3">
                {section.title}
              </h2>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {section.content}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Policies;
