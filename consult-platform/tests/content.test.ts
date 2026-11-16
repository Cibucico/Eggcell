import { describe, expect, it } from "vitest";
import { seedCourses, seedLiveSessions, seedServices } from "@/content/seed";
import { blocksSchema, parseBlocks, toSlides, videoEmbedUrl } from "@/lib/blocks";
import { formatPrice, safeNextPath, slugify } from "@/lib/utils";
import { bookingSchema, enquirySchema, registerSchema } from "@/lib/validation";

describe("lesson blocks", () => {
  it("every sample lesson is valid", () => {
    for (const lesson of seedCourses.flatMap((c) => c.modules).flatMap((m) => m.lessons)) {
      expect(blocksSchema.safeParse(lesson.blocks).success, lesson.title).toBe(true);
    }
  });

  it("groups blocks into screens", () => {
    const slides = toSlides([
      { type: "text", markdown: "intro" },
      { type: "slide", title: "One" },
      { type: "text", markdown: "a" },
      { type: "exercise", title: "Do", text: "b" },
      { type: "slide", title: "Two" },
    ]);
    expect(slides.map((s) => [s.title, s.blocks.length])).toEqual([["", 1], ["One", 2], ["Two", 0]]);
  });

  it("rejects unsafe links and impossible quizzes", () => {
    expect(blocksSchema.safeParse([{ type: "embed", url: "javascript:alert(1)" }]).success).toBe(false);
    expect(blocksSchema.safeParse([{ type: "video", url: "http://insecure.test/v.mp4" }]).success).toBe(false);
    expect(
      blocksSchema.safeParse([{ type: "quiz", question: "Q", options: ["a", "b"], correctIndex: 4 }]).success,
    ).toBe(false);
  });

  it("drops malformed stored blocks instead of failing", () => {
    expect(parseBlocks([{ type: "text", markdown: "ok" }, { type: "nonsense" }, null])).toHaveLength(1);
    expect(parseBlocks("not an array")).toEqual([]);
  });

  it("turns watch links into player links", () => {
    expect(videoEmbedUrl("https://www.youtube.com/watch?v=abc123")).toBe("https://www.youtube-nocookie.com/embed/abc123");
    expect(videoEmbedUrl("https://youtu.be/abc123")).toBe("https://www.youtube-nocookie.com/embed/abc123");
    expect(videoEmbedUrl("https://vimeo.com/987654")).toBe("https://player.vimeo.com/video/987654");
    expect(videoEmbedUrl("https://cdn.example.test/lesson.mp4")).toBeNull();
  });
});

describe("sample content", () => {
  it("has unique ids and web address names", () => {
    for (const list of [seedServices, seedCourses, seedLiveSessions]) {
      expect(new Set(list.map((x) => x.id)).size).toBe(list.length);
      expect(new Set(list.map((x) => x.slug)).size).toBe(list.length);
    }
  });
});

describe("utilities", () => {
  it("only allows same-site redirect targets after sign-in", () => {
    expect(safeNextPath("/learn/x")).toBe("/learn/x");
    expect(safeNextPath("https://evil.test")).toBe("/dashboard");
    expect(safeNextPath("//evil.test")).toBe("/dashboard");
    expect(safeNextPath("/\\evil.test")).toBe("/dashboard");
    expect(safeNextPath(null)).toBe("/dashboard");
  });
  it("formats prices", () => {
    expect(formatPrice(0)).toBe("Free");
    expect(formatPrice(249900).replace(/\s/g, " ")).toBe("R 2 499");
  });
  it("makes web address names", () => {
    expect(slugify("  Funding & Investor Readiness! ")).toBe("funding-investor-readiness");
  });
});

describe("form validation", () => {
  const person = { name: "Lebo Mokoena", email: " Lebo@Example.Test ", phone: "", company: "", consent: "on" };

  it("normalises a valid enquiry", () => {
    const result = enquirySchema.safeParse({ ...person, service_id: "", message: "Please call me about funding." });
    expect(result.success && result.data).toMatchObject({ email: "lebo@example.test", phone: null, service_id: null });
  });
  it("requires consent", () => {
    const { consent: _c, ...rest } = person;
    expect(enquirySchema.safeParse({ ...rest, service_id: "", message: "Please call me about funding." }).success).toBe(false);
  });
  it("rejects malformed bookings", () => {
    const base = { ...person, service_id: "", preferred_time: "10:00", mode: "online", notes: "" };
    expect(bookingSchema.safeParse({ ...base, preferred_date: "2027-02-30" }).success).toBe(false);
    expect(bookingSchema.safeParse({ ...base, preferred_date: "2027-02-12", mode: "phone" }).success).toBe(false);
    expect(bookingSchema.safeParse({ ...base, preferred_date: "2027-02-12" }).success).toBe(true);
  });
  it("enforces password length", () => {
    const base = { full_name: "Lebo Mokoena", email: "l@example.test", consent: "on" };
    expect(registerSchema.safeParse({ ...base, password: "short" }).success).toBe(false);
    expect(registerSchema.safeParse({ ...base, password: "long enough pw" }).success).toBe(true);
  });
});
