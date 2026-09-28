// Cyber Explorers — certificate verification logic
// Reads ?id=<certificate-id> from the URL, looks it up in data/students.json,
// runs a short "boot sequence" in the terminal, then reveals the result.

const BADGE_DEFS = [
  { key: "firstHack",     label: "FIRST HACK",     icon: "assets/img/doodles/badge-first-hack.svg" },
  { key: "trapSpotter",   label: "TRAP SPOTTER",   icon: "assets/img/doodles/badge-trap-spotter.svg" },
  { key: "cyberExplorer", label: "CYBER EXPLORER", icon: "assets/img/doodles/badge-cyber-explorer.svg" }
];

const PLACEHOLDER_AVATAR = "assets/img/doodles/avatar-placeholder.svg";

function getRequestedId() {
  const params = new URLSearchParams(window.location.search);
  return (params.get("id") || "").trim();
}

function fetchJSON(path) {
  return fetch(path).then((r) => {
    if (!r.ok) throw new Error("Failed to load " + path);
    return r.json();
  });
}

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso + "T00:00:00");
  if (isNaN(d)) return iso;
  return d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

function renderBadges(badges) {
  return BADGE_DEFS.map((b) => {
    const earned = !!(badges && badges[b.key]);
    return `
      <div class="badge-slot ${earned ? "" : "locked"}">
        <img src="${b.icon}" alt="${b.label}${earned ? "" : " (not yet earned)"}">
        <div class="label">${b.label}</div>
      </div>`;
  }).join("");
}

function renderFound(student, instructor) {
  const stage = document.getElementById("verify-stage");
  const photo = student.photo && student.photo.trim() ? student.photo : PLACEHOLDER_AVATAR;
  const statusLabel = student.status === "graduate" ? "GRADUATE · ALL 3 BADGES EARNED" : "MISSION IN PROGRESS";
  const statusClass = student.status === "graduate" ? "graduate" : "progress";
  const alias = student.hackerAlias ? `<div class="cert-alias">a.k.a. "${escapeHTML(student.hackerAlias)}"</div>` : "";
  const instructorBlock = instructor
    ? `<div class="instructor-strip">
         <img class="avatar sm" src="${instructor.photo && instructor.photo.trim() ? instructor.photo : PLACEHOLDER_AVATAR}" alt="${escapeHTML(instructor.name)}">
         <div>
           <div class="sig">${escapeHTML(instructor.name)}</div>
           <div class="mono" style="font-size:.72rem;color:#888;">${escapeHTML(instructor.role || "Program Instructor")}</div>
         </div>
       </div>`
    : "";

  stage.innerHTML = `
    <div class="cert-wrap">
      <div class="cert-card">
        <img class="verified-stamp" src="assets/img/doodles/verified-stamp.svg" alt="Verified authentic">
        <div class="cert-top">
          <div class="cert-org mono">BOYS &amp; GIRLS CLUB OF WORCESTER<br>CYBER EXPLORERS PROGRAM</div>
          <div class="cert-id">${escapeHTML(student.id)}</div>
        </div>

        <span class="status-ribbon ${statusClass}">${statusLabel}</span>

        <div class="cert-person">
          <img class="cert-photo" src="${photo}" alt="${escapeHTML(student.firstName)} ${escapeHTML(student.lastInitial)}.">
          <div>
            <h2 class="cert-name">${escapeHTML(student.firstName)} ${escapeHTML(student.lastInitial)}.</h2>
            ${alias}
          </div>
        </div>

        <div class="cert-meta">
          <div><span>Cohort</span>${escapeHTML(student.cohort || "—")}</div>
          <div><span>Completed</span>${formatDate(student.completedDate)}</div>
        </div>

        <div class="badge-row">${renderBadges(student.badges)}</div>

        ${instructorBlock}
      </div>

      <p class="mono" style="text-align:center;font-size:.8rem;color:#7a7a8c;margin-top:18px;">
        Think something here looks wrong? Email
        <a href="mailto:${instructor && instructor.contact ? instructor.contact : ""}">${instructor && instructor.contact ? instructor.contact : "the program instructor"}</a>.
      </p>
    </div>`;
}

function renderNotFound(id) {
  const stage = document.getElementById("verify-stage");
  stage.innerHTML = `
    <div class="cert-wrap">
      <div class="sticker error-card">
        <div class="code mono">ERR_CERT_NOT_FOUND</div>
        <h2>Access Denied</h2>
        <p>We couldn't find a certificate matching <strong class="mono">${escapeHTML(id || "(blank)")}</strong>.</p>
        <p style="color:#666;font-size:.92rem;">
          Double-check the code printed under the QR on your certificate, or scan it again —
          it should open this page automatically with the right ID.
        </p>
        <a class="btn btn-teal" href="index.html" style="margin-top:14px;">&larr; Back home</a>
      </div>
    </div>`;
}

function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str == null ? "" : String(str);
  return div.innerHTML;
}

function runBootSequence(onDone) {
  const body = document.getElementById("verify-terminal-body");
  const id = getRequestedId();
  const lines = [
    "> connecting to cyber_explorers_db...",
    "> looking up certificate " + (id || "(none provided)") + " ...",
    "> cross-checking badge ledger...",
  ];
  let li = 0, ci = 0;
  const cursor = document.createElement("span");
  cursor.className = "cursor";

  function tick() {
    if (li >= lines.length) {
      setTimeout(onDone, 350);
      return;
    }
    const line = lines[li];
    if (ci <= line.length) {
      let out = "";
      for (let i = 0; i < li; i++) out += lines[i] + "\n";
      out += line.slice(0, ci);
      body.textContent = out;
      body.appendChild(cursor);
      ci++;
      setTimeout(tick, 16);
    } else {
      li++; ci = 0;
      setTimeout(tick, 260);
    }
  }
  tick();
}

document.addEventListener("DOMContentLoaded", () => {
  const id = getRequestedId();

  runBootSequence(() => {
    if (!id) { renderNotFound(id); return; }

    Promise.all([
      fetchJSON("data/students.json"),
      fetchJSON("data/team.json").catch(() => [])
    ]).then(([students, team]) => {
      const student = students.find(
        (s) => s.id && s.id.toLowerCase() === id.toLowerCase()
      );
      if (!student) { renderNotFound(id); return; }
      const instructor = team.find((t) => t.id === student.instructorId) || team[0] || null;
      renderFound(student, instructor);
    }).catch(() => renderNotFound(id));
  });
});
