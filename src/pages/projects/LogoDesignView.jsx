import { useState } from "react";
import PropTypes from "prop-types";
import { AlertTriangle, Download, ExternalLink, ImageOff } from "lucide-react";

function inferExtension(url, contentType) {
  if (contentType && contentType.includes("/")) {
    const ext = contentType.split("/")[1].split(";")[0].trim();
    if (ext) return ext === "jpeg" ? "jpg" : ext;
  }
  try {
    const path = new URL(url).pathname;
    const m = path.match(/\.([a-zA-Z0-9]{3,4})$/);
    if (m) return m[1].toLowerCase();
  } catch {
    /* ignore */
  }
  return "png";
}

async function downloadFromUrl(url, filename) {
  const response = await fetch(url, { mode: "cors" });
  if (!response.ok) throw new Error(`Fetch failed (${response.status})`);
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(objectUrl), 2000);
}

function isUsable(img) {
  return Boolean(img && typeof img.url === "string" && /^https?:\/\//i.test(img.url));
}

export default function LogoDesignView({ images, prompt, brandName, model, seed, errors, requested }) {
  const usable = (Array.isArray(images) ? images : []).filter(isUsable);
  const [downloadingIndex, setDownloadingIndex] = useState(-1);
  const [downloadError, setDownloadError] = useState("");
  const [brokenIndices, setBrokenIndices] = useState(() => new Set());

  const handleDownload = async (img, index) => {
    setDownloadError("");
    setDownloadingIndex(index);
    try {
      const ext = inferExtension(img.url, img.content_type);
      const safeBrand = (brandName || "logo").replace(/[^a-z0-9-]+/gi, "-").toLowerCase();
      await downloadFromUrl(img.url, `${safeBrand}-concept-${index + 1}.${ext}`);
    } catch (err) {
      setDownloadError(err?.message || "Download failed. Right-click the image to save.");
    } finally {
      setDownloadingIndex(-1);
    }
  };

  const markBroken = (index) => {
    setBrokenIndices((prev) => {
      if (prev.has(index)) return prev;
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  };

  if (!usable.length) {
    return (
      <div className="portal-card">
        <p className="portal-card-copy">
          No logo images were returned. The model may have rejected the prompt or rate-limited the
          request — try again with a slightly different description.
        </p>
        {Array.isArray(errors) && errors.length ? (
          <ul className="portal-card-copy" style={{ marginTop: 8 }}>
            {errors.map((e, i) => <li key={i}>{e}</li>)}
          </ul>
        ) : null}
      </div>
    );
  }

  const partial = typeof requested === "number" && requested > usable.length;

  return (
    <div className="bg-view">
      <div className="bg-view-hero">
        <div className="bg-view-hero-tag">Logo concepts</div>
        <h2>{brandName || "Logo Design"}</h2>
        <p>
          {usable.length} concept{usable.length === 1 ? "" : "s"} generated. Pick a favorite to
          refine with your AOG strategist.
        </p>
      </div>

      {partial || (Array.isArray(errors) && errors.length) ? (
        <div
          style={{
            background: "rgba(229, 159, 0, 0.12)",
            border: "1px solid rgba(229, 159, 0, 0.35)",
            color: "var(--portal-text)",
            padding: "0.6rem 0.9rem",
            borderRadius: 8,
            margin: "0 0 0.8rem",
            fontSize: 12,
            display: "flex",
            alignItems: "flex-start",
            gap: 8,
          }}
        >
          <AlertTriangle size={14} style={{ marginTop: 2, flexShrink: 0 }} />
          <span>
            {partial
              ? `${usable.length} of ${requested} variants returned — the model may have rate-limited or filtered the rest.`
              : "Some variants failed to generate."}
            {Array.isArray(errors) && errors.length ? ` (${errors[0]})` : null}
          </span>
        </div>
      ) : null}

      {downloadError ? (
        <div
          style={{
            background: "rgba(232,77,77,0.1)",
            border: "1px solid rgba(232,77,77,0.3)",
            color: "var(--portal-danger)",
            padding: "0.6rem 0.9rem",
            borderRadius: 8,
            margin: "0 0 0.8rem",
            fontSize: 12,
          }}
        >
          {downloadError}
        </div>
      ) : null}

      <div className="logo-result-grid">
        {usable.map((img, i) => {
          const broken = brokenIndices.has(i);
          return (
            <figure key={img.url || i} className="logo-result-card">
              <div className="logo-result-image">
                {broken ? (
                  <div className="logo-result-broken">
                    <ImageOff size={28} />
                    <span>Image unavailable</span>
                  </div>
                ) : (
                  <img
                    src={img.url}
                    alt={`Logo concept ${i + 1}`}
                    loading="lazy"
                    onError={() => markBroken(i)}
                  />
                )}
              </div>
              <figcaption className="logo-result-caption">
                <span>Concept {i + 1}</span>
                <span className="logo-result-actions">
                  <a
                    href={img.url}
                    target="_blank"
                    rel="noreferrer"
                    className="logo-result-link"
                    aria-label={`Open concept ${i + 1} in a new tab`}
                  >
                    <ExternalLink size={14} />
                  </a>
                  <button
                    type="button"
                    className="logo-result-link"
                    onClick={() => handleDownload(img, i)}
                    disabled={downloadingIndex === i || broken}
                    aria-label={`Download concept ${i + 1}`}
                  >
                    <Download size={14} />
                  </button>
                </span>
              </figcaption>
            </figure>
          );
        })}
      </div>

      {prompt ? (
        <details className="logo-result-prompt">
          <summary>View the prompt sent to the model</summary>
          <pre>{prompt}</pre>
        </details>
      ) : null}

      {model || seed != null ? (
        <p className="bg-view-meta">
          Generated with <strong>{model}</strong>
          {seed != null ? <> · seed {seed}</> : null}
        </p>
      ) : null}
    </div>
  );
}

LogoDesignView.propTypes = {
  images: PropTypes.arrayOf(
    PropTypes.shape({
      url: PropTypes.string.isRequired,
      width: PropTypes.number,
      height: PropTypes.number,
    })
  ),
  prompt: PropTypes.string,
  brandName: PropTypes.string,
  model: PropTypes.string,
  seed: PropTypes.number,
  errors: PropTypes.arrayOf(PropTypes.string),
  requested: PropTypes.number,
};

LogoDesignView.defaultProps = {
  images: [],
  prompt: "",
  brandName: "",
  model: "",
  seed: null,
  errors: undefined,
  requested: undefined,
};
