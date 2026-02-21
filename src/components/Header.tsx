import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import helixLogo from "@/assets/helix-logo.png";

const menuItems = [
  { label: "About", href: "/about" },
  { label: "Testimonials", href: "/testimonials" },
  { label: "Policies", href: "/policies" },
];

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="absolute top-0 left-0 right-0 z-50 px-6 py-6">
      <div className="flex items-center justify-center">
        <motion.div
          className="flex items-center gap-1.5 sm:gap-3"
          layout
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        >
          <a href="/">
            <img
              src={helixLogo}
              alt="Helix Solutions logo"
              className="h-10 w-10 sm:h-14 sm:w-14"
            />
          </a>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="relative flex flex-col items-center justify-center gap-[5px] focus:outline-none"
            aria-label="Toggle menu"
          >
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="block bg-foreground rounded-full"
                animate={{
                  width: menuOpen ? 16 : 3,
                  height: menuOpen ? 2 : 3,
                  borderRadius: menuOpen ? 2 : 9999,
                }}
                transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
              />
            ))}
          </button>

          <AnimatePresence>
            {menuOpen && (
              <motion.nav
                className="flex items-center gap-1.5 sm:gap-3"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                style={{ overflow: "hidden" }}
              >
                {menuItems.map((item, i) => (
                  <motion.a
                    key={item.label}
                    href={item.href}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{
                      duration: 0.25,
                      delay: i * 0.06,
                      ease: "easeOut",
                    }}
                    className="whitespace-nowrap rounded-full glass px-2 py-0.5 text-[8px] sm:px-4 sm:py-1.5 sm:text-xs font-medium uppercase tracking-wider text-foreground hover:border-primary/30 transition-colors"
                  >
                    {item.label}
                  </motion.a>
                ))}
              </motion.nav>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </header>
  );
};

export default Header;
