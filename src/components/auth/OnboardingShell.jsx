import { useState } from "react";
import PropTypes from "prop-types";
import { Globe, Home, Moon, Sun } from "lucide-react";
import { Link } from "react-router-dom";
import { authAppearance } from "../../config/authAppearance";

function OnboardingShell({
  children,
  showHomeLink,
  showLanguage,
  homePath,
  homeLabel,
  showTopLogo,
  backgroundImageSrc,
  backgroundImageAlt,
}) {
  const [theme, setTheme] = useState(() => {
    const storedTheme = localStorage.getItem("aog-auth-theme");
    return storedTheme === "light" ? "light" : "dark";
  });

  const toggleTheme = () => {
    setTheme((previousTheme) => {
      const nextTheme = previousTheme === "dark" ? "light" : "dark";
      localStorage.setItem("aog-auth-theme", nextTheme);
      return nextTheme;
    });
  };

  return (
    <div className={`onboarding-shell ${theme === "dark" ? "auth-theme-dark" : "auth-theme-light"}`}>
      {backgroundImageSrc ? (
        <img
          src={backgroundImageSrc}
          alt={backgroundImageAlt}
          className="onboarding-bg onboarding-bg-full"
          loading="lazy"
          aria-hidden="true"
        />
      ) : null}

      {!backgroundImageSrc && authAppearance.rightImage?.src ? (
        <>
          <img
            src={authAppearance.rightImage.src}
            alt=""
            className="onboarding-bg onboarding-bg-left"
            loading="lazy"
            aria-hidden="true"
          />
          <img
            src={authAppearance.rightImage.src}
            alt=""
            className="onboarding-bg onboarding-bg-right"
            loading="lazy"
            aria-hidden="true"
          />
        </>
      ) : null}

      <div className="onboarding-fade" aria-hidden="true" />

      <header className="onboarding-toolbar">
        {showHomeLink ? (
          <Link to={homePath} className="onboarding-home-link">
            <Home size={15} />
            <span>{homeLabel}</span>
          </Link>
        ) : null}

        {showLanguage ? (
          <button type="button" className="onboarding-language" aria-label="Language selector">
            <Globe size={16} />
            <span>{authAppearance.languageLabel}</span>
          </button>
        ) : null}

        {(showHomeLink || showLanguage) ? <span className="onboarding-toolbar-divider" aria-hidden="true" /> : null}

        <button
          type="button"
          className="onboarding-theme-toggle"
          aria-label="Toggle theme"
          onClick={toggleTheme}
        >
          {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
        </button>
      </header>

      {showTopLogo && authAppearance.logoSrc ? (
        <img src={authAppearance.logoSrc} alt={authAppearance.brandName} className="onboarding-top-logo" />
      ) : null}

      <main className="onboarding-main">{children}</main>

      <footer className="onboarding-footer">
        <p>{authAppearance.copyrightText}</p>
      </footer>
    </div>
  );
}

OnboardingShell.propTypes = {
  children: PropTypes.node.isRequired,
  showHomeLink: PropTypes.bool,
  showLanguage: PropTypes.bool,
  homePath: PropTypes.string,
  homeLabel: PropTypes.string,
  showTopLogo: PropTypes.bool,
  backgroundImageSrc: PropTypes.string,
  backgroundImageAlt: PropTypes.string,
};

OnboardingShell.defaultProps = {
  showHomeLink: false,
  showLanguage: true,
  homePath: "/",
  homeLabel: "Home",
  showTopLogo: true,
  backgroundImageSrc: "",
  backgroundImageAlt: "",
};

export default OnboardingShell;
