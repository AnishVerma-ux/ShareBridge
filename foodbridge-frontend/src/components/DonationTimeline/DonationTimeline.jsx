import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";

const labels = {
  AVAILABLE: "Donation published",
  ACCEPTED: "Accepted by NGO",
  ASSIGNED: "Volunteer assigned",
  PICKED_UP: "Picked up by volunteer",
  DELIVERED: "Delivered",
};

const DonationTimeline = ({ donationId }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    axiosInstance.get(`/donations/${donationId}/history`)
      .then((response) => { if (active) setHistory(Array.isArray(response.data) ? response.data : []); })
      .catch(() => { if (active) setError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [donationId]);

  return (
    <details className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
      <summary className="cursor-pointer text-sm font-semibold text-slate-700">📍 Donation tracking</summary>
      {loading ? <p className="mt-3 text-xs text-slate-500">Loading tracking history…</p>
        : error ? <p className="mt-3 text-xs text-amber-700">Tracking is unavailable for this account or donation. Refresh after the next status update.</p>
          : history.length === 0 ? <p className="mt-3 text-xs text-slate-500">No history has been recorded yet. New status changes will appear here.</p>
            : <ol className="mt-3 space-y-3">
              {history.map((event) => (
                <li key={event.id} className="relative border-l-2 border-emerald-200 pl-4 pb-1 last:border-transparent">
                  <span className="absolute -left-[5px] top-1 h-2 w-2 rounded-full bg-emerald-600" />
                  <p className="text-sm font-semibold text-slate-800">{labels[event.status] || event.status}</p>
                  <p className="text-xs text-slate-600">{event.note}</p>
                  <p className="mt-1 text-xs text-slate-400">{event.changedByName || "System"} · {event.changedAt ? new Date(event.changedAt).toLocaleString() : "Time unavailable"}</p>
                </li>
              ))}
            </ol>}
    </details>
  );
};

export default DonationTimeline;
