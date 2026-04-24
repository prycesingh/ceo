import Logo from "@/components/Logo";
import { getOptionalSession } from "@/lib/dal";
import { getCourses } from "@/lib/moodle";
import { ArrowRight, BookOpen, CheckCircle2, Users, Zap } from "lucide-react";
import Link from "next/link";

const courseIds = (process.env.MOODLE_COURSE_IDS ?? "")
  .split(",")
  .map((s) => parseInt(s.trim(), 10))
  .filter(Boolean);

const COVER_GRADIENTS = [
  "linear-gradient(135deg,#1B4FD8 0%,#3B82F6 100%)",
  "linear-gradient(135deg,#7C3AED 0%,#A78BFA 100%)",
  "linear-gradient(135deg,#059669 0%,#34D399 100%)",
  "linear-gradient(135deg,#D97706 0%,#FCD34D 100%)",
];

export default async function LandingPage() {
  const session = await getOptionalSession();
  let courses: Awaited<ReturnType<typeof getCourses>> = [];
  try {
    if (courseIds.length) courses = await getCourses(courseIds);
  } catch {
    // show page even if Moodle is unreachable
  }

  return (
    <div
      className="flex flex-col min-h-screen"
      style={{ backgroundColor: "var(--color-cream)" }}
    >
      {/* ── Top Nav ── */}
      <nav
        className="sticky top-0 z-50 border-b"
        style={{
          borderColor: "rgba(255,255,255,0.12)",
          backgroundColor: "rgba(13,31,60,0.94)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Logo variant="dark" size="md" />
          <div className="flex items-center gap-3">
            {session ? (
              <Link
                href="/feed"
                className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-full transition-all"
                style={{ backgroundColor: "var(--color-brand)", color: "#fff" }}
              >
                My feed <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium transition-colors hidden sm:inline"
                  style={{ color: "rgba(255,255,255,0.7)" }}
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-full transition-all"
                  style={{
                    backgroundColor: "var(--color-brand)",
                    color: "#fff",
                  }}
                >
                  Subscribe free
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section
        className="relative overflow-hidden"
        style={{
          background:
            "linear-gradient(160deg, #0D1F3C 0%, #172D54 55%, #1B4FD8 100%)",
        }}
      >
        {/* Decorative grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.06) 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
        {/* Glow blob */}
        <div
          className="absolute pointer-events-none"
          style={{
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 70%)",
            top: "-150px",
            right: "-100px",
          }}
        />

        <div className="relative max-w-6xl mx-auto px-6 py-20 lg:py-28 flex flex-col lg:flex-row items-center gap-16">
          {/* Text side */}
          <div className="flex-1 text-center lg:text-left">
            <div
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-6"
              style={{
                backgroundColor: "rgba(196,147,42,0.18)",
                color: "#F5C842",
                border: "1px solid rgba(196,147,42,0.3)",
              }}
            >
              <Zap className="w-3 h-3" />
              IT By Design · CEO Newsletter
            </div>

            <h1
              className="font-black leading-tight mb-6"
              style={{
                fontFamily:
                  "var(--font-playfair), var(--font-merriweather), Georgia, serif",
                fontSize: "clamp(2.25rem, 6vw, 3.75rem)",
                color: "#FFFFFF",
                letterSpacing: "-0.02em",
              }}
            >
              Insights from the
              <br />
              <span style={{ color: "#93C5FD" }}>desk of our CEO</span>
            </h1>

            <p
              className="text-lg leading-relaxed mb-10 max-w-xl mx-auto lg:mx-0"
              style={{ color: "rgba(255,255,255,0.65)" }}
            >
              Weekly strategy, leadership wisdom, and industry perspectives —
              delivered exclusively to ITBD professionals.
            </p>

            {!session ? (
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 font-semibold px-8 py-3.5 rounded-full transition-all text-base"
                  style={{
                    backgroundColor: "#FFFFFF",
                    color: "var(--color-navy)",
                    boxShadow: "0 4px 24px rgba(0,0,0,0.25)",
                  }}
                >
                  Start reading for free
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/login"
                  className="text-sm transition-colors"
                  style={{ color: "rgba(255,255,255,0.55)" }}
                >
                  Already a subscriber? Sign in
                </Link>
              </div>
            ) : (
              <Link
                href="/feed"
                className="inline-flex items-center gap-2 font-semibold px-8 py-3.5 rounded-full transition-all text-base"
                style={{
                  backgroundColor: "#FFFFFF",
                  color: "var(--color-navy)",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.25)",
                }}
              >
                Go to my feed <ArrowRight className="w-4 h-4" />
              </Link>
            )}

            {/* Trust badges */}
            <div
              className="flex flex-wrap items-center justify-center lg:justify-start gap-5 mt-8 text-sm"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              {[
                {
                  icon: <CheckCircle2 className="w-3.5 h-3.5" />,
                  text: "Free to read",
                },
                {
                  icon: <CheckCircle2 className="w-3.5 h-3.5" />,
                  text: "New editions weekly",
                },
                {
                  icon: <CheckCircle2 className="w-3.5 h-3.5" />,
                  text: "Unsubscribe anytime",
                },
              ].map((b) => (
                <span
                  key={b.text}
                  className="flex items-center gap-1.5"
                  style={{ color: "rgba(147,197,253,0.8)" }}
                >
                  {b.icon} {b.text}
                </span>
              ))}
            </div>
          </div>

          {/* CEO portrait / visual side */}
          <div className="shrink-0 flex flex-col items-center gap-6">
            {/* Avatar card */}
            <div
              className="relative"
              style={{
                width: "260px",
                height: "300px",
                borderRadius: "20px",
                overflow: "hidden",
                background: "linear-gradient(160deg, #1E3A6E 0%, #0D1F3C 100%)",
                border: "1px solid rgba(255,255,255,0.12)",
                boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
              }}
            >
              {/* Professional silhouette SVG */}
              <svg
                viewBox="0 0 260 300"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="absolute inset-0 w-full h-full"
              >
                {/* Background subtle gradient */}
                <defs>
                  <radialGradient id="glow" cx="50%" cy="40%" r="50%">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#0D1F3C" stopOpacity="0" />
                  </radialGradient>
                  <linearGradient id="suit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1E3264" />
                    <stop offset="100%" stopColor="#0F1F3D" />
                  </linearGradient>
                  <linearGradient id="face" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#C8A882" />
                    <stop offset="100%" stopColor="#B89060" />
                  </linearGradient>
                </defs>
                <rect width="260" height="300" fill="url(#glow)" />
                {/* Body / suit */}
                <ellipse cx="130" cy="290" rx="80" ry="55" fill="url(#suit)" />
                <rect
                  x="90"
                  y="210"
                  width="80"
                  height="100"
                  rx="10"
                  fill="url(#suit)"
                />
                {/* Tie */}
                <polygon
                  points="125,210 135,210 131,240 129,240"
                  fill="#C4932A"
                  opacity="0.9"
                />
                {/* Shirt collar */}
                <polygon
                  points="113,205 130,215 147,205 143,195 130,205 117,195"
                  fill="white"
                  opacity="0.85"
                />
                {/* Neck */}
                <rect
                  x="120"
                  y="178"
                  width="20"
                  height="28"
                  rx="8"
                  fill="url(#face)"
                />
                {/* Head */}
                <ellipse cx="130" cy="155" rx="40" ry="46" fill="url(#face)" />
                {/* Hair */}
                <ellipse
                  cx="130"
                  cy="115"
                  rx="40"
                  ry="20"
                  fill="#2C1810"
                  opacity="0.9"
                />
                <rect
                  x="90"
                  y="115"
                  width="80"
                  height="20"
                  fill="#2C1810"
                  opacity="0.9"
                />
                {/* Eyes */}
                <ellipse cx="117" cy="152" rx="5" ry="4" fill="#1A1A1A" />
                <ellipse cx="143" cy="152" rx="5" ry="4" fill="#1A1A1A" />
                <ellipse
                  cx="116"
                  cy="151"
                  rx="2"
                  ry="2"
                  fill="white"
                  opacity="0.6"
                />
                <ellipse
                  cx="142"
                  cy="151"
                  rx="2"
                  ry="2"
                  fill="white"
                  opacity="0.6"
                />
                {/* Subtle smile */}
                <path
                  d="M 118 168 Q 130 175 142 168"
                  stroke="#8B6040"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>

              {/* Name card overlay at bottom */}
              <div
                className="absolute bottom-0 left-0 right-0 px-4 py-3"
                style={{
                  background:
                    "linear-gradient(0deg, rgba(13,31,60,0.95) 0%, transparent 100%)",
                }}
              >
                <p
                  className="text-white font-semibold text-sm"
                  style={{
                    fontFamily: "var(--font-merriweather), Georgia, serif",
                  }}
                >
                  CEO, IT By Design
                </p>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: "rgba(147,197,253,0.8)" }}
                >
                  Weekly Strategic Insights
                </p>
              </div>
            </div>

            {/* Stats strip */}
            <div
              className="flex items-center gap-5 px-5 py-3 rounded-2xl"
              style={{
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.1)",
                backdropFilter: "blur(10px)",
              }}
            >
              {[
                {
                  icon: <Users className="w-3.5 h-3.5" />,
                  val: "500+",
                  label: "Subscribers",
                },
                {
                  icon: <BookOpen className="w-3.5 h-3.5" />,
                  val: "40+",
                  label: "Editions",
                },
                {
                  icon: <Zap className="w-3.5 h-3.5" />,
                  val: "Weekly",
                  label: "Cadence",
                },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <div
                    className="flex items-center justify-center gap-1 mb-0.5"
                    style={{ color: "#93C5FD" }}
                  >
                    {s.icon}
                    <span className="text-sm font-bold text-white">
                      {s.val}
                    </span>
                  </div>
                  <p
                    className="text-xs"
                    style={{ color: "rgba(255,255,255,0.45)" }}
                  >
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom wave */}
        <div
          className="absolute bottom-0 left-0 right-0 overflow-hidden leading-none"
          style={{ lineHeight: 0 }}
        >
          <svg
            viewBox="0 0 1440 40"
            preserveAspectRatio="none"
            style={{ display: "block", width: "100%", height: "40px" }}
          >
            <path
              d="M0,40 L1440,40 L1440,10 Q720,-10 0,10 Z"
              fill="var(--color-cream)"
            />
          </svg>
        </div>
      </section>

      {/* ── What's inside ── */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-8">
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            {
              icon: "🎯",
              title: "Strategic Direction",
              body: "Quarterly priorities, OKRs, and the thinking behind our biggest company decisions.",
            },
            {
              icon: "🧠",
              title: "Leadership Lessons",
              body: "Hard-won insights from building and scaling a successful IT services company.",
            },
            {
              icon: "📊",
              title: "Industry Intelligence",
              body: "What's shifting in managed services, AI adoption, and the future of IT operations.",
            },
          ].map((card) => (
            <div
              key={card.title}
              className="rounded-2xl p-6 border"
              style={{
                backgroundColor: "var(--color-surface)",
                borderColor: "var(--color-border)",
              }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl mb-4"
                style={{ backgroundColor: "var(--color-brand-light)" }}
              >
                {card.icon}
              </div>
              <h3
                className="font-bold text-base mb-2"
                style={{
                  fontFamily: "var(--font-merriweather), Georgia, serif",
                  color: "var(--color-ink)",
                }}
              >
                {card.title}
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "var(--color-ink-muted)" }}
              >
                {card.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Newsletters ── */}
      {courses.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p
                className="text-xs font-semibold uppercase tracking-widest mb-1"
                style={{ color: "var(--color-brand)" }}
              >
                Available Newsletters
              </p>
              <h2
                className="font-bold text-2xl"
                style={{
                  fontFamily: "var(--font-merriweather), Georgia, serif",
                  color: "var(--color-ink)",
                }}
              >
                What you&apos;ll be reading
              </h2>
            </div>
            {!session && (
              <Link
                href="/register"
                className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold px-5 py-2.5 rounded-full transition-all"
                style={{ backgroundColor: "var(--color-brand)", color: "#fff" }}
              >
                Subscribe free <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course, i) => (
              <div
                key={course.id}
                className="group rounded-2xl border overflow-hidden hover:shadow-lg transition-all duration-300"
                style={{
                  backgroundColor: "var(--color-surface)",
                  borderColor: "var(--color-border)",
                }}
              >
                {/* Cover strip */}
                <div
                  className="h-28 flex items-center justify-center relative overflow-hidden"
                  style={{
                    background: COVER_GRADIENTS[i % COVER_GRADIENTS.length],
                  }}
                >
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      backgroundImage:
                        "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.08) 1px, transparent 0)",
                      backgroundSize: "24px 24px",
                    }}
                  />
                  <BookOpen className="w-10 h-10 text-white opacity-40" />
                </div>
                {/* Content */}
                <div className="p-5">
                  <h3
                    className="font-bold text-lg leading-snug mb-2"
                    style={{
                      fontFamily: "var(--font-merriweather), Georgia, serif",
                      color: "var(--color-ink)",
                    }}
                  >
                    {course.fullname}
                  </h3>
                  {course.summary && (
                    <p
                      className="text-sm leading-relaxed mb-4 line-clamp-2"
                      style={{ color: "var(--color-ink-muted)" }}
                      dangerouslySetInnerHTML={{
                        __html: course.summary.replace(/<[^>]+>/g, ""),
                      }}
                    />
                  )}
                  <Link
                    href={session ? `/newsletter/${course.id}` : "/register"}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold transition-colors group-hover:gap-2.5"
                    style={{ color: "var(--color-brand)" }}
                  >
                    {session ? "Browse editions" : "Subscribe to read"}
                    <ArrowRight className="w-3.5 h-3.5 transition-all" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Testimonials ── */}
      <section
        className="py-16"
        style={{
          background: "linear-gradient(160deg, #0D1F3C 0%, #172D54 100%)",
        }}
      >
        <div className="max-w-6xl mx-auto px-6">
          <p
            className="text-center text-xs font-semibold uppercase tracking-widest mb-2"
            style={{ color: "rgba(147,197,253,0.7)" }}
          >
            From the community
          </p>
          <h2
            className="text-center font-bold text-2xl mb-10 text-white"
            style={{ fontFamily: "var(--font-merriweather), Georgia, serif" }}
          >
            What subscribers are saying
          </h2>
          <div className="grid sm:grid-cols-3 gap-5">
            {[
              {
                quote:
                  "Every edition gives me something actionable I can bring to my team on Monday morning.",
                name: "Sarah M.",
                role: "Operations Manager",
              },
              {
                quote:
                  "The CEO's perspective on AI adoption alone has changed how I present proposals to clients.",
                name: "James T.",
                role: "Senior Engineer",
              },
              {
                quote:
                  "Rare to find leadership content this candid and directly relevant to our industry.",
                name: "Priya K.",
                role: "Account Executive",
              },
            ].map((t) => (
              <div
                key={t.name}
                className="rounded-2xl p-6"
                style={{
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <p
                  className="text-sm leading-relaxed mb-5 italic"
                  style={{ color: "rgba(255,255,255,0.75)" }}
                >
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                    style={{
                      background: "linear-gradient(135deg,#1B4FD8,#3B82F6)",
                    }}
                  >
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{t.name}</p>
                    <p
                      className="text-xs"
                      style={{ color: "rgba(255,255,255,0.45)" }}
                    >
                      {t.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      {!session && (
        <section className="max-w-6xl mx-auto px-6 py-20 text-center">
          <h2
            className="font-black text-3xl md:text-4xl mb-4"
            style={{
              fontFamily: "var(--font-merriweather), Georgia, serif",
              color: "var(--color-ink)",
            }}
          >
            Join 500+ ITBD professionals
          </h2>
          <p
            className="text-base mb-8 max-w-md mx-auto"
            style={{ color: "var(--color-ink-muted)" }}
          >
            Stay ahead with direct insights from leadership. Free, every week.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 font-semibold px-9 py-4 rounded-full transition-all text-base text-white"
            style={{
              backgroundColor: "var(--color-brand)",
              boxShadow: "0 4px 20px rgba(27,79,216,0.35)",
            }}
          >
            Subscribe for free <ArrowRight className="w-4 h-4" />
          </Link>
        </section>
      )}

      {/* ── Footer ── */}
      <footer
        className="border-t py-10 mt-auto"
        style={{ borderColor: "var(--color-border)" }}
      >
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <Logo variant="light" size="sm" />
          <p className="text-sm" style={{ color: "var(--color-ink-muted)" }}>
            © {new Date().getFullYear()} IT By Design. All rights reserved.
          </p>
          <div
            className="flex items-center gap-5 text-sm"
            style={{ color: "var(--color-ink-muted)" }}
          >
            <Link href="/login" className="hover:underline">
              Sign in
            </Link>
            <Link href="/register" className="hover:underline">
              Subscribe
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
