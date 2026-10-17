import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

const Navbar = () => {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const handleLogout = () => { localStorage.removeItem("token"); setUser(null); setMenuOpen(false); navigate("/login"); };
  const dashboardPath = user ? `/${user.role?.toLowerCase()}/dashboard` : "/login";
  const navLink = "rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-800";
  return <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur">
    <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
      <Link to="/" onClick={() => setMenuOpen(false)} className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#174b3e] text-xl text-lime-200">↗</span><span><span className="block text-lg font-extrabold tracking-tight text-[#174b3e]">ShareBridge</span><span className="hidden text-[11px] font-medium tracking-wide text-slate-500 sm:block">GIVE · SHARE · RECONNECT</span></span></Link>
      <div className="hidden items-center gap-1 md:flex"><Link className={navLink} to="/">Home</Link><Link className={navLink} to="/about">About</Link><Link className={navLink} to="/contact">Contact</Link>{user ? <><Link className={navLink} to={dashboardPath}>Dashboard</Link><Link className={navLink} to="/profile">Profile</Link><span className="mx-2 max-w-40 truncate text-xs text-slate-500">{user.email}</span><button onClick={handleLogout} className="rounded-xl bg-[#174b3e] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#103c32]">Log out</button></> : <><Link className={navLink} to="/login">Log in</Link><Link to="/register" className="ml-1 rounded-xl bg-[#174b3e] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#103c32]">Get started <span className="ml-1">→</span></Link></>}</div>
      <button type="button" aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)} className="rounded-lg border border-slate-200 p-2 text-slate-700 md:hidden">{menuOpen ? <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 6 12 12M18 6 6 18" /></svg> : <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7h16M4 12h16M4 17h16" /></svg>}</button>
    </div>
    {menuOpen && <div className="border-t border-slate-100 bg-white px-4 py-4 md:hidden"><div className="mx-auto flex max-w-7xl flex-col gap-1"><Link onClick={() => setMenuOpen(false)} className={navLink} to="/">Home</Link><Link onClick={() => setMenuOpen(false)} className={navLink} to="/about">About</Link><Link onClick={() => setMenuOpen(false)} className={navLink} to="/contact">Contact</Link>{user ? <><Link onClick={() => setMenuOpen(false)} className={navLink} to={dashboardPath}>Dashboard</Link><Link onClick={() => setMenuOpen(false)} className={navLink} to="/profile">Profile</Link><button onClick={handleLogout} className="mt-2 rounded-xl bg-[#174b3e] px-4 py-3 text-left text-sm font-semibold text-white">Log out</button></> : <><Link onClick={() => setMenuOpen(false)} className={navLink} to="/login">Log in</Link><Link onClick={() => setMenuOpen(false)} className="mt-1 rounded-xl bg-[#174b3e] px-4 py-3 text-sm font-semibold text-white" to="/register">Get started →</Link></>}</div></div>}
  </nav>;
};
export default Navbar;
