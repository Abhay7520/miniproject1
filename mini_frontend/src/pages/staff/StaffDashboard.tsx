import DashboardLayout from "@/components/DashboardLayout";
import { 
  Package, MapPin, Clock, TrendingUp, Bell, Sparkles, Shield, 
  ChevronRight, MessageSquare, Zap, Calendar, BarChart3, X, 
  Send, Truck, Search, CheckCircle, Loader2, ArrowRight,
  Filter, Map, Activity, User as UserIcon
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, BarChart, Bar, CartesianGrid } from "recharts";
import { useState, useEffect } from "react";
import { apiRequest, getUserData } from "@/lib/api";
import { toast } from "sonner";

const StaffDashboard = () => {
  const user = getUserData();
  const navigate = useNavigate();
  const location = useLocation();
  const [parcels, setParcels] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Determine active view based on URL
  const activeView = location.pathname.split("/").pop() || "dashboard";

  useEffect(() => {
    if (user && user.role !== "staff") {
      navigate(`/${user.role}/dashboard`);
    }
    fetchParcels();
  }, [user, navigate]);

  const fetchParcels = async () => {
    try {
      const data = await apiRequest("/parcels/");
      setParcels(data);
    } catch (err) {
      toast.error("Failed to fetch parcels");
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (trackingId: string, newStatus: string) => {
    setUpdatingId(trackingId);
    try {
      await apiRequest(`/parcels/${trackingId}/status`, {
        method: "PUT",
        body: JSON.stringify({ status: newStatus }),
      });
      toast.success(`Status updated to ${newStatus}`);
      fetchParcels();
    } catch (err) {
      toast.error("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const stats = [
    { label: "Active Queue", value: parcels.filter(p => p.status !== "Delivered").length.toString(), icon: Package, color: "text-blue-400", bg: "from-blue-500/20 to-blue-500/5" },
    { label: "Ready to Ship", value: parcels.filter(p => p.status === "Processing").length.toString(), icon: Send, color: "text-amber-400", bg: "from-amber-500/20 to-amber-500/5" },
    { label: "Delivered Today", value: parcels.filter(p => p.status === "Delivered").length.toString(), icon: CheckCircle, color: "text-emerald-400", bg: "from-emerald-500/20 to-emerald-500/5" },
    { label: "Efficiency", value: "94%", icon: Zap, color: "text-violet-400", bg: "from-violet-500/20 to-violet-500/5" },
  ];

  const renderDashboardView = () => (
    <div className="space-y-8">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0a0a14] p-8"
      >
        <div className="absolute top-0 right-0 h-full w-1/2 bg-gradient-to-l from-blue-500/10 to-transparent" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
               <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
               <span className="text-xs font-bold uppercase tracking-widest text-blue-400">System Online</span>
            </div>
            <h1 className="text-4xl font-black tracking-tight text-white">Staff Command Center</h1>
            <p className="mt-2 text-white/50 max-w-md">Monitoring {parcels.length} global shipments with AI-assisted logistics optimization.</p>
          </div>
          <div className="flex gap-3">
             <Button className="bg-blue-600 hover:bg-blue-500 text-white px-6 font-bold shadow-lg shadow-blue-500/20">
               Generate Route Plan
             </Button>
             <Button variant="outline" className="border-white/10 bg-white/5 text-white">
               <Bell className="h-4 w-4" />
             </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}
            className={`rounded-2xl border border-white/5 bg-gradient-to-br ${s.bg} p-6 backdrop-blur-md`}>
            <div className="flex items-center justify-between mb-4">
              <s.icon className={`h-6 w-6 ${s.color}`} />
              <span className="text-[10px] font-bold uppercase text-white/30 tracking-widest">Real-time</span>
            </div>
            <h3 className="text-3xl font-black text-white">{s.value}</h3>
            <p className="text-sm text-white/40 font-medium">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
           <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
             <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-400" /> Recent Operations
                </h3>
                <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">View Logistics Map</Button>
             </div>
             <div className="h-64">
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={[
                   { name: "08:00", v: 40 }, { name: "10:00", v: 75 }, { name: "12:00", v: 55 },
                   { name: "14:00", v: 90 }, { name: "16:00", v: 120 }, { name: "18:00", v: 80 }
                 ]}>
                   <defs>
                     <linearGradient id="staffArea" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                       <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                     </linearGradient>
                   </defs>
                   <Tooltip contentStyle={{backgroundColor: "#0a0a14", border: "1px solid rgba(255,255,255,0.1)"}} />
                   <Area type="monotone" dataKey="v" stroke="#3b82f6" fillOpacity={1} fill="url(#staffArea)" strokeWidth={3} />
                 </AreaChart>
               </ResponsiveContainer>
             </div>
           </div>
        </div>

        <div className="space-y-6">
           <div className="rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-transparent p-6 backdrop-blur-sm">
             <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
               <Sparkles className="h-5 w-5 text-violet-400" /> AI Logi-Brain
             </h3>
             <div className="space-y-4">
                <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                   <p className="text-xs text-violet-400 font-bold uppercase mb-2">Priority Hub</p>
                   <p className="text-sm text-white/70">Traffic congestion detected at Pune Sorting Hub. Redirecting 4 shipments via Route B.</p>
                </div>
                <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                   <p className="text-xs text-emerald-400 font-bold uppercase mb-2">Efficiency Tip</p>
                   <p className="text-sm text-white/70">Batch processing MH-DL parcels now will save 12% on fuel costs.</p>
                </div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );

  const renderParcelsView = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
       <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-white">Inventory Management</h2>
          <div className="flex gap-2">
             <Input placeholder="Search tracking ID..." className="w-64 bg-white/5 border-white/10" />
             <Button variant="outline" className="border-white/10"><Filter className="h-4 w-4" /></Button>
          </div>
       </div>

       <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden backdrop-blur-sm">
          <div className="grid grid-cols-4 bg-white/5 px-6 py-4 text-xs font-bold uppercase tracking-widest text-white/40">
             <span>Parcel ID</span>
             <span>Route</span>
             <span>Status</span>
             <span className="text-right">Actions</span>
          </div>
          <div className="divide-y divide-white/5">
             {parcels.map(p => (
               <div key={p.id} className="grid grid-cols-4 px-6 py-4 items-center hover:bg-white/[0.02] transition-colors">
                  <span className="font-bold text-blue-400">{p.tracking_number}</span>
                  <span className="text-sm text-white/70">{p.origin_city} → {p.destination_city}</span>
                  <span>
                    <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase ${
                      p.status === "Delivered" ? "bg-emerald-500/20 text-emerald-400" :
                      p.status === "In Transit" ? "bg-blue-500/20 text-blue-400" : "bg-amber-500/20 text-amber-400"
                    }`}>
                      {p.status}
                    </span>
                  </span>
                  <div className="flex justify-end gap-2">
                     <Button size="sm" variant="ghost" className="text-white/40 hover:text-white">View Details</Button>
                     {p.status !== "Delivered" && (
                       <Button size="sm" className="bg-blue-600 text-white" onClick={() => updateStatus(p.tracking_number, p.status === "Processing" ? "In Transit" : "Delivered")}>
                         Update
                       </Button>
                     )}
                  </div>
               </div>
             ))}
          </div>
       </div>
    </motion.div>
  );

  return (
    <DashboardLayout role="staff">
      <AnimatePresence mode="wait">
        {activeView === "dashboard" && renderDashboardView()}
        {(activeView === "parcels" || activeView === "update") && renderParcelsView()}
        {activeView === "delivery" && (
          <div className="flex flex-col items-center justify-center h-[60vh] text-white/30">
            <Map className="h-16 w-16 mb-4 opacity-20" />
            <h2 className="text-xl font-bold">Interactive Route Map</h2>
            <p>Loading AI-generated delivery paths...</p>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default StaffDashboard;
