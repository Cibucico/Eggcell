/**
 * End-to-end check of the signed-in flows against the local Supabase stack.
 *   1. ./supabase/local/start.sh --reset
 *   2. npm run build && npm start
 *   3. npm run test:e2e
 * Uses Playwright from the machine (not a project dependency).
 */
const { chromium } = require("playwright");
const { execFileSync } = require("node:child_process");

const BASE = process.env.E2E_BASE_URL ?? "http://localhost:3000";
const DB = process.env.LOCAL_DB ?? "consult_local";
const PSQL = (process.env.PSQL_SUPER ?? "sudo -u postgres psql").split(" ");
const sql = (q) => execFileSync(PSQL[0], [...PSQL.slice(1), "-d", DB, "-tAc", q]).toString().trim();

const stamp = Date.now();
const admin = { name: "Ada Admin", email: `ada+${stamp}@example.test`, password: "correct horse 42" };
const member = { name: "Lebo Learner", email: `lebo+${stamp}@example.test`, password: "battery staple 77" };

let failures = 0;
const pending = new Map();
const check = (ok, label, detail = "") => {
  if (!ok) failures += 1;
  console.log(`${ok ? "ok  " : "FAIL"} ${label}${ok || !detail ? "" : ` -> ${detail}`}`);
};
const path = (page) => new URL(page.url()).pathname;
/** True once the element shows up; content behind sign-in streams in after the page shell. */
/** Polls the database until a condition holds (form posts finish a moment after the click). */
async function until(fn, timeout = 10000) {
  const end = Date.now() + timeout;
  while (Date.now() < end) {
    if (fn()) return true;
    await new Promise((r) => setTimeout(r, 200));
  }
  return false;
}
const seen = (locator, timeout = 10000) =>
  locator.first().waitFor({ state: "visible", timeout }).then(() => true, () => false);

/** With email confirmation switched on, test users for the main flow are confirmed directly. */
const confirmInDb = (user) => sql(`update auth.users set email_confirmed_at = now() where email='${user.email}'`);

async function register(page, user, next = "") {
  await page.goto(`${BASE}/register${next ? `?next=${encodeURIComponent(next)}` : ""}`);
  await page.fill("[name=full_name]", user.name);
  await page.fill("[name=email]", user.email);
  await page.fill("[name=password]", user.password);
  await page.check("[name=consent]");
  await page.click("button[type=submit]");
  if (process.env.E2E_EMAIL === "1") {
    await seen(page.getByText("We have sent a confirmation link"));
    confirmInDb(user);
    await signIn(page, user);
  }
  await page.waitForURL((u) => !u.pathname.startsWith("/register") && !u.pathname.startsWith("/login"), { timeout: 15000 });
}

async function signIn(page, user) {
  await page.goto(`${BASE}/login`);
  await page.fill("[name=email]", user.email);
  await page.fill("[name=password]", user.password);
  await page.click("button[type=submit]");
}

(async () => {
  const browser = await chromium.launch();
  const errors = [];
  const newPage = async () => {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await ctx.newPage();
    page.on("pageerror", (e) => errors.push(String(e)));
    page.on("request", (r) => pending.set(r, Date.now()));
    page.on("requestfinished", (r) => pending.delete(r));
    page.on("requestfailed", (r) => pending.delete(r));
    return page;
  };

  // ---- Member: account ---------------------------------------------------
  const m = await newPage();
  await register(m, member);
  check(path(m) === "/dashboard", "register signs the user in and opens the dashboard", m.url());
  check(await seen(m.getByText("Welcome, Lebo")), "dashboard greets the user by name");
  check(sql(`select role from profiles where email='${member.email}'`) === "member", "profile row created as member");

  await m.goto(`${BASE}/admin`);
  await m.waitForURL("**/dashboard");
  check(path(m) === "/dashboard", "member is turned away from the admin area");

  // profile edit
  await m.goto(`${BASE}/dashboard/profile`);
  await m.fill("[name=company]", "Lebo Trading");
  await m.click("button[type=submit]");
  await m.getByText("Your details have been saved.").waitFor();
  check(sql(`select company from profiles where email='${member.email}'`) === "Lebo Trading", "profile edit is saved");

  // ---- Member: lead forms --------------------------------------------------
  await m.goto(`${BASE}/contact?service=funding-readiness`);
  // The topic is pre-selected from the link once the page has loaded.
  await m.waitForFunction(() => document.querySelector("[name=service_id]")?.value !== "");
  await m.fill("[name=name]", member.name);
  await m.fill("[name=email]", member.email);
  await m.fill("[name=message]", "We would like help preparing for a funding round.");
  await m.check("[name=consent]");
  await m.click("button[type=submit]");
  await m.getByText("Your enquiry has been received").waitFor();
  check(sql(`select count(*) from enquiries where email='${member.email}' and service_id is not null and user_id is not null`) === "1", "enquiry saved with service and user");

  await m.goto(`${BASE}/book`);
  await m.fill("[name=name]", member.name);
  await m.fill("[name=email]", member.email);
  const date = await m.getAttribute("[name=preferred_date]", "min");
  await m.fill("[name=preferred_date]", date);
  await m.selectOption("[name=preferred_time]", "10:00");
  await m.check("[name=consent]");
  await m.click("button[type=submit]");
  await m.getByText("Your request has been received").waitFor();
  check(sql(`select status from bookings where email='${member.email}'`) === "requested", "consultation request saved");

  await m.goto(`${BASE}/investors`);
  await m.fill("[name=name]", "Ivy Investor");
  await m.fill("[name=email]", `ivy+${stamp}@example.test`);
  await m.selectOption("[name=investor_type]", { index: 1 });
  await m.check("[name=consent]");
  await m.click("button[type=submit]");
  await m.getByText("Thank you for your interest").waitFor();
  check(sql(`select count(*) from investor_leads where email='ivy+${stamp}@example.test'`) === "1", "investor interest saved");

  // ---- Member: free course, progress, certificate --------------------------
  await m.goto(`${BASE}/training/popia-essentials`);
  await m.click("text=Start for free");
  await m.waitForURL("**/enrol/popia-essentials");
  await m.click("text=Enrol and start learning");
  check(await seen(m.getByText("Lesson 1 of 2")), "free enrolment opens the first lesson");

  for (let lesson = 0; lesson < 2; lesson += 1) {
    await seen(m.getByRole("button", { name: /Complete/ }).or(m.getByRole("button", { name: "Next", exact: true })));
    while (await m.getByRole("button", { name: "Next", exact: true }).isVisible().catch(() => false)) {
      await m.getByRole("button", { name: "Next", exact: true }).click();
    }
    const before = m.url();
    await m.getByRole("button", { name: /Complete/ }).click();
    await m.waitForURL((u) => u.href !== before, { timeout: 15000 });
    if (lesson === 0) await seen(m.getByText("Lesson 2 of 2"));
  }
  check(path(m).startsWith("/certificates/"), "finishing every lesson issues a certificate", m.url());
  check(await seen(m.getByText(member.name).first()), "certificate shows the learner's name");
  const serial = path(m).split("/").pop();

  const anon = await newPage();
  await anon.goto(`${BASE}/certificates/${serial.toLowerCase()}`);
  check(await seen(anon.getByText("Verified: issued by")), "anyone can verify the certificate by number");
  await anon.goto(`${BASE}/certificates/ZZZZZZ999999`);
  check(await seen(anon.getByText("No certificate found")), "unknown certificate numbers are rejected");

  // locked lesson for signed-out visitor, preview lesson open
  const paid = JSON.parse(sql(`select json_agg(json_build_object('id', l.id, 'preview', l.is_preview) order by m.sort_order, l.sort_order) from lessons l join course_modules m on m.id=l.module_id join courses c on c.id=l.course_id where c.slug='funding-ready'`));
  await anon.goto(`${BASE}/learn/funding-ready/${paid.find((l) => !l.preview).id}`);
  check(await seen(anon.getByText("This lesson is for enrolled learners")), "paid lesson is locked for visitors");
  await anon.goto(`${BASE}/learn/funding-ready/${paid.find((l) => l.preview).id}`);
  check(await seen(anon.getByText("Every kind of money has a price")), "free preview lesson is open to visitors");

  await m.goto(`${BASE}/dashboard`);
  check(await seen(m.getByText("2 of 2 lessons")), "dashboard shows course progress");
  check(await seen(m.getByText(`No. ${serial}`)), "dashboard lists the certificate");
  check(await seen(m.getByText("Awaiting confirmation")), "dashboard lists the consultation request");

  // ---- Member: live sessions -------------------------------------------------
  await m.goto(`${BASE}/live/funding-clinic`);
  await m.click("text=Register for free");
  await m.getByText("You are registered").waitFor();
  check(sql(`select count(*) from live_registrations r join profiles p on p.id=r.user_id where p.email='${member.email}'`) === "1", "free live session registration saved");

  await m.goto(`${BASE}/live/reading-your-numbers`);
  await m.getByRole("link", { name: /Book your seat/ }).click();
  await m.waitForURL("**/checkout/live/reading-your-numbers");
  check(await seen(m.getByText("Online payment is still under construction")), "paid checkout shows the under-construction notice without PayFast");

  // ---- Admin ---------------------------------------------------------------
  const a = await newPage();
  await register(a, admin);
  sql(`update profiles set role='admin' where email='${admin.email}'`);
  await a.goto(`${BASE}/admin`);
  check(await seen(a.getByRole("heading", { name: "Dashboard" })), "admin opens the admin dashboard");
  check(await seen(a.getByText("New enquiries")), "admin dashboard shows lead counts");

  for (const p of ["enquiries", "bookings", "investors", "orders", "users", "content/services", "content/courses", "content/live-sessions", "content/discounts", "content/team", "content/case-studies", "content/testimonials"]) {
    const res = await a.goto(`${BASE}/admin/${p}`);
    const loaded = await seen(a.locator("main h1"));
    const broken = await a.getByText("could not be loaded").isVisible().catch(() => false);
    check(res.status() === 200 && loaded && !broken, `admin page /admin/${p} loads`);
  }

  // confirm the booking with a meeting link
  await a.goto(`${BASE}/admin/bookings`);
  await a.selectOption("select[name=status]", "confirmed");
  await a.fill("[name=meeting_link]", "https://meet.example.test/room-1");
  await a.getByRole("button", { name: "Save" }).first().click();
  await a.waitForURL("**/admin/bookings?saved=1");
  check(sql(`select status || ' ' || meeting_link from bookings where email='${member.email}'`) === "confirmed https://meet.example.test/room-1", "admin confirms a consultation");
  await m.goto(`${BASE}/dashboard`);
  check(await seen(m.getByRole("link", { name: "Join meeting" })), "member sees the meeting link once confirmed");

  // create a service and see it on the public site
  await a.goto(`${BASE}/admin/content/services/new`);
  await a.fill("#title", `Tax Advisory ${stamp}`);
  await a.fill("#summary", "Help with company tax.");
  await a.fill("#price_from_cents", "12500");
  await a.check("#published");
  await a.getByRole("button", { name: "Create" }).click();
  await a.waitForURL("**/admin/content/services/*?saved=1");
  await anon.goto(`${BASE}/services`);
  check(await seen(anon.getByText(`Tax Advisory ${stamp}`)), "a new service appears on the public site straight away");
  await anon.goto(`${BASE}/services/tax-advisory-${stamp}`);
  const priced = await seen(anon.getByText(/From R\s12\s500/));
  check(priced, "new service has its own page with the price", priced ? "" : (await anon.locator("body").innerText()).slice(0, 300).replace(/\n+/g, " | "));

  // duplicate slug is refused politely
  await a.goto(`${BASE}/admin/content/services/new`);
  await a.fill("#title", "Duplicate");
  await a.fill("#slug", "business-strategy");
  await a.getByRole("button", { name: "Create" }).click();
  await a.getByText("already in use").waitFor();
  check(true, "duplicate web address name is refused with a clear message");

  // course: add module + lesson, build content, publish path
  const courseId = sql(`select id from courses where slug='popia-essentials'`);
  await a.goto(`${BASE}/admin/courses/${courseId}`);
  await a.fill("input[placeholder='New module title']", `Bonus module ${stamp}`);
  await a.getByRole("button", { name: "Add module" }).click();
  const moduleAdded = await until(() => sql(`select count(*) from course_modules where course_id='${courseId}' and title='Bonus module ${stamp}'`) === "1");
  check(moduleAdded, "admin adds a module", moduleAdded ? "" : `${a.url()} :: ${(await a.locator("main").last().innerText()).slice(0, 300).replace(/\n+/g, " | ")}`);
  await seen(a.locator(`input[value='Bonus module ${stamp}']`));
  await a.locator("input[placeholder='New lesson title']").last().fill(`Bonus lesson ${stamp}`);
  await a.getByRole("button", { name: "Add lesson" }).last().click();
  await a.waitForURL("**/admin/lessons/**");
  await a.getByRole("button", { name: "New screen" }).click();
  await a.locator("ol > li").last().locator("input").fill("Welcome to the bonus");
  await a.getByRole("button", { name: "Text", exact: true }).click();
  await a.locator("ol > li").last().locator("textarea").fill("This lesson was **built in the admin area**.");
  await a.getByRole("button", { name: "Save lesson" }).click();
  await a.getByText("Lesson saved.").waitFor();
  const bonusId = path(a).split("/").pop();
  check(sql(`select jsonb_array_length(blocks) from lesson_contents where lesson_id='${bonusId}'`) === "2", "lesson builder saves its screens");
  await m.goto(`${BASE}/learn/popia-essentials/${bonusId}`);
  check(await seen(m.getByText("built in the admin area")), "enrolled learner sees the new lesson");

  // move + delete lesson
  await a.goto(`${BASE}/admin/courses/${courseId}`);
  a.once("dialog", (d) => d.accept());
  await a.locator("li", { hasText: `Bonus lesson ${stamp}` }).getByRole("button", { name: "Delete lesson" }).click();
  check(await until(() => sql(`select count(*) from lessons where id='${bonusId}'`) === "0"), "admin deletes a lesson");

  // discount code -> free checkout of a paid course
  await a.goto(`${BASE}/admin/content/discounts/new`);
  await a.fill("#code", `free${stamp}`.slice(0, 16));
  await a.fill("#value", "100");
  await a.getByRole("button", { name: "Create" }).click();
  await a.waitForURL("**/admin/content/discounts/*?saved=1");
  const code = `FREE${stamp}`.slice(0, 16);
  await m.goto(`${BASE}/checkout/course/funding-ready`);
  await m.fill("#code", "NOTREAL");
  await m.getByRole("button", { name: "Apply" }).click();
  await m.getByText("That code is not valid").waitFor();
  check(true, "invalid discount code is rejected at checkout");
  await m.fill("#code", code);
  await m.getByRole("button", { name: "Apply" }).click();
  await m.getByRole("button", { name: "Complete order" }).waitFor();
  await m.getByRole("button", { name: "Complete order" }).click();
  await m.waitForURL("**/checkout/complete**");
  check(await seen(m.getByText("your order is confirmed")), "100% discount completes the order without payment");
  check(sql(`select count(*) from enrolments e join profiles p on p.id=e.user_id join courses c on c.id=e.course_id where p.email='${member.email}' and c.slug='funding-ready'`) === "1", "completed order enrols the buyer");
  check(sql(`select used_count from discount_codes where code='${code}'`) === "1", "discount use is counted");
  await a.goto(`${BASE}/admin/orders`);
  check(await seen(a.getByText(member.email).first()), "order appears under admin payments");

  // roles: make the member an editor
  await a.goto(`${BASE}/admin/users`);
  const row = a.locator("tr", { hasText: member.email });
  await row.locator("select").selectOption("editor");
  await row.getByRole("button", { name: "Save" }).click();
  await a.waitForURL("**/admin/users?saved=1");
  await m.goto(`${BASE}/admin`);
  const editorIn = await seen(m.getByRole("heading", { name: "Dashboard" }));
  check(editorIn && !(await m.getByText("New enquiries").isVisible().catch(() => false)), "editor reaches the admin area without lead counts");
  await m.goto(`${BASE}/admin/enquiries`);
  await m.waitForURL("**/dashboard");
  check(path(m) === "/dashboard", "editor is turned away from leads");
  await m.goto(`${BASE}/admin/content/courses`);
  check(await seen(m.getByText("POPIA Essentials")), "editor can manage courses");

  // ---- Sign out / sign in ----------------------------------------------------
  await m.goto(`${BASE}/dashboard`);
  await m.getByRole("button", { name: "Sign out" }).click();
  await m.waitForURL(`${BASE}/`);
  await m.goto(`${BASE}/dashboard`);
  await m.waitForURL("**/login**");
  check(path(m) === "/login", "signed-out user is sent to sign in");
  await signIn(m, { ...member, password: "wrong password!" });
  await m.getByText("The email or password is incorrect.").waitFor();
  check(true, "wrong password is refused");
  await signIn(m, member);
  await m.waitForURL("**/dashboard");
  check(true, "user can sign back in");

  await anon.goto(`${BASE}/forgot-password`);
  await anon.fill("[name=email]", member.email);
  await anon.click("button[type=submit]");
  check(await seen(anon.getByText("If an account exists"), 15000), "password reset request is accepted");

  // ---- Emailed links (needs LOCAL_AUTOCONFIRM=false and the local mail sink) --
  if (process.env.E2E_EMAIL === "1") {
    const fs = require("node:fs");
    const mailDir = process.env.MAIL_DIR ?? ".local-supabase/mail";
    /** Newest saved email to an address, with its first link decoded. */
    const linkFor = async (address) => {
      let link = null;
      await until(() => {
        const files = fs.readdirSync(mailDir).sort().reverse();
        for (const f of files) {
          const raw = fs.readFileSync(`${mailDir}/${f}`, "utf8");
          if (!raw.includes(address)) continue;
          const text = raw.replace(/=\r?\n/g, "").replace(/=([0-9A-F]{2})/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
          const found = text.match(/href="([^"]+)"/);
          if (found) link = found[1].replace(/&amp;/g, "&");
          fs.unlinkSync(`${mailDir}/${f}`);
          return Boolean(link);
        }
        return false;
      });
      return link;
    };

    const newUser = { name: "Nomsa New", email: `nomsa+${stamp}@example.test`, password: "first password 1" };
    const n = await newPage();
    await n.goto(`${BASE}/register`);
    await n.fill("[name=full_name]", newUser.name);
    await n.fill("[name=email]", newUser.email);
    await n.fill("[name=password]", newUser.password);
    await n.check("[name=consent]");
    await n.click("button[type=submit]");
    check(await seen(n.getByText("We have sent a confirmation link")), "sign-up asks the user to confirm their email");
    await signIn(n, newUser);
    check(await seen(n.getByText("Please confirm your email address first")), "sign-in is refused until the email is confirmed");
    const confirmLink = await linkFor(newUser.email);
    check(Boolean(confirmLink), "confirmation email was sent");
    await n.goto(confirmLink);
    await n.waitForURL("**/dashboard", { timeout: 15000 }).catch(() => {});
    check(path(n) === "/dashboard" && (await seen(n.getByText("Welcome, Nomsa"))), "confirmation link signs the user in", n.url());

    await n.getByRole("button", { name: "Sign out" }).click();
    await n.waitForURL(`${BASE}/`);
    await n.goto(`${BASE}/forgot-password`);
    await n.fill("[name=email]", newUser.email);
    await n.click("button[type=submit]");
    await seen(n.getByText("If an account exists"));
    const resetLink = await linkFor(newUser.email);
    check(Boolean(resetLink), "password reset email was sent");
    await n.goto(resetLink);
    await n.waitForURL("**/reset-password", { timeout: 15000 }).catch(() => {});
    check(path(n) === "/reset-password", "reset link opens the new-password page", n.url());
    await n.fill("[name=password]", "second password 2");
    await n.fill("[name=confirm]", "second password 2");
    await n.click("button[type=submit]");
    await n.waitForURL("**/dashboard**", { timeout: 15000 }).catch(() => {});
    check(path(n) === "/dashboard", "new password is saved", n.url());
    await n.getByRole("button", { name: "Sign out" }).click();
    await n.waitForURL(`${BASE}/`);
    await signIn(n, newUser);
    check(await seen(n.getByText("The email or password is incorrect.")), "old password no longer works");
    await signIn(n, { ...newUser, password: "second password 2" });
    await n.waitForURL("**/dashboard", { timeout: 15000 }).catch(() => {});
    check(path(n) === "/dashboard", "new password signs the user in");
  }

  check(errors.length === 0, "no browser errors", errors.slice(0, 3).join(" | "));
  await browser.close();
  console.log(failures === 0 ? "\nALL END-TO-END CHECKS PASSED" : `\n${failures} CHECK(S) FAILED`);
  process.exit(failures === 0 ? 0 : 1);
})().catch((err) => {
  console.error("\nSTOPPED:", err.message.split("\n").slice(0, 6).join("\n"));
  for (const [r, t] of pending) console.error("  still loading:", r.method(), r.url().slice(0, 140), `${Date.now() - t}ms`);
  process.exit(1);
});
