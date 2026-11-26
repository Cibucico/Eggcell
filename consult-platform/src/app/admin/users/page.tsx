import { AdminHeader, Feedback, inputClass, Panel } from "@/components/admin/ui";
import { buttonClass } from "@/components/ui/button";
import { Badge } from "@/components/ui/primitives";
import { brand } from "@/config/brand";
import { decideMembership, setUserRole } from "@/lib/actions/admin";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { VerificationStatus } from "@/lib/types";
import { formatDate } from "@/lib/utils";

const statusBadge: Record<VerificationStatus, { label: string; tone: "accent" | "success" | "danger" | "neutral" }> = {
  pending: { label: "Waiting for approval", tone: "accent" },
  approved: { label: "Approved", tone: "success" },
  rejected: { label: "Declined", tone: "danger" },
  unverified: { label: "ID not checked", tone: "neutral" },
};

const order: Record<VerificationStatus, number> = { pending: 0, unverified: 1, approved: 2, rejected: 3 };

export default async function UsersPage({ searchParams }: PageProps<"/admin/users">) {
  const query = await searchParams;
  const me = await requireAdmin();
  const womenOnly = brand.features.womenOnly;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, company, role, created_at, verification_status, id_number_hash")
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) throw new Error(`Could not load users: ${error.message}`);
  const rows = [...(data ?? [])].sort((a, b) =>
    womenOnly ? order[a.verification_status as VerificationStatus] - order[b.verification_status as VerificationStatus] : 0,
  );
  const waiting = rows.filter((r) => r.verification_status === "pending").length;

  return (
    <>
      <AdminHeader
        title={womenOnly ? "Members" : "Users"}
        intro={
          womenOnly
            ? "Everyone with an account. New members wait here until you approve them; only approved members can enter the meeting room. Editors can manage the toolkit, webinars and website content. Admins can do everything."
            : "Everyone with an account. Editors can manage courses, live sessions and website content. Admins can do everything, including seeing leads and payments."
        }
      />
      <Feedback query={query} />
      {womenOnly && waiting > 0 && (
        <p className="mb-6 rounded-brand border border-accent/40 bg-accent/10 px-4 py-3 text-sm font-medium">
          {waiting} {waiting === 1 ? "member is" : "members are"} waiting for approval.
        </p>
      )}
      <Panel className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line text-xs uppercase tracking-wider text-muted">
            <tr>
              {["Name", "Business", "Joined", ...(womenOnly ? ["Membership"] : []), "Role"].map((h) => (
                <th key={h} scope="col" className="px-4 py-3 font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const status = row.verification_status as VerificationStatus;
              const isStaff = row.role !== "member";
              return (
                <tr key={row.id} className="border-b border-line align-top last:border-b-0">
                  <td className="px-4 py-3">
                    <span className="font-medium">{row.full_name || "—"}</span>
                    <span className="block text-xs text-muted">{row.email}</span>
                  </td>
                  <td className="px-4 py-3">{row.company ?? "—"}</td>
                  <td className="whitespace-nowrap px-4 py-3">{formatDate(row.created_at)}</td>
                  {womenOnly && (
                    <td className="px-4 py-3">
                      {isStaff ? (
                        <span className="text-xs text-muted">Staff</span>
                      ) : (
                        <div className="space-y-2">
                          <Badge tone={statusBadge[status].tone}>{statusBadge[status].label}</Badge>
                          {row.id_number_hash && (
                            <span className="block text-xs text-muted">Valid female SA ID checked</span>
                          )}
                          {status !== "approved" && (
                            <form action={decideMembership} className="flex flex-wrap gap-2">
                              <input type="hidden" name="user_id" value={row.id} />
                              <button type="submit" name="decision" value="approved" className={buttonClass("primary", "sm")}>
                                Approve
                              </button>
                              {status !== "rejected" && (
                                <button type="submit" name="decision" value="rejected" className={buttonClass("outline", "sm")}>
                                  Decline
                                </button>
                              )}
                            </form>
                          )}
                          {status === "approved" && (
                            <form action={decideMembership}>
                              <input type="hidden" name="user_id" value={row.id} />
                              <button type="submit" name="decision" value="rejected" className="text-xs font-semibold text-danger hover:underline">
                                Remove access
                              </button>
                            </form>
                          )}
                        </div>
                      )}
                    </td>
                  )}
                  <td className="px-4 py-3">
                    <form action={setUserRole} className="flex items-center gap-2">
                      <input type="hidden" name="user_id" value={row.id} />
                      <select
                        name="role"
                        defaultValue={row.role}
                        aria-label={`Role for ${row.email}`}
                        disabled={row.id === me.id}
                        className={`${inputClass} w-32`}
                      >
                        <option value="member">Member</option>
                        <option value="editor">Editor</option>
                        <option value="admin">Admin</option>
                      </select>
                      {row.id === me.id ? (
                        <span className="text-xs text-muted">You</span>
                      ) : (
                        <button type="submit" className={buttonClass("outline", "sm")}>
                          Save
                        </button>
                      )}
                    </form>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Panel>
    </>
  );
}
