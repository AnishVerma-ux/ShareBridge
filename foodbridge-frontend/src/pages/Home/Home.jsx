import { Link } from "react-router-dom";
import { donationCategories } from "../../data/donationCategories";

const categories = donationCategories;

const Home = () => (
  <main className="min-h-screen bg-[#f8faf8] text-slate-900">
    <section className="relative overflow-hidden bg-[#123b32] text-white">
      <div className="absolute -right-20 -top-28 h-96 w-96 rounded-full bg-emerald-400/15 blur-3xl" />
      <div className="absolute -bottom-40 left-1/4 h-80 w-80 rounded-full bg-lime-300/10 blur-3xl" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 md:grid-cols-2 md:py-24">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-emerald-100"><span>✦</span> Give a little. Change a lot.</span>
          <h1 className="mt-6 max-w-xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">Good things deserve <span className="text-lime-300">a second life.</span></h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-emerald-50/80 sm:text-lg">Share what you no longer need with people and communities who can use it. From food and clothing to furniture, electronics, school supplies and everyday essentials, every donation can make a difference.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/register" className="rounded-xl bg-lime-300 px-6 py-3.5 font-semibold text-[#173c32] shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:bg-lime-200">Start donating <span aria-hidden="true">→</span></Link>
            <a href="#categories" className="rounded-xl border border-white/25 px-6 py-3.5 font-semibold text-white transition hover:bg-white/10">Explore categories</a>
          </div>
          <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm text-emerald-100/80"><span>✓ Simple to share</span><span>✓ Community powered</span><span>✓ Less waste, more good</span></div>
        </div>
        <div className="relative mx-auto w-full max-w-lg">
          <div className="rounded-[2rem] border border-white/15 bg-white/10 p-4 shadow-2xl backdrop-blur-sm sm:p-6">
            <div className="rounded-3xl bg-[#f7f6ee] p-5 text-slate-900 sm:p-7">
              <div className="flex items-center justify-between"><div><p className="text-sm font-medium text-slate-500">Small acts, shared together</p><h2 className="mt-1 text-2xl font-bold">Make room for good.</h2></div><span className="text-3xl">🌱</span></div>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-orange-100 p-4"><span className="text-3xl">🥫</span><p className="mt-3 font-semibold">Food</p><p className="mt-1 text-xs text-slate-600">Share extra, feed more</p></div>
                <div className="rounded-2xl bg-sky-100 p-4"><span className="text-3xl">👕</span><p className="mt-3 font-semibold">Clothing</p><p className="mt-1 text-xs text-slate-600">Pass on what fits</p></div>
                <div className="rounded-2xl bg-violet-100 p-4"><span className="text-3xl">📚</span><p className="mt-3 font-semibold">Books</p><p className="mt-1 text-xs text-slate-600">Keep ideas moving</p></div>
                <div className="rounded-2xl bg-emerald-100 p-4"><span className="text-3xl">🪑</span><p className="mt-3 font-semibold">Home goods</p><p className="mt-1 text-xs text-slate-600">Useful things, reused</p></div>
              </div>
              <div className="mt-4 flex items-center gap-3 rounded-2xl bg-white p-4"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-lime-100 text-xl">💚</span><div><p className="text-sm font-semibold">Your unused can be someone else's useful.</p><p className="mt-1 text-xs text-slate-500">One community. Many ways to help.</p></div></div>
            </div>
          </div>
          <div className="absolute -bottom-5 -left-4 hidden rounded-2xl bg-lime-300 px-4 py-3 font-semibold text-[#173c32] shadow-lg sm:block">♻️ Give items another chance</div>
        </div>
      </div>
    </section>

    <section id="categories" className="mx-auto max-w-7xl px-5 py-16 sm:px-8 md:py-20">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-700">What can you share?</p><h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">A second life for useful things.</h2></div><p className="max-w-md leading-7 text-slate-600">Give useful items a new home instead of letting them go to waste. Explore the kinds of items you can share. If your item is not listed, choose “Other useful items” when creating your donation.</p></div>
      <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {categories.map((category) => <article key={category.value} className="group rounded-2xl border border-slate-200/80 bg-white p-6 transition duration-200 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-950/5"><div className={`flex h-14 w-14 items-center justify-center rounded-2xl text-3xl ${category.tone}`}>{category.icon}</div><h3 className="mt-5 text-lg font-bold">{category.label}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{category.description}</p><Link to="/register" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-emerald-800">Share in this category <span className="transition group-hover:translate-x-1">→</span></Link></article>)}
      </div>
    </section>

    <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-8 md:pb-20"><div className="grid gap-4 rounded-3xl bg-[#e8f1e9] p-7 sm:p-10 md:grid-cols-3 md:items-center"><div className="md:col-span-2"><p className="text-sm font-bold uppercase tracking-[0.16em] text-emerald-800">A simple way to make a difference</p><h2 className="mt-3 text-2xl font-bold sm:text-3xl">Donate with purpose. Connect with your community.</h2><p className="mt-3 max-w-2xl leading-7 text-slate-600">List an item, add pickup details, and let registered community organizations coordinate the next step.</p></div><div className="md:text-right"><Link to="/register" className="inline-flex rounded-xl bg-[#174b3e] px-6 py-3.5 font-semibold text-white transition hover:bg-[#103c32]">Join ShareBridge <span className="ml-2">→</span></Link></div></div></section>
    <footer className="border-t border-slate-200 bg-white"><div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-8"><p><span className="font-bold text-emerald-900">ShareBridge</span> · Useful things, shared with care.</p><p>Built for a more thoughtful, connected community.</p></div></footer>
  </main>
);

export default Home;
