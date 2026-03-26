import { Link } from "react-router";
import {
  ShieldCheck, Users, ArrowRight, BarChart3, Package, Calendar,
  FileText, CheckCircle, TrendingUp, Bell, Lock, Globe, Zap,
  ClipboardList, FolderOpen, Mail, ChevronDown, Database,
  Activity, Layers, MousePointerClick
} from "lucide-react";
import { ThemeToggle } from "../components/ThemeToggle";

const features = [
  { icon: Package,      title: "Stock Management",    desc: "Real-time inventory tracking across all categories with low-stock alerts and full purchase history.", color: "text-orange-400", bg: "bg-orange-400/10 border-orange-400/20", gradient: "from-orange-500/20 to-orange-600/5" },
  { icon: ClipboardList,title: "Leave Requests",      desc: "Submit, review, approve or defer leave applications with a full audit trail and HR signatures.",     color: "text-blue-400",   bg: "bg-blue-400/10 border-blue-400/20",   gradient: "from-blue-500/20 to-blue-600/5" },
  { icon: Calendar,     title: "Meetings",             desc: "Schedule meetings, view a live calendar, and auto-send branded email invites to all participants.",  color: "text-emerald-400",bg: "bg-emerald-400/10 border-emerald-400/20", gradient: "from-emerald-500/20 to-emerald-600/5" },
  { icon: FolderOpen,   title: "Document Vault",       desc: "Securely upload, organise and access company documents and meeting minutes from anywhere.",          color: "text-purple-400", bg: "bg-purple-400/10 border-purple-400/20", gradient: "from-purple-500/20 to-purple-600/5" },
  { icon: BarChart3,    title: "Analytics Dashboard",  desc: "Visual charts for stock trends, leave stats, purchase history and meeting activity — all live.",    color: "text-pink-400",   bg: "bg-pink-400/10 border-pink-400/20",   gradient: "from-pink-500/20 to-pink-600/5" },
  { icon: Mail,         title: "Email Notifications",  desc: "Automated branded email notifications for meeting invites, updates and reminders via Resend.",       color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/20", gradient: "from-yellow-500/20 to-yellow-600/5" },
];

const steps = [
  { icon: MousePointerClick, step: "01", title: "Choose your portal", desc: "Select Admin or HR login from the landing page." },
  { icon: Lock,              step: "02", title: "Authenticate securely", desc: "Sign in with your credentials — role-based access enforced." },
  { icon: Layers,            step: "03", title: "Access your dashboard", desc: "Your personalised dashboard loads with real-time data." },
  { icon: Activity,          step: "04", title: "Manage & act", desc: "Approve leave, track stock, schedule meetings and more." },
];

const roles = [
  {
    icon: ShieldCheck, role: "Admin", color: "text-[#D1131B]",
    border: "border-[#D1131B]/30 hover:border-[#D1131B]/60",
    bg: "bg-gradient-to-br from-[#D1131B]/8 to-[#D1131B]/3",
    iconBg: "bg-[#D1131B]/10 border-[#D1131B]/20",
    btnClass: "bg-[#D1131B] hover:bg-[#B01018]",
    href: "/login/admin",
    title: "Admin Dashboard",
    desc: "Full system access. Manage stock, approve leave, schedule meetings, upload documents and view all analytics.",
    perms: ["Full CRUD on all modules", "Approve / reject leave", "Schedule & manage meetings", "Upload & delete documents", "View all analytics"],
    accentLine: "bg-[#D1131B]",
  },
  {
    icon: Users, role: "HR", color: "text-blue-400",
    border: "border-blue-500/30 hover:border-blue-500/60",
    bg: "bg-gradient-to-br from-blue-500/8 to-blue-600/3",
    iconBg: "bg-blue-500/10 border-blue-500/20",
    btnClass: "bg-blue-600 hover:bg-blue-700",
    href: "/login/hr",
    title: "HR Dashboard",
    desc: "HR-focused access. View stock levels, manage leave requests, attend meetings and access documents.",
    perms: ["View stock & purchase history", "Approve / defer leave requests", "View meetings & calendar", "Access document vault", "View analytics dashboard"],
    accentLine: "bg-blue-500",
  },
];

// Inline SVG dashboard mockup
function DashboardMockup() {
  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Glow behind mockup */}
      <div className="absolute inset-0 bg-[#D1131B]/20 blur-3xl rounded-full scale-75 -z-10" />
      <div className="rounded-2xl border border-white/10 bg-gray-900/80 backdrop-blur shadow-2xl overflow-hidden">
        {/* Titlebar */}
        <div className="flex items-center gap-2 px-4 py-3 bg-gray-800/80 border-b border-white/5">
          <span className="w-3 h-3 rounded-full bg-red-500/80" />
          <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <span className="w-3 h-3 rounded-full bg-green-500/80" />
          <div className="flex-1 mx-4 h-5 bg-white/5 rounded-full" />
        </div>
        {/* Sidebar + content */}
        <div className="flex h-52 sm:h-64">
          {/* Sidebar */}
          <div className="w-14 sm:w-20 bg-gray-800/60 border-r border-white/5 flex flex-col items-center py-4 gap-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`w-8 h-8 rounded-lg ${i === 0 ? "bg-[#D1131B]/80" : "bg-white/5"}`} />
            ))}
          </div>
          {/* Main area */}
          <div className="flex-1 p-4 space-y-3">
            {/* Top stat cards */}
            <div className="grid grid-cols-3 gap-2">
              {[["#D1131B", "12"], ["#3b82f6", "4"], ["#10b981", "98%"]].map(([color, val], i) => (
                <div key={i} className="rounded-lg bg-white/5 border border-white/5 p-2">
                  <div className="w-4 h-1 rounded mb-1.5" style={{ background: color }} />
                  <p className="text-white font-bold text-sm">{val}</p>
                  <div className="w-10 h-1.5 bg-white/10 rounded mt-1" />
                </div>
              ))}
            </div>
            {/* Chart area */}
            <div className="rounded-lg bg-white/5 border border-white/5 p-3 flex items-end gap-1 h-20">
              {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75].map((h, i) => (
                <div key={i} className="flex-1 rounded-sm" style={{ height: `${h}%`, background: i === 7 ? "#D1131B" : "rgba(255,255,255,0.15)" }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Landing() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0d14] text-gray-900 dark:text-white flex flex-col transition-colors duration-200">

      {/* NAV */}
      <header className="sticky top-0 z-50 border-b border-gray-200/80 dark:border-white/5 bg-white/90 dark:bg-[#0a0d14]/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <img src="/Millenium_logo_white-removebg-preview.png" alt="Millenium" className="h-9 object-contain hidden dark:block" />
          <img src="/Millenum_logo_black-removebg-preview.png" alt="Millenium" className="h-9 object-contain dark:hidden" />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link to="/login/admin" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5">
              Admin Login
            </Link>
            <Link to="/login/hr" className="text-sm bg-[#D1131B] hover:bg-[#B01018] text-white px-4 py-2 rounded-lg transition-colors font-medium shadow-sm shadow-[#D1131B]/30">
              HR Login
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        {/* Animated background blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-[#D1131B]/8 dark:bg-[#D1131B]/12 rounded-full blur-[140px]" />
          <div className="absolute top-40 -right-40 w-[500px] h-[500px] bg-blue-500/5 dark:bg-blue-500/8 rounded-full blur-[100px]" />
          <div className="absolute top-60 -left-40 w-[400px] h-[400px] bg-purple-500/5 dark:bg-purple-500/8 rounded-full blur-[100px]" />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left — text */}
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-5 leading-[1.08]">
                One platform.<br />
                <span className="text-[#D1131B]">Every</span> operation.
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-base sm:text-lg max-w-lg mb-8 leading-relaxed">
                A unified management system for stock, HR, meetings and documents — built exclusively for the Millenium Digital team.
              </p>
              {/* Mini stats */}
              <div className="flex flex-wrap gap-6">
                {[["6", "Modules"], ["2", "Portals"], ["100%", "Live Data"]].map(([v, l]) => (
                  <div key={l}>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{v}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{l}</p>
                  </div>
                ))}
              </div>
            </div>
            {/* Right — dashboard mockup */}
            <div className="hidden lg:block">
              <DashboardMockup />
            </div>
          </div>

          {/* Scroll cue */}
          <div className="flex justify-center mt-16">
            <button
              onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
              className="flex flex-col items-center gap-1 text-gray-400 dark:text-gray-600 hover:text-[#D1131B] dark:hover:text-[#D1131B] transition-colors"
              aria-label="Scroll down"
            >
              <span className="text-[10px] tracking-widest uppercase font-medium">Explore</span>
              <ChevronDown className="w-5 h-5 animate-bounce" />
            </button>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-14">
          <p className="text-xs text-[#D1131B] font-semibold uppercase tracking-widest mb-3">What's inside</p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-3">Everything your team needs</h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto text-sm sm:text-base">Six fully integrated modules, all connected to a live Supabase database.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(f => {
            const Icon = f.icon;
            return (
              <div key={f.title} className={`group relative overflow-hidden bg-gray-50 dark:bg-white/3 border border-gray-200 dark:border-white/8 hover:border-gray-300 dark:hover:border-white/15 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:hover:shadow-black/30`}>
                {/* Subtle gradient top */}
                <div className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r ${f.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-4 ${f.bg} group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`w-5 h-5 ${f.color}`} />
                </div>
                <h3 className="font-semibold text-base mb-2">{f.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-gray-50 dark:bg-white/2 border-y border-gray-200 dark:border-white/5 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-xs text-[#D1131B] font-semibold uppercase tracking-widest mb-3">How it works</p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">Up and running in seconds</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto text-sm sm:text-base">Simple, secure access for every team member.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={s.step} className="relative flex flex-col items-center text-center p-6 rounded-2xl bg-white dark:bg-white/3 border border-gray-200 dark:border-white/8 shadow-sm">
                  {/* Connector line */}
                  {i < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-10 left-[calc(100%-1px)] w-6 h-px bg-gray-200 dark:bg-white/10 z-10" />
                  )}
                  <div className="w-14 h-14 rounded-2xl bg-[#D1131B]/10 border border-[#D1131B]/20 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-[#D1131B]" />
                  </div>
                  <span className="text-xs font-bold text-[#D1131B] tracking-widest mb-2">{s.step}</span>
                  <h3 className="font-semibold text-sm mb-1.5">{s.title}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* TECH STACK */}
      <section className="bg-gray-50 dark:bg-white/2 border-t border-gray-200 dark:border-white/5 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-10">
            <p className="text-xs text-[#D1131B] font-semibold uppercase tracking-widest mb-3">Built with</p>
            <h2 className="text-2xl sm:text-3xl font-bold">Modern tech stack</h2>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { icon: Zap,        label: "React + TypeScript" },
              { icon: Database,   label: "Supabase (PostgreSQL)" },
              { icon: Lock,       label: "Role-based Auth" },
              { icon: TrendingUp, label: "Recharts Analytics" },
              { icon: Bell,       label: "Resend Email API" },
              { icon: Globe,      label: "Tailwind CSS" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full px-5 py-2.5 text-sm text-gray-600 dark:text-gray-300 shadow-sm hover:border-[#D1131B]/40 transition-colors">
                <Icon className="w-4 h-4 text-[#D1131B]" />
                {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-200 dark:border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <img src="/Millenium_logo_white-removebg-preview.png" alt="Millenium" className="h-7 object-contain opacity-60 hidden dark:block" />
          <img src="/Millenum_logo_black-removebg-preview.png" alt="Millenium" className="h-7 object-contain opacity-50 dark:hidden" />
          <p className="text-gray-400 dark:text-gray-600 text-xs text-center">
            © {new Date().getFullYear()} Millenium Digital. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-gray-600">
            <Link to="/login/admin" className="hover:text-[#D1131B] transition-colors">Admin</Link>
            <Link to="/login/hr" className="hover:text-[#D1131B] transition-colors">HR</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
