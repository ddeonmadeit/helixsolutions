import helixLogo from "@/assets/helix-logo.png";

const menuItems = [
  { label: "About", href: "/about" },
  { label: "Testimonials", href: "/testimonials" },
  { label: "Policies", href: "/policies" },
];

const Header = () => {
  return (
    <header className="absolute top-0 left-0 right-0 z-50 px-4 pt-10 sm:px-6 sm:py-6">
      <div className="flex items-center justify-center">
        <div className="flex items-center gap-2 sm:gap-3">
          <a href="/">
            <img
              src={helixLogo}
              alt="Helix Solutions logo"
              className="h-11 w-11 sm:h-14 sm:w-14"
            />
          </a>

          <nav className="flex items-center gap-2 sm:gap-3">
            {menuItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="whitespace-nowrap rounded-full glass px-2.5 py-1 text-[9px] sm:px-4 sm:py-1.5 sm:text-xs font-medium uppercase tracking-wider text-foreground hover:border-primary/30 transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
