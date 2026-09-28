// Cyber Explorers — shared site behavior (homepage terminal + certificate lookup form)

function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str == null ? "" : String(str);
  return div.innerHTML;
}

function typeLines(el, lines, opts = {}) {
  const speed = opts.speed || 26;
  const pause = opts.pause || 500;
  let li = 0, ci = 0;
  el.textContent = "";
  const cursor = document.createElement("span");
  cursor.className = "cursor";

  function step() {
    if (li >= lines.length) {
      el.appendChild(cursor);
      return;
    }
    const line = lines[li];
    if (ci <= line.length) {
      renderProgress();
      ci++;
      setTimeout(step, speed);
    } else {
      li++; ci = 0;
      setTimeout(step, pause);
    }
  }

  function renderProgress() {
    // Rebuild full text from scratch each tick (simplest reliable approach)
    let out = "";
    for (let i = 0; i < li; i++) out += lines[i] + "\n";
    out += lines[li].slice(0, ci);
    el.textContent = out;
    el.appendChild(cursor);
  }

  step();
}

document.addEventListener("DOMContentLoaded", () => {
  const boot = document.getElementById("hero-terminal-body");
  if (boot) {
    typeLines(boot, [
      "> whoami",
      "future_cyber_hero",
      "> ./run_mission.sh --track=ethical-hacking",
      "> access granted _"
    ], { speed: 24, pause: 650 });
  }

  const teamList = document.getElementById("team-list");
  if (teamList) {
    fetch("data/team.json")
      .then((r) => r.json())
      .then((team) => {
        teamList.innerHTML = team.map((t) => `
          <div class="team-card">
            <img class="avatar" src="${t.photo && t.photo.trim() ? t.photo : "assets/img/doodles/avatar-placeholder.svg"}" alt="${escapeHTML(t.name)}">
            <div>
              <h3>${escapeHTML(t.name)}</h3>
              <div class="role mono">${escapeHTML(t.role || "")}</div>
              <p class="bio">${escapeHTML(t.bio || "")}</p>
              ${t.contact ? `<p class="bio mono" style="margin-top:8px;"><a href="mailto:${escapeHTML(t.contact)}">${escapeHTML(t.contact)}</a></p>` : ""}
            </div>
          </div>`).join("");
      })
      .catch(() => { teamList.innerHTML = ""; });
  }

  const lookupForm = document.getElementById("lookup-form");
  if (lookupForm) {
    lookupForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = document.getElementById("lookup-id");
      const id = (input.value || "").trim();
      if (!id) { input.focus(); return; }
      window.location.href = "verify.html?id=" + encodeURIComponent(id);
    });
  }
});
