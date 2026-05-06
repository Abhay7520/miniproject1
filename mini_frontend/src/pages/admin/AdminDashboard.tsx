import DashboardLayout from "@/components/DashboardLayout";
import { 
  Package, Truck, AlertTriangle, CheckCircle, Users, Clock, 
  Trophy, IndianRupee, Bell, ShieldAlert, Zap, BarChart3, 
  TrendingUp, Search, Loader2, UserPlus, Settings, Database,
  ArrowUpRight, Globe, ShieldCheck, Mail, Calendar, Filter
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area 
} from "recharts";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiRequest, getUserData } from "@/lib/api";
import { toast } from "sonner";
import { useLocation } from "react-router-dom";

const AdminDashboard = () => {
  const user = getUserData();
  const location = useLocation();
  const [stats, setStats] = useState<any>(null);
  const [parcels, setParcels] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const activeView = location.pathname.split("/").pop() || "dashboard";

  useEffect(() => {
    fetchStats();
    if (activeView === "parcels") {
        fetchParcels();
    }
  }, [activeView]);

  const fetchStats = async () => {
    try {
      const data = await apiRequest("/admin/stats");
      setStats(data);
    } catch (err) {
      toast.error("Failed to fetch admin statistics");
    } finally {
      if (activeView !== "parcels") setIsLoading(false);
    }
  };

  const fetchParcels = async () => {
    setIsLoading(true);
    try {
      const data = await apiRequest("/parcels/");
      setParcels(data);
    } catch (err) {
      toast.error("Failed to fetch parcels");
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    { label: "Gross Revenue", value: stats ? `₹${stats.revenue.toLocaleString()}` : "₹0", icon: IndianRupee, color: "text-emerald-400", trend: "+12.5%", trendUp: true },
    { label: "Global Parcels", value: stats ? stats.total_parcels.toString() : "0", icon: Package, color: "text-orange-400", trend: "+4% daily", trendUp: true },
    { label: "User Base", value: stats ? stats.total_users.toString() : "0", icon: Users, color: "text-blue-400", trend: "+18 new", trendUp: true },
    { label: "System Uptime", value: "99.98%", icon: ShieldCheck, color: "text-violet-400", trend: "Stable", trendUp: true },
  ];

  const renderDashboardView = () => (
    <div className="space-y-8">
      {/* Premium Hero */}
      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="relative rounded-[2rem] border border-white/10 bg-[#08080c] p-10 overflow-hidden">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-violet-600/10 blur-[120px]" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-orange-600/10 blur-[120px]" />
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-10">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-xs font-bold text-violet-400 mb-6 uppercase tracking-widest">
               <Database className="h-3.5 w-3.5" /> Central Intelligence
            </div>
            <h1 className="text-5xl font-black tracking-tight text-white mb-4">Enterprise Control</h1>
            <p className="text-lg text-white/40 max-w-lg mx-auto lg:mx-0 font-medium">Real-time oversight of your global logistics network powered by AIPOSTAL's proprietary neural models.</p>
          </div>
          <div className="flex gap-4">
             <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center">
                <p className="text-xs text-white/30 uppercase font-bold tracking-widest mb-2">Network Health</p>
                <div className="text-2xl font-black text-emerald-400">OPTIMAL</div>
             </div>
             <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center">
                <p className="text-xs text-white/30 uppercase font-bold tracking-widest mb-2">Pending Alerts</p>
                <div className="text-2xl font-black text-orange-400">{stats?.processing || 0}</div>
             </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="rounded-3xl border border-white/5 bg-white/[0.03] p-6 backdrop-blur-xl hover:border-white/10 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-2xl bg-white/5 ${s.color}`}>
                <s.icon className="h-6 w-6" />
              </div>
              <span className={`text-xs font-bold ${s.trendUp ? "text-emerald-400" : "text-red-400"}`}>{s.trend}</span>
            </div>
            <p className="text-xs font-bold text-white/30 uppercase tracking-widest mb-1">{s.label}</p>
            <h3 className="text-3xl font-black text-white">{s.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3 rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
           <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-white">System Throughput</h3>
              <div className="flex gap-2">
                 <div className="flex items-center gap-2 text-xs text-white/30"><span className="h-2 w-2 rounded-full bg-orange-500" /> Parcels</div>
              </div>
           </div>
           <div className="h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={[
                 { name: "Mon", v: 145 }, { name: "Tue", v: 178 }, { name: "Wed", v: 162 },
                 { name: "Thu", v: 198 }, { name: "Fri", v: 210 }, { name: "Sat", v: 130 }, { name: "Sun", v: 85 }
               ]}>
                 <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                 <XAxis dataKey="name" tick={{fontSize: 12, fill: "rgba(255,255,255,0.3)"}} axisLine={false} tickLine={false} />
                 <Tooltip contentStyle={{backgroundColor: "#0a0a14", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px"}} />
                 <Bar dataKey="v" fill="hsl(25, 95%, 53%)" radius={[6, 6, 0, 0]} />
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>

        <div className="lg:col-span-2 rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm flex flex-col justify-center">
           <h3 className="text-xl font-bold text-white mb-8 text-center">Logistics Distribution</h3>
           <div className="h-[250px]">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie data={[
                   { name: "Delivered", value: stats?.delivered || 0 },
                   { name: "In Transit", value: stats?.in_transit || 0 },
                   { name: "Processing", value: stats?.processing || 0 }
                 ]} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={8} dataKey="value">
                   <Cell fill="#10b981" />
                   <Cell fill="#6366f1" />
                   <Cell fill="#f59e0b" />
                 </Pie>
                 <Tooltip contentStyle={{backgroundColor: "#0a0a14", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px"}} />
               </PieChart>
             </ResponsiveContainer>
           </div>
           <div className="flex justify-center gap-6 mt-6">
              <div className="flex flex-col items-center"><span className="text-xs text-white/30 mb-1">Delivered</span><div className="h-2 w-10 rounded-full bg-emerald-500" /></div>
              <div className="flex flex-col items-center"><span className="text-xs text-white/30 mb-1">Transit</span><div className="h-2 w-10 rounded-full bg-indigo-500" /></div>
              <div className="flex flex-col items-center"><span className="text-xs text-white/30 mb-1">Pending</span><div className="h-2 w-10 rounded-full bg-amber-500" /></div>
           </div>
        </div>
      </div>
    </div>
  );

  const renderStaffView = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
       <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black text-white">Staff Management</h2>
            <p className="text-white/40">Manage system operators and field agents.</p>
          </div>
          <Button className="bg-violet-600 text-white font-bold"><UserPlus className="mr-2 h-4 w-4" /> Add Operator</Button>
       </div>
       
       <div className="grid gap-6 md:grid-cols-3">
          {[
            { name: "Rahul Sharma", role: "Hub Manager", status: "Active", shift: "Morning" },
            { name: "Priya Patel", role: "Route Optimizer", status: "Active", shift: "Morning" },
            { name: "Amit Kumar", role: "System Admin", status: "Busy", shift: "Night" }
          ].map(s => (
            <div key={s.name} className="p-6 rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-sm">
               <div className="flex justify-between items-start mb-6">
                  <div className="h-12 w-12 rounded-2xl bg-violet-500/20 flex items-center justify-center text-violet-400">
                     <Users className="h-6 w-6" />
                  </div>
                  <span className="text-[10px] font-bold uppercase px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{s.status}</span>
               </div>
               <h4 className="text-lg font-bold text-white mb-1">{s.name}</h4>
               <p className="text-sm text-white/40 mb-4">{s.role}</p>
               <div className="flex items-center gap-2 text-xs text-white/30 pt-4 border-t border-white/5">
                  <Calendar className="h-3.5 w-3.5" /> Shift: {s.shift}
               </div>
            </div>
          ))}
       </div>
    </motion.div>
  );

  const renderParcelsView = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
       <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black text-white">Global Inventory</h2>
            <p className="text-white/40">Consolidated view of every parcel in the AIPOSTAL network.</p>
          </div>
          <div className="flex gap-2">
             <Input placeholder="Search global shipments..." className="w-64 bg-white/5 border-white/10" />
             <Button variant="outline" onClick={fetchParcels} className="border-white/10"><Clock className="h-4 w-4 mr-2" /> Refresh</Button>
          </div>
       </div>

       {isLoading ? (
          <div className="flex flex-col items-center justify-center p-20 text-white/40">
             <Loader2 className="h-10 w-10 animate-spin mb-4" />
             <p>Accessing global parcel ledger...</p>
          </div>
       ) : (
          <div className="rounded-[2rem] border border-white/10 bg-white/5 overflow-hidden backdrop-blur-xl">
             <div className="grid grid-cols-6 bg-white/5 px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">
                <span>Tracking ID</span>
                <span>Sender</span>
                <span>Receiver</span>
                <span>Route</span>
                <span>Status</span>
                <span className="text-right">Weight</span>
             </div>
             <div className="divide-y divide-white/5">
                {parcels.length > 0 ? parcels.map(p => (
                  <div key={p.id} className="grid grid-cols-6 px-8 py-6 items-center hover:bg-white/[0.03] transition-colors border-l-2 border-transparent hover:border-orange-500">
                     <div className="flex flex-col">
                        <span className="font-black text-white">{p.tracking_number}</span>
                        <span className="text-[10px] text-white/30 font-bold">{new Date(p.created_at).toLocaleDateString()}</span>
                     </div>
                     <span className="text-sm font-medium text-white/70">{p.sender_name}</span>
                     <span className="text-sm font-medium text-white/70">{p.receiver_name}</span>
                     <div className="flex items-center gap-2 text-xs text-blue-400 font-bold">
                        {p.origin_city} <ArrowUpRight className="h-3 w-3" /> {p.destination_city}
                     </div>
                     <span>
                        <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${
                          p.status === "Delivered" ? "bg-emerald-500/20 text-emerald-400" :
                          p.status === "In Transit" ? "bg-blue-500/20 text-blue-400" : "bg-amber-500/20 text-amber-400"
                        }`}>
                          {p.status}
                        </span>
                     </span>
                     <span className="text-right font-mono font-bold text-white/50">{p.weight} kg</span>
                  </div>
                )) : (
                  <div className="p-20 text-center text-white/20 font-bold">No global shipment records found.</div>
                )}
             </div>
          </div>
       )}
    </motion.div>
  );

  return (
    <DashboardLayout role="admin">
      <AnimatePresence mode="wait">
        {activeView === "dashboard" && renderDashboardView()}
        {activeView === "staff" && renderStaffView()}
        {activeView === "anomalies" && (
           <div className="flex flex-col items-center justify-center h-[60vh] text-white/30 text-center">
             <ShieldAlert className="h-20 w-20 mb-6 opacity-10" />
             <h2 className="text-3xl font-black text-white/50 mb-2">Anomaly Detection AI</h2>
             <p className="max-w-md">Scanning global routes for stuck parcels, route loops, and hub overloads. No critical anomalies detected in the last 24 hours.</p>
           </div>
        )}
        {activeView === "parcels" && renderParcelsView()}
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default AdminDashboard;
