import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import { toast } from "react-toastify";
import { categoryLabels, categoryIcons, getDonationTitle } from "../../data/donationCategories";
import DonationTimeline from "../../components/DonationTimeline/DonationTimeline";

const VolunteerDashboard = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => { fetchDonations(); }, []);

  const fetchDonations = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/donations/accepted");
      setDonations(Array.isArray(response.data?.content) ? response.data.content : []);
    } catch (error) {
      const data = error.response?.data;
      toast.error(typeof data === "string" ? data : "Failed to load volunteer assignments. Please log in as a volunteer.");
    } finally { setLoading(false); }
  };

  const updateDonation = async (id, action) => {
    setUpdatingId(id);
    try {
      await axiosInstance.put(`/donations/${id}/${action}`);
      toast.success(action === "assign" ? "Donation assigned to you." : action === "pickup" ? "Pickup recorded." : "Delivery recorded.");
      await fetchDonations();
    } catch (error) {
      const data = error.response?.data;
      toast.error(typeof data === "string" ? data : "Could not update this donation. It may be expired or assigned to another volunteer.");
    } finally { setUpdatingId(null); }
  };

  const statusStyles = {
    ACCEPTED: "bg-amber-100 text-amber-800",
    ASSIGNED: "bg-violet-100 text-violet-800",
    PICKED_UP: "bg-sky-100 text-sky-800",
    DELIVERED: "bg-emerald-100 text-emerald-800",
  };

  return (
    <main className="min-h-screen bg-[#f7f9f7] px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 rounded-3xl bg-[#174b3e] px-6 py-8 text-white sm:px-9 sm:py-10">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-lime-200">Volunteer workspace</p>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">Every pickup makes a difference.</h1>
          <p className="mt-3 max-w-2xl leading-7 text-emerald-50/80">Claim an available assignment, record pickup, then confirm delivery. Only the assigned volunteer can move that donation forward.</p>
        </header>

        <div className="mb-6 flex flex-wrap items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-slate-600">Showing <span className="font-semibold text-slate-800">{donations.length}</span> available assignments and your active/completed work</p>
          <button type="button" onClick={fetchDonations} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold hover:bg-slate-50">Refresh</button>
        </div>

        {loading ? <div className="rounded-xl bg-white p-12 text-center text-slate-500">Loading assignments…</div>
          : donations.length === 0 ? <div className="rounded-xl border border-gray-100 bg-white p-12 text-center"><p className="mb-3 text-4xl">📭</p><p className="text-lg text-slate-600">No assignments available</p><p className="mt-1 text-sm text-slate-400">Check back when an NGO accepts a donation.</p></div>
            : <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {donations.map((donation) => (
                <article key={donation.id} className="flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-md transition-shadow hover:shadow-lg">
                  {donation.imageUrl ? <img src={`http://localhost:8080/uploads/${donation.imageUrl}`} alt={getDonationTitle(donation)} loading="lazy" className="h-44 w-full object-cover" /> : <div className="flex h-28 items-center justify-center bg-emerald-50 text-5xl">{categoryIcons[donation.category] || "📦"}</div>}
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-start justify-between gap-2"><h2 className="text-xl font-semibold text-slate-800">{getDonationTitle(donation)}</h2><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[donation.status] || "bg-slate-100 text-slate-700"}`}>{(donation.status || "ACCEPTED").replaceAll("_", " ")}</span></div>
                    <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-emerald-700">{categoryLabels[donation.category] || donation.category || "Donation"}</p>
                    {donation.description && <p className="mt-2 text-sm leading-6 text-slate-500">{donation.description}</p>}
                    <div className="mt-3 space-y-2 text-sm text-slate-600"><p><strong>Quantity:</strong> {donation.quantity} units</p><p><strong>Pickup:</strong> {donation.pickupAddress}</p>{donation.ngo?.organizationName && <p><strong>NGO:</strong> {donation.ngo.organizationName}</p>}{donation.category === "FOOD" && <p className="text-orange-700"><strong>Expiry:</strong> {donation.expiryTime ? new Date(donation.expiryTime).toLocaleString() : "Missing expiry"}</p>}</div>
                    <div className="mt-4 border-t border-slate-100 pt-4">
                      {donation.status === "ACCEPTED" && <button type="button" onClick={() => updateDonation(donation.id, "assign")} disabled={updatingId === donation.id} className="w-full rounded-xl bg-[#174b3e] py-3 font-semibold text-white hover:bg-[#103c32] disabled:opacity-60">{updatingId === donation.id ? "Assigning…" : "Take assignment"}</button>}
                      {donation.status === "ASSIGNED" && <button type="button" onClick={() => updateDonation(donation.id, "pickup")} disabled={updatingId === donation.id} className="w-full rounded-xl bg-[#174b3e] py-3 font-semibold text-white hover:bg-[#103c32] disabled:opacity-60">{updatingId === donation.id ? "Updating…" : "Confirm pickup"}</button>}
                      {donation.status === "PICKED_UP" && <button type="button" onClick={() => updateDonation(donation.id, "deliver")} disabled={updatingId === donation.id} className="w-full rounded-xl bg-[#174b3e] py-3 font-semibold text-white hover:bg-[#103c32] disabled:opacity-60">{updatingId === donation.id ? "Updating…" : "Confirm delivery"}</button>}
                      {donation.status === "DELIVERED" && <p className="text-center text-sm font-semibold text-emerald-700">✓ Delivered — tracking complete</p>}
                      {donation.status !== "ACCEPTED" && <DonationTimeline donationId={donation.id} />}
                    </div>
                  </div>
                </article>
              ))}
            </div>}
      </div>
    </main>
  );
};

export default VolunteerDashboard;
