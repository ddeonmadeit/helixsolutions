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
  {
    title: "Refund & Billing Policy — Overview",
    content: `Due to the customised and digital nature of our AI Agent services, all purchases and subscriptions are subject to the terms outlined below. By purchasing our AI Agent setup or subscribing to our monthly service, you agree to this Refund & Billing Policy in full.`,
  },
  {
    title: "One-Time Setup Fee (Non-Refundable)",
    content: `The one-time setup fee covers custom AI configuration, infrastructure deployment (VPS, hosting, integrations), strategy, prompt engineering, system optimisation, and technical implementation and labour. Because this work begins immediately upon purchase and involves irreversible allocation of resources, all setup fees are strictly non-refundable once payment is processed. No exceptions will be made for change of mind, business model changes, lack of usage, misunderstanding of functionality, or performance expectations not explicitly guaranteed in writing. If onboarding has not yet commenced and a cancellation request is made within 24 hours of purchase, we may review the request at our sole discretion.`,
  },
  {
    title: "Monthly Subscription Fees",
    content: `Monthly subscriptions are billed in advance and grant access to the AI Agent infrastructure, maintenance, and management services. You may cancel at any time before the next billing cycle to prevent future charges. However, we do not provide refunds for partially used billing periods, we do not prorate unused time, and no refunds will be issued for failure to cancel prior to renewal. Once a billing cycle begins, that month is considered delivered.`,
  },
  {
    title: "AI Token Usage (Usage-Based Billing)",
    content: `AI processing requires token consumption through third-party model providers. Unless explicitly stated otherwise in writing: token usage is billed separately from the base subscription, token charges are usage-dependent and calculated based on actual consumption, usage is measured automatically by system logs, and charges are invoiced at the end of each billing cycle. Token usage fees are non-refundable once consumed. Clients are responsible for monitoring their usage and understanding that higher conversation volume, longer responses, file processing, and advanced reasoning increase token consumption. We reserve the right to apply usage caps if necessary, require a minimum balance, or suspend service for unpaid usage charges.`,
  },
  {
    title: "Performance & Results Disclaimer",
    content: `We do not guarantee revenue outcomes, lead generation volume, conversion rates, business growth, or financial results. AI Agents are operational tools whose effectiveness depends on market conditions, offer strength, implementation quality, and user strategy. Results will vary.`,
  },
  {
    title: "Technical Issues",
    content: `If a verified technical fault directly caused by our system prevents the AI Agent from operating for more than 72 consecutive hours, we will repair the issue promptly and extend subscription time proportionally if appropriate. Refunds will not be issued for temporary outages, third-party API disruptions, hosting provider downtime, user misconfiguration, or external platform limitations.`,
  },
  {
    title: "Chargebacks & Payment Disputes",
    content: `By purchasing our services, you agree to contact support before initiating a chargeback or payment dispute. Disputes for delivered digital services will be formally contested using service access logs, usage records, IP data, communication history, and agreement confirmation. Access may be suspended immediately upon dispute initiation.`,
  },
  {
    title: "Exceptional Circumstances",
    content: `Refund requests outside the scope of this policy may be reviewed at our sole discretion but are not guaranteed. All decisions are final.`,
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
