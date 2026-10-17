import { useEffect, useRef, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import { toast } from "react-toastify";
import { donationCategories, categoryLabels, categoryIcons, getDonationTitle } from "../../data/donationCategories";
import LocationButton from "../../components/LocationButton/LocationButton";
import DonationTimeline from "../../components/DonationTimeline/DonationTimeline";

const localToday = () => { const now = new Date(); return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`; };

const statusStyles = { AVAILABLE: "bg-emerald-50 text-emerald-700", ACCEPTED: "bg-amber-50 text-amber-700", ASSIGNED: "bg-violet-50 text-violet-700", PICKED_UP: "bg-sky-50 text-sky-700", DELIVERED: "bg-slate-100 text-slate-600" };

const DonorDashboard = () => {
  const [form, setForm] = useState({ title: "", category: "FOOD", quantity: "1", description: "", itemCondition: "GOOD", expiryDate: "", pickupAddress: "" });
  const [image, setImage] = useState(null);
  const [myDonations, setMyDonations] = useState([]);
  const [openRequests, setOpenRequests] = useState([]);
  const [selectedRequestId, setSelectedRequestId] = useState("");
  const donationFormRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [loadingDonations, setLoadingDonations] = useState(true);

  useEffect(() => { fetchMyDonations(); fetchOpenRequests(); }, []);
  const fetchMyDonations = async () => {
    setLoadingDonations(true);
    try {
      const response = await axiosInstance.get("/donations/my-donations");
      setMyDonations(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      const data = error.response?.data;
      toast.error(typeof data === "string" ? data : "Failed to load your donations. Check that you are logged in as a donor.");
    } finally { setLoadingDonations(false); }
  };

  const fetchOpenRequests = async () => {
    try {
      const response = await axiosInstance.get("/donation-requests/open");
      setOpenRequests(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      const data = error.response?.data;
      toast.error(typeof data === "string" ? data : "Could not load NGO donation requests.");
    }
  };

  const donateForRequest = (request) => {
    setSelectedRequestId(String(request.id));
    setForm((current) => ({
      ...current,
      title: request.title || "",
      category: request.category || "OTHER",
      quantity: String(request.quantity || 1),
      description: request.description || "",
    }));
    donationFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    toast.info("Donation form filled for this NGO request. Add the pickup address and required expiry date, then publish.");
  };

  const updateField = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (form.category === "FOOD" && !form.expiryDate) { toast.error("Please add an expiry date for food donations"); return; }
    const formData = new FormData();
    formData.append("title", form.title.trim());
    formData.append("category", form.category);
    formData.append("quantity", form.quantity);
    formData.append("pickupAddress", form.pickupAddress.trim());
    formData.append("description", form.description.trim());
    formData.append("itemCondition", form.itemCondition);
    if (form.expiryDate) formData.append("expiryTime", `${form.expiryDate} 23:59:59`);
    if (image) formData.append("image", image);
    if (selectedRequestId) formData.append("requestId", selectedRequestId);
    setLoading(true);
    try {
      await axiosInstance.post("/donations", formData, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Your donation has been listed!");
      setForm({ title: "", category: "FOOD", quantity: "1", description: "", itemCondition: "GOOD", expiryDate: "", pickupAddress: "" });
      setImage(null);
      setSelectedRequestId("");
      const input = document.getElementById("donationImage"); if (input) input.value = "";
      await fetchMyDonations();
    } catch (error) { const data = error.response?.data; toast.error(typeof data === "string" ? data : "Could not create donation. Please try again."); }
    finally { setLoading(false); }
  };

  return <main className="min-h-screen bg-[#f7f9f7] px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
    <div className="mx-auto max-w-7xl">
      <header className="mb-8 rounded-3xl bg-[#174b3e] px-6 py-8 text-white sm:px-9 sm:py-10"><p className="text-sm font-semibold uppercase tracking-[0.16em] text-lime-200">Donor workspace</p><div className="mt-3 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><h1 className="text-3xl font-bold sm:text-4xl">Share something good.</h1><p className="mt-3 max-w-xl leading-7 text-emerald-50/80">Give more than food: share clothing, furniture, electronics, books, baby supplies and other useful items with your community.</p></div><div className="rounded-2xl bg-white/10 px-5 py-4"><p className="text-sm text-emerald-50/80">Your listings</p><p className="mt-1 text-3xl font-bold">{myDonations.length}</p></div></div></header>
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <section ref={donationFormRef} className="scroll-mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"><div className="mb-6"><p className="text-sm font-semibold text-emerald-700">NEW LISTING</p><h2 className="mt-1 text-2xl font-bold">Create a donation</h2><p className="mt-2 text-sm leading-6 text-slate-500">Share a few details so an organization can decide whether it can use your item.</p></div>
          {selectedRequestId && <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900"><span>Donating for NGO request #{selectedRequestId}. The donation category must match the request.</span><button type="button" onClick={() => setSelectedRequestId("")} className="shrink-0 font-semibold underline">Clear request</button></div>}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div><label htmlFor="category" className="mb-2 block text-sm font-semibold text-slate-700">Donation category *</label><div className="relative"><select id="category" name="category" value={form.category} onChange={updateField} className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10">{donationCategories.map((category) => <option key={category.value} value={category.value}>{category.icon} {category.label}</option>)}</select><span className="pointer-events-none absolute right-4 top-3.5 text-slate-400">⌄</span></div></div>
            <div><label htmlFor="title" className="mb-2 block text-sm font-semibold text-slate-700">What are you donating? *</label><input id="title" name="title" value={form.title} onChange={updateField} required maxLength={120} placeholder={form.category === "FOOD" ? "e.g. Packaged groceries" : "e.g. Gently used winter jackets"} className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10" /></div>
            <div className="grid gap-5 sm:grid-cols-2"><div><label htmlFor="quantity" className="mb-2 block text-sm font-semibold text-slate-700">Quantity *</label><input id="quantity" name="quantity" type="number" min="1" max="100000" value={form.quantity} onChange={updateField} required className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10" /></div><div><label htmlFor="itemCondition" className="mb-2 block text-sm font-semibold text-slate-700">Condition *</label><select id="itemCondition" name="itemCondition" value={form.itemCondition} onChange={updateField} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"><option value="NEW">New</option><option value="LIKE_NEW">Like new</option><option value="GOOD">Good</option><option value="FAIR">Fair / usable</option><option value="NOT_APPLICABLE">Not applicable</option></select></div></div>
            {form.category === "FOOD" && <div><label htmlFor="expiryDate" className="mb-2 block text-sm font-semibold text-slate-700">Use-by / expiry date *</label><input id="expiryDate" name="expiryDate" type="date" min={localToday()} value={form.expiryDate} onChange={updateField} required className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10" /><p className="mt-1 text-xs text-slate-500">Required for food donations; optional for other categories.</p></div>}
            <div><label htmlFor="description" className="mb-2 block text-sm font-semibold text-slate-700">Description</label><textarea id="description" name="description" rows="3" maxLength={1500} value={form.description} onChange={updateField} placeholder="Add size, quantity details, condition, or other useful information..." className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 outline-none placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10" /></div>
            <div><label htmlFor="pickupAddress" className="mb-2 block text-sm font-semibold text-slate-700">Pickup address *</label><textarea id="pickupAddress" name="pickupAddress" rows="2" required value={form.pickupAddress} onChange={updateField} placeholder="House / building, street, area, city" className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10" /><LocationButton onAddress={(address) => setForm((current) => ({ ...current, pickupAddress: address }))} /></div>
            <div><label htmlFor="donationImage" className="mb-2 block text-sm font-semibold text-slate-700">Photo <span className="font-normal text-slate-400">(optional)</span></label><input id="donationImage" type="file" accept="image/*" onChange={(event) => setImage(event.target.files?.[0] || null)} className="block w-full rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-50 file:px-3 file:py-2 file:font-semibold file:text-emerald-800" />{image && <p className="mt-2 text-xs text-emerald-700">Selected: {image.name}</p>}</div>
            <button type="submit" disabled={loading} className="w-full rounded-xl bg-[#174b3e] px-5 py-3.5 font-semibold text-white shadow-sm transition hover:bg-[#103c32] disabled:cursor-not-allowed disabled:opacity-60">{loading ? "Publishing donation..." : "Publish donation →"}</button>
            <p className="text-center text-xs leading-5 text-slate-400">Please only list items that are safe, usable, and legal to donate. Medical and personal-care items must be sealed and appropriate for donation.</p>
          </form>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-4"><p className="text-sm font-semibold text-emerald-700">COMMUNITY NEEDS</p><h2 className="mt-1 text-2xl font-bold">NGO donation requests</h2><p className="mt-2 text-sm text-slate-500">Choose a request to prefill the donation form.</p></div>
          {openRequests.length === 0 ? <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">No open NGO requests right now.</p> : <div className="mb-7 space-y-3">{openRequests.map((request) => <article key={request.id} className="rounded-xl border border-slate-200 p-4"><div className="flex items-start justify-between gap-2"><h3 className="font-semibold text-slate-800">{request.title}</h3><span className="rounded-full bg-emerald-50 px-2 py-1 text-xs text-emerald-800">{request.status}</span></div><p className="mt-1 text-xs text-slate-500">{categoryLabels[request.category] || request.category} · Requested quantity: {request.quantity}</p>{request.description && <p className="mt-2 text-sm text-slate-600">{request.description}</p>}<p className="mt-1 text-xs text-slate-400">Requested by {request.ngo?.organizationName || request.ngo?.fullName || "NGO"}</p><button type="button" onClick={() => donateForRequest(request)} className="mt-3 w-full rounded-lg bg-emerald-700 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-800">Donate for this request</button></article>)}</div>}
          <div className="flex items-start justify-between gap-3"><div><p className="text-sm font-semibold text-emerald-700">YOUR ACTIVITY</p><h2 className="mt-1 text-2xl font-bold">My donations</h2><p className="mt-2 text-sm text-slate-500">Track the items you have shared.</p></div><span className="rounded-xl bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-800">{myDonations.length} total</span></div>
          {loadingDonations ? <div className="flex h-40 items-center justify-center"><div className="h-9 w-9 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-700" /></div> : myDonations.length === 0 ? <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-12 text-center"><div className="text-4xl">📦</div><p className="mt-3 font-semibold">Your listings will appear here</p><p className="mt-1 text-sm text-slate-500">Your first donation can start with one useful item.</p></div> : <div className="mt-6 space-y-3">{myDonations.map((donation) => <article key={donation.id} className="flex gap-3 rounded-2xl border border-slate-100 p-4 transition hover:border-emerald-100 hover:bg-emerald-50/30"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-2xl">{categoryIcons[donation.category] || "📦"}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-start justify-between gap-2"><h3 className="font-semibold text-slate-800">{getDonationTitle(donation)}</h3><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[donation.status] || "bg-slate-100 text-slate-600"}`}>{(donation.status || "AVAILABLE").replace("_", " ")}</span></div><p className="mt-1 text-xs font-medium text-emerald-800">{categoryLabels[donation.category] || donation.category || "Donation"} · Qty {donation.quantity}</p>{donation.description && <p className="mt-2 line-clamp-2 text-sm text-slate-500">{donation.description}</p>}<p className="mt-2 truncate text-xs text-slate-400">⌖ {donation.pickupAddress}</p><DonationTimeline donationId={donation.id} /></div></article>)}</div>}
        </section>
      </div>
    </div>
  </main>;
};

export default DonorDashboard;
