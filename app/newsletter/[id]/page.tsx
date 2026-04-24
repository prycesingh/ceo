import BellButton from "@/components/BellButton";
import PortalShell from "@/components/PortalShell";
import { verifySession } from "@/lib/dal";
import type { MoodleSection } from "@/lib/definitions";
import {
  getCourseContents,
  getCourses,
  getUserEnrolledCourseIds,
} from "@/lib/moodle";
import {
  ArrowLeft,
  Calendar,
  ChevronRight,
  Download,
  FileText,
  Video,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

const allowedIds = (process.env.MOODLE_COURSE_IDS ?? "")
  .split(",")
  .map((s) => parseInt(s.trim(), 10))
  .filter(Boolean);

const COVER_GRADIENTS = [
  "linear-gradient(135deg,#1B4FD8 0%,#3B82F6 100%)",
  "linear-gradient(135deg,#7C3AED 0%,#A78BFA 100%)",
  "linear-gradient(135deg,#059669 0%,#34D399 100%)",
  "linear-gradient(135deg,#D97706 0%,#FCD34D 100%)",
];

function formatDate(ts: number): string {
  if (!ts) return "";
  return new Date(ts * 1000).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getSectionMedia(section: MoodleSection) {
  let videos = 0,
    files = 0;
  for (const mod of section.modules) {
    if (mod.modname === "resource" && mod.contents) {
      for (const c of mod.contents) {
        if (
          c.mimetype?.includes("video") ||
          mod.url?.includes("youtube") ||
          mod.url?.includes("vimeo")
        )
          videos++;
        else files++;
      }
    }
    if (mod.modname === "url") videos++;
    if (mod.modname === "folder") files++;
    if (mod.modname === "page") files++;
  }
  return { videos, files };
}

export default async function NewsletterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const courseId = parseInt(id, 10);

  if (!allowedIds.includes(courseId)) notFound();

  const session = await verifySession();
  const [courses, sections, enrolledIds] = await Promise.all([
    getCourses([courseId]),
    getCourseContents(courseId),
    getUserEnrolledCourseIds(session.userId),
  ]);

  const course = courses[0];
  if (!course) notFound();

  const isSubscribed = enrolledIds.includes(courseId);
  const visibleSections = sections.filter(
    (s) => s.name && s.name !== "General" && s.modules.length > 0,
  );
  const coverGradient = COVER_GRADIENTS[courseId % COVER_GRADIENTS.length];

  return (
    <PortalShell>
      <div className="max-w-4xl mx-auto px-6 py-10">
        <Link
          href="/feed"
          className="inline-flex items-center gap-1.5 text-sm font-medium mb-8 hover:opacity-70 transition-opacity"
          style={{ color: "var(--color-ink-muted)" }}
        >
          <ArrowLeft className="w-4 h-4" /> Back to feed
        </Link>

        <div
          className="rounded-3xl overflow-hidden border mb-10"
          style={{
            borderColor: "var(--color-border)",
            backgroundColor: "var(--color-surface)",
          }}
        >
          <div
            className="h-36 relative flex items-end px-7 pb-6"
            style={{ background: coverGradient }}
          >
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.07) 1px, transparent 0)",
                backgroundSize: "24px 24px",
              }}
            />
          </div>
          <div className="px-7 py-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1">
              <h1
                className="font-black text-2xl md:text-3xl leading-tight mb-2"
                style={{
                  fontFamily: "var(--font-merriweather), Georgia, serif",
                  color: "var(--color-ink)",
                }}
              >
                {course.fullname}
              </h1>
              {course.summary && (
                <p
                  className="text-sm leading-relaxed max-w-lg"
                  style={{ color: "var(--color-ink-muted)" }}
                  dangerouslySetInnerHTML={{
                    __html: course.summary.replace(/<[^>]+>/g, ""),
                  }}
                />
              )}
              <div
                className="flex items-center gap-4 mt-3 text-xs"
                style={{ color: "var(--color-ink-light)" }}
              >
                <span className="flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5" />
                  {visibleSections.length} edition
                  {visibleSections.length !== 1 ? "s" : ""}
                </span>
                {visibleSections.length > 0 &&
                  (() => {
                    const ts =
                      visibleSections[0]?.modules[0]?.dates?.[0]?.timestamp;
                    return ts ? (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        Latest: {formatDate(ts)}
                      </span>
                    ) : null;
                  })()}
              </div>
            </div>
            <div className="shrink-0">
              <BellButton
                courseId={courseId}
                initialSubscribed={isSubscribed}
              />
            </div>
          </div>
        </div>

        {visibleSections.length === 0 ? (
          <div
            className="text-center py-16 rounded-2xl border"
            style={{
              borderColor: "var(--color-border)",
              color: "var(--color-ink-muted)",
            }}
          >
            <p className="text-lg font-medium">No editions published yet.</p>
            <p className="text-sm mt-1">Check back soon!</p>
          </div>
        ) : (
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-5"
              style={{ color: "var(--color-ink-muted)" }}
            >
              All editions · {visibleSections.length} published
            </p>
            <div className="space-y-2">
              {visibleSections.map((section, i) => {
                const { videos, files } = getSectionMedia(section);
                const editionNum = visibleSections.length - i;
                const ts = section.modules[0]?.dates?.[0]?.timestamp;
                return (
                  <Link
                    key={section.id}
                    href={`/newsletter/${courseId}/issue/${section.id}`}
                    className="group flex items-center gap-4 p-4 sm:p-5 rounded-2xl border hover:border-blue-200 hover:shadow-md transition-all duration-200"
                    style={{
                      backgroundColor: "var(--color-surface)",
                      borderColor: "var(--color-border)",
                    }}
                  >
                    <div
                      className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm"
                      style={{ background: coverGradient, color: "white" }}
                    >
                      #{editionNum}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3
                        className="font-semibold text-base leading-snug mb-1 group-hover:text-blue-600 transition-colors"
                        style={{ color: "var(--color-ink)" }}
                      >
                        {section.name}
                      </h3>
                      <div
                        className="flex flex-wrap items-center gap-3 text-xs"
                        style={{ color: "var(--color-ink-light)" }}
                      >
                        {ts && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(ts)}
                          </span>
                        )}
                        {videos > 0 && (
                          <span
                            className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: "#EEF2FF",
                              color: "var(--color-brand)",
                            }}
                          >
                            <Video className="w-3 h-3" />
                            {videos} video{videos !== 1 ? "s" : ""}
                          </span>
                        )}
                        {files > 0 && (
                          <span
                            className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: "#F0FDF4",
                              color: "#059669",
                            }}
                          >
                            <Download className="w-3 h-3" />
                            {files} file{files !== 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight
                      className="w-4 h-4 shrink-0 opacity-30 group-hover:opacity-70 group-hover:translate-x-0.5 transition-all"
                      style={{ color: "var(--color-brand)" }}
                    />
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </PortalShell>
  );
}
