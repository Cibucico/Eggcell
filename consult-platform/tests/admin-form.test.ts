import { describe, expect, it } from "vitest";
import { parseResourceForm, toFormValue } from "@/lib/admin/form";
import { getResource } from "@/lib/admin/resources";

const form = (values: Record<string, string>) => {
  const fd = new FormData();
  for (const [k, v] of Object.entries(values)) fd.set(k, v);
  return fd;
};
const services = getResource("services")!;
const sessions = getResource("live-sessions")!;
const discounts = getResource("discounts")!;

describe("parseResourceForm", () => {
  it("converts a service form for storage", () => {
    const result = parseResourceForm(
      services,
      form({
        title: "Tax Advisory",
        slug: "",
        summary: "Help with tax.",
        description: "",
        icon: "scale",
        deliverables: "Review\n\n  Plan  \n",
        price_from_cents: "12 500,50",
        duration_label: "",
        booking_deposit_cents: "",
        featured: "on",
        sort_order: "3",
      }),
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.main).toMatchObject({
      title: "Tax Advisory",
      slug: "tax-advisory",
      deliverables: ["Review", "Plan"],
      price_from_cents: 1250050,
      booking_deposit_cents: 0,
      featured: true,
      published: false,
      sort_order: 3,
    });
  });

  it("stores a blank optional price as empty, not zero", () => {
    const result = parseResourceForm(services, form({ title: "X", icon: "scale", price_from_cents: "" }));
    expect(result.ok && result.main.price_from_cents).toBeNull();
  });

  it("requires required fields and rejects bad values", () => {
    const result = parseResourceForm(
      services,
      form({ title: "", icon: "not-an-icon", price_from_cents: "-5", sort_order: "abc" }),
    );
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(Object.keys(result.fieldErrors).sort()).toEqual(
      ["icon", "price_from_cents", "slug", "sort_order", "title"].sort(),
    );
  });

  it("only accepts https links", () => {
    const team = getResource("team")!;
    const bad = parseResourceForm(team, form({ name: "A", photo_url: "javascript:alert(1)" }));
    expect(bad.ok).toBe(false);
    const good = parseResourceForm(team, form({ name: "A", photo_url: "https://cdn.example.test/a.jpg" }));
    expect(good.ok && good.main.photo_url).toBe("https://cdn.example.test/a.jpg");
  });

  it("reads live session times as South African time and splits off the joining link", () => {
    const result = parseResourceForm(
      sessions,
      form({
        title: "Clinic",
        starts_at: "2027-01-21T16:00",
        duration_minutes: "60",
        platform: "Zoom",
        price_cents: "450",
        capacity: "",
        join_url: "https://zoom.example.test/j/1",
        passcode: "1234",
      }),
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.main.starts_at).toBe("2027-01-21T14:00:00.000Z");
    expect(result.main.price_cents).toBe(45000);
    expect(result.main.capacity).toBeNull();
    expect(result.main).not.toHaveProperty("join_url");
    expect(result.companion).toMatchObject({ join_url: "https://zoom.example.test/j/1", passcode: "1234" });
  });

  it("round-trips a stored time back into the form", () => {
    const field = sessions.fields.find((f) => f.name === "starts_at")!;
    expect(toFormValue(field, "2027-01-21T14:00:00+00:00")).toBe("2027-01-21T16:00");
  });

  it("validates discount codes", () => {
    const percent = parseResourceForm(discounts, form({ code: "launch-20", kind: "percent", value: "20", applies_to: "" }));
    expect(percent.ok && percent.main).toMatchObject({ code: "LAUNCH20", value: 20, applies_to: null, max_uses: null });

    const tooHigh = parseResourceForm(discounts, form({ code: "BIG", kind: "percent", value: "150", applies_to: "" }));
    expect(tooHigh.ok).toBe(false);

    const amount = parseResourceForm(discounts, form({ code: "R100OFF", kind: "amount", value: "100", applies_to: "course" }));
    expect(amount.ok && amount.main).toMatchObject({ value: 10000, applies_to: "course" });
  });

  it("shows a rand discount in rand when editing", () => {
    const field = discounts.fields.find((f) => f.name === "value")!;
    expect(toFormValue(field, 10000, "amount")).toBe("100");
    expect(toFormValue(field, 20, "percent")).toBe("20");
  });
});
