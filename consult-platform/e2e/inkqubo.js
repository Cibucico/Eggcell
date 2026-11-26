/**
 * End-to-end checks for a community brand (iNkqubo) against the local stack.
 *   NEXT_PUBLIC_BRAND=inkqubo ./supabase/local/start.sh --reset
 *   npm run build && npm start
 *   node e2e/inkqubo.js
 * Set E2E_JAAS=1 when the server runs with (test) JaaS keys to check the
 * video room loads.
 */
const { chromium } = require("playwright");
const { execFileSync } = require("node:child_process");

const BASE = process.env.E2E_BASE_URL ?? "http://localhost:3000";
const DB = process.env.LOCAL_DB ?? "consult_local";
const PSQL = (process.env.PSQL_SUPER ?? "sudo -u postgres psql").split(" ");
const sql = (q) => execFileSync(PSQL[0], [...PSQL.slice(1), "-d", DB, "-tAc", q]).toString().trim();

const stamp = Date.now();
const admin = { name: "Ada Admin", email: `ada+${stamp}@example.test`, password: "correct horse 42" };
const member = { name: "Naledi Dlamini", email: `naledi+${stamp}@example.test`, password: "battery staple 77" };
const other = { name: "Zola Other", email: `zola+${stamp}@example.test`, password: "another pass 99" };

let failures = 0;
const check = (ok, label, detail = "") => {
  if (!ok) failures += 1;
  console.log(`${ok ? "ok  " : "FAIL"} ${label}${ok || !detail ? "" : ` -> ${detail}`}`);
};
const path = (page) => new URL(page.url()).pathname;
const seen = (locator, timeout = 10000) =>
  locator.first().waitFor({ state: "visible", timeout }).then(() => true, () => false);
async function until(fn, timeout = 10000) {
  const end = Date.now() + timeout;
  while (Date.now() < end) {
    if (fn()) return true;
    await new Promise((r) => setTimeout(r, 250));
  }
  return false;
}

async function register(page, user, gender = "woman") {
  await page.goto(`${BASE}/register`);
  await page.fill("[name=full_name]", user.name);
  await page.fill("[name=email]", user.email);
  await page.fill("[name=password]", user.password);
  await page.selectOption("[name=gender]", gender);
  await page.check("[name=consent]");
  await page.click("button[type=submit]");
}

(async () => {
  const browser = await chromium.launch();
  const errors = [];
  const newPage = async (viewport = { width: 1280, height: 900 }) => {
    const ctx = await browser.newContext({ viewport });
    const page = await ctx.newPage();
    page.on("pageerror", (e) => errors.push(String(e)));
    return page;
  };

  // ---- Public pages ----------------------------------------------------------
  const v = await newPage();
  await v.goto(`${BASE}/`);
  check(await seen(v.getByRole("heading", { level: 1, name: /A space for women/ })), "home shows the headline");
  check(await seen(v.locator('img[alt^="Painting of a woman"]')), "home shows the hero painting");
  check(await seen(v.getByText("Why we")), "home shows why we exist");
  check(await seen(v.getByRole("link", { name: /Operations/ })), "home shows the toolkit path");
  check(await seen(v.locator("#contact form")), "home ends with the contact form");
  check(await seen(v.getByRole("link", { name: "iNkqubo Consultancy home" })), "logo links home");

  await v.getByRole("button", { name: "Open menu" }).click();
  const menu = v.locator("#site-menu");
  for (const label of ["About", "Toolkit", "Operations", "Marketing", "Finance", "Meeting room", "Investors", "Contact"]) {
    check(await seen(menu.getByRole("link", { name: label, exact: true })), `menu lists ${label}`);
  }
  await menu.getByRole("link", { name: "Finance", exact: true }).click();
  await v.waitForURL("**/toolkit/finance");
  check(await seen(v.getByRole("link", { name: /Separate your business and personal money/ })), "finance lists its guides in order");
  await v.getByRole("link", { name: /Separate your business and personal money/ }).click();
  check(await seen(v.getByRole("heading", { level: 1, name: /Separate your business/ })), "a guide opens");
  check(await seen(v.getByText("Next guide")), "a guide links to the next one");

  await v.goto(`${BASE}/about`);
  check(await seen(v.locator('img[alt^="iNkqubo Consultancy logo"]')), "about shows the full logo");
  for (const t of ["Our Mission", "Our Vision", "Our Purpose", "Who we serve"]) {
    check(await seen(v.getByText(t, { exact: true })), `about shows ${t}`);
  }
  check(await seen(v.locator("#contact form")), "about ends with the contact form");

  await v.goto(`${BASE}/meeting-room`);
  check(await seen(v.getByText("The meeting room is for members")), "meeting room asks visitors to join");

  // ---- Contact form -------------------------------------------------------
  await v.goto(`${BASE}/`);
  const form = v.locator("#contact form");
  await form.locator("[name=name]").fill("Thembi Visitor");
  await form.locator("[name=email]").fill(`thembi+${stamp}@example.test`);
  await form.locator("[name=company]").fill("Thembi's Kitchen");
  await form.locator("[name=service_id]").selectOption({ label: "Marketing" });
  await form.locator("[name=message]").fill("I need help finding customers for my catering business.");
  await form.locator("[name=consent]").check();
  await form.getByRole("button", { name: "Send enquiry" }).click();
  check(await seen(v.getByText("Your enquiry has been received")), "contact form confirms");
  check(
    sql(`select e.company || '|' || s.title from enquiries e join services s on s.id = e.service_id where e.email='thembi+${stamp}@example.test'`) ===
      "Thembi's Kitchen|Marketing",
    "enquiry saved with business name and topic",
  );

  // ---- Chat (visitor) --------------------------------------------------------
  const chat = await newPage({ width: 390, height: 844 });
  await chat.goto(`${BASE}/toolkit`);
  await chat.getByRole("button", { name: "Chat with us" }).click();
  const panel = chat.locator("#chat-panel");
  await panel.locator("[name=name]").fill("Lerato Visitor");
  await panel.locator("[name=email]").fill(`lerato+${stamp}@example.test`);
  await panel.locator("[name=body]").fill("Hello, do you help with registering a company?");
  await panel.locator("[name=consent]").check();
  await panel.getByRole("button", { name: "Start chat" }).click();
  check(await seen(panel.getByText("We will reply here and by email")), "visitor starts a chat");
  await panel.locator("#chat-body").fill("I am in Soweto.");
  await panel.locator("#chat-body").press("Enter");
  check(await seen(panel.getByText("I am in Soweto.")), "visitor sends a second message");
  check(
    sql(`select count(*) from chat_messages m join chat_conversations c on c.id = m.conversation_id where c.visitor_email='lerato+${stamp}@example.test'`) === "2",
    "chat messages are saved",
  );
  const overflow = await chat.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  check(!overflow, "chat panel fits on a phone");

  // ---- Sign-up with the gender question -------------------------------------
  const m = await newPage();
  await register(m, { ...other, email: `man+${stamp}@example.test` }, "man");
  check(await seen(m.getByText("Membership is for women")), "choosing Man is refused");
  check(sql(`select count(*) from auth.users where email='man+${stamp}@example.test'`) === "0", "no account is made for a refused sign-up");

  await register(m, member, "woman");
  await m.waitForURL("**/dashboard", { timeout: 15000 }).catch(() => {});
  check(path(m) === "/dashboard", "a woman can sign up", m.url());
  check(await seen(m.getByText("Your membership is being reviewed")), "dashboard says the membership is being reviewed");
  check(
    sql(`select verification_status || '|' || coalesce(verification_note,'') from profiles where email='${member.email}'`) ===
      "pending|Chose 'Woman' at sign-up",
    "membership waits for approval",
  );

  await m.goto(`${BASE}/meeting-room`);
  check(await seen(m.getByText("Your membership is being reviewed")), "meeting room stays locked until approval");
  const session = sql("select slug from live_sessions order by starts_at limit 1");
  await m.goto(`${BASE}/meeting-room/${session}`);
  check(await seen(m.getByText("Your membership is being reviewed")), "a session room is locked until approval");

  // Book an online consultation while signed in.
  await m.goto(`${BASE}/book`);
  await m.fill("[name=name]", member.name);
  await m.fill("[name=email]", member.email);
  await m.fill("[name=preferred_date]", await m.getAttribute("[name=preferred_date]", "min"));
  await m.selectOption("[name=preferred_time]", "10:00");
  await m.check("[name=consent]");
  await m.click("button[type=submit]");
  check(await seen(m.getByText("Your request has been received")), "member requests a consultation");

  // ---- Admin ---------------------------------------------------------------
  const a = await newPage();
  await register(a, admin, "woman");
  await a.waitForURL("**/dashboard", { timeout: 15000 }).catch(() => {});
  sql(`update profiles set role='admin' where email='${admin.email}'`);
  await a.goto(`${BASE}/admin`);
  check(await seen(a.getByText("Members to approve")), "admin dashboard shows members to approve");
  check(await seen(a.getByText("Unanswered chats")), "admin dashboard shows unanswered chats");

  await a.goto(`${BASE}/admin/users`);
  check(await seen(a.getByText(/waiting for approval/)), "members page lists members waiting");
  const row = a.locator("tr", { hasText: member.email });
  check(await seen(row.getByText("Chose 'Woman' at sign-up")), "members page shows how she was checked");
  await row.getByRole("button", { name: "Approve" }).click();
  await a.waitForURL("**/admin/users?saved=1");
  check(sql(`select verification_status from profiles where email='${member.email}'`) === "approved", "admin approves the member");

  // Chat reply
  await a.goto(`${BASE}/admin/chat`);
  check(await seen(a.getByText("Lerato Visitor")), "chat inbox lists the conversation");
  await a.getByRole("link", { name: /Lerato Visitor/ }).click();
  check(await seen(a.getByText("I am in Soweto.")), "admin reads the chat");
  await a.fill("#reply", "Yes, we can help. Book a consultation and we will walk you through CIPC registration.");
  await a.getByRole("button", { name: "Send" }).click();
  await a.waitForLoadState("load");
  check(
    await until(() => sql(`select status || '|' || unread_for_staff from chat_conversations where visitor_email='lerato+${stamp}@example.test'`) === "in_progress|false"),
    "reply marks the chat answered",
  );
  check(await seen(panel.getByText("walk you through CIPC registration"), 15000), "visitor sees the reply in her chat");
  await chat.reload();
  await chat.getByRole("button", { name: "Chat with us" }).click();
  check(await seen(chat.locator("#chat-panel").getByText("walk you through CIPC registration")), "chat history survives a page reload");

  // Toolkit article written in the admin area
  await a.goto(`${BASE}/admin/content/toolkit/new`);
  await a.fill("#title", `Cash flow basics ${stamp}`);
  await a.selectOption("#category", "finance");
  await a.fill("#summary", "Keep enough cash to pay the bills.");
  await a.getByRole("button", { name: "Text", exact: true }).click();
  await a.locator("ol > li").last().locator("textarea").fill("Cash flow is the money moving **in and out** of your business.");
  await a.getByRole("button", { name: "Video", exact: true }).click();
  await a.locator("ol > li").last().locator("input").first().fill("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
  await a.check("#published");
  await a.getByRole("button", { name: "Create" }).click();
  await a.waitForURL("**/admin/content/toolkit/*?saved=1");
  check(true, "admin creates a toolkit article with text and video");
  // The first visit after publishing may still get the cached page while it rebuilds.
  let listed = false;
  for (let tries = 0; tries < 3 && !listed; tries += 1) {
    await v.goto(`${BASE}/toolkit/finance`);
    listed = await seen(v.getByText(`Cash flow basics ${stamp}`), 4000);
  }
  check(listed, "new article appears in the toolkit");
  await v.getByText(`Cash flow basics ${stamp}`).click();
  check(await seen(v.locator('iframe[src*="youtube-nocookie.com/embed/dQw4w9WgXcQ"]')), "article shows the embedded video");

  // Consultation in the meeting room
  await a.goto(`${BASE}/admin/bookings`);
  const booking = a.locator("div", { hasText: member.email }).filter({ has: a.locator("form") }).last();
  await booking.locator("select[name=status]").selectOption("confirmed");
  await booking.locator("[name=use_room]").check();
  await booking.getByRole("button", { name: "Save" }).click();
  await a.waitForURL("**/admin/bookings?saved=1");
  const link = sql(`select meeting_link from bookings where email='${member.email}'`);
  check(/\/meeting-room\/consultation\/[0-9a-f-]{36}$/.test(link), "admin puts the consultation in the meeting room", link);

  // ---- Approved member ----------------------------------------------------
  await m.goto(`${BASE}/dashboard`);
  check(await seen(m.getByText("Your membership is approved")), "member sees she is approved");
  check(await seen(m.getByRole("link", { name: "Join meeting" })), "member sees the consultation room link");
  await m.goto(`${BASE}/meeting-room`);
  check(await seen(m.getByText("Upcoming webinars and meetings")), "approved member sees the sessions");
  check(await seen(m.getByText("Opens 30 minutes before the start")), "future sessions show when they open");
  await m.goto(`${BASE}${new URL(link).pathname}`);
  check(await seen(m.getByRole("heading", { name: /Your consultation with/ })), "member opens her consultation room");
  const jaas = process.env.E2E_JAAS === "1";
  if (jaas) {
    check(await seen(m.locator("text=Opening the meeting room…").or(m.locator("iframe"))), "video room starts loading");
  } else {
    check(await seen(m.getByText("The meeting room is being set up")), "room shows set-up notice until keys are added");
  }

  // Admins host any session at any time.
  await a.goto(`${BASE}/meeting-room/${session}`);
  check(await seen(a.getByText(jaas ? "You are hosting" : "The meeting room is being set up")), "admin can open a session room early");

  // Someone else cannot open her consultation room.
  const o = await newPage();
  await register(o, other, "woman");
  await o.waitForURL("**/dashboard", { timeout: 15000 }).catch(() => {});
  const res = await o.goto(`${BASE}${new URL(link).pathname}`);
  check(res.status() === 404 || (await seen(o.getByText("We could not find that page"))), "another member cannot open her consultation room");

  // Installable app
  const manifest = await (await fetch(`${BASE}/manifest.webmanifest`)).json();
  check(manifest.name === "iNkqubo Consultancy" && manifest.icons.length >= 2, "site can be installed as an app");

  check(errors.length === 0, "no browser errors", errors.slice(0, 3).join(" | "));
  await browser.close();
  console.log(failures === 0 ? "\nALL INKQUBO CHECKS PASSED" : `\n${failures} CHECK(S) FAILED`);
  process.exit(failures === 0 ? 0 : 1);
})().catch((err) => {
  console.error("\nSTOPPED:", err.message.split("\n").slice(0, 6).join("\n"));
  process.exit(1);
});
