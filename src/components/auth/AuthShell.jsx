import { useState } from "react";
import PropTypes from "prop-types";
import { Globe, Moon, Sun } from "lucide-react";
import { authAppearance } from "../../config/authAppearance";

function IconSlot({ src, alt, className, children }) {
  if (src) {
    return <img src={src} alt={alt} className={className} />;
  }
  return children;
}

IconSlot.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string.isRequired,
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};

IconSlot.defaultProps = {
  src: "",
  className: "",
};

export default function AuthShell({ children }) {
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
    <div className={`auth-shell ${theme === "dark" ? "auth-theme-dark" : "auth-theme-light"}`}>
      <section className="auth-panel">
        <header className="auth-toolbar">
          <button type="button" className="auth-language" aria-label="Language selector">
            <IconSlot
              src={authAppearance.icons.language}
              alt="Language icon"
              className="auth-toolbar-icon"
            >
              <Globe size={18} />
            </IconSlot>
            <span>{authAppearance.languageLabel}</span>
          </button>

          <button
            type="button"
            className="auth-theme-toggle"
            aria-label="Toggle theme"
            onClick={toggleTheme}
          >
            {theme === "dark" ? (
              <IconSlot
                src={authAppearance.icons.sun}
                alt="Sun icon"
                className="auth-toolbar-icon"
              >
                <Sun size={16} />
              </IconSlot>
            ) : (
              <IconSlot
                src={authAppearance.icons.moon}
                alt="Moon icon"
                className="auth-toolbar-icon"
              >
                <Moon size={16} />
              </IconSlot>
            )}
          </button>
        </header>

        <main className="auth-content">{children}</main>

        <footer className="auth-footer">
          {authAppearance.logoSrc ? (
            <img
              src={authAppearance.logoSrc}
              alt={authAppearance.brandName}
              className="auth-brand-logo"
            />
          ) : (
            <p className="auth-brand-name">{authAppearance.brandName}</p>
          )}
          <p className="auth-copyright">{authAppearance.copyrightText}</p>
        </footer>
      </section>

      <aside className="auth-right-pane" aria-hidden="true">
        {authAppearance.rightImage?.src ? (
          <img
            src={authAppearance.rightImage.src}
            alt={authAppearance.rightImage.alt || "Authentication visual"}
            className="auth-right-image"
            loading="lazy"
          />
        ) : (
          <div className="auth-right-placeholder">
            Add your PNG path in `authAppearance.rightImage.src`
          </div>
        )}
      </aside>
    </div>
  );
}

AuthShell.propTypes = {
  children: PropTypes.node.isRequired,
};
