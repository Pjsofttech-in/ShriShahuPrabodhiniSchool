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
      <PageHeader title="Our Features" />
      <section className="section-pad">
        <div className="container-app">
          {loading ? (
            <div className="py-16 text-center text-muted">Loading features...</div>
          ) : features.length === 0 ? (
            <div className="py-16 text-center text-muted">No features are available right now.</div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature) => (
                <article key={feature.id} className="card overflow-hidden group">
                  <div className="h-52 overflow-hidden bg-navy-light">
                    <img
                      src={resolveImageUrl(feature.image)}
                      alt={feature.title}
                      onError={(event) => {
                        event.currentTarget.src = fallbackImage;
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6">
                    <h2 className="font-display text-xl font-bold text-navy mb-2">{feature.title}</h2>
                    <p className="text-sm text-muted leading-relaxed">{feature.description}</p>
                    {feature.link && (
                      <a
                        href={feature.link}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 mt-5 text-sm font-bold text-gold-dark hover:text-navy transition-colors"
                      >
                        Learn more <ArrowUpRight size={15} />
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