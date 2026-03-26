import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { Eye, EyeOff, Lock, Mail, ShieldCheck, ArrowLeft } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { api } from "../../services/api";

export function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await api.login(email, password);
      if (user.role !== "admin") {
        setError("Access denied. This portal is for admins only.");
        return;
      }
      sessionStorage.setItem("auth_admin", "true");
      sessionStorage.setItem("auth_user", JSON.stringify({ name: user.name, email: user.email, role: user.role }));
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-4">
      {/* Back to landing */}
      <Link to="/" className="absolute top-6 left-6 flex items-center gap-1.5 text-gray-500 hover:text-gray-300 text-sm transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>

      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <Link to="/">
            <img src="/Millenium_logo_white-removebg-preview.png" alt="Millenium" className="h-12 mb-5 object-contain" />
          </Link>
          <div className="flex items-center gap-2 bg-[#D1131B]/10 border border-[#D1131B]/30 rounded-full px-4 py-1.5">
            <ShieldCheck className="w-4 h-4 text-[#D1131B]" />
            <span className="text-sm font-medium text-[#D1131B]">Admin Portal</span>
          </div>
        </div>

        <div className="bg-white/3 backdrop-blur border border-white/10 rounded-2xl p-8 shadow-2xl">
          <h1 className="text-2xl font-bold text-white mb-1">Welcome back</h1>
          <p className="text-gray-400 text-sm mb-6">Sign in to the Admin Dashboard</p>

          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="bg-red-900/30 border border-red-700/50 rounded-lg px-4 py-3 text-red-400 text-sm">{error}</div>
            )}
            <div className="space-y-1.5">
              <Label className="text-gray-300 text-sm">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="admin@millenium.co.ke"
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-[#D1131B] focus:ring-0"
                  required />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-gray-300 text-sm">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="pl-10 pr-10 bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-[#D1131B] focus:ring-0"
                  required />
                <button type="button" onClick={() => setShowPw(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" disabled={loading}
              className="w-full bg-[#D1131B] hover:bg-[#B01018] text-white font-semibold h-11 mt-2">
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <p className="text-center text-gray-600 text-xs mt-5">
            HR staff?{" "}
            <Link to="/login/hr" className="text-blue-400 hover:text-blue-300 transition-colors">
              Sign in to HR portal
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
