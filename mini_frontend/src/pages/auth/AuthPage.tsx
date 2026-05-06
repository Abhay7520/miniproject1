import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package, Mail, Lock, User, ArrowRight, ArrowLeft, Zap,
  Send, Truck, BarChart3, MapPin, Shield, Clock, Eye, EyeOff,
  CheckCircle, AlertCircle, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiRequest, setAuthToken, setUserData } from "@/lib/api";
import { toast } from "sonner";

const roleConfigs = {
  user: {
    label: "User",
    tagline: "Seamless delivery powered by AI",
    description: "Track shipments, send parcels, and manage deliveries easily.",
    gradient: "from-orange-500 to-amber-400",
    gradientBg: "from-orange-500/20 via-amber-500/10 to-transparent",
    shadow: "shadow-orange-500/25",
    glow: "bg-orange-500/10",
    border: "border-orange-500/30",
    text: "text-orange-400",
    accent: "orange",
    illustrations: [
      { icon: Send, label: "Send Parcels", delay: 0 },
      { icon: MapPin, label: "Track Shipments", delay: 0.8 },
      { icon: Clock, label: "AI ETA", delay: 1.6 },
    ],
  },
  staff: {
    label: "Staff",
    tagline: "Empowering logistics with intelligence",
    description: "Manage logistics, process deliveries, and handle operations.",
    gradient: "from-blue-500 to-cyan-400",
    gradientBg: "from-blue-500/20 via-cyan-500/10 to-transparent",
    shadow: "shadow-blue-500/25",
    glow: "bg-blue-500/10",
    border: "border-blue-500/30",
    text: "text-blue-400",
    accent: "blue",
    illustrations: [
      { icon: Truck, label: "Route Management", delay: 0 },
      { icon: Package, label: "Parcel Processing", delay: 0.8 },
      { icon: Shield, label: "Secure Handling", delay: 1.6 },
    ],
  },
  admin: {
    label: "Admin",
    tagline: "Complete control at your fingertips",
    description: "Monitor system performance, analytics, and platform control.",
    gradient: "from-violet-500 to-purple-400",
    gradientBg: "from-violet-500/20 via-purple-500/10 to-transparent",
    shadow: "shadow-violet-500/25",
    glow: "bg-violet-500/10",
    border: "border-violet-500/30",
    text: "text-violet-400",
    accent: "violet",
    illustrations: [
      { icon: BarChart3, label: "Analytics", delay: 0 },
      { icon: Shield, label: "System Control", delay: 0.8 },
      { icon: Zap, label: "AI Monitoring", delay: 1.6 },
    ],
  },
};

type Role = keyof typeof roleConfigs;

const FloatingElement = ({ icon: Icon, label, delay, gradient }: { icon: any; label: string; delay: number; gradient: string }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: delay + 0.4, duration: 0.5 }}
    className="flex flex-col items-center gap-2"
  >
    <motion.div
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay }}
      className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} shadow-lg`}
    >
      <Icon className="h-7 w-7 text-white" strokeWidth={1.5} />
    </motion.div>
    <span className="text-xs font-semibold text-white/50">{label}</span>
  </motion.div>
);

const IllustrationBox = ({ role }: { role: Role }) => {
  const cfg = roleConfigs[role] || roleConfigs.user;
  return (
    <motion.div
      key={role}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5 }}
      className={`relative rounded-3xl border ${cfg.border} bg-white/[0.02] backdrop-blur-sm p-8 overflow-hidden`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${cfg.gradientBg} opacity-30`} />
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }} />
      <div className="relative z-10 flex flex-col items-center gap-8">
        <div className="flex gap-6">
          {cfg.illustrations.map((item) => (
            <FloatingElement key={item.label} {...item} gradient={cfg.gradient} />
          ))}
        </div>
        <div className="relative w-full max-w-[200px] h-0.5">
          <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${cfg.gradient} opacity-20`} />
          <motion.div
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className={`absolute top-0 left-0 h-full w-1/3 rounded-full bg-gradient-to-r ${cfg.gradient}`}
          />
        </div>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="text-lg font-bold text-white/60 text-center">
          {cfg.tagline}
        </motion.p>
      </div>
    </motion.div>
  );
};

const AuthPage = () => {
  const { role: roleParam, mode } = useParams<{ role: string; mode: string }>();
  const role = (roleParam || "user") as Role;
  const isLogin = mode === "login";
  const cfg = roleConfigs[role] || roleConfigs.user;
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!formData.email || !formData.password) {
      setError("Please fill in all required fields");
      setIsLoading(false);
      return;
    }

    if (!isLogin && formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      if (isLogin) {
        console.log(`Attempting login as ${role}...`);
        const body = new URLSearchParams();
        body.append("username", formData.email);
        body.append("password", formData.password);
        
        const response = await fetch("http://localhost:8000/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: body.toString(),
        });
        
        const data = await response.json();

        if (!response.ok) {
          if (response.status === 404) {
             throw new Error(`${role.toUpperCase()} account not found. Please create an account first!`);
          }
          throw new Error(data.detail || "Login failed");
        }
        
        // CRITICAL ROLE CHECK
        if (data.user.role !== role) {
          console.error(`Role mismatch: Expected ${role}, got ${data.user.role}`);
          throw new Error(`This account is registered as a ${data.user.role}, not an ${role}. Please switch roles at the bottom of the page.`);
        }

        setAuthToken(data.access_token);
        setUserData(data.user);
        toast.success(`Welcome back, ${data.user.full_name}!`);
        
        const targetPath = `/${role}/dashboard`;
        console.log(`Navigating to: ${targetPath}`);
        navigate(targetPath);
      } else {
        // Handle Signup
        await apiRequest("/auth/signup", {
          method: "POST",
          body: JSON.stringify({
            email: formData.email,
            full_name: formData.name,
            password: formData.password,
            role: role,
          }),
        });
        
        toast.success(`${role.toUpperCase()} account created! You can now sign in.`);
        navigate(`/auth/${role}/login`);
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = isLogin ? "register" : "login";

  return (
    <div className="flex min-h-screen bg-[#050508] text-white overflow-hidden">
      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="fixed top-[4.5rem] left-4 z-50 hidden md:block">
        <Link to={`/auth/select/${mode}`} className="flex items-center justify-center gap-2 rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm font-medium text-white/60 backdrop-blur-md transition-all hover:text-white hover:bg-white/10">
          <ArrowLeft className="h-4 w-4" /> Back to role selection
        </Link>
      </motion.div>

      {/* Visual Panel */}
      <div className="hidden lg:flex w-1/2 relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0812] via-[#080510] to-[#050508]" />
        <div className={`absolute top-1/4 left-1/4 h-80 w-80 rounded-full ${cfg.glow} blur-[100px] transition-colors duration-700`} />
        <div className="relative z-10 max-w-lg px-10 flex flex-col items-center">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${cfg.gradient} shadow-lg ${cfg.shadow}`}>
            <Package className="h-7 w-7 text-white" />
          </motion.div>
          <AnimatePresence mode="wait"><IllustrationBox role={role} /></AnimatePresence>
          <div className={`mt-6 inline-flex items-center gap-2 rounded-full border ${cfg.border} ${cfg.glow} px-4 py-1.5 text-xs font-semibold ${cfg.text}`}>
            <Zap className="h-3 w-3" /> {cfg.label} Portal
          </div>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-r from-transparent to-[#050508]" />
      </div>

      {/* Form Panel */}
      <div className="flex w-full items-center justify-center px-4 lg:w-1/2">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${cfg.border} ${cfg.glow} ${cfg.text} mb-4`}>
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {isLogin ? "Signing in" : "Registering"} as {cfg.label}
          </div>

          <h2 className="text-3xl font-black tracking-tight text-white">{isLogin ? "Sign In" : "Create Account"}</h2>
          <p className="mt-2 text-sm text-white/40">{cfg.description}</p>

          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-4 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                <AlertCircle className="h-4 w-4 flex-shrink-0" /> {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {!isLogin && (
              <div>
                <Label className="text-sm font-semibold text-white/70">Full Name</Label>
                <div className="relative mt-1.5">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                  <Input placeholder="John Doe" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="border-white/10 bg-white/5 pl-10 text-white" required={!isLogin} />
                </div>
              </div>
            )}

            <div>
              <Label className="text-sm font-semibold text-white/70">Email</Label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                <Input type="email" placeholder="you@example.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="border-white/10 bg-white/5 pl-10 text-white" required />
              </div>
            </div>

            <div>
              <Label className="text-sm font-semibold text-white/70">Password</Label>
              <div className="relative mt-1.5">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                <Input type={showPassword ? "text" : "password"} placeholder="••••••••" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="border-white/10 bg-white/5 pl-10 text-white" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div>
                <Label className="text-sm font-semibold text-white/70">Confirm Password</Label>
                <div className="relative mt-1.5">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                  <Input type={showConfirmPassword ? "text" : "password"} placeholder="••••••••" value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} className="border-white/10 bg-white/5 pl-10 text-white" required />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}

            <Button type="submit" disabled={isLoading} className={`w-full h-11 border-0 bg-gradient-to-r ${cfg.gradient} font-bold text-white shadow-lg`}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (isLogin ? `Sign In as ${cfg.label}` : `Create ${cfg.label} Account`)}
              {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-white/40">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <Link to={`/auth/${role}/${toggleMode}`} className={`font-bold ${cfg.text} hover:underline`}>{isLogin ? "Create one" : "Sign in"}</Link>
          </p>

          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-xs text-white/30 mb-3">Switch role</p>
            <div className="flex gap-2 justify-center">
              {(["user", "staff", "admin"] as const).map((r) => (
                <Link key={r} to={`/auth/${r}/${mode}`} className={`rounded-lg px-4 py-1.5 text-xs font-bold capitalize ${r === role ? `bg-gradient-to-r ${roleConfigs[r].gradient} text-white` : "bg-white/5 text-white/40 hover:text-white/70"}`}>{r}</Link>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthPage;
