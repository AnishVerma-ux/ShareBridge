import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import { toast } from "react-toastify";
import { donationCategories, categoryLabels, categoryIcons, getDonationTitle } from "../../data/donationCategories";
import DonationTimeline from "../../components/DonationTimeline/DonationTimeline";

const NgoDashboard = () => {
  const [donations, setDonations] = useState([]);
  const [myDonations, setMyDonations] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [requestForm, setRequestForm] = useState({ title: "", category: "FOOD", quantity: "1", description: "" });
  const [creatingRequest, setCreatingRequest] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMine, setLoadingMine] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [acceptingId, setAcceptingId] = useState(null);

  useEffect(() => { fetchDonations(); fetchMyDonations(); fetchMyRequests(); }, []);

  const fetchDonations = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/donations/available");
      setDonations(Array.isArray(response.data?.content) ? response.data.content : []);
    } catch (error) {
      const data = error.response?.data;
      toast.error(typeof data === "string" ? data : "Failed to load available donations. Please log in as an NGO.");
    } finally { setLoading(false); }
  };

  const fetchMyDonations = async () => {
    setLoadingMine(true);
    try {
      const response = await axiosInstance.get("/donations/my-donations");
      setMyDonations(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      const data = error.response?.data;
      toast.error(typeof data === "string" ? data : "Failed to load donations accepted by your NGO.");
    } finally { setLoadingMine(false); }
  };


  const fetchMyRequests = async () => {
    try {
      const response = await axiosInstance.get("/donation-requests/mine");
      setMyRequests(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      const data = error.response?.data;
      toast.error(typeof data === "string" ? data : "Could not load your NGO requests.");
    }
  };

  const createRequest = async (event) => {
    event.preventDefault();
    setCreatingRequest(true);
    try {
      await axiosInstance.post("/donation-requests", { ...requestForm, quantity: Number(requestForm.quantity) });
      toast.success("Donation request published.");
      setRequestForm({ title: "", category: "FOOD", quantity: "1", description: "" });
      await fetchMyRequests();
    } catch (error) {
      const data = error.response?.data;
      toast.error(typeof data === "string" ? data : "Could not publish the request.");
    } finally { setCreatingRequest(false); }
  };

  const acceptDonation = async (id) => {
    setAcceptingId(id);
    try {
      await axiosInstance.put(`/donations/${id}/accept`);
      toast.success("Donation accepted by your NGO!");
      await Promise.all([fetchDonations(), fetchMyDonations()]);
    } catch (error) {
      const data = error.response?.data;
      toast.error(typeof data === "string" ? data : "Could not accept this donation. It may have expired or already been accepted.");
    } finally { setAcceptingId(null); }
  };

  const filteredDonations = donations.filter((donation) => {
    const matchesCategory = categoryFilter === "ALL" || donation.category === categoryFilter;
    const searchable = `${getDonationTitle(donation)} ${donation.description || ""} ${donation.pickupAddress || ""}`.toLowerCase();
    return matchesCategory && searchable.includes(search.toLowerCase());
  });

  const DonationCard = ({ donation, accepted = false }) => (
    <article key={donation.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {donation.imageUrl ? <img src={`http://localhost:8080/uploads/${donation.imageUrl}`} alt={getDonationTitle(donation)} className="h-44 w-full object-cover" loading="lazy" /> : <div className="flex h-24 items-center justify-center bg-emerald-50 text-5xl">{categoryIcons[donation.category] || "📦"}</div>}
      <div className="p-5">
        <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">{categoryLabels[donation.category] || donation.category}</p>
        <h3 className="mt-1 text-lg font-semibold text-slate-800">{getDonationTitle(donation)}</h3>
        {donation.description && <p className="mt-2 text-sm leading-6 text-slate-500">{donation.description}</p>}
        <p className="mt-3 text-sm text-slate-600">Quantity: {donation.quantity}</p>
        <p className="mt-1 text-sm text-slate-600">Pickup: {donation.pickupAddress}</p>
        {donation.category === "FOOD" && <p className="mt-1 text-sm text-orange-700">Expiry: {donation.expiryTime ? new Date(donation.expiryTime).toLocaleString() : "Not specified — do not accept"}</p>}
        {accepted ? <>
          <div className="mt-3 inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">{(donation.status || "ACCEPTED").replaceAll("_", " ")}</div>
          <DonationTimeline donationId={donation.id} />
        </> : <button type="button" onClick={() => acceptDonation(donation.id)} disabled={acceptingId === donation.id} className="mt-4 w-full rounded-xl bg-[#174b3e] px-4 py-3 font-semibold text-white transition hover:bg-[#103c32] disabled:cursor-not-allowed disabled:opacity-60">{acceptingId === donation.id ? "Accepting…" : "Accept donation →"}</button>}
      </div>
    </article>
  );

  return (
    <main className="min-h-screen bg-[#f7f9f7] px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-7 rounded-3xl bg-[#174b3e] px-6 py-8 text-white sm:px-9 sm:py-10">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-lime-200">NGO workspace</p>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">Donations ready to help.</h1>
          <p className="mt-3 max-w-2xl leading-7 text-emerald-50/80">Browse useful items, accept what your organization can use, and track each donation until delivery.</p>
        </header>

        <section className="mb-10 grid items-start gap-6 lg:grid-cols-2">
          <form onSubmit={createRequest} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-bold">Request a donation</h2><p className="mt-1 text-sm text-slate-500">Tell donors what your organization currently needs.</p>
            <label className="mt-4 block text-sm font-semibold">Item needed<input required maxLength={120} value={requestForm.title} onChange={(e) => setRequestForm((current) => ({ ...current, title: e.target.value }))} placeholder="e.g. Packaged groceries" className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal" /></label>
            <div className="mt-4 grid gap-3 sm:grid-cols-2"><label className="block text-sm font-semibold">Category<select value={requestForm.category} onChange={(e) => setRequestForm((current) => ({ ...current, category: e.target.value }))} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 font-normal">{donationCategories.map((category) => <option key={category.value} value={category.value}>{category.label}</option>)}</select></label><label className="block text-sm font-semibold">Quantity<input type="number" min="1" max="100000" required value={requestForm.quantity} onChange={(e) => setRequestForm((current) => ({ ...current, quantity: e.target.value }))} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 font-normal" /></label></div>
            <label className="mt-4 block text-sm font-semibold">Details<textarea rows="2" maxLength={1500} value={requestForm.description} onChange={(e) => setRequestForm((current) => ({ ...current, description: e.target.value }))} placeholder="Sizes, intended use, preferred condition…" className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal" /></label>
            <button type="submit" disabled={creatingRequest} className="mt-4 w-full rounded-xl bg-[#174b3e] px-4 py-3 font-semibold text-white disabled:opacity-60">{creatingRequest ? "Publishing…" : "Publish request"}</button>
          </form>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-xl font-bold">My requests</h2><p className="mt-1 text-sm text-slate-500">Track requests published by your organization.</p>{myRequests.length === 0 ? <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">Your published requests will appear here.</p> : <div className="mt-4 space-y-3">{myRequests.map((request) => <article key={request.id} className="rounded-xl border border-slate-200 p-4"><div className="flex items-start justify-between gap-2"><h3 className="font-semibold">{request.title}</h3><span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold">{request.status}</span></div><p className="mt-1 text-sm text-slate-500">{categoryLabels[request.category] || request.category} · Quantity {request.quantity}</p>{request.description && <p className="mt-2 text-sm text-slate-600">{request.description}</p>}</article>)}</div>}</div>
        </section>

        <section className="mb-10">
          <div className="mb-5"><h2 className="text-2xl font-bold">Available donations</h2><p className="mt-1 text-sm text-slate-500">Expired food is filtered by the backend and cannot be accepted.</p></div>
          <div className="mb-5 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-[1fr_260px]">
            <label><span className="mb-2 block text-sm font-semibold">Search donations</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by item, details or pickup area…" className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-600" /></label>
            <label><span className="mb-2 block text-sm font-semibold">Filter category</span><select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3"><option value="ALL">All categories</option>{donationCategories.map((category) => <option key={category.value} value={category.value}>{category.label}</option>)}</select></label>
          </div>
          {loading ? <p className="rounded-xl bg-white p-8 text-center text-slate-500">Loading available donations…</p> : filteredDonations.length === 0 ? <p className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">No available donations match your search.</p> : <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{filteredDonations.map((donation) => <DonationCard key={donation.id} donation={donation} />)}</div>}
        </section>

        <section>
          <div className="mb-5"><h2 className="text-2xl font-bold">Accepted by my NGO</h2><p className="mt-1 text-sm text-slate-500">Follow volunteer assignment, pickup and delivery status.</p></div>
          {loadingMine ? <p className="rounded-xl bg-white p-8 text-center text-slate-500">Loading your accepted donations…</p> : myDonations.length === 0 ? <p className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">Donations your NGO accepts will appear here.</p> : <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{myDonations.map((donation) => <DonationCard key={donation.id} donation={donation} accepted />)}</div>}
        </section>
      </div>
    </main>
  );
};

export default NgoDashboard;
