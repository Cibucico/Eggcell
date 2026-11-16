import { LeadCard, NotesField, SaveButton, StatusSelect } from "@/components/admin/lead-card";
import { AdminHeader, Feedback, inputClass } from "@/components/admin/ui";
import { Badge, EmptyState } from "@/components/ui/primitives";
import { updateBooking } from "@/lib/actions/admin";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatMoney } from "@/lib/utils";

const tones = { requested: "accent", confirmed: "success", completed: "neutral", cancelled: "danger" } as const;
const labels = { requested: "To confirm", confirmed: "Confirmed", completed: "Completed", cancelled: "Cancelled" } as const;

export default async function BookingsPage({ searchParams }: PageProps<"/admin/bookings">) {
  const query = await searchParams;
  await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bookings")
    .select("*, service:services(title)")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw new Error(`Could not load consultations: ${error.message}`);
  const rows = data ?? [];

  return (
    <>
      <AdminHeader
        title="Consultations"
        intro="Confirm a request and add the meeting link. The client is emailed when you confirm. Showing the latest 100."
      />
      <Feedback query={query} />
      {rows.length === 0 ? (
        <EmptyState title="No consultation requests yet" text="Requests from the booking page will appear here." />
      ) : (
        <div className="space-y-4">
          {rows.map((row) => (
            <LeadCard
              key={row.id}
              name={row.name}
              email={row.email}
              phone={row.phone}
              createdAt={row.created_at}
              badge={<Badge tone={tones[row.status as keyof typeof tones]}>{labels[row.status as keyof typeof labels]}</Badge>}
              details={[
                ["Requested", `${formatDate(row.preferred_date)} at ${row.preferred_time}`],
                ["Meeting", row.mode === "online" ? "Online" : "In person"],
                ["Company", row.company],
                ["Topic", (row.service as { title: string } | null)?.title],
                [
                  "Deposit",
                  row.deposit_cents > 0
                    ? `${formatMoney(row.deposit_cents)} · ${row.deposit_paid_at ? "paid" : "not paid yet"}`
                    : null,
                ],
              ]}
              message={row.notes}
            >
              <form action={updateBooking} className="space-y-3">
                <input type="hidden" name="id" value={row.id} />
                <StatusSelect
                  value={row.status}
                  options={[
                    ["requested", "To confirm"],
                    ["confirmed", "Confirmed"],
                    ["completed", "Completed"],
                    ["cancelled", "Cancelled"],
                  ]}
                />
                <label className="block text-sm">
                  <span className="mb-1 block font-medium">Meeting link</span>
                  <input
                    name="meeting_link"
                    type="url"
                    defaultValue={row.meeting_link ?? ""}
                    placeholder="https://…"
                    pattern="https://.*"
                    className={inputClass}
                  />
                </label>
                <NotesField value={row.admin_notes} />
                <SaveButton />
              </form>
            </LeadCard>
          ))}
        </div>
      )}
    </>
  );
}
