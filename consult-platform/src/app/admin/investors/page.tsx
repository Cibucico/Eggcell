import { LEAD_OPTIONS, LeadCard, LeadStatusBadge, NotesField, SaveButton, StatusSelect } from "@/components/admin/lead-card";
import { AdminHeader, Feedback } from "@/components/admin/ui";
import { EmptyState } from "@/components/ui/primitives";
import { updateLead } from "@/lib/actions/admin";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function Page({ searchParams }: PageProps<"/admin/investors">) {
  const query = await searchParams;
  await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("investor_leads")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw new Error(`Could not load this page: ${error.message}`);
  const rows = data ?? [];

  return (
    <>
      <AdminHeader title="Investor interest" intro="People who registered interest on the investors page. Showing the latest 100." />
      <Feedback query={query} />
      {rows.length === 0 ? (
        <EmptyState title="Nothing here yet" text="New submissions will appear on this page." />
      ) : (
        <div className="space-y-4">
          {rows.map((row) => (
            <LeadCard
              key={row.id}
              name={row.name}
              email={row.email}
              phone={row.phone}
              createdAt={row.created_at}
              badge={<LeadStatusBadge status={row.status} />}
              details={[
                ["Organisation", row.organisation],
                ["Type", row.investor_type],
                ["Indicative amount", row.ticket_range],
              ]}
              message={row.message}
            >
              <form action={updateLead} className="space-y-3">
                <input type="hidden" name="table" value="investor_leads" />
                <input type="hidden" name="id" value={row.id} />
                <StatusSelect value={row.status} options={LEAD_OPTIONS} />
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
