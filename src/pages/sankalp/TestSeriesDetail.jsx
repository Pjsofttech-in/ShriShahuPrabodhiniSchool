import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowDownToLine, LoaderCircle } from "lucide-react";
import PageHeader from "../../components/PageHeader.jsx";
import { fetchExams, fetchTestSeriesById } from "../../services/backendService.js";
import { API_BASE_URL } from "../../utils/api.js";
import { useAuth } from "../../context/AuthContext.jsx";

function imageUrl(image) {
  if (!image) return "";
  return /^(https?:|data:|blob:)/i.test(image) ? image : `${API_BASE_URL.replace(/\/+$/, "")}/${String(image).replace(/^\/+/, "")}`;
}

function ExamImage({ src, alt }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return <div className="flex h-full items-center justify-center bg-navy text-xs text-white/70">Image not available</div>;
  return <img src={imageUrl(src)} alt={alt} onError={() => setFailed(true)} className="h-full w-full object-cover" />;
}

function paperFrom(value, index) {
  const exam = value?.exam || value;
  return {
    id: exam?.examId ?? exam?.exam_id ?? exam?.id ?? index + 1,
    name: exam?.examName ?? exam?.name ?? `Test Paper ${index + 1}`,
    image: exam?.image ?? exam?.imageUrl ?? "",
    totalMarks: exam?.totalMarks ?? "-",
    totalQuestions: exam?.totalQuestions ?? "-",
    duration: exam?.duration ?? "-",
    active: exam?.active !== false,
  };
}

export default function TestSeriesDetail() {
  const { id } = useParams();
  const [series, setSeries] = useState(null);
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchTestSeriesById(id), fetchExams()])
      .then(([loadedSeries, allExams]) => {
        setSeries(loadedSeries);
        const linked = loadedSeries.exams?.length ? loadedSeries.exams.map(paperFrom) : allExams.filter((exam) => !exam.testSeriesId || String(exam.testSeriesId) === String(id)).map(paperFrom);
        setPapers(linked.filter((paper) => paper.active));
      })
      .catch(() => setSeries(null))
      .finally(() => setLoading(false));
  }, [id]);
 
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Helper: when user not logged in -> send to login page and preserve next destination
  function redirectToLogin(next) {
    navigate('/login', { state: { from: location.pathname, next }, replace: true });
  }

  function handleBuySeries() {
    // If user not signed in, ask them to login (show register option on login page).
    if (!user) {
      redirectToLogin(`/sankalp/test-series/${id}`);
      return;
    }

    // If user appears to have paid (local sample uses paymentStatus), go to first paper or start page
    const firstPaper = papers && papers.length ? papers[0] : null;
    const paid = (user.paymentStatus && String(user.paymentStatus).toLowerCase() === 'paid') || user.amount > 0;
    if (paid && firstPaper) {
      navigate(`/exam/${firstPaper.id}`, { state: { exam: firstPaper } });
      return;
    }

    // Otherwise, take user to registration/payment flow
    // If user is logged in, show the Start screen for the first paper instead of forcing register
    if (user && firstPaper) {
      navigate(`/exam/${firstPaper.id}/start`, { state: { exam: firstPaper } });
    } else {
      navigate('/register');
    }
  }

  function handleStartPaper(paper) {
    if (isFreeSeries) {
      navigate(`/exam/${paper.id}/start`, { state: { exam: paper } });
      return;
    }

    if (!user) {
      redirectToLogin(`/exam/${paper.id}`);
      return;
    }

    const paid = (user.paymentStatus && String(user.paymentStatus).toLowerCase() === 'paid') || user.amount > 0;
    if (!paid) {
      // If student hasn't paid yet, instead of forcing registration, show the Start screen
      navigate(`/exam/${paper.id}/start`, { state: { exam: paper } });
      return;
    }

    // Navigate to the exam player, pass paper as state for client-side rendering
    navigate(`/exam/${paper.id}`, { state: { exam: paper } });
  }

  if (loading) return <div><PageHeader title="Test Series" /><div className="flex justify-center py-24 text-muted"><LoaderCircle className="animate-spin text-gold" /></div></div>;
  if (!series) return <div><PageHeader title="Test Series" /><p className="py-24 text-center text-muted">Test series not found.</p></div>;

  const isFreeSeries = Number(series.sellingPrice ?? series.price ?? 0) === 0;

  return (
    <div className="min-h-screen bg-white">
      <PageHeader title={series.title} crumb="Test Series" />
      <section className="section-pad pt-6 md:pt-8">
        <div className="container-app">
          <div className="grid items-center gap-6 rounded-[26px] border border-[#eadfce] bg-[linear-gradient(115deg,#fff7ed_0%,#fffdf8_58%,#fff0df_100%)] p-5 shadow-[0_18px_45px_rgba(237,90,0,0.12)] md:grid-cols-[1fr_320px] md:p-8">
            <div>
              <h2 className="text-2xl font-bold text-[#e86516] md:text-3xl">{series.title}</h2>
              <p className="mt-3 text-sm text-muted">{series.description || "All papers with solutions"}</p>
              <ul className="mt-4 list-inside list-disc space-y-1 text-sm text-ink">
                {[series.featureOne, series.featureTwo, series.featureThree].filter(Boolean).map((feature) => <li key={feature}>{feature}</li>)}
                {!series.featureOne && !series.featureTwo && !series.featureThree && <><li>Latest test papers</li><li>Detailed solutions</li><li>Performance tracking</li></>}
              </ul>
              <div className="mt-3 flex items-center gap-3"><span className="font-bold text-green-700">{series.sellingPrice != null ? `Rs ${series.sellingPrice}` : series.price != null ? `Rs ${series.price}` : "FREE"}</span>{series.mrp && <span className="text-sm text-muted line-through">Rs {series.mrp}</span>}</div>
              {isFreeSeries ? <p className="mt-4 inline-flex w-fit rounded-full bg-[#fff0df] px-4 py-2 text-sm font-bold text-[#b65318]">Free access - choose a paper below to start.</p> : <button type="button" onClick={() => handleBuySeries()} className="btn-primary mt-4 !bg-[#e86516] !shadow-[0_8px_18px_rgba(232,101,22,0.22)] hover:!bg-[#c84c0b]">BUY TEST SERIES</button>}
            </div>
            <div className="aspect-[1.8] overflow-hidden rounded-xl shadow-lg"><ExamImage src={series.image} alt={series.title} /></div>
          </div>

          <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {papers.length === 0 && <p className="col-span-full py-12 text-center text-muted">No test papers are available in this series yet.</p>}
            {papers.map((paper) => (
              <article key={paper.id} className="group overflow-hidden rounded-[22px] border border-[#eadfce] bg-[linear-gradient(180deg,#fff7ed_0%,#fffdf8_100%)] shadow-[0_10px_25px_rgba(23,59,95,0.09)] transition duration-500 hover:-translate-y-2 hover:border-[#e86516]/45 hover:shadow-[0_20px_40px_rgba(237,90,0,0.16)]">
                <div className="aspect-[1.65] overflow-hidden border-b border-[#ffead8]"><ExamImage src={paper.image || series.image} alt={paper.name} /></div>
              <div className="p-4">
                <h3 className="text-lg font-bold text-[#e86516]">{paper.name}</h3>
                <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                  <span><b className="block text-ink">Questions:</b>{paper.totalQuestions}</span>
                  <span><b className="block text-ink">Marks:</b>{paper.totalMarks}</span>
                  <span><b className="block text-ink">Time:</b>{paper.duration} min</span>
                </div>
                {/* Auth-aware Start button */}
                <button
                  type="button"
                  onClick={() => handleStartPaper(paper)}
                  className="mt-4 block w-full rounded-lg bg-[#e86516] px-3 py-2 text-center text-sm font-semibold text-white shadow-[0_8px_16px_rgba(232,101,22,0.22)] transition hover:-translate-y-0.5 hover:bg-[#c84c0b]"
                >
                  Start Free Test
                </button>
                <div className="mt-2 flex gap-2">
                  <button type="button" disabled className="flex items-center justify-center rounded-md border border-[#f3bd63] bg-white px-3 py-2 text-[#e86516] disabled:opacity-50" aria-label="Download test paper"><ArrowDownToLine size={18} /></button>
                  <Link to="/register" className="flex-1 rounded-md border border-slate-200 bg-white px-2 py-2 text-center text-xs text-muted">My Result</Link>
                  <Link to="/register" className="flex-1 rounded-md border border-slate-200 bg-white px-2 py-2 text-center text-xs text-muted">All Result</Link>
                </div>
              </div>
            </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
