import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Zap, Loader2 } from "lucide-react";
import { apiServices } from "../services/apiServices";

// Small credits + tokens chip rendered in the header. Polls the
// /api/usage/summary endpoint and re-fetches when the route changes so
// the counter feels live after a generation.

function formatCredits(n) {
  const v = Number(n) || 0;
  if (v >= 1000) return `${(v / 1000).toFixed(1)}k`;
  return v % 1 === 0 ? String(v) : v.toFixed(1);
}

function formatTokens(n) {
  const v = Number(n) || 0;
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}k`;
  return String(v);
}

export default function CreditsBadge() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await apiServices.usage_summary({ sinceDays: 30 });
        if (cancelled) return;
        if (res?.success) setSummary(res.summary);
      } catch {
        /* silent */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [location.pathname]);

  return (
    <div className="credits-badge-wrap">
      <button
        type="button"
        className="credits-badge"
        onClick={() => setOpen((v) => !v)}
        title="Usage in the last 30 days"
      >
        {loading ? <Loader2 size={12} className="strategist-spin" /> : <Zap size={12} />}
        <span>
          {summary ? formatCredits(summary.total_credits) : "0"}<small>cr</small>
        </span>
      </button>

      {open && summary ? (
        <div className="credits-popover" onClick={(e) => e.stopPropagation()}>
          <div className="credits-popover-header">
            <strong>Last {summary.since_days} days</strong>
            <span>{summary.total_events} event{summary.total_events === 1 ? "" : "s"}</span>
          </div>
          <ul className="credits-popover-list">
            <li>
              <span>Total credits</span>
              <strong>{formatCredits(summary.total_credits)}</strong>
            </li>
            <li>
              <span>LLM tokens (in / out)</span>
              <strong>
                {formatTokens(summary.total_input_tokens)} / {formatTokens(summary.total_output_tokens)}
              </strong>
            </li>
            <li>
              <span>Images generated</span>
              <strong>{summary.total_units}</strong>
            </li>
          </ul>
          {(summary.by_kind || []).length ? (
            <>
              <hr />
              <div className="credits-popover-bykind">
                {summary.by_kind.map((row) => (
                  <div key={row.kind}>
                    <span>{row.kind}</span>
                    <strong>{formatCredits(row.credits)} cr</strong>
                  </div>
                ))}
              </div>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
