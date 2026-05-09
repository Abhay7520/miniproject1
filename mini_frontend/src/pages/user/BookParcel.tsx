import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Package,
  MapPin,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Brain,
  Sparkles,
  FileText,
  Zap,
  User,
  Phone,
  Building2,
  Search,
  Loader2,
} from "lucide-react";
import { apiRequest } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

// ─── Constants ────────────────────────────────────────────────────────────────

const STEPS = ["Address", "Parcel Details", "Review"] as const;

const RATE_PER_KG = 50; // ₹ per kg

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormData {
  senderName: string;
  senderPhone: string;
  originCity: string;
  receiverName: string;
  receiverPhone: string;
  destinationCity: string;
  weight: number;
  description: string;
  type: "standard" | "express" | "fragile";
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Animated step indicator strip */
const StepIndicator = ({ step }: { step: number }) => (
  <div className="mb-10 flex items-center gap-0">
    {STEPS.map((s, i) => {
      const state =
        step > i + 1 ? "done" : step === i + 1 ? "active" : "pending";
      return (
        <div key={s} className="flex items-center">
          <motion.div
            animate={state === "active" ? { scale: [1, 1.08, 1] } : {}}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="flex flex-col items-center gap-1.5"
          >
            <div
              className={`relative flex h-10 w-10 items-center justify-center rounded-full text-sm font-black transition-all duration-500 ${state === "done"
                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                : state === "active"
                  ? "bg-gradient-to-br from-orange-500 to-amber-400 text-white shadow-lg shadow-orange-500/40"
                  : "bg-white/8 text-white/30 border border-white/10"
                }`}
            >
              {state === "done" ? <CheckCircle className="h-5 w-5" /> : i + 1}
              {state === "active" && (
                <span className="absolute inset-0 rounded-full animate-ping bg-orange-500/20" />
              )}
            </div>
            <span
              className={`text-xs font-semibold tracking-wide ${state === "active"
                ? "text-orange-400"
                : state === "done"
                  ? "text-emerald-400"
                  : "text-white/25"
                }`}
            >
              {s}
            </span>
          </motion.div>

          {i < STEPS.length - 1 && (
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
);

/** Reusable labelled input with left icon */
const IconInput = ({
  icon: Icon,
  iconColor = "text-white/30",
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  icon: React.ElementType;
  iconColor?: string;
  label: string;
  name: string;
  value: string | number;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  placeholder?: string;
  type?: string;
}) => (
  <div className="space-y-1.5">
    <Label className="text-xs text-white/60">{label}</Label>
    <div className="relative">
      <Icon
        className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 ${iconColor}`}
      />
      <Input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="pl-10 bg-white/5 border-white/10 text-white h-11 rounded-xl focus:border-orange-500/40 focus:ring-0 transition-colors"
      />
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const BookParcel = () => {
  const [step, setStep] = useState(1);
  const [aiValidated, setAiValidated] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [originOffices, setOriginOffices] = useState<any[]>([]);
  const [destOffices, setDestOffices] = useState<any[]>([]);
  const [isSearchingOrigin, setIsSearchingOrigin] = useState(false);
  const [isSearchingDest, setIsSearchingDest] = useState(false);
  const [showOriginDropdown, setShowOriginDropdown] = useState(false);
  const [showDestDropdown, setShowDestDropdown] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".relative")) {
        setShowOriginDropdown(false);
        setShowDestDropdown(false);
      }
    };
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  const [formData, setFormData] = useState<FormData>({
    senderName: "",
    senderPhone: "",
    originCity: "",
    receiverName: "",
    receiverPhone: "",
    destinationCity: "",
    weight: 2.5,
    description: "",
    type: "standard",
  });

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (name === "originCity") {
      setShowOriginDropdown(true);
      fetchPostOffices(value, setOriginOffices, setIsSearchingOrigin);
    } else if (name === "destinationCity") {
      setShowDestDropdown(true);
      fetchPostOffices(value, setDestOffices, setIsSearchingDest);
    }
  };

  const fetchPostOffices = async (query: string, setResults: any, setLoading: any) => {
    if (query.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const data = await apiRequest(`/post-offices?search=${query}`);
      setResults(data);
    } catch (error) {
      console.error("Failed to fetch post offices:", error);
    } finally {
      setLoading(false);
    }
  };

  const selectPostOffice = (name: string, type: "origin" | "dest", officeName: string) => {
    if (type === "origin") {
      setFormData({ ...formData, originCity: officeName });
      setShowOriginDropdown(false);
    } else {
      setFormData({ ...formData, destinationCity: officeName });
      setShowDestDropdown(false);
    }
  };

  const handleValidate = () => {
    const { senderName, originCity, receiverName, destinationCity } = formData;
    if (!senderName || !originCity || !receiverName || !destinationCity) {
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

  const estimatedCost = Math.round(formData.weight * RATE_PER_KG);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <DashboardLayout role="user">
      {/* Page header */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/8 px-3 py-1 text-xs font-semibold text-orange-400 mb-3">
          <Package className="h-3 w-3" /> New Shipment
        </div>
        <h1 className="text-4xl font-black tracking-tight text-white">
          Book a Parcel
        </h1>
        <p className="mt-1.5 text-white/40">
          AI-powered address validation and smart routing
        </p>
      </div>

      {/* Step indicator */}
      <StepIndicator step={step} />

      {/* Form card */}
      <div className="max-w-2xl">
        <div className="relative rounded-2xl border border-white/[0.07] bg-white/[0.03] backdrop-blur-md overflow-hidden">
          {/* Top accent line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />

          <div className="p-8">
            <AnimatePresence mode="wait">

              {/* ── STEP 1: Address ───────────────────────────────────────── */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="space-y-6"
                >
                  {/* Sender */}
                  <div className="space-y-4">
                    <h3 className="text-orange-400 text-sm font-bold uppercase tracking-widest border-b border-white/10 pb-2">
                      Sender Details
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <IconInput
                        icon={User}
                        label="Full Name"
                        name="senderName"
                        value={formData.senderName}
                        onChange={handleChange}
                        placeholder="John Doe"
                      />
                      <IconInput
                        icon={Phone}
                        label="Phone Number"
                        name="senderPhone"
                        value={formData.senderPhone}
                        onChange={handleChange}
                        placeholder="+91 9876543210"
                      />
                    </div>
                    <div className="relative">
                      <IconInput
                        icon={MapPin}
                        iconColor="text-orange-400/60"
                        label="Origin City"
                        name="originCity"
                        value={formData.originCity}
                        onChange={handleChange}
                        placeholder="e.g. Pune"
                      />
                      {showOriginDropdown && (originOffices.length > 0 || isSearchingOrigin) && (
                        <div className="absolute z-50 mt-1 w-full rounded-xl border border-white/10 bg-black/90 backdrop-blur-xl p-1 shadow-2xl">
                          {isSearchingOrigin ? (
                            <div className="flex items-center justify-center p-4">
                              <Loader2 className="h-4 w-4 animate-spin text-orange-400" />
                            </div>
                          ) : (
                            originOffices.map((office) => (
                              <button
                                key={office.id}
                                onClick={() => selectPostOffice(office.name, "origin", office.city)}
                                className="flex w-full flex-col items-start rounded-lg px-3 py-2 text-left hover:bg-white/5 transition-colors"
                              >
                                <span className="text-sm font-bold text-white">{office.name}</span>
                                <span className="text-xs text-white/40">{office.city}</span>
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Receiver */}
                  <div className="space-y-4 pt-4">
                    <h3 className="text-violet-400 text-sm font-bold uppercase tracking-widest border-b border-white/10 pb-2">
                      Receiver Details
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <IconInput
                        icon={User}
                        label="Full Name"
                        name="receiverName"
                        value={formData.receiverName}
                        onChange={handleChange}
                        placeholder="Jane Smith"
                      />
                      <IconInput
                        icon={Phone}
                        label="Phone Number"
                        name="receiverPhone"
                        value={formData.receiverPhone}
                        onChange={handleChange}
                        placeholder="+91 9123456789"
                      />
                    </div>
                    <div className="relative">
                      <IconInput
                        icon={MapPin}
                        iconColor="text-violet-400/60"
                        label="Destination City"
                        name="destinationCity"
                        value={formData.destinationCity}
                        onChange={handleChange}
                        placeholder="e.g. Delhi"
                      />
                      {showDestDropdown && (destOffices.length > 0 || isSearchingDest) && (
                        <div className="absolute z-50 mt-1 w-full rounded-xl border border-white/10 bg-black/90 backdrop-blur-xl p-1 shadow-2xl">
                          {isSearchingDest ? (
                            <div className="flex items-center justify-center p-4">
                              <Loader2 className="h-4 w-4 animate-spin text-violet-400" />
                            </div>
                          ) : (
                            destOffices.map((office) => (
                              <button
                                key={office.id}
                                onClick={() => selectPostOffice(office.name, "dest", office.city)}
                                className="flex w-full flex-col items-start rounded-lg px-3 py-2 text-left hover:bg-white/5 transition-colors"
                              >
                                <span className="text-sm font-bold text-white">{office.name}</span>
                                <span className="text-xs text-white/40">{office.city}</span>
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* AI Validation */}
                  <AnimatePresence mode="wait">
                    {!aiValidated ? (
                      <motion.div
                        key="validate-btn"
                        exit={{ opacity: 0, scale: 0.95 }}
                      >
                        <button
                          onClick={handleValidate}
                          disabled={isValidating}
                          className="group relative w-full overflow-hidden rounded-xl border border-orange-500/20 bg-orange-500/5 px-5 py-3.5 text-sm font-bold text-orange-400 hover:bg-orange-500/10 hover:border-orange-500/40 transition-all duration-300 flex items-center justify-center gap-2.5 mt-4 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {isValidating ? (
                            <>
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{
                                  duration: 1,
                                  repeat: Infinity,
                                  ease: "linear",
                                }}
                              >
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
                      <motion.div
                        key="validated"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-xl border border-emerald-500/25 bg-emerald-500/8 p-4 mt-4"
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <CheckCircle className="h-4 w-4 text-emerald-400" />
                          <span className="font-black text-emerald-400 text-sm">
                            AI Validated Successfully
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="rounded-lg bg-white/5 px-3 py-2.5">
                            <p className="text-[10px] font-bold uppercase text-white/30">
                              Origin Hub
                            </p>
                            <p className="text-xs font-bold text-white">
                              {formData.originCity} GPO
                            </p>
                          </div>
                          <div className="rounded-lg bg-white/5 px-3 py-2.5">
                            <p className="text-[10px] font-bold uppercase text-white/30">
                              Destination Hub
                            </p>
                            <p className="text-xs font-bold text-white">
                              {formData.destinationCity} GPO
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex justify-end pt-1 mt-4">
                    <Button
                      onClick={() => setStep(2)}
                      disabled={!aiValidated}
                      className="bg-gradient-to-r from-orange-500 to-amber-400 text-white font-bold rounded-xl px-6 disabled:opacity-40"
                    >
                      Continue <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* ── STEP 2: Parcel Details ────────────────────────────────── */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="space-y-5"
                >
                  {/* Weight */}
                  <div className="grid gap-5 sm:grid-cols-2">
                    <IconInput
                      icon={Zap}
                      iconColor="text-orange-400/50"
                      label="Weight (kg)"
                      name="weight"
                      type="number"
                      value={formData.weight}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-white/60">Description</Label>
                    <div className="relative">
                      <FileText className="absolute left-3.5 top-3.5 h-4 w-4 text-white/30" />
                      <Textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="pl-10 min-h-[80px] bg-white/5 border-white/10 text-white rounded-xl focus:border-orange-500/40 focus:ring-0 transition-colors resize-none"
                        placeholder="Brief parcel description"
                      />
                    </div>
                  </div>

                  {/* Live cost preview */}
                  <div className="rounded-xl bg-gradient-to-r from-orange-500/8 to-amber-500/8 border border-orange-500/12 px-5 py-3.5 flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-widest text-white/30">
                      Estimated Cost
                    </p>
                    <span className="text-2xl font-black text-orange-400">
                      ₹{estimatedCost}
                    </span>
                  </div>

                  <div className="flex justify-between pt-1 mt-2">
                    <Button
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="border-white/10 bg-white/5 text-white/60 rounded-xl px-5 gap-2 hover:bg-white/10 hover:text-white"
                    >
                      <ArrowLeft className="h-4 w-4" /> Back
                    </Button>
                    <Button
                      onClick={() => setStep(3)}
                      className="bg-gradient-to-r from-orange-500 to-amber-400 text-white font-bold rounded-xl px-6"
                    >
                      Continue <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* ── STEP 3: Review ────────────────────────────────────────── */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="space-y-6"
                >
                  <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] overflow-hidden">
                    {/* Card header */}
                    <div className="px-5 py-3 border-b border-white/[0.06] flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-orange-400" />
                      <span className="text-xs font-black uppercase tracking-widest text-white/40">
                        Shipment Summary
                      </span>
                    </div>

                    {/* Summary rows */}
                    <div className="p-5 divide-y divide-white/[0.05]">
                      {[
                        {
                          icon: <User className="h-3.5 w-3.5 text-white/40" />,
                          label: "Sender",
                          value: `${formData.senderName} (${formData.senderPhone})`,
                        },
                        {
                          icon: (
                            <MapPin className="h-3.5 w-3.5 text-orange-400" />
                          ),
                          label: "From",
                          value: formData.originCity,
                        },
                        {
                          icon: <User className="h-3.5 w-3.5 text-white/40" />,
                          label: "Receiver",
                          value: `${formData.receiverName} (${formData.receiverPhone})`,
                        },
                        {
                          icon: (
                            <MapPin className="h-3.5 w-3.5 text-violet-400" />
                          ),
                          label: "To",
                          value: formData.destinationCity,
                        },
                        {
                          icon: (
                            <Zap className="h-3.5 w-3.5 text-amber-400" />
                          ),
                          label: "Weight",
                          value: `${formData.weight} kg`,
                        },
                        ...(formData.description
                          ? [
                            {
                              icon: (
                                <FileText className="h-3.5 w-3.5 text-white/40" />
                              ),
                              label: "Description",
                              value: formData.description,
                            },
                          ]
                          : []),
                      ].map(({ icon, label, value }) => (
                        <div
                          key={label}
                          className="flex items-center justify-between py-3.5"
                        >
                          <div className="flex items-center gap-2.5">
                            {icon}
                            <span className="text-sm text-white/40">
                              {label}
                            </span>
                          </div>
                          <span className="text-sm font-bold text-white max-w-[55%] text-right truncate">
                            {value}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Cost banner */}
                    <div className="mx-5 mb-5 rounded-xl bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/15 px-5 py-4 flex items-center justify-between">
                      <p className="text-xs font-bold uppercase tracking-widest text-white/30">
                        Estimated Cost
                      </p>
                      <span className="text-3xl font-black text-orange-400">
                        ₹{estimatedCost}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      onClick={() => setStep(2)}
                      className="border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white rounded-xl px-5 gap-2"
                    >
                      <ArrowLeft className="h-4 w-4" /> Back
                    </Button>
                    <Button
                      onClick={handleContinueToPayment}
                      className="bg-gradient-to-r from-orange-500 to-amber-400 text-white font-bold rounded-xl px-6 gap-2"
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