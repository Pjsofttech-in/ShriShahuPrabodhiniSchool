import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Copy, IndianRupee } from "lucide-react";
import { payWithRazorpay } from "../utils/razorpay.js";
import {
  createRazorpayOrder,
  fetchCenters,
  fetchCoordinators,
  fetchDistricts,
  fetchTalukas,
  registerStudent,
  verifyRazorpayPayment,
} from "../services/backendService.js";

const initialForm = {
  name: "",
  mobile: "",
  email: "",
  password: "",
  confirmPassword: "",
  gender: "",
  dateOfBirth: "",
  class: "",
  medium: "",
  address: "",
  village: "",
  state: "",
  pincode: "",
  schoolName: "",
  districtId: "",
  talukaId: "",
  centerId: "",
  coordinatorId: "",
  userId: null,
};

function getOptionId(item) {
  if (!item) return "";
  return (
    item.id ??
    item.districtId ??
    item.talukaId ??
    item.schoolId ??
    item.centerId ??
    item.coordinatorId ??
    item.value ??
    item?.district?.id ??
    item?.taluka?.id ??
    item?.school?.id ??
    item?.center?.id ??
    item?.coordinator?.id ??
    ""
  );
}

function getOptionLabel(item) {
  if (!item) return "";
  return (
    item.name ??
    item.label ??
    item.fullName ??
    item.districtName ??
    item.talukaName ??
    item.schoolName ??
    item.centerName ??
    item.coordinatorName ??
    item?.district?.name ??
    item?.district?.districtName ??
    item?.taluka?.name ??
    item?.taluka?.talukaName ??
    item?.school?.schoolName ??
    item?.school?.name ??
    item?.center?.centerName ??
    item?.center?.name ??
    item?.coordinator?.name ??
    ""
  );
}

function normalizeOptions(items) {
  if (Array.isArray(items)) return items;
  if (!items || typeof items !== "object") return [];

  const queue = [items];
  const seen = new Set();

  while (queue.length) {
    const current = queue.shift();
    if (!current || typeof current !== "object" || seen.has(current)) continue;
    seen.add(current);

    if (Array.isArray(current)) return current;

    for (const key of [
      "data",
      "content",
      "items",
      "list",
      "rows",
      "result",
      "records",
      "values",
      "districts",
      "talukas",
      "schools",
      "centers",
      "coordinators",
      "students",
    ]) {
      const value = current[key];
      if (Array.isArray(value)) return value;
      if (value && typeof value === "object") queue.push(value);
    }

    if (Object.keys(current).some((key) => ["id", "districtId", "talukaId", "schoolId", "centerId", "coordinatorId", "districtName", "talukaName", "schoolName", "centerName", "coordinatorName", "name"].includes(key))) {
      return [current];
    }
  }

  return [];
}

function buildOptions(items) {
  return normalizeOptions(items)
    .filter((item) => item && typeof item === "object")
    .map((item) => {
      const id = getOptionId(item);
      const name = getOptionLabel(item);

      if ((id === "" && name === "") || typeof id === "object" || typeof name === "object") {
        return null;
      }

      return {
        id: String(id ?? ""),
        name: String(name ?? ""),
      };
    })
    .filter((item) => item && item.id && item.name);
}

export default function StudentRegistration() {
  const [form, setForm] = useState(initialForm);
  const [step, setStep] = useState("form");
  const [error, setError] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [registered, setRegistered] = useState(null);
  const [districts, setDistricts] = useState([]);
  const [talukas, setTalukas] = useState([]);
  const [centers, setCenters] = useState([]);
  const [coordinators, setCoordinators] = useState([]);

  const districtOptions = useMemo(() => buildOptions(districts), [districts]);
  const talukaOptions = useMemo(() => buildOptions(talukas), [talukas]);
  const centerOptions = useMemo(() => buildOptions(centers), [centers]);
  const coordinatorOptions = useMemo(() => buildOptions(coordinators), [coordinators]);

  async function update(field, value) {
    setForm((prev) => {
      let next = { ...prev, [field]: value };

      if (field === "districtId") {
        next = { ...next, talukaId: "", centerId: "", coordinatorId: "" };
      }

      if (field === "talukaId") {
        next = { ...next, centerId: "", coordinatorId: "" };
      }

      if (field === "centerId") {
        next = { ...next, coordinatorId: "" };
      }

      return next;
    });

    if (field === "districtId") {
      setTalukas([]);
      setCenters([]);
      setCoordinators([]);

      if (!value) return;

      try {
        const talukaList = await fetchTalukas(value);
        setTalukas(Array.isArray(talukaList) ? talukaList : []);
      } catch (error) {
        console.warn("Could not load talukas.", error);
        setTalukas([]);
      }
      return;
    }

    if (field === "talukaId") {
      setCenters([]);
      setCoordinators([]);

      if (!value) return;

      try {
        const centerList = await fetchCenters(value);
        setCenters(Array.isArray(centerList) ? centerList : []);
      } catch (error) {
        console.warn("Could not load centers.", error);
        setCenters([]);
      }
      return;
    }

    if (field === "centerId") {
      setCoordinators([]);

      if (!value) return;

      try {
        const coordinatorList = await fetchCoordinators(value);
        setCoordinators(Array.isArray(coordinatorList) ? coordinatorList : []);
      } catch (error) {
        console.warn("Could not load coordinators.", error);
        setCoordinators([]);
      }
    }
  }

  useEffect(() => {
    async function loadDistricts() {
      try {
        const loadedDistricts = await fetchDistricts();
        setDistricts(loadedDistricts || []);
      } catch (err) {
        console.warn("Unable to load backend districts.", err);
      }
    }

    loadDistricts();
  }, []);

  async function saveToBackend(paymentId) {
    const payload = {
      studentName: form.name,
      mobile: form.mobile,
      email: form.email,
      password: form.password,
      gender: form.gender,
      studentClass: form.class,
      medium: form.medium,
      address: form.address,
      village: form.village,
      state: form.state,
      pincode: form.pincode,
      schoolName: form.schoolName,
      dateOfBirth: form.dateOfBirth || null,
      active: true,
      userId: form.userId || null,
      districtId: Number(form.districtId),
      talukaId: Number(form.talukaId),
      centerId: Number(form.centerId),
      coordinatorId: Number(form.coordinatorId),
      paymentId,
    };

    return await registerStudent(payload);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.districtId) return setError("Please select a District.");
    if (!form.talukaId) return setError("Please select a Taluka.");
    if (!form.schoolName.trim()) return setError("Please enter your School Name.");
    if (!form.centerId) return setError("Please select an Exam Center.");
    if (!form.coordinatorId) return setError("Please select a Co-ordinator assigned to your center.");
    if (!form.password) return setError("Please enter a password.");
    if (form.password.length < 6) return setError("Password must be at least 6 characters long.");
    if (form.password !== form.confirmPassword) return setError("Password and Confirm Password do not match.");
    if (!acceptedTerms) return setError("Please agree to the Terms and Conditions before paying.");

    try {
      setStep("paying");

      const order = await createRazorpayOrder(250, form.mobile);

      if (!order?.id) {
        throw new Error("Unable to create payment order.");
      }

      const orderId = order.id;

      payWithRazorpay({
        amount: 250,
        name: form.name,
        contact: form.mobile,
        orderId,
        onSuccess: async ({ paymentId, orderId: razorpayOrderId, signature }) => {
          setStep("saving");

          try {
            const verification = await verifyRazorpayPayment({
              orderId: razorpayOrderId || orderId,
              paymentId,
              signature,
            });

            if (verification !== "Payment Successful") {
              throw new Error("Payment verification failed.");
            }

            const saved = await saveToBackend(paymentId);
            setRegistered(saved);
            setStep("success");
          } catch (error) {
            console.error("Registration failed:", error);
            setError(
              error?.response?.data?.message ||
                error?.message ||
                `Payment succeeded but registration failed. Payment ID: ${paymentId}`
            );
            setStep("form");
          }
        },
        onFailure: (message) => {
          setError(message || "Payment was not completed. Please try again.");
          setStep("form");
        },
      });
    } catch (error) {
      console.error("Payment order creation failed:", error);
      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to create payment order. Please try again."
      );
      setStep("form");
    }
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
              <CredRow label="Student Name" value={registered.name || registered.studentName} />
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
            <Field label="Mobile">
              <input required pattern="[0-9]{10}" title="10 digit mobile number" className="input-field" value={form.mobile} onChange={(e) => update("mobile", e.target.value)} />
            </Field>
            <Field label="Email">
              <input required type="email" className="input-field" value={form.email} onChange={(e) => update("email", e.target.value)} />
            </Field>
            <Field label="Password">
              <input required type="password" minLength={6} className="input-field" value={form.password} onChange={(e) => update("password", e.target.value)} />
            </Field>
            <Field label="Confirm Password">
              <input required type="password" minLength={6} className="input-field" value={form.confirmPassword} onChange={(e) => update("confirmPassword", e.target.value)} />
            </Field>
            <Field label="Gender">
              <select required className="input-field" value={form.gender} onChange={(e) => update("gender", e.target.value)}>
                <option value="">Select</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </Field>

            <Field label="Date of Birth">
              <input required type="date" className="input-field" value={form.dateOfBirth} onChange={(e) => update("dateOfBirth", e.target.value)} />
            </Field>
            <Field label="Class">
              <select required className="input-field" value={form.class} onChange={(e) => update("class", e.target.value)}>
                <option value="">Select</option>
                {[
                  "5th",
                  "6th",
                  "7th",
                  "8th",
                  "9th",
                  "10th",
                ].map((c) => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Medium">
              <select required className="input-field" value={form.medium} onChange={(e) => update("medium", e.target.value)}>
                <option value="">Select</option>
                <option>Marathi</option>
                <option>Semi-English</option>
                <option>English</option>
              </select>
            </Field>
            <Field label="Address">
              <input required className="input-field" value={form.address} onChange={(e) => update("address", e.target.value)} />
            </Field>

            <Field label="Village">
              <input required className="input-field" value={form.village} onChange={(e) => update("village", e.target.value)} />
            </Field>
            <Field label="State">
              <input required className="input-field" value={form.state} onChange={(e) => update("state", e.target.value)} />
            </Field>
            <Field label="Pincode">
              <input required inputMode="numeric" pattern="[0-9]{6}" title="6 digit pincode" className="input-field" value={form.pincode} onChange={(e) => update("pincode", e.target.value)} />
            </Field>
            <Field label="School Name">
              <input required className="input-field" value={form.schoolName} onChange={(e) => update("schoolName", e.target.value)} placeholder="Write your school name" />
            </Field>
            <Field label="District">
              <select required className="input-field" value={form.districtId} onChange={(e) => update("districtId", e.target.value)}>
                <option value="">Select District</option>
                {districtOptions.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </Field>

            <Field label="Taluka">
              <select required disabled={!form.districtId} className="input-field" value={form.talukaId} onChange={(e) => update("talukaId", e.target.value)}>
                <option value="">{form.districtId ? "Select Taluka" : "Select District First"}</option>
                {talukaOptions.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Exam Center">
              <select required disabled={!form.talukaId} className="input-field" value={form.centerId} onChange={(e) => update("centerId", e.target.value)}>
                <option value="">{form.talukaId ? "Select Center" : "Select Taluka First"}</option>
                {centerOptions.map((center) => (
                  <option key={center.id} value={center.id}>{center.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Coordinator">
              <select required disabled={!form.centerId} className="input-field" value={form.coordinatorId} onChange={(e) => update("coordinatorId", e.target.value)}>
                <option value="">{form.centerId ? "Select Coordinator" : "Select Center First"}</option>
                {coordinatorOptions.map((coordinator) => (
                  <option key={coordinator.id} value={coordinator.id}>{coordinator.name}</option>
                ))}
              </select>
              {form.centerId && coordinatorOptions.length === 0 && (
                <p className="text-[10px] text-red-500 mt-0.5">No coordinator allocated yet.</p>
              )}
            </Field>
          </div>

          <div className="pt-2 flex flex-col items-center gap-3">
            <div className="bg-cream rounded-lg px-6 py-3 flex items-center gap-2 border border-gold/30">
              <span className="text-sm text-muted">Registration Fee:</span>
              <span className="font-display font-bold text-navy text-lg flex items-center"><IndianRupee size={16} /> 250</span>
            </div>
            <label className="flex items-start gap-2 text-xs text-muted max-w-xl">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-0.5 accent-gold"
              />
              <span>
                I agree to the <Link to="/terms-and-conditions" className="text-navy font-semibold hover:text-gold">Terms and Conditions</Link> and understand that the ₹250 registration fee is processed through Razorpay.
              </span>
            </label>
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
    navigator.clipboard?.writeText(value || "");
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