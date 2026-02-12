import helixLogo from "@/assets/helix-logo.png";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center px-6 py-4">
      <a href="/">
        <img
          src={helixLogo}
          alt="Helix Solutions logo"
          className="h-8 w-8"
        />
      </a>
    </header>
  );
};

export default Header;
