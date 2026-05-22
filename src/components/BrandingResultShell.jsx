import { useMemo } from "react";
import PropTypes from "prop-types";

// Shared visual shell for the three "AI brief" services
// (Rebranding, Brand Guidelines, E-Commerce Mockups). Renders the
// sticky left sidebar (service / sub-service pills, status, brand
// name, description, tagline) and slots the per-service main content
// on the right.

const STATUS_MAP = {
  done:         { cls: "is-done",     text: "Done" },
  3:            { cls: "is-done",     text: "Done" },
  "in progress":{ cls: "is-progress", text: "In progress" },
  1:            { cls: "is-progress", text: "In progress" },
  pending:      { cls: "is-pending",  text: "Pending" },
  2:            { cls: "is-pending",  text: "Pending" },
};

function resolveStatus(raw) {
  const key = typeof raw === "string" ? raw.toLowerCase() : raw;
  return STATUS_MAP[key] || { cls: "is-progress", text: "In progress" };
}

export default function BrandingResultShell({
  brandName,
  description,
  tagline,
  subServiceLabel,
  status,
  children,
}) {
  const upperBrand = useMemo(
    () => String(brandName || "").trim().toUpperCase(),
    [brandName]
  );
  const resolvedStatus = resolveStatus(status);

  return (
    <div className="logo-result-page">
      <div className="logo-result-layout">
        <aside className="logo-result-side">
          <section className="logo-brand-card">
            <div className="logo-brand-pills">
              <div className="logo-brand-pill-stack">
                <span className="logo-brand-pill is-category">Branding &amp; Design</span>
                <span className="logo-brand-pill is-service">{subServiceLabel}</span>
              </div>
              <span className={`logo-brand-status ${resolvedStatus.cls}`}>
                <span className="dot" /> {resolvedStatus.text}
              </span>
            </div>
            <h2 className="logo-brand-name">{upperBrand || "Brand"}</h2>
            {description ? (
              <p className="logo-brand-subtitle">{description}</p>
            ) : null}
            {tagline ? (
              <>
                <hr className="logo-brand-divider" />
                <p className="logo-brand-tagline">&ldquo;{tagline}&rdquo;</p>
              </>
            ) : null}
          </section>
        </aside>

        <div className="bg-out-main">{children}</div>
      </div>
    </div>
  );
}

BrandingResultShell.propTypes = {
  brandName: PropTypes.string,
  description: PropTypes.string,
  tagline: PropTypes.string,
  subServiceLabel: PropTypes.string.isRequired,
  status: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  children: PropTypes.node.isRequired,
};

BrandingResultShell.defaultProps = {
  brandName: "",
  description: "",
  tagline: "",
  status: "in progress",
};
