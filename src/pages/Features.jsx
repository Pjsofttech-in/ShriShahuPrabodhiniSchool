import React, { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import PageHeader from "../components/PageHeader.jsx";
import { fetchFeatures } from "../services/backendService.js";
import { API_BASE_URL } from "../utils/api.js";

const fallbackImage = "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=900&auto=format&fit=crop";

function resolveImageUrl(image) {
  if (!image) return fallbackImage;
  if (/^(https?:|data:|blob:)/i.test(image)) return image;
  return `${API_BASE_URL.replace(/\/+$/, "")}/${String(image).replace(/^\/+/, "")}`;
}

export default function Features() {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    fetchFeatures()
      .then((data) => {
        if (mounted) setFeatures(data);
      })
      .catch((error) => {
        console.error("Failed to fetch features:", error);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div>
      <PageHeader title="Our Features" crumb="Features" />
      <section className="bg-white py-12 md:py-16">
        <div className="container-app">
          {loading ? (
            <div className="py-16 text-center text-muted">Loading features...</div>
          ) : features.length === 0 ? (
            <div className="py-16 text-center text-muted">No features are available right now.</div>
          ) : (
            <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 max-w-4xl mx-auto">
              {features.map((feature) => (
                <article key={feature.id} className="group overflow-hidden rounded-3xl bg-gradient-to-br from-yellow-50 via-yellow-50 to-orange-50 p-8 sm:p-10 shadow-[0_4px_20px_rgba(11,37,69,0.06)] transition duration-300 hover:shadow-[0_8px_28px_rgba(11,37,69,0.1)] border border-yellow-100/40">
                  <div className="flex flex-col items-center text-center space-y-6">
                    {/* Icon Container */}
                    <div className="h-28 w-28 sm:h-32 sm:w-32 flex items-center justify-center">
                      <img
                        src={resolveImageUrl(feature.image)}
                        alt={feature.title}
                        onError={(event) => {
                          event.currentTarget.src = fallbackImage;
                        }}
                        className="h-full w-full object-contain"
                      />
                    </div>
                    
                    {/* Title */}
                    <h2 className="font-display text-2xl sm:text-3xl font-bold text-navy">{feature.title}</h2>
                    
                    {/* Description */}
                    <p className="text-base sm:text-lg text-slate-600 leading-relaxed">{feature.description}</p>
                    
                    {/* Link */}
                    {feature.link && (
                      <a
                        href={feature.link}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 mt-3 text-sm font-semibold text-gold-dark hover:text-navy transition-colors"
                      >
                        Learn more <ArrowUpRight size={16} />
                      </a>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}