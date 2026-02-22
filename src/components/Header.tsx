import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import helixLogo from "@/assets/helix-logo.png";

const allNavItems = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Policies", href: "/policies" },
];

const Header = () => {
  const { pathname } = useLocation();

  // Show 3 items: all except the one matching the current page
  const menuItems = allNavItems.filter((item) => item.href !== pathname);

  return (
    <header className="absolute top-0 left-0 right-0 z-50 px-4 pt-10 sm:px-6 sm:py-6">
      <div className="flex items-center justify-center">
        <div className="flex items-center gap-2 sm:gap-3">
          <Link to="/">
            <img
              src={helixLogo}
              alt="Helix Solutions logo"
              className="h-11 w-11 sm:h-14 sm:w-14"
            />
          </Link>

          <nav className="flex items-center gap-2 sm:gap-3">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className="whitespace-nowrap rounded-full glass px-2.5 py-1 text-[9px] sm:px-4 sm:py-1.5 sm:text-xs font-medium uppercase tracking-wider text-foreground hover:border-primary/30 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
