import { useRef, useState } from "react";
import PropTypes from "prop-types";
import { Upload } from "lucide-react";
import { apiServices } from "../../services/apiServices";

/**
 * Multipart upload button. Hands the file to apiServices.upload_file and
 * calls onUploaded with { url, file } once the backend has stored it.
 *
 * Used by all service forms (Brand Guidelines, Rebranding, E-Commerce
 * Mockups, Logo Design) so behavior is consistent.
 */
export default function FileUploadButton({
  category,
  serviceType,
  projectName,
  accept,
  multiple,
  label,
  onUploaded,
  onError,
}) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);

  const openPicker = () => {
    if (busy) return;
    inputRef.current?.click();
  };

  const handleChange = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    event.target.value = "";

    setBusy(true);
    try {
      for (const file of files) {
        const res = await apiServices.upload_file(file, {
          projectName,
          category,
          serviceType,
        });
        if (res?.success && res?.file?.url) {
          onUploaded?.({ url: res.file.url, file: res.file, name: file.name });
        } else {
          throw new Error(res?.message || "Upload failed");
        }
      }
    } catch (err) {
      onError?.(err?.message || "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className="branding-btn-primary"
        style={{ height: 36, minWidth: 0, padding: "0 1.4rem", fontSize: 13 }}
        onClick={openPicker}
        disabled={busy}
      >
        <Upload size={14} style={{ marginRight: 6, verticalAlign: -2 }} />
        {busy ? "Uploading…" : label || "Upload"}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleChange}
        style={{ display: "none" }}
      />
    </>
  );
}

FileUploadButton.propTypes = {
  category: PropTypes.string,
  serviceType: PropTypes.string,
  projectName: PropTypes.string,
  accept: PropTypes.string,
  multiple: PropTypes.bool,
  label: PropTypes.string,
  onUploaded: PropTypes.func,
  onError: PropTypes.func,
};

FileUploadButton.defaultProps = {
  category: null,
  serviceType: null,
  projectName: null,
  accept: undefined,
  multiple: false,
  label: "Upload",
  onUploaded: undefined,
  onError: undefined,
};
