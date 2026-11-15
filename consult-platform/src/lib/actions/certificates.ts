"use server";

import { redirect } from "next/navigation";

export async function findCertificate(formData: FormData) {
  const serial = String(formData.get("serial") ?? "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 32);
  redirect(serial ? `/certificates/${serial}` : "/certificates");
}
