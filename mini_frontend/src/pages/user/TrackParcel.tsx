import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Search,
  Package,
  CheckCircle,
  Truck,
  Building2,
  Clock,
  AlertTriangle
} from "lucide-react";
import { motion } from "framer-motion";

const TrackParcel = () => {
  const location = useLocation();
  const [trackingId, setTrackingId] = useState(location.state?.trackingId || "");
  const [tracked, setTracked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [parcelData, setParcelData] = useState<any>(null);
  const [aiData, setAiData] = useState<any>(null);

  const handleTrack = async (idToTrack?: string) => {
    const id = idToTrack || trackingId;
    if (!id.trim()) return;
    setIsLoading(true);
    setError("");
    setTracked(false);
    setParcelData(null);
    setAiData(null);

    try {
      // 1. Fetch real parcel data from DB
      const pRes = await fetch(`http://localhost:8000/parcels/${id}`);
      if (!pRes.ok) throw new Error("Parcel not found. Check your Tracking ID.");
      const pData = await pRes.json();

      // 2. Fetch AI ETA Prediction
      const etaRes = await fetch(`http://localhost:8000/ai/predict_eta?origin=${pData.origin_city}&destination=${pData.destination_city}&weight=${pData.weight}`);
      const etaData = await etaRes.json();

      // 3. Fetch AI Delay Risk
      const riskRes = await fetch(`http://localhost:8000/ai/delay_risk?tracking_number=${id}`);
      const riskData = await riskRes.json();

      setParcelData(pData);
      setAiData({ eta: etaData, risk: riskData });
      setTracked(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (location.state?.trackingId) {
      handleTrack(location.state.trackingId);
    }
  }, [location.state?.trackingId]);

  // Generate dynamic milestones based on status
  const getMilestones = (status: string, eta: string) => {
    const formattedDate = new Date(eta).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
    
    return [
      { label: "Order Placed", time: "Completed", done: true, icon: Package },
      { label: "Processing at Hub", time: "Completed", done: status !== "Processing", icon: Building2 },
      { label: "In Transit", time: status === "In Transit" ? "Current" : (status === "Delivered" ? "Completed" : "Pending"), done: status === "Delivered" || status === "In Transit", icon: Truck },
      { label: "Delivered", time: `Predicted ETA: ${formattedDate}`, done: status === "Delivered", icon: CheckCircle, predicted: true },
    ];
  };

  return (
    <DashboardLayout role="user">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Track Parcel</h1>
        <p className="mt-1 text-white/50">Real-time AI-powered tracking from database</p>
      </div>

      <div className="mb-6 flex max-w-lg gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          <Input
            value={trackingId}
            onChange={(e) => setTrackingId(e.target.value)}
            placeholder="Enter Tracking ID (e.g. AP-XXXXXX)"
            className="pl-10 border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:scale-[1.02] transition-transform"
          />
        </div>
        <Button
          onClick={() => handleTrack()}
          disabled={isLoading}
          className="bg-gradient-to-r from-orange-500 to-violet-600 text-white disabled:opacity-50"
        >
          {isLoading ? "Loading..." : "Track"}
        </Button>
      </div>

      {error && <p className="text-red-400 mb-6">{error}</p>}

      {tracked && parcelData && aiData && (
        <>
          <div className="mb-6 rounded-2xl border border-white/10 bg-gradient-to-r from-orange-500/10 via-violet-500/10 to-transparent p-5 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/40">Current Status</p>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  {parcelData.status === "Delivered" ? <CheckCircle className="h-5 w-5 text-emerald-400" /> : <Truck className="h-5 w-5 text-orange-400" />}
                  {parcelData.status}
                </h2>
                <p className="text-xs text-white/50 mt-1">
                  Estimated Delivery: {new Date(aiData.eta.predicted_eta).toLocaleString()}
                </p>
              </div>

              <div className="text-right">
                <p className="text-xs text-white/40">Progress</p>
                <p className="text-lg font-bold text-orange-400">
                  {parcelData.status === "Processing" ? "25%" : parcelData.status === "In Transit" ? "65%" : "100%"}
                </p>
              </div>
            </div>

            <div className="mt-4 h-2 w-full rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-violet-500 transition-all duration-1000"
                style={{ width: parcelData.status === "Processing" ? "25%" : parcelData.status === "In Transit" ? "65%" : "100%" }}
              />
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid max-w-5xl gap-6 lg:grid-cols-3"
          >
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-6 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-white">Parcel Info</h3>

              <div className="mt-4 space-y-3 text-sm">
                <div>
                  <span className="text-white/40">Tracking ID</span>
                  <p className="font-medium text-orange-400">{parcelData.tracking_number}</p>
                </div>
                <div>
                  <span className="text-white/40">From</span>
                  <p className="text-white/80">{parcelData.sender_name} - {parcelData.origin_city}</p>
                </div>
                <div>
                  <span className="text-white/40">To</span>
                  <p className="text-white/80">{parcelData.receiver_name} - {parcelData.destination_city}</p>
                </div>
                <div>
                  <span className="text-white/40">Weight</span>
                  <p className="text-white/80">{parcelData.weight} kg</p>
                </div>
              </div>

              {/* AI INSIGHTS FROM BACKEND */}
              <div className="mt-5 rounded-xl border border-violet-500/30 bg-violet-500/10 p-4">
                <p className="text-sm font-semibold text-violet-400 flex items-center gap-2">
                  🧠 AI Insights
                </p>

                <ul className="mt-2 text-xs text-white/60 space-y-2">
                  <li className="flex items-start gap-1">
                    <span className="text-violet-400">•</span>
                    Confidence Score: {aiData.eta.confidence_score * 100}%
                  </li>
                  <li className="flex items-start gap-1">
                    <span className="text-violet-400">•</span>
                    Risk Level: <span className={aiData.risk.risk_level === "High" ? "text-red-400 font-bold" : aiData.risk.risk_level === "Medium" ? "text-orange-400" : "text-emerald-400"}>{aiData.risk.risk_level}</span>
                  </li>
                  {aiData.risk.reason && (
                    <li className="flex items-start gap-1 text-red-400/80">
                      <AlertTriangle className="h-3 w-3 mt-0.5" />
                      {aiData.risk.reason}
                    </li>
                  )}
                </ul>
              </div>
            </div>

            <div className="lg:col-span-2 rounded-xl border border-white/[0.08] bg-white/[0.04] p-6 backdrop-blur-sm">
              <h3 className="mb-6 text-lg font-semibold text-white">
                Tracking Timeline
              </h3>

              {getMilestones(parcelData.status, aiData.eta.predicted_eta).map((m, i, arr) => {
                const isCurrent = !m.done && (i === 0 || arr[i - 1].done);

                return (
                  <div key={m.label} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-full
                        ${m.done
                            ? "bg-emerald-500 text-white"
                            : isCurrent
                              ? "bg-orange-500 text-white animate-pulse"
                              : m.predicted
                                ? "border-2 border-dashed border-white/20 bg-white/5 text-white/40"
                                : "bg-white/10 text-white/40"
                          }`}
                      >
                        <m.icon className="h-4 w-4" />
                      </div>

                      {i < arr.length - 1 && (
                        <div
                          className={`my-1 h-10 w-0.5 ${m.done
                              ? "bg-emerald-500"
                              : isCurrent
                                ? "bg-gradient-to-b from-orange-500 to-white/10"
                                : "bg-white/10"
                            }`}
                        />
                      )}
                    </div>

                    <div className="pb-6">
                      <p
                        className={`text-sm font-medium ${m.done
                            ? "text-white"
                            : isCurrent
                              ? "text-orange-400"
                              : "text-white/50"
                          }`}
                      >
                        {m.label}
                        {m.predicted && (
                          <span className="ml-2 text-xs text-violet-400">
                            (AI Predicted)
                          </span>
                        )}
                      </p>

                      <p className="flex items-center gap-1 text-xs text-white/40">
                        <Clock className="h-3 w-3" /> {m.time}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </DashboardLayout>
  );
};

export default TrackParcel;