import helixLogo from "@/assets/helix-logo.png";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center px-6 py-4">
      <a href="/" className="flex items-center gap-2">
        <img
          src={helixLogo}
          alt="Helix Solutions logo"
          className="h-8 w-8 opacity-80 brightness-90 invert"
        />
        <span className="text-sm font-semibold tracking-wide text-foreground/80">
          Helix Solutions
        </span>
      </a>
    </header>
  );
};

export default Header;
