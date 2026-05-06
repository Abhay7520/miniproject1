import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Smartphone, Banknote, CheckCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { apiRequest } from "@/lib/api";
import { toast } from "sonner";

const methods = [
  { id: "upi", label: "UPI", icon: Smartphone, desc: "Pay via UPI ID" },
  { id: "card", label: "Credit Card", icon: CreditCard, desc: "Visa, Mastercard" },
  { id: "cod", label: "Cash on Delivery", icon: Banknote, desc: "Pay when delivered" },
];

const Payment = () => {
  const [selected, setSelected] = useState("upi");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const parcelDetails = location.state?.parcelDetails;

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const data = await apiRequest("/parcels/", {
        method: "POST",
        body: JSON.stringify({
          sender_name: parcelDetails?.senderName || "Unknown",
          sender_phone: parcelDetails?.senderPhone || "",
          receiver_name: parcelDetails?.receiverName || "Unknown",
          receiver_phone: parcelDetails?.receiverPhone || "",
          origin_city: parcelDetails?.originCity || "Unknown",
          destination_city: parcelDetails?.destinationCity || "Unknown",
          weight: parcelDetails?.weight || 1.0
        }),
      });

      toast.success("Parcel booked successfully!");
      navigate("/user/confirmation", { state: { trackingNumber: data.tracking_number } });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout role="user">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-white">Payment</h1>
        <p className="mt-1 text-white/50">Complete your booking</p>
      </div>

      <div className="grid max-w-3xl gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-6 backdrop-blur-sm">
            <h3 className="mb-4 font-display text-lg font-semibold text-white">Payment Method</h3>
            <div className="space-y-3">
              {methods.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelected(m.id)}
                  className={`flex w-full items-center gap-4 rounded-lg border p-4 text-left transition-all ${
                    selected === m.id ? "border-orange-500/50 bg-orange-500/10" : "border-white/[0.08] hover:border-white/20"
                  }`}
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${selected === m.id ? "bg-gradient-to-r from-orange-500 to-violet-600 text-white" : "bg-white/10 text-white/50"}`}>
                    <m.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-white">{m.label}</p>
                    <p className="text-xs text-white/40">{m.desc}</p>
                  </div>
                  {selected === m.id && <CheckCircle className="ml-auto h-5 w-5 text-orange-400" />}
                </button>
              ))}
            </div>

            <Button onClick={handlePay} disabled={isLoading} className="mt-6 w-full bg-gradient-to-r from-orange-500 to-violet-600 text-white hover:opacity-90">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (selected === "cod" ? "Confirm Booking" : `Pay ₹${Math.round((parcelDetails?.weight || 1.0) * 50)}`)}
            </Button>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-6 backdrop-blur-sm">
            <h3 className="mb-4 font-display text-lg font-semibold text-white">Order Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-white/50">From</span><span className="text-white">{parcelDetails?.originCity || "Unknown"}</span></div>
              <div className="flex justify-between"><span className="text-white/50">To</span><span className="text-white">{parcelDetails?.destinationCity || "Unknown"}</span></div>
              <div className="flex justify-between"><span className="text-white/50">Weight</span><span className="text-white">{parcelDetails?.weight || 1.0} kg</span></div>
              <div className="border-t border-white/[0.08] pt-3 flex justify-between font-semibold text-white">
                <span>Total</span><span className="text-orange-400">₹{Math.round((parcelDetails?.weight || 1.0) * 50)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Payment;
