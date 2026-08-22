import React, { useEffect, useState } from "react";
import { MapPin, Phone, Mail } from "lucide-react";
import PageHeader from "../components/PageHeader.jsx";
import { schoolInfo } from "../data/siteData.js";
import { fetchContactInfo } from "../services/backendService.js";

export default function ContactUs() {
  const [sent, setSent] = useState(false);
  const [contactInfo, setContactInfo] = useState({
    address: schoolInfo.address,
    contactNo: `${schoolInfo.phone} / ${schoolInfo.altPhone}`,
    email: schoolInfo.email,
    mapLink: schoolInfo.mapEmbed,
  });

  useEffect(() => {
    let mounted = true;

    const loadContactInfo = async () => {
      const data = await fetchContactInfo();
      if (!mounted || !data) return;

      setContactInfo({
        address: data.address || schoolInfo.address,
        contactNo: data.contactNo || `${schoolInfo.phone} / ${schoolInfo.altPhone}`,
        email: data.email || schoolInfo.email,
        mapLink: data.mapLink || schoolInfo.mapEmbed,
      });
    };

    loadContactInfo();
    return () => {
      mounted = false;
    };
  }, []);

  function submit(e) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <div>
      <PageHeader title="Contact Us" />
      <section className="section-pad">
        <div className="container-app grid md:grid-cols-3 gap-6 mb-14">
          <div className="card p-6 flex items-start gap-3">
            <MapPin className="text-gold-dark shrink-0" />
            <div>
              <p className="font-bold text-navy text-sm mb-1">Our Address</p>
              <p className="text-sm text-muted">{contactInfo.address}</p>
            </div>
          </div>
          <div className="card p-6 flex items-start gap-3">
            <Phone className="text-gold-dark shrink-0" />
            <div>
              <p className="font-bold text-navy text-sm mb-1">Call Us</p>
              <p className="text-sm text-muted">{contactInfo.contactNo}</p>
            </div>
          </div>
          <div className="card p-6 flex items-start gap-3">
            <Mail className="text-gold-dark shrink-0" />
            <div>
              <p className="font-bold text-navy text-sm mb-1">Email Us</p>
              <p className="text-sm text-muted">{contactInfo.email}</p>
            </div>
          </div>
        </div>

        <div className="container-app grid md:grid-cols-2 gap-10">
          <div>
            <h2 className="text-2xl font-bold text-navy mb-6">Send Us a Message</h2>
            {sent ? (
              <div className="card p-6 bg-cream text-navy font-semibold">
                Thank you! Your message has been received. Our team will contact you shortly.
              </div>
            ) : (
              <form onSubmit={submit} className="card p-6 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div><label className="label-field">Full Name</label><input required className="input-field" /></div>
                  <div><label className="label-field">Mobile No.</label><input required className="input-field" /></div>
                </div>
                <div><label className="label-field">Email</label><input type="email" className="input-field" /></div>
                <div><label className="label-field">Subject</label><input className="input-field" /></div>
                <div><label className="label-field">Message</label><textarea required rows={5} className="input-field" /></div>
                <button className="btn-primary w-full justify-center">Send Message</button>
              </form>
            )}
          </div>
          <div className="rounded-xl overflow-hidden shadow-lg border border-black/5 min-h-[400px]">
            <iframe title="School location map" src={contactInfo.mapLink} className="w-full h-full min-h-[400px]" loading="lazy" />
          </div>
        </div>
      </section>
    </div>
  );
}
