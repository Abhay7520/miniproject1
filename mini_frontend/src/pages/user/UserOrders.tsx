import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Link } from "react-router-dom";
import { MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/api";

const UserOrders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiRequest("/parcels/")
      .then(data => {
        setOrders(Array.isArray(data) ? data : []);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch parcels", err);
        setOrders([]);
        setIsLoading(false);
      });
  }, []);

  return (
    <DashboardLayout role="user">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-white">My Orders</h1>
        <p className="mt-1 text-white/50">All your real parcel bookings</p>
      </div>

      <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06] text-left text-xs uppercase tracking-wider text-white/40">
                <th className="px-5 py-3 font-medium">Tracking ID</th>
                <th className="px-5 py-3 font-medium">From</th>
                <th className="px-5 py-3 font-medium">To</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-white/50">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-orange-400" />
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-white/50">
                    No orders found.
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.tracking_number} className="border-b border-white/[0.06] last:border-0 hover:bg-white/[0.04]">
                    <td className="px-5 py-4 font-medium text-orange-400">{o.tracking_number}</td>
                    <td className="px-5 py-4 text-sm text-white/80">{o.origin_city}</td>
                    <td className="px-5 py-4 text-sm text-white/80">{o.destination_city}</td>
                    <td className="px-5 py-4 text-sm text-white/40">{new Date(o.created_at).toLocaleDateString()}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${o.status === "Delivered" ? "bg-emerald-500/10 text-emerald-400" :
                          o.status === "In Transit" ? "bg-blue-500/10 text-blue-400" :
                            "bg-amber-500/10 text-amber-400"
                        }`}>{o.status}</span>
                    </td>
                    <td className="px-5 py-4">
                      <Link to={`/user/track`} state={{ trackingId: o.tracking_number }}>
                        <Button variant="ghost" size="sm" className="text-white/60 hover:text-white hover:bg-white/[0.06]">
                          <MapPin className="mr-1 h-3 w-3" /> Track
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UserOrders;
