// Cyber Explorers — local admin helper.
// Builds a students.json entry and a matching QR code. Runs entirely client-side;
// nothing here is sent to a server. The instructor still commits the result to the repo.

(function () {
  const $ = (id) => document.getElementById(id);
  const STORAGE_KEY = "cyberExplorersAdminBaseUrl";

  const siteBase = $("site-base");
  const savedBase = localStorage.getItem(STORAGE_KEY);
  if (savedBase) siteBase.value = savedBase;

  // Matches codes from the Certificate Code Ledger: CE-XXXX-XXXX using the
  // A-Z/2-9 alphabet (no 0/O/1/I/L, to avoid mix-ups when read off a printout).
  const CODE_PATTERN = /^CE-[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{4}-[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{4}$/;

  $("generate-btn").addEventListener("click", () => {
    const base = siteBase.value.trim().replace(/\/?$/, "/");
    localStorage.setItem(STORAGE_KEY, base);

    const id = $("cert-id").value.trim().toUpperCase();
    const firstName = $("first-name").value.trim();
    const lastInitial = $("last-initial").value.trim().toUpperCase();
    const certIdNote = $("cert-id-note");

    if (!CODE_PATTERN.test(id)) {
      certIdNote.textContent = "That doesn't look like a code from your Certificate Code Ledger (expected format CE-XXXX-XXXX). Double-check what's printed on the sheet.";
      return;
    }
    certIdNote.textContent = "";

    if (!firstName || !lastInitial) {
      alert("Please fill in at least First name and Last initial.");
      return;
    }

    const badges = {
      firstHack: $("badge-1").checked,
      trapSpotter: $("badge-2").checked,
      cyberExplorer: $("badge-3").checked
    };
    const status = (badges.firstHack && badges.trapSpotter && badges.cyberExplorer) ? "graduate" : "in-progress";

    const entry = {
      id,
      firstName,
      lastInitial,
      hackerAlias: $("alias").value.trim(),
      photo: $("photo-path").value.trim(),
      cohort: $("cohort").value.trim(),
      completedDate: $("completed").value,
      badges,
      status,
      instructorId: "instructor-01"
    };

    $("output").value = JSON.stringify(entry, null, 2) + ",";

    const verifyUrl = base
      ? base + "verify.html?id=" + encodeURIComponent(id)
      : "verify.html?id=" + encodeURIComponent(id) + "  (set your site's base URL above for a real link)";

    const canvas = $("qr-canvas");
    const qrNote = $("qr-note");
    if (!window.QRCode) {
      canvas.style.display = "none";
      qrNote.textContent = "Couldn't load the QR code library (needs an internet connection the first time). The JSON snippet above still works fine — you can generate the QR later, or use any free QR generator with the verify link shown here: " + verifyUrl;
      $("download-qr").disabled = true;
      return;
    }
    canvas.style.display = "block";
    qrNote.textContent = "";
    QRCode.toCanvas(canvas, verifyUrl, { width: 220, margin: 1 }, (err) => {
      $("download-qr").disabled = !!err;
      if (err) qrNote.textContent = "QR generation failed: " + err.message;
    });
  });

  $("download-qr").addEventListener("click", () => {
    const canvas = $("qr-canvas");
    const id = $("cert-id").value.trim() || "certificate";
    const link = document.createElement("a");
    link.download = id + "-qr.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  });
})();
