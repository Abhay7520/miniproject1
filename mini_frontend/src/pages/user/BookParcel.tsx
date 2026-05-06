import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Package, MapPin, ArrowRight, ArrowLeft, CheckCircle, Brain, Sparkles, Weight, FileText, Zap, Building2, User, Phone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";


const steps = ["Address", "Parcel Details", "Review"];

const BookParcel = () => {
  const [step, setStep] = useState(1);
  const [aiValidated, setAiValidated] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const navigate = useNavigate();

  // State to hold all form data
  const [formData, setFormData] = useState({
    senderName: "",
    senderPhone: "",
    originCity: "",
    receiverName: "",
    receiverPhone: "",
    destinationCity: "",
    weight: 2.5,
    description: "",
    type: "standard"
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleValidate = () => {
    if (!formData.senderName || !formData.originCity || !formData.receiverName || !formData.destinationCity) {
      alert("Please fill in all names and cities before validating.");
      return;
    }
    setIsValidating(true);
    setTimeout(() => {
      setIsValidating(false);
      setAiValidated(true);
    }, 1400);
  };

  const handleContinueToPayment = () => {
    navigate("/user/payment", { state: { parcelDetails: formData } });
  };

  return (
    <DashboardLayout role="user">
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/8 px-3 py-1 text-xs font-semibold text-orange-400 mb-3">
          <Package className="h-3 w-3" /> New Shipment
        </div>
        <h1 className="text-4xl font-black tracking-tight text-white">Book a Parcel</h1>
        <p className="mt-1.5 text-white/40">AI-powered address validation and smart routing</p>
      </div>

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

      <div className="max-w-2xl">
        <div className="relative rounded-2xl border border-white/[0.07] bg-white/[0.03] backdrop-blur-md overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />

          <div className="p-8">
            <AnimatePresence mode="wait">

              {/* ── STEP 1: Address ── */}
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }} className="space-y-6">
                  
                  {/* Sender Section */}
                  <div className="space-y-4">
                    <h3 className="text-orange-400 text-sm font-bold uppercase tracking-widest border-b border-white/10 pb-2">Sender Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs text-white/60">Full Name</Label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                          <Input name="senderName" value={formData.senderName} onChange={handleChange} className="pl-10 bg-white/5 border-white/10 text-white h-11 rounded-xl" placeholder="John Doe" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-white/60">Phone Number</Label>
                        <div className="relative">
                          <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                          <Input name="senderPhone" value={formData.senderPhone} onChange={handleChange} className="pl-10 bg-white/5 border-white/10 text-white h-11 rounded-xl" placeholder="+91 9876543210" />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-white/60">Origin City</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-400/60" />
                        <Input name="originCity" value={formData.originCity} onChange={handleChange} className="pl-10 bg-white/5 border-white/10 text-white h-11 rounded-xl" placeholder="e.g. Pune" />
                      </div>
                    </div>
                  </div>

                  {/* Receiver Section */}
                  <div className="space-y-4 pt-4">
                    <h3 className="text-violet-400 text-sm font-bold uppercase tracking-widest border-b border-white/10 pb-2">Receiver Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs text-white/60">Full Name</Label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                          <Input name="receiverName" value={formData.receiverName} onChange={handleChange} className="pl-10 bg-white/5 border-white/10 text-white h-11 rounded-xl" placeholder="Jane Smith" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-white/60">Phone Number</Label>
                        <div className="relative">
                          <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                          <Input name="receiverPhone" value={formData.receiverPhone} onChange={handleChange} className="pl-10 bg-white/5 border-white/10 text-white h-11 rounded-xl" placeholder="+91 9123456789" />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-white/60">Destination City</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-violet-400/60" />
                        <Input name="destinationCity" value={formData.destinationCity} onChange={handleChange} className="pl-10 bg-white/5 border-white/10 text-white h-11 rounded-xl" placeholder="e.g. Delhi" />
                      </div>
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    {!aiValidated ? (
                      <motion.div key="validate-btn" exit={{ opacity: 0, scale: 0.95 }}>
                        <button
                          onClick={handleValidate}
                          disabled={isValidating}
                          className="group relative w-full overflow-hidden rounded-xl border border-orange-500/20 bg-orange-500/5 px-5 py-3.5 text-sm font-bold text-orange-400 hover:bg-orange-500/10 hover:border-orange-500/40 transition-all duration-300 flex items-center justify-center gap-2.5 mt-4"
                        >
                          {isValidating ? (
                            <>
                              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                                <Sparkles className="h-4 w-4" />
                              </motion.div>
                              <span>AI is analysing addresses…</span>
                            </>
                          ) : (
                            <>
                              <Brain className="h-4 w-4" /> Validate with AI
                            </>
                          )}
                        </button>
                      </motion.div>
                    ) : (
                      <motion.div key="validated" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-emerald-500/25 bg-emerald-500/8 p-4 mt-4">
                        <div className="flex items-center gap-2 mb-3">
                          <CheckCircle className="h-4 w-4 text-emerald-400" />
                          <span className="font-black text-emerald-400 text-sm">AI Validated Successfully</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="rounded-lg bg-white/5 px-3 py-2.5">
                            <p className="text-[10px] font-bold uppercase text-white/30">Origin Hub</p>
                            <p className="text-xs font-bold text-white">{formData.originCity} GPO</p>
                          </div>
                          <div className="rounded-lg bg-white/5 px-3 py-2.5">
                            <p className="text-[10px] font-bold uppercase text-white/30">Destination Hub</p>
                            <p className="text-xs font-bold text-white">{formData.destinationCity} GPO</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex justify-end pt-1 mt-4">
                    <Button onClick={() => setStep(2)} disabled={!aiValidated} className="bg-gradient-to-r from-orange-500 to-amber-400 text-white font-bold rounded-xl px-6">
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
                      <Label className="text-xs text-white/60">Weight (kg)</Label>
                      <div className="relative">
                        <Zap className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-400/50" />
                        <Input name="weight" type="number" value={formData.weight} onChange={handleChange} className="pl-10 bg-white/5 border-white/10 text-white rounded-xl h-11" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs text-white/60">Description</Label>
                    <div className="relative">
                      <FileText className="absolute left-3.5 top-3.5 h-4 w-4 text-white/30" />
                      <Textarea name="description" value={formData.description} onChange={handleChange} className="pl-10 min-h-[80px] bg-white/5 border-white/10 text-white rounded-xl" placeholder="Brief parcel description" />
                    </div>
                  </div>

                  <div className="flex justify-between pt-1 mt-6">
                    <Button variant="outline" onClick={() => setStep(1)} className="border-white/10 bg-white/5 text-white/60 rounded-xl px-5 gap-2">
                      <ArrowLeft className="h-4 w-4" /> Back
                    </Button>
                    <Button onClick={() => setStep(3)} className="bg-gradient-to-r from-orange-500 to-amber-400 text-white font-bold rounded-xl px-6">
                      Continue <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* ── STEP 3: Review ── */}
              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }} className="space-y-6">
                  <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] overflow-hidden">
                    <div className="px-5 py-3 border-b border-white/[0.06] flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-orange-400" />
                      <span className="text-xs font-black uppercase tracking-widest text-white/40">Shipment Summary</span>
                    </div>

                    <div className="p-5 space-y-0 divide-y divide-white/[0.05]">
                      <div className="flex items-center justify-between py-3.5">
                        <div className="flex items-center gap-2.5"><User className="h-3.5 w-3.5 text-white/40" /><span className="text-sm text-white/40">Sender</span></div>
                        <span className="text-sm font-bold text-white">{formData.senderName} ({formData.senderPhone})</span>
                      </div>
                      <div className="flex items-center justify-between py-3.5">
                        <div className="flex items-center gap-2.5"><MapPin className="h-3.5 w-3.5 text-orange-400" /><span className="text-sm text-white/40">From</span></div>
                        <span className="text-sm font-bold text-white">{formData.originCity}</span>
                      </div>
                      <div className="flex items-center justify-between py-3.5">
                        <div className="flex items-center gap-2.5"><User className="h-3.5 w-3.5 text-white/40" /><span className="text-sm text-white/40">Receiver</span></div>
                        <span className="text-sm font-bold text-white">{formData.receiverName} ({formData.receiverPhone})</span>
                      </div>
                      <div className="flex items-center justify-between py-3.5">
                        <div className="flex items-center gap-2.5"><MapPin className="h-3.5 w-3.5 text-violet-400" /><span className="text-sm text-white/40">To</span></div>
                        <span className="text-sm font-bold text-white">{formData.destinationCity}</span>
                      </div>
                      <div className="flex items-center justify-between py-3.5">
                        <div className="flex items-center gap-2.5"><Zap className="h-3.5 w-3.5 text-amber-400" /><span className="text-sm text-white/40">Weight</span></div>
                        <span className="text-sm font-bold text-white">{formData.weight} kg</span>
                      </div>
                    </div>

                    <div className="mx-5 mb-5 rounded-xl bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/15 px-5 py-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-white/30">Estimated Cost</p>
                      </div>
                      <div className="text-right">
                        <span className="text-3xl font-black text-orange-400">₹{Math.round(formData.weight * 50)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setStep(2)} className="border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white rounded-xl px-5 gap-2">
                      <ArrowLeft className="h-4 w-4" /> Back
                    </Button>
                    <Button onClick={handleContinueToPayment} className="bg-gradient-to-r from-orange-500 to-amber-400 text-white font-bold rounded-xl px-6 gap-2">
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