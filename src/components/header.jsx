import { useMemo } from "react";
import {
  Search,
  Compass,
  CalendarClock,
  Briefcase,
  ListChecks,
  Bell,
  Moon,
  Sun,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const userName = localStorage.getItem("user_name") || "Andrey";
  const initial = useMemo(() => (userName[0] || "A").toUpperCase(), [userName]);

  return (
    <header className="portal-header">
      <div className="portal-search">
        <Search size={16} className="portal-search-icon" />
        <input type="text" placeholder="Search" aria-label="Search" />
      </div>

      <div className="portal-header-actions">
        <button type="button" className="portal-icon-btn" aria-label="Explore">
          <Compass size={18} />
        </button>
        <button type="button" className="portal-icon-btn" aria-label="Calendar">
          <CalendarClock size={18} />
        </button>
        <button type="button" className="portal-icon-btn" aria-label="Projects">
          <Briefcase size={18} />
        </button>
        <button type="button" className="portal-icon-btn" aria-label="Tasks">
          <ListChecks size={18} />
        </button>

        <span className="portal-header-divider" />

        <button type="button" className="portal-icon-btn is-accent" aria-label="Notifications">
          <Bell size={18} />
        </button>
        <button
          type="button"
          className="portal-icon-btn"
          aria-label="Toggle theme"
          onClick={toggleTheme}
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button type="button" className="portal-icon-btn is-avatar" aria-label="Profile">
          {initial}
        </button>
      </div>
    </header>
  );
}
