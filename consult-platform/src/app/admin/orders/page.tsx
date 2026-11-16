import { AdminHeader, Panel } from "@/components/admin/ui";
import { Badge, EmptyState } from "@/components/ui/primitives";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatDateTime, formatMoney } from "@/lib/utils";

const tones = { paid: "success", pending: "accent", failed: "danger", cancelled: "neutral" } as const;
const kinds = { course: "Course", live_session: "Live session", consultation: "Consultation deposit" } as const;

export default async function OrdersPage() {
  await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("id, kind, description, subtotal_cents, discount_cents, amount_cents, status, created_at, paid_at, provider_payment_id, buyer:profiles(full_name, email), code:discount_codes(code)")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw new Error(`Could not load payments: ${error.message}`);
  const rows = data ?? [];

  return (
    <>
      <AdminHeader title="Payments" intro="Every order placed at checkout. Showing the latest 200." />
      {rows.length === 0 ? (
        <EmptyState title="No orders yet" text="Orders appear here as soon as someone starts a checkout." />
      ) : (
        <Panel className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line text-xs uppercase tracking-wider text-muted">
              <tr>
                {["Date", "Buyer", "Item", "Amount", "Status", "PayFast reference"].map((h) => (
                  <th key={h} scope="col" className="px-4 py-3 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const buyer = row.buyer as unknown as { full_name: string; email: string } | null;
                const code = row.code as unknown as { code: string } | null;
                return (
                  <tr key={row.id} className="border-b border-line align-top last:border-b-0">
                    <td className="whitespace-nowrap px-4 py-3">{formatDateTime(row.created_at)}</td>
                    <td className="px-4 py-3">
                      <span className="font-medium">{buyer?.full_name || "—"}</span>
                      <span className="block text-xs text-muted">{buyer?.email}</span>
                    </td>
                    <td className="px-4 py-3">
                      {row.description}
                      <span className="block text-xs text-muted">{kinds[row.kind as keyof typeof kinds]}</span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span className="font-medium">{formatMoney(row.amount_cents)}</span>
                      {row.discount_cents > 0 && (
                        <span className="block text-xs text-muted">
                          {formatMoney(row.discount_cents)} off{code ? ` (${code.code})` : ""}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={tones[row.status as keyof typeof tones]}>{row.status}</Badge>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{row.provider_payment_id ?? "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Panel>
      )}
    </>
  );
}
