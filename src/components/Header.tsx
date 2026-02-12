import helixLogo from "@/assets/helix-logo.png";

const Header = () => {
  return (
    <header className="absolute top-0 left-0 right-0 z-50 flex justify-center px-6 py-6">
      <a href="/">
        <img
          src={helixLogo}
          alt="Helix Solutions logo"
          className="h-18 w-18"
        />
      </a>
    </header>
  );
};

export default Header;
