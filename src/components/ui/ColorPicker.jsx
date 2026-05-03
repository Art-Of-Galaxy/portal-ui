import { useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import { X } from "lucide-react";

// Convert HSV (0-360, 0-1, 0-1) -> hex "#RRGGBB"
function hsvToHex(h, s, v) {
  const c = v * s;
  const hh = (h % 360) / 60;
  const x = c * (1 - Math.abs((hh % 2) - 1));
  let r = 0;
  let g = 0;
  let b = 0;
  if (hh >= 0 && hh < 1) [r, g, b] = [c, x, 0];
  else if (hh < 2) [r, g, b] = [x, c, 0];
  else if (hh < 3) [r, g, b] = [0, c, x];
  else if (hh < 4) [r, g, b] = [0, x, c];
  else if (hh < 5) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const m = v - c;
  const to = (n) => {
    const v8 = Math.round((n + m) * 255);
    return v8.toString(16).padStart(2, "0").toUpperCase();
  };
  return `#${to(r)}${to(g)}${to(b)}`;
}

function hexToHsv(hex) {
  const m = String(hex || "")
    .trim()
    .replace(/^#/, "")
    .match(/^([0-9a-fA-F]{6})$/);
  if (!m) return { h: 220, s: 0.85, v: 0.65 };
  const num = parseInt(m[1], 16);
  const r = ((num >> 16) & 255) / 255;
  const g = ((num >> 8) & 255) / 255;
  const b = (num & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  const s = max === 0 ? 0 : d / max;
  const v = max;
  return { h, s, v };
}

function isValidHex(value) {
  return /^#?[0-9a-fA-F]{6}$/.test(String(value || "").trim());
}

function normalizeHex(value) {
  const v = String(value || "").trim();
  if (!v) return "";
  return v.startsWith("#") ? v.toUpperCase() : `#${v.toUpperCase()}`;
}

/**
 * Reusable HSV color picker.
 *
 * Props:
 * - value: current array of saved hex strings (length = slotCount, "" for empty)
 * - onChange(nextValue): called with the new array
 * - slotCount: how many saved-color slots to render (default 4)
 * - max: max number of saved colors (default = slotCount)
 */
export default function ColorPicker({ value, onChange, slotCount, max }) {
  const slots = slotCount || 4;
  const cap = max || slots;
  const safeValue = useMemo(() => {
    const arr = Array.isArray(value) ? value.slice(0, slots) : [];
    while (arr.length < slots) arr.push("");
    return arr;
  }, [value, slots]);

  const [hue, setHue] = useState(220);
  const [sat, setSat] = useState(0.85);
  const [val, setVal] = useState(0.65);
  const [hexDraft, setHexDraft] = useState(hsvToHex(220, 0.85, 0.65).slice(1));

  const padRef = useRef(null);
  const hueRef = useRef(null);
  const draggingPad = useRef(false);
  const draggingHue = useRef(false);

  const currentHex = useMemo(() => hsvToHex(hue, sat, val), [hue, sat, val]);

  useEffect(() => {
    setHexDraft(currentHex.slice(1));
  }, [currentHex]);

  useEffect(() => {
    function up() {
      draggingPad.current = false;
      draggingHue.current = false;
    }
    function move(e) {
      if (draggingPad.current && padRef.current) {
        const r = padRef.current.getBoundingClientRect();
        const x = Math.min(Math.max(e.clientX - r.left, 0), r.width);
        const y = Math.min(Math.max(e.clientY - r.top, 0), r.height);
        setSat(x / r.width);
        setVal(1 - y / r.height);
      }
      if (draggingHue.current && hueRef.current) {
        const r = hueRef.current.getBoundingClientRect();
        const y = Math.min(Math.max(e.clientY - r.top, 0), r.height);
        setHue((y / r.height) * 360);
      }
    }
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
  }, []);

  const padPointerStyle = useMemo(
    () => ({
      left: `${sat * 100}%`,
      top: `${(1 - val) * 100}%`,
    }),
    [sat, val]
  );

  const handlePadDown = (e) => {
    draggingPad.current = true;
    if (padRef.current) {
      const r = padRef.current.getBoundingClientRect();
      const x = Math.min(Math.max(e.clientX - r.left, 0), r.width);
      const y = Math.min(Math.max(e.clientY - r.top, 0), r.height);
      setSat(x / r.width);
      setVal(1 - y / r.height);
    }
  };

  const handleHueDown = (e) => {
    draggingHue.current = true;
    if (hueRef.current) {
      const r = hueRef.current.getBoundingClientRect();
      const y = Math.min(Math.max(e.clientY - r.top, 0), r.height);
      setHue((y / r.height) * 360);
    }
  };

  const handleHexChange = (e) => {
    const next = e.target.value.replace(/^#/, "").slice(0, 6);
    setHexDraft(next);
    if (isValidHex(next)) {
      const { h, s, v } = hexToHsv(next);
      setHue(h);
      setSat(s);
      setVal(v);
    }
  };

  const handleSave = () => {
    const hex = normalizeHex(currentHex);
    if (!hex) return;
    const next = [...safeValue];
    const empty = next.indexOf("");
    if (empty === -1) {
      const filled = next.filter(Boolean).length;
      if (filled >= cap) return;
      return;
    }
    if (next.includes(hex)) return;
    next[empty] = hex;
    onChange(next);
  };

  const handleRemove = (idx) => {
    const next = [...safeValue];
    next.splice(idx, 1);
    next.push("");
    onChange(next);
  };

  return (
    <div className="color-picker">
      <div className="color-picker-stage">
        <div
          ref={padRef}
          className="color-picker-pad"
          onMouseDown={handlePadDown}
          style={{ background: `hsl(${hue} 100% 50%)` }}
        >
          <div className="color-picker-pad-sat" />
          <div className="color-picker-pad-val" />
          <span className="color-picker-pad-pointer" style={padPointerStyle} />
        </div>

        <div
          ref={hueRef}
          className="color-picker-hue"
          onMouseDown={handleHueDown}
        >
          <span
            className="color-picker-hue-pointer"
            style={{ top: `${(hue / 360) * 100}%` }}
          />
        </div>

        <div className="color-picker-side">
          <div className="color-picker-hex-row">
            <span
              className="color-picker-hex-swatch"
              style={{ background: currentHex }}
            />
            <span className="color-picker-hex-hash">#</span>
            <input
              className="color-picker-hex-input"
              value={hexDraft}
              onChange={handleHexChange}
              maxLength={6}
              spellCheck={false}
            />
          </div>
          <button type="button" className="color-picker-save" onClick={handleSave}>
            Save Color
          </button>

          <div className="color-picker-divider" />

          <div className="color-picker-saved">
            {safeValue.map((hex, i) => (
              <div key={i} className="color-picker-saved-slot">
                <span
                  className="color-picker-saved-swatch"
                  style={{ background: hex || "transparent" }}
                >
                  {hex ? (
                    <button
                      type="button"
                      className="color-picker-saved-remove"
                      onClick={() => handleRemove(i)}
                      aria-label="Remove color"
                    >
                      <X size={10} />
                    </button>
                  ) : null}
                </span>
                <span className="color-picker-saved-hex">
                  {hex || "#______"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

ColorPicker.propTypes = {
  value: PropTypes.arrayOf(PropTypes.string),
  onChange: PropTypes.func.isRequired,
  slotCount: PropTypes.number,
  max: PropTypes.number,
};

ColorPicker.defaultProps = {
  value: [],
  slotCount: 4,
  max: 4,
};
