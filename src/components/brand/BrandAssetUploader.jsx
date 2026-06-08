import { useRef, useState } from "react";
import PropTypes from "prop-types";
import { Paperclip, X, Image as ImageIcon, FileText, Loader2, AlertTriangle } from "lucide-react";
import { apiServices } from "../../services/apiServices";

// Reusable uploader for brand-asset attachments (product photos, existing
// logos, mood references, prior collateral). Used in both the Brand
// Guidelines quiz and the strategist chat page so the brief and the
// downstream fal.ai image generations can condition on real client
// inputs. Owns its upload state internally; emits the resulting URL
// list back via `onChange`.

function isImageMime(mime, name) {
  if (typeof mime === "string" && mime.startsWith("image/")) return true;
  return /\.(png|jpe?g|webp|gif|bmp|svg|heic)$/i.test(name || "");
}

export default function BrandAssetUploader({
  value = [],
  onChange,
  projectName = "Brand Guidelines Request",
  accept = "image/*,application/pdf",
  label = "Upload brand materials",
  helper = "Product photos, existing logos, mood references, prior brand collateral. Used to ground the guidelines and reference your product in the social media kit.",
}) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFiles(event) {
    const picked = Array.from(event.target.files || []);
    event.target.value = "";
    if (!picked.length) return;
    setUploading(true);
    setError("");
    try {
      const next = [...value];
      for (const file of picked) {
        const res = await apiServices.upload_file(file, {
          projectName,
          category: "Branding & Design",
          serviceType: "brand_guidelines",
        });
        const url = res?.file?.url || res?.url;
        if (!res?.success || !url) {
          throw new Error(res?.message || `Upload failed for ${file.name}`);
        }
        next.push({
          url,
          name: file.name,
          kind: isImageMime(file.type, file.name) ? "image" : "file",
          mime: file.type || "",
        });
      }
      onChange(next);
    } catch (err) {
      setError(err?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function removeAt(idx) {
    const next = value.slice();
    next.splice(idx, 1);
    onChange(next);
  }

  return (
    <div className="brand-asset-uploader">
      {label ? <label className="quiz-label">{label}</label> : null}
      {helper ? <p className="brand-asset-helper">{helper}</p> : null}
      <div className="brand-asset-actions">
        <button
          type="button"
          className="brand-asset-pick"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? <Loader2 size={14} className="bg-spin" /> : <Paperclip size={14} />}
          {uploading ? "Uploading..." : "Choose files"}
        </button>
        <span className="brand-asset-count">
          {value.length ? `${value.length} attached` : "No files yet"}
        </span>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple
        onChange={handleFiles}
        style={{ display: "none" }}
      />
      {error ? (
        <div className="brand-asset-error">
          <AlertTriangle size={13} /> {error}
        </div>
      ) : null}
      {value.length ? (
        <ul className="brand-asset-list">
          {value.map((f, i) => (
            <li key={`${f.url}-${i}`} className="brand-asset-chip">
              {f.kind === "image" ? (
                <span className="brand-asset-thumb">
                  <img src={f.url} alt={f.name} />
                </span>
              ) : (
                <span className="brand-asset-thumb is-file">
                  <FileText size={14} />
                </span>
              )}
              <div className="brand-asset-meta">
                <a href={f.url} target="_blank" rel="noreferrer">{f.name}</a>
                <span className="brand-asset-kind">
                  {f.kind === "image" ? <ImageIcon size={11} /> : <FileText size={11} />}
                  {f.kind === "image" ? "Image" : "File"}
                </span>
              </div>
              <button
                type="button"
                className="brand-asset-remove"
                aria-label={`Remove ${f.name}`}
                onClick={() => removeAt(i)}
              >
                <X size={13} />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

BrandAssetUploader.propTypes = {
  value: PropTypes.arrayOf(
    PropTypes.shape({
      url: PropTypes.string.isRequired,
      name: PropTypes.string,
      kind: PropTypes.oneOf(["image", "file"]),
      mime: PropTypes.string,
    })
  ),
  onChange: PropTypes.func.isRequired,
  projectName: PropTypes.string,
  accept: PropTypes.string,
  label: PropTypes.string,
  helper: PropTypes.string,
};
