import { useMemo, useRef, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  Home,
  LayoutDashboard,
  Briefcase,
  Users,
  MessageSquare,
  Megaphone,
  TrendingUp,
  BarChart,
  FolderOpen,
  FolderKanban,
  CheckSquare,
  CreditCard,
  Lightbulb,
  LifeBuoy,
  UserPlus,
  ChevronDown,
  LogOut,
  Settings,
} from "lucide-react";
import PropTypes from "prop-types";
import { appLogo } from "../assets";
import { logout } from "../redux/authSlice";
import { signUpLogout } from "../redux/signUpSlice";

const NAV_ITEMS = [
  { icon: Home, label: "Home", path: "/home" },
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Briefcase, label: "New Projects", path: "/new-projects" },
  { icon: Users, label: "Customers", path: "/customers" },
  { icon: MessageSquare, label: "Conversations", path: "/conversations" },
  { icon: Megaphone, label: "Campaigns", path: "/campaigns" },
  { icon: TrendingUp, label: "Conversions", path: "/conversions" },
  { icon: BarChart, label: "Reporting", path: "/reporting" },
  { icon: FolderOpen, label: "My Files", path: "/my-files" },
  { icon: FolderKanban, label: "My Projects", path: "/my-projects" },
  { icon: CheckSquare, label: "My Tasks", path: "/my-tasks" },
  { icon: CreditCard, label: "Billing", path: "/billing" },
  { icon: Lightbulb, label: "Get Inspired", path: "/get-inspired" },
];

const SUPPORT_ITEMS = [
  { icon: LifeBuoy, label: "Live customer support", path: "/support" },
  { icon: UserPlus, label: "Invite team members", path: "/invite-team" },
];

function NavButton({ icon: Icon, label, path, badge, onClick, isActive }) {
  return (
    <button
      type="button"
      onClick={() => onClick(path)}
      className={`portal-nav-item ${isActive ? "is-active" : ""}`}
    >
      <Icon className="portal-nav-icon" />
      <span className="portal-nav-label">{label}</span>
      {badge ? (
        <span className={`portal-nav-badge badge-${badge.tone}`}>{badge.text}</span>
      ) : null}
    </button>
  );
}

NavButton.propTypes = {
  icon: PropTypes.elementType.isRequired,
  label: PropTypes.string.isRequired,
  path: PropTypes.string.isRequired,
  badge: PropTypes.shape({ text: PropTypes.string, tone: PropTypes.string }),
  onClick: PropTypes.func.isRequired,
  isActive: PropTypes.bool,
};

NavButton.defaultProps = { badge: null, isActive: false };

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const userName = localStorage.getItem("user_name") || "Andrey Vasilyev";
  const userRole = "Admin";
  const initials = useMemo(() => {
    const parts = userName.trim().split(/\s+/).slice(0, 2);
    return parts.map((p) => p[0]?.toUpperCase() || "").join("") || "A";
  }, [userName]);

  useEffect(() => {
    function handleClick(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleNavigate = (path) => navigate(path);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(signUpLogout());
    localStorage.clear();
    navigate("/login");
  };

  return (
    <aside className="portal-sidebar">
      <div className="portal-sidebar-logo">
        <img src={appLogo} alt="Art of Galaxy" />
      </div>

      <div className="portal-user-card" ref={menuRef} onClick={() => setMenuOpen((o) => !o)}>
        <div className="portal-user-avatar">{initials}</div>
        <div className="portal-user-info">
          <span className="portal-user-name">{userName}</span>
          <span className="portal-user-role">{userRole}</span>
        </div>
        <ChevronDown size={16} className="portal-user-caret" />
        {menuOpen ? (
          <div
            style={{
              position: "absolute",
              top: 58,
              left: 12,
              right: 12,
              background: "var(--portal-card-bg)",
              border: "1px solid var(--portal-border)",
              borderRadius: 10,
              boxShadow: "var(--portal-shadow-md)",
              padding: 6,
              zIndex: 20,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="portal-nav-item"
              onClick={() => {
                setMenuOpen(false);
                navigate("/profile");
              }}
            >
              <Settings className="portal-nav-icon" />
              <span className="portal-nav-label">Profile settings</span>
            </button>
            <button
              type="button"
              className="portal-nav-item"
              onClick={() => {
                setMenuOpen(false);
                handleLogout();
              }}
              style={{ color: "var(--portal-danger)" }}
            >
              <LogOut className="portal-nav-icon" />
              <span className="portal-nav-label">Logout</span>
            </button>
          </div>
        ) : null}
      </div>

      <nav className="portal-nav">
        {NAV_ITEMS.map((item) => (
          <NavButton
            key={item.path}
            icon={item.icon}
            label={item.label}
            path={item.path}
            badge={item.badge}
            onClick={handleNavigate}
            isActive={location.pathname.startsWith(item.path)}
          />
        ))}
      </nav>

      <div className="portal-sidebar-section-title">Need support?</div>
      <nav className="portal-nav">
        {SUPPORT_ITEMS.map((item) => (
          <NavButton
            key={item.path}
            icon={item.icon}
            label={item.label}
            path={item.path}
            onClick={handleNavigate}
            isActive={location.pathname.startsWith(item.path)}
          />
        ))}
      </nav>
    </aside>
  );
}
