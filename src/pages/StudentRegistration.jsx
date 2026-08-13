import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Copy, IndianRupee } from "lucide-react";
import { payWithRazorpay } from "../utils/razorpay.js";
import { createRazorpayOrder, fetchCenters, fetchCoordinators, fetchDistricts, fetchTalukas, registerStudent } from "../services/backendService.js";

const initialForm = {
  name: "", mobile: "", gender: "", class: "", medium: "",
  schoolName: "", schoolAddress: "", village: "",
  district: "", taluka: "", examCenterId: "", coordinatorId: "",
};

export default function StudentRegistration() {
  const [form, setForm] = useState(initialForm);
  const [step, setStep] = useState("form"); // form | paying | saving | success
  const [error, setError] = useState("");
  const [registered, setRegistered] = useState(null);
  const [districts, setDistricts] = useState([]);
  const [talukas, setTalukas] = useState([]);
  const [centers, setCenters] = useState([]);
const [coordinators, setCoordinators] = useState([]);
  // const districtNames = useMemo(
  //   () => {
  //     if (districts.length) {
  //       return [...new Set(districts.map((item) => item.name || item.district || item.districtName))].sort();
  //     }
  //     return [...new Set(centers.map((c) => c.district))].sort();
  //   },
  //   [districts, centers]
  // );
  const districtNames = districts;
const talukaNames = talukas;
  // const talukaNames = useMemo(() => {
  //   if (!form.district) return [];
  //   if (talukas.length) {
  //     return [...new Set(
  //       talukas
  //         .filter((item) =>
  //           item.district === form.district || item.districtName === form.district || item.districtId === form.district
  //         )
  //         .map((item) => item.name || item.taluka || item.talukaName)
  //     )].sort();
  //   }
  //   return [...new Set(centers.filter((c) => c.district === form.district).map((c) => c.taluka))].sort();
  // }, [talukas, centers, form.district]);

  // const eligibleCenters = useMemo(
  //   () =>
  //     centers.filter(
  //       (c) => (!form.district || c.district === form.district) && (!form.taluka || c.taluka === form.taluka)
  //     ),
  //   [centers, form.district, form.taluka]
  // );
const eligibleCenters = centers;
  const eligibleCoordinators = useMemo(
    () => coordinators.filter((c) => c.centerId === form.examCenterId),
    [coordinators, form.examCenterId]
  );

  async function update(field, value) {

  if (field === "district") {

    setForm((prev) => ({
      ...prev,
      district: value,
      taluka: "",
      examCenterId: "",
      coordinatorId: "",
    }));

    setCenters([]);
    setTalukas([]);

    const talukaList = await fetchTalukas(value);
    setTalukas(talukaList);

    return;
  }

  if (field === "taluka") {

    setForm((prev) => ({
      ...prev,
      taluka: value,
      examCenterId: "",
      coordinatorId: "",
    }));

    setCenters([]);

    const centerList = await fetchCenters(value);
    setCenters(centerList);

    return;
  }

  setForm((prev) => ({
    ...prev,
    [field]: value,
  }));
}

  useEffect(() => {
    async function loadLookupData() {
      try {
        const [loadedDistricts, loadedTalukas, loadedCenters, loadedCoordinators] = await Promise.all([
          fetchDistricts(),
        
          fetchCoordinators(),
        ]);
        if (loadedDistricts?.length) setDistricts(loadedDistricts);
       
        if (loadedCoordinators?.length) setCoordinators(loadedCoordinators);
      } catch (err) {
        console.warn("Unable to load backend lookup data, using local fallbacks.", err);
      }
    }

    loadLookupData();
  }, []);

  async function saveToBackend(paymentId) {
    const payload = {
      name: form.name,
      mobile: form.mobile,
      gender: form.gender,
      studentClass: form.class,
      medium: form.medium,
      schoolName: form.schoolName,
      schoolAddress: form.schoolAddress,
      village: form.village,
      district: form.district,
      taluka: form.taluka,
      examCenterId: form.examCenterId,
      coordinatorId: form.coordinatorId,
      paymentId,
      amount: 250,
    };

    return await registerStudent(payload);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.examCenterId) return setError("Please select an Exam Center.");
    if (!form.coordinatorId) return setError("Please select a Co-ordinator allocated to your center.");

    setStep("paying");

    const order = await createRazorpayOrder(250);
    const orderId = order?.id || null;

    payWithRazorpay({
      amount: 250,
      name: form.name,
      contact: form.mobile,
      orderId,
      onSuccess: async (paymentId) => {
        setStep("saving");
        try {
          const saved = await saveToBackend(paymentId);
          setRegistered(saved);
          setStep("success");
        } catch (err) {
          setError(err.message || (err?.response?.data?.message) || "Payment succeeded but saving your registration failed. Please contact support with your payment ID: " + paymentId);
          setStep("form");
        }
      },
      onFailure: (msg) => {
        setError(msg || "Payment was not completed. Please try again.");
        setStep("form");
      },
    });
  }

  if (step === "success" && registered) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center py-8">
        <div className="container-app max-w-xl">
          <div className="card p-8 text-center border-t-4 border-gold">
            <CheckCircle2 className="text-green-600 mx-auto mb-4" size={48} />
            <h2 className="font-display font-bold text-navy text-2xl mb-2">You're Registered!</h2>
            <p className="text-muted mb-6">Save these credentials — you'll need them to log in and check your result.</p>
            <div className="bg-cream rounded-xl p-6 text-left space-y-3">
              <CredRow label="Student Name" value={registered.name} />
              <CredRow label="Roll Number" value={registered.rollNo} mono />
              <CredRow label="Login Password" value={registered.password} mono />
              <CredRow label="Payment ID" value={registered.paymentId} mono small />
              <CredRow label="Amount Paid" value={`₹${registered.amount}`} />
            </div>
            <Link to="/login" className="btn-primary w-full justify-center mt-8">Proceed to Student Login</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[90vh] flex items-start justify-center py-6 px-3 bg-cream/40">
      <div className="container-app max-w-4xl">
        <div className="text-center mb-4">
          <h1 className="font-display font-bold text-navy text-2xl md:text-3xl">Sankalp Scholarship Exam Registration</h1>
          <p className="text-muted text-sm mt-1">Fill in your details to book your exam center</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-4 md:p-6 space-y-3">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md p-2.5">{error}</div>
          )}

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Field label="Student Name">
              <input required className="input-field" value={form.name} onChange={(e) => update("name", e.target.value)} />
            </Field>
            <Field label="Mobile No.">
              <input required pattern="[0-9]{10}" title="10 digit mobile number" className="input-field" value={form.mobile} onChange={(e) => update("mobile", e.target.value)} />
            </Field>
            <Field label="Gender">
              <select required className="input-field" value={form.gender} onChange={(e) => update("gender", e.target.value)}>
                <option value="">Select</option>
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
            </Field>
            <Field label="Class">
              <select required className="input-field" value={form.class} onChange={(e) => update("class", e.target.value)}>
                <option value="">Select</option>
                {["5th","6th","7th","8th","9th","10th"].map((c) => <option key={c}>{c}</option>)}
              </select>
            </Field>

            <Field label="Medium">
              <select required className="input-field" value={form.medium} onChange={(e) => update("medium", e.target.value)}>
                <option value="">Select</option>
                <option>Marathi</option><option>Semi-English</option><option>English</option>
              </select>
            </Field>
            <Field label="School Name">
              <input required className="input-field" value={form.schoolName} onChange={(e) => update("schoolName", e.target.value)} />
            </Field>
            <Field label="School Address">
              <input required className="input-field" value={form.schoolAddress} onChange={(e) => update("schoolAddress", e.target.value)} />
            </Field>
            <Field label="Village">
              <input required className="input-field" value={form.village} onChange={(e) => update("village", e.target.value)} />
            </Field>

            <Field label="District">
              <select required className="input-field" value={form.district} onChange={(e) => update("district", e.target.value)}>
                <option value="">Select District</option>
                {districtNames.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </Field>
            <Field label="Taluka">
  <select
    required
    disabled={!form.district}
    className="input-field"
    value={form.taluka}
    onChange={(e) => update("taluka", e.target.value)}
  >
    <option value="">Select Taluka</option>

    {talukaNames.map((t) => (
      <option key={t.id} value={t.id}>
        {t.name}
      </option>
    ))}
  </select>
</Field>
            {/* <Field label="Taluka">
              <select required disabled={!form.district} className="input-field" value={form.taluka} onChange={(e) => update("taluka", e.target.value)}>
                <option value="">{form.district ? "Select Taluka" : "Select District First"}</option>
                {talukaNames.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field> */}
            <Field label="Exam Center">
  <select
    required
    disabled={!form.taluka}
    className="input-field"
    value={form.examCenterId}
    onChange={(e) => update("examCenterId", e.target.value)}
  >
    <option value="">Select Center</option>

    {eligibleCenters.map((c) => (
      <option key={c.id} value={c.id}>
        {c.centerName}
      </option>
    ))}
  </select>
</Field>
            {/* <Field label="Exam Center">
              <select required disabled={!form.taluka} className="input-field" value={form.examCenterId} onChange={(e) => update("examCenterId", e.target.value)}>
                <option value="">{form.taluka ? "Select Center" : "Select Taluka First"}</option>
                {eligibleCenters.map((c) => <option key={c.id} value={c.id}>{c.centerName || c.name || c.center}</option>)}
              </select>
              {form.taluka && eligibleCenters.length === 0 && (
                <p className="text-[10px] text-red-500 mt-0.5">No center in this taluka yet.</p>
              )}
            </Field> */}
            <Field label="Co-ordinator">
              <select required disabled={!form.examCenterId} className="input-field" value={form.coordinatorId} onChange={(e) => update("coordinatorId", e.target.value)}>
                <option value="">{form.examCenterId ? "Select Co-ordinator" : "Select Center First"}</option>
                {eligibleCoordinators.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {form.examCenterId && eligibleCoordinators.length === 0 && (
                <p className="text-[10px] text-red-500 mt-0.5">No coordinator allocated yet.</p>
              )}
            </Field>
          </div>

          <div className="pt-2 flex flex-col items-center gap-3">
            <div className="bg-cream rounded-lg px-6 py-3 flex items-center gap-2 border border-gold/30">
              <span className="text-sm text-muted">Registration Fee:</span>
              <span className="font-display font-bold text-navy text-lg flex items-center"><IndianRupee size={16} /> 250</span>
            </div>
            <button
              type="submit"
              disabled={step === "paying" || step === "saving"}
              className="btn-primary justify-center disabled:opacity-60 w-full sm:w-72"
            >
              {step === "paying" ? "Processing Payment..." : step === "saving" ? "Saving Registration..." : "Pay ₹250 & Register"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="label-field text-xs">{label}</label>
      {children}
    </div>
  );
}

function CredRow({ label, value, mono, small }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard?.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-muted">{label}</span>
      <span className="flex items-center gap-2">
        <span className={`font-bold text-navy ${mono ? "font-mono" : ""} ${small ? "text-xs" : "text-sm"}`}>{value}</span>
        <button type="button" onClick={copy} className="text-muted hover:text-navy" aria-label={`Copy ${label}`}>
          <Copy size={13} />
        </button>
        {copied && <span className="text-[10px] text-green-600">Copied</span>}
      </span>
    </div>
  );
}