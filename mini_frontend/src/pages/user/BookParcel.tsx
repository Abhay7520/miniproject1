import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Package, MapPin, ArrowRight, ArrowLeft, CheckCircle, Brain, Sparkles, Weight, FileText, Zap, Building2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";


const steps = ["Address", "Parcel Details", "Review"];

const BookParcel = () => {
  const [step, setStep] = useState(1);
  const [aiValidated, setAiValidated] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const navigate = useNavigate();

  const handleValidate = () => {
    setIsValidating(true);
    setTimeout(() => {
      setIsValidating(false);
      setAiValidated(true);
    }, 1400);
  };

  return (
 
    <DashboardLayout role="user">
      {/* Page header */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/8 px-3 py-1 text-xs font-semibold text-orange-400 mb-3">
          <Package className="h-3 w-3" /> New Shipment
        </div>
        <h1 className="text-4xl font-black tracking-tight text-white">Book a Parcel</h1>
        <p className="mt-1.5 text-white/40">AI-powered address validation and smart routing</p>
      </div>

      {/* Step indicator */}
      <div className="mb-10 flex items-center gap-0">
        {steps.map((s, i) => {
          const state = step > i + 1 ? "done" : step === i + 1 ? "active" : "pending";
          return (
            <div key={s} className="flex items-center">
              <motion.div
                animate={state === "active" ? { scale: [1, 1.08, 1] } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="flex flex-col items-center gap-1.5"
              >
                <div className={`relative flex h-10 w-10 items-center justify-center rounded-full text-sm font-black transition-all duration-500 ${state === "done"
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                  : state === "active"
                    ? "bg-gradient-to-br from-orange-500 to-amber-400 text-white shadow-lg shadow-orange-500/40"
                    : "bg-white/8 text-white/30 border border-white/10"
                  }`}>
                  {state === "done" ? <CheckCircle className="h-5 w-5" /> : i + 1}
                  {state === "active" && (
                    <span className="absolute inset-0 rounded-full animate-ping bg-orange-500/20" />
                  )}
                </div>
                <span className={`text-xs font-semibold tracking-wide ${state === "active" ? "text-orange-400" : state === "done" ? "text-emerald-400" : "text-white/25"
                  }`}>{s}</span>
              </motion.div>
              {i < steps.length - 1 && (
                <div className="mx-3 mb-4 h-px w-16 relative overflow-hidden">
                  <div className="absolute inset-0 bg-white/8" />
                  {step > i + 1 && (
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 0.5 }}
                      className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-emerald-400"
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Card */}
      <div className="max-w-2xl">
        <div className="relative rounded-2xl border border-white/[0.07] bg-white/[0.03] backdrop-blur-md overflow-hidden">
          {/* Top accent line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />

          <div className="p-8">
            <AnimatePresence mode="wait">

              {/* ── STEP 1: Address ── */}
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }} className="space-y-5">

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-widest text-white/40">Source Address</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-orange-400/60" />
                      <Textarea
                        placeholder="Enter full source address"
                        className="pl-10 min-h-[80px] border-white/10 bg-white/5 text-white placeholder:text-white/20 focus-visible:ring-1 focus-visible:ring-orange-500/50 focus-visible:border-orange-500/40 resize-none rounded-xl transition-all"
                        defaultValue="42, MG Road, Pune, Maharashtra 411001"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-widest text-white/40">Destination Address</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-violet-400/60" />
                      <Textarea
                        placeholder="Enter full destination address"
                        className="pl-10 min-h-[80px] border-white/10 bg-white/5 text-white placeholder:text-white/20 focus-visible:ring-1 focus-visible:ring-orange-500/50 focus-visible:border-orange-500/40 resize-none rounded-xl transition-all"
                        defaultValue="15, Connaught Place, New Delhi 110001"
                      />
                    </div>
                  </div>

                  {/* AI Validate */}
                  <AnimatePresence mode="wait">
                    {!aiValidated ? (
                      <motion.div key="validate-btn" exit={{ opacity: 0, scale: 0.95 }}>
                        <button
                          onClick={handleValidate}
                          disabled={isValidating}
                          className="group relative w-full overflow-hidden rounded-xl border border-orange-500/20 bg-orange-500/5 px-5 py-3.5 text-sm font-bold text-orange-400 hover:bg-orange-500/10 hover:border-orange-500/40 transition-all duration-300 flex items-center justify-center gap-2.5"
                        >
                          {isValidating ? (
                            <>
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              >
                                <Sparkles className="h-4 w-4" />
                              </motion.div>
                              <span>AI is analysing addresses…</span>
                              {/* shimmer */}
                              <motion.div
                                animate={{ x: ["-100%", "200%"] }}
                                transition={{ duration: 1.2, repeat: Infinity }}
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-400/10 to-transparent"
                              />
                            </>
                          ) : (
                            <>
                              <Brain className="h-4 w-4" />
                              Validate with AI
                            </>
                          )}
                        </button>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="validated"
                        initial={{ opacity: 0, y: 10, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className="rounded-xl border border-emerald-500/25 bg-emerald-500/8 p-4 space-y-3"
                      >
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/20">
                            <CheckCircle className="h-4 w-4 text-emerald-400" />
                          </div>
                          <span className="font-black text-emerald-400 text-sm">AI Validated Successfully</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { icon: Building2, label: "Origin Post Office", value: "Pune GPO (MH-PNQ-001)" },
                            { icon: Building2, label: "Destination Post Office", value: "New Delhi GPO (DL-NDL-001)" },
                          ].map((item) => (
                            <div key={item.label} className="rounded-lg bg-white/5 px-3 py-2.5">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1">{item.label}</p>
                              <p className="text-xs font-bold text-white">{item.value}</p>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex justify-end pt-1">
                    <Button
                      onClick={() => setStep(2)}
                      disabled={!aiValidated}
                      className="bg-gradient-to-r from-orange-500 to-amber-400 text-white font-bold shadow-lg shadow-orange-500/25 hover:opacity-90 hover:shadow-orange-500/40 transition-all rounded-xl px-6 disabled:opacity-30"
                    >
                      Continue <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* ── STEP 2: Parcel Details ── */}
              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }} className="space-y-5">

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold uppercase tracking-widest text-white/40">Weight (kg)</Label>
                      <div className="relative">
                        <Zap className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-400/50" />
                        <Input
                          type="number"
                          className="pl-10 border-white/10 bg-white/5 text-white placeholder:text-white/20 focus-visible:ring-1 focus-visible:ring-orange-500/50 focus-visible:border-orange-500/40 rounded-xl h-11"
                          defaultValue="2.5"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold uppercase tracking-widest text-white/40">Parcel Type</Label>
                      <Select defaultValue="standard">
                        <SelectTrigger className="border-white/10 bg-white/5 text-white rounded-xl h-11 focus:ring-1 focus:ring-orange-500/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="border-white/10 bg-[#111114] text-white rounded-xl">
                          {["standard", "express", "fragile"].map((v) => (
                            <SelectItem key={v} value={v} className="capitalize focus:bg-white/10 focus:text-white">
                              {v.charAt(0).toUpperCase() + v.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-widest text-white/40">Description</Label>
                    <div className="relative">
                      <FileText className="absolute left-3.5 top-3.5 h-4 w-4 text-white/30" />
                      <Textarea
                        className="pl-10 min-h-[80px] border-white/10 bg-white/5 text-white placeholder:text-white/20 focus-visible:ring-1 focus-visible:ring-orange-500/50 focus-visible:border-orange-500/40 resize-none rounded-xl"
                        placeholder="Brief parcel description"
                        defaultValue="Electronics - laptop charger"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between pt-1">
                    <Button variant="outline" onClick={() => setStep(1)} className="border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white rounded-xl px-5 gap-2">
                      <ArrowLeft className="h-4 w-4" /> Back
                    </Button>
                    <Button onClick={() => setStep(3)} className="bg-gradient-to-r from-orange-500 to-amber-400 text-white font-bold shadow-lg shadow-orange-500/25 hover:opacity-90 transition-all rounded-xl px-6">
                      Continue <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* ── STEP 3: Review ── */}
              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }} className="space-y-6">

                  {/* Summary card */}
                  <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] overflow-hidden">
                    <div className="px-5 py-3 border-b border-white/[0.06] flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-orange-400" />
                      <span className="text-xs font-black uppercase tracking-widest text-white/40">Shipment Summary</span>
                    </div>

                    <div className="p-5 space-y-0 divide-y divide-white/[0.05]">
                      {[
                        { label: "From", value: "42, MG Road, Pune", icon: MapPin, color: "text-orange-400" },
                        { label: "To", value: "15, Connaught Place, Delhi", icon: MapPin, color: "text-violet-400" },
                        { label: "Weight", value: "2.5 kg", icon: Zap, color: "text-amber-400" },
                        { label: "Type", value: "Standard", icon: Package, color: "text-blue-400" },
                      ].map((row) => (
                        <div key={row.label} className="flex items-center justify-between py-3.5">
                          <div className="flex items-center gap-2.5">
                            <row.icon className={`h-3.5 w-3.5 ${row.color}`} />
                            <span className="text-sm text-white/40">{row.label}</span>
                          </div>
                          <span className="text-sm font-bold text-white">{row.value}</span>
                        </div>
                      ))}
                    </div>

                    {/* Cost row */}
                    <div className="mx-5 mb-5 rounded-xl bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/15 px-5 py-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-white/30">Estimated Cost</p>
                        <p className="text-xs text-white/30 mt-0.5">Inclusive of taxes</p>
                      </div>
                      <div className="text-right">
                        <span className="text-3xl font-black text-orange-400">₹185</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setStep(2)} className="border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white rounded-xl px-5 gap-2">
                      <ArrowLeft className="h-4 w-4" /> Back
                    </Button>
                    <Button
                      onClick={() => navigate("/user/payment")}
                      className="bg-gradient-to-r from-orange-500 to-amber-400 text-white font-bold shadow-lg shadow-orange-500/30 hover:opacity-90 hover:shadow-orange-500/50 transition-all rounded-xl px-6 gap-2"
                    >
                      <Package className="h-4 w-4" /> Proceed to Payment
                    </Button>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};


export default BookParcel;