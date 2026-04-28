import PropTypes from "prop-types";
import { Sidebar } from "../../components/Sidebar";
import { Header } from "../../components/header";

export function AuthenticatedLayout({ children }) {
  return (
    <div className="portal-shell">
      <Sidebar />
      <div className="portal-main-area">
        <Header />
        <main className="portal-main-content">{children}</main>
      </div>
    </div>
  );
}

AuthenticatedLayout.propTypes = {
  children: PropTypes.node.isRequired,
};
