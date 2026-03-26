import { useState } from "react";
import { useNavigate } from "react-router";
import { Eye, EyeOff, Lock, Mail, Users } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { api } from "../../services/api";

export function Login() {
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
      if (user.role !== "hr") {
        setError("Access denied. This portal is for HR only.");
        return;
      }
      sessionStorage.setItem("auth_hr", "true");
      sessionStorage.setItem("auth_user", JSON.stringify({ name: user.name, email: user.email, role: user.role }));
      navigate("/");
    } catch (err: any) {
      setError(err.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-[#0a0a1a] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <img src="/Millenium_logo_white-removebg-preview.png" alt="Millenium" className="h-14 mb-4 object-contain" />
          <div className="flex items-center gap-2 bg-blue-900/20 border border-blue-700/30 rounded-full px-4 py-1.5">
            <Users className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-blue-400">HR Portal</span>
          </div>
        </div>

        <div className="bg-gray-900/80 backdrop-blur border border-gray-800 rounded-2xl p-8 shadow-2xl">
          <h1 className="text-2xl font-bold text-white mb-1">Welcome back</h1>
          <p className="text-gray-400 text-sm mb-6">Sign in to your HR dashboard</p>

          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="bg-red-900/30 border border-red-700/50 rounded-lg px-4 py-3 text-red-400 text-sm">{error}</div>
            )}
            <div className="space-y-1.5">
              <Label className="text-gray-300 text-sm">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="hr@millenium.co.ke"
                  className="pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-600 focus:border-blue-500"
                  required />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-gray-300 text-sm">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="pl-10 pr-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-600 focus:border-blue-500"
                  required />
                <button type="button" onClick={() => setShowPw(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold h-11 mt-2">
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </div>
        <p className="text-center text-gray-600 text-xs mt-6">Millenium Digital ERP · HR Dashboard</p>
      </div>
    </div>
  );
}
