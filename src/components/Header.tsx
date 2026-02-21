import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import helixLogo from "@/assets/helix-logo.png";

const menuItems = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Tier 1", href: "/tier1" },
];

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="absolute top-0 left-0 right-0 z-50 px-6 py-6">
      <div className="flex items-center justify-center">
        <motion.div
          className="flex items-center gap-2"
          layout
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        >
          <button onClick={() => setMenuOpen(!menuOpen)} className="focus:outline-none">
            <img
              src={helixLogo}
              alt="Helix Solutions logo"
              className="h-14 w-14 cursor-pointer"
            />
          </button>

          <AnimatePresence>
            {menuOpen && (
              <motion.nav
                className="flex items-center gap-1"
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
                    className="whitespace-nowrap rounded-full glass px-4 py-1.5 text-xs font-medium text-foreground hover:border-primary/30 transition-colors"
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
