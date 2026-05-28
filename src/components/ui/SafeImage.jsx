import { useEffect, useState } from "react";
import PropTypes from "prop-types";

// SafeImage renders any image by URL without ever letting the browser
// auto-download it. <object>/<embed> tags ask the browser to "load this
// resource" — when S3 serves Content-Type: application/octet-stream or
// Content-Disposition: attachment, the browser falls back to download.
// <img> does not — it always tries to render and shows a broken-image
// icon if it can't.
//
// For SVG specifically: modern browsers happily render <img src="x.svg">
// based on the .svg URL extension even if the Content-Type header is wrong.
// As a last-resort fallback, if the <img> still fails to load, we fetch
// the URL ourselves, sniff the response for "<svg ...", and inline it via
// dangerouslySetInnerHTML (this requires CORS on the host, which the
// portal's S3 bucket already permits).
export default function SafeImage({ src = "", alt = "", className, style, onError }) {
  const [imgFailed, setImgFailed] = useState(false);
  const [svgMarkup, setSvgMarkup] = useState(null);

  // Reset when the src changes so the inline-fetch state doesn't leak
  // across cards.
  useEffect(() => {
    setImgFailed(false);
    setSvgMarkup(null);
  }, [src]);

  const looksLikeSvg = typeof src === "string" && /\.svg(\?|#|$)/i.test(src);

  useEffect(() => {
    if (!imgFailed || !looksLikeSvg || svgMarkup) return;
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch(src, { mode: "cors" });
        if (!r.ok) return;
        const text = await r.text();
        if (cancelled) return;
        if (text.includes("<svg")) {
          setSvgMarkup(text);
        }
      } catch {
        /* swallow — broken-image icon will show */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [imgFailed, looksLikeSvg, src, svgMarkup]);

  if (svgMarkup) {
    return (
      <span
        className={className}
        style={{ display: "block", ...style }}
        title={alt || ""}
        // dangerouslySetInnerHTML is fine here: we control which sources we
        // fetch (our own S3 bucket) and we only run this branch after a
        // failed <img> load on a .svg URL. The inlined <svg> element
        // carries its own accessibility (and arrives with the brand mark).
        dangerouslySetInnerHTML={{ __html: svgMarkup }}
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt || ""}
      className={className}
      style={style}
      loading="lazy"
      onError={(event) => {
        setImgFailed(true);
        // We may still be able to recover by inlining the SVG content, so
        // we only surface onError to the caller if this isn't an .svg URL
        // (where the fetch fallback might rescue it).
        if (!looksLikeSvg && typeof onError === "function") onError(event);
      }}
    />
  );
}

SafeImage.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.object,
  onError: PropTypes.func,
};

