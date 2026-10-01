import DEFAULTS from "./defaults.js";

const $ = (s, r = document) => r.querySelector(s);
const isObj = v => v && typeof v === "object" && !Array.isArray(v);
const merge = (base, over) => {
  if (!isObj(base) || !isObj(over)) return over === undefined ? base : over;
  const out = { ...base };
  for (const k of Object.keys(over)) out[k] = merge(base[k], over[k]);
  return out;
};

let content = DEFAULTS;
const cached = (() => { try { return JSON.parse(localStorage.getItem("delta.content")); } catch { return null; } })();
if (cached) content = merge(DEFAULTS, cached);

let lang = new URLSearchParams(location.search).get("lang") || localStorage.getItem("delta.lang") || content.lang.default || "ar";
if (!["ar", "en"].includes(lang)) lang = "ar";
const t = v => (v && typeof v === "object" ? v[lang] ?? "" : v ?? "");

/* ---------- تحليلات GA4 ---------- */
let gaLoaded = "";
function initGA(id) {
  if (!id || gaLoaded === id) return;
  gaLoaded = id;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  gtag("js", new Date()); gtag("config", id);
  const s = document.createElement("script");
  s.async = true; s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
  document.head.appendChild(s);
}
const track = (name, params = {}) => { try { window.gtag && gtag("event", name, params); } catch {} };

/* ---------- العرض ---------- */
function render() {
  const c = content;
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  document.title = t(c.meta.title) + (lang === "ar" ? " | DELTA" : " | دلتا");
  $('meta[name="description"]').content = t(c.meta.description);
  $("#langBtn").textContent = t(c.lang.switchLabel);
  $("#langBtn").setAttribute("lang", lang === "ar" ? "en" : "ar");

  renderHero(c.hero);
  const words = t(c.brochure.tagline).trim().split(/\s+/);
  const last = words.pop();
  $("#tagline").innerHTML = "";
  $("#tagline").append(words.join(" ") + " ");
  const b = document.createElement("b"); b.textContent = last; $("#tagline").append(b);

  const bb = $("#brochureBtn");
  bb.href = c.brochure.file || "#";
  bb.querySelector("span").textContent = t(c.brochure.button);

  $("#contactTitle").textContent = t(c.contact.title);
  renderForm(c.contact);

  const f = c.footer;
  const ul = $("#footLinks"); ul.innerHTML = "";
  const icons = {
    mail: '<path d="M4 6h16v12H4z"/><path d="m4 7 8 6 8-6"/>',
    ig: '<rect x="4" y="4" width="16" height="16" rx="5"/><circle cx="12" cy="12" r="3.6"/><circle cx="17" cy="7" r=".6"/>',
    x: '<path d="M5 5l14 14M19 5 5 19"/>'
  };
  [["mail", `mailto:${f.email}`, f.email], ["ig", f.instagram, "Instagram"], ["x", f.x, "X"]].forEach(([ic, href, label]) => {
    if (!href || href === "mailto:") return;
    const li = document.createElement("li");
    li.innerHTML = `<a rel="noopener"><svg class="ic" viewBox="0 0 24 24" aria-hidden="true">${icons[ic]}</svg><span></span></a>`;
    const a = li.firstChild; a.href = href; a.querySelector("span").textContent = label;
    if (ic !== "mail") a.target = "_blank";
    ul.append(li);
  });
  const rt = $("#rights"); rt.textContent = "";
  const cp = document.createElement("bdi"); cp.textContent = `© ${new Date().getFullYear()} DELTA`;
  rt.append(cp, " — ", t(f.rights));

  const wa = $("#wa");
  const num = String(f.whatsapp || "").replace(/\D/g, "");
  wa.hidden = !num;
  wa.href = `https://wa.me/${num}?text=${encodeURIComponent(t(f.whatsappMessage))}`;
  wa.setAttribute("aria-label", t(f.whatsappLabel));

  $("#modalTitle").textContent = t(c.contact.successTitle);
  $("#modalClose").textContent = t(c.contact.close);
  initGA(c.integrations.ga4MeasurementId);
}

let heroKey = "";
function renderHero(h) {
  const key = (h.video || "") + "|" + (h.image || "");
  const media = $("#heroMedia");
  if (key !== heroKey) {
    heroKey = key;
    media.innerHTML = "";
    if (h.video) {
      const v = document.createElement("video");
      Object.assign(v, { src: h.video, autoplay: true, loop: true, muted: true, playsInline: true });
      v.setAttribute("playsinline", ""); v.setAttribute("muted", "");
      if (h.image) v.poster = h.image;
      media.append(v);
    } else {
      const img = new Image(); img.src = h.image; img.decoding = "async"; media.append(img);
    }
  }
  const img = media.querySelector("img"); if (img) img.alt = t(h.alt);
  const btn = $("#soundBtn");
  btn.hidden = !h.video;
  if (h.video) updateSound();
  function updateSound() {
    const v = media.querySelector("video"); const on = v && !v.muted;
    btn.innerHTML = on
      ? '<svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9H4Z"/><path d="M16 9a4 4 0 0 1 0 6M18.500 6.500a8 8 0 0 1 0 11"/></svg>'
      : '<svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9H4Z"/><path d="m16 9 5 6m0-6-5 6"/></svg>';
    btn.setAttribute("aria-label", t(on ? h.soundOff : h.soundOn));
    btn.onclick = () => { v.muted = !v.muted; if (!v.muted) v.play().catch(() => {}); updateSound(); };
  }
}

function renderForm(c) {
  const form = $("#form");
  const vals = Object.fromEntries([...form.querySelectorAll("input")].map(i => [i.name, i.value]));
  form.innerHTML = "";
  const fields = [["firstName", "text", "given-name"], ["lastName", "text", "family-name"], ["phone", "tel", "tel"], ["email", "email", "email"]];
  fields.forEach(([name, type, ac]) => {
    const d = document.createElement("div"); d.className = "field";
    d.innerHTML = `<input id="f-${name}" name="${name}" type="${type}" autocomplete="${ac}" placeholder=" " required><label for="f-${name}"></label><span class="err" aria-live="polite"></span>`;
    d.querySelector("label").textContent = t(c[name]) + " *";
    if (name === "phone" || name === "email") d.querySelector("input").dir = "ltr";
    d.querySelector("input").value = vals[name] || "";
    form.append(d);
  });
  const hp = document.createElement("input"); hp.className = "hp"; hp.name = "website"; hp.tabIndex = -1; hp.autocomplete = "off"; hp.setAttribute("aria-hidden", "true"); form.append(hp);
  const btn = document.createElement("button"); btn.className = "btn"; btn.type = "submit"; btn.textContent = t(c.submit); form.append(btn);
}

/* ---------- النموذج ---------- */
const toLatin = s => s.replace(/[٠-٩]/g, d => "٠١٢٣٤٥٦٧٨٩".indexOf(d)).replace(/[۰-۹]/g, d => "۰۱۲۳۴۵۶۷۸۹".indexOf(d));
function validate(form) {
  const c = content.contact; let ok = true;
  form.querySelectorAll(".field").forEach(f => {
    const i = f.querySelector("input"), e = f.querySelector(".err"); let m = "";
    const v = toLatin(i.value.trim());
    if (!v) m = t(c.required);
    else if (i.name === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) m = t(c.invalidEmail);
    else if (i.name === "phone" && !/^\+?\d{8,15}$/.test(v.replace(/[\s()-]/g, ""))) m = t(c.invalidPhone);
    f.classList.toggle("bad", !!m); e.textContent = m; if (m) ok = false;
  });
  return ok;
}

$("#form").addEventListener("submit", async ev => {
  ev.preventDefault();
  const form = ev.currentTarget; const c = content.contact;
  if (form.website.value) return;
  if (!validate(form)) return form.querySelector(".bad input")?.focus();
  const btn = form.querySelector("button"); btn.disabled = true; btn.textContent = t(c.sending) + "…";
  const data = {
    firstName: form.firstName.value.trim(), lastName: form.lastName.value.trim(),
    phone: toLatin(form.phone.value.trim()), email: form.email.value.trim(),
    language: lang, page: location.href, submittedAt: new Date().toISOString()
  };
  const ig = content.integrations; let sent = false;
  try {
    if (ig.excelWebhookUrl) {
      await fetch(ig.excelWebhookUrl, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain" }, body: JSON.stringify(data) });
      sent = true;
    }
  } catch (e) { console.warn("Excel webhook failed", e); }
  try {
    if (ig.saveToFirestore !== false) {
      const fb = await import("./firebase.js");
      await fb.addDoc(fb.collection(fb.db, "submissions"), { ...data, createdAt: fb.serverTimestamp() });
      sent = true;
    }
  } catch (e) { console.warn("Firestore save failed", e); }
  btn.disabled = false; btn.textContent = t(c.submit);
  if (!sent) { alert(t(c.error)); return; }
  track("generate_lead", { method: "contact_form", language: lang });
  form.reset(); form.querySelectorAll(".field").forEach(f => f.classList.remove("bad"));
  openModal();
});

/* ---------- نافذة التأكيد ---------- */
let lastFocus;
function openModal() { lastFocus = document.activeElement; $("#modal").hidden = false; $("#modalClose").focus(); }
function closeModal() { $("#modal").hidden = true; lastFocus?.focus(); }
$("#modalClose").onclick = closeModal;
$("#modal").addEventListener("click", e => { if (e.target.id === "modal") closeModal(); });
document.addEventListener("keydown", e => { if (e.key === "Escape" && !$("#modal").hidden) closeModal(); });

/* ---------- أحداث أخرى ---------- */
$("#langBtn").onclick = () => {
  lang = lang === "ar" ? "en" : "ar"; localStorage.setItem("delta.lang", lang); render(); track("language_switch", { language: lang });
};
$("#brochureBtn").addEventListener("click", e => {
  track("file_download", { file_name: "DELTA-Brochure.pdf", language: lang });
  const r = document.createElement("i"), b = e.currentTarget.getBoundingClientRect();
  r.className = "rip"; Object.assign(r.style, { width: "40px", height: "40px", left: e.clientX - b.left - 20 + "px", top: e.clientY - b.top - 20 + "px" });
  e.currentTarget.append(r); setTimeout(() => r.remove(), 700);
});
$("#wa").addEventListener("click", () => track("whatsapp_click", { language: lang }));

const header = $("header"), pattern = $(".pattern");
addEventListener("scroll", () => {
  header.classList.toggle("solid", scrollY > innerHeight * .6);
  const r = pattern.parentElement.getBoundingClientRect();
  pattern.style.setProperty("--py", (r.top * -0.08).toFixed(1) + "px");
}, { passive: true });

const io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && (e.target.classList.add("in"), io.unobserve(e.target))), { threshold: .2 });
document.querySelectorAll(".brochure .inner,.contact .inner").forEach(el => { el.classList.add("rv"); io.observe(el); });

render();
addEventListener("load", () => setTimeout(() => document.body.classList.remove("loading"), 1300));

/* ---------- مزامنة المحتوى الحي من Firestore ---------- */
import("./firebase.js").then(fb => {
  fb.onSnapshot(fb.doc(fb.db, "site", "content"), snap => {
    if (!snap.exists()) return;
    const remote = snap.data();
    try { localStorage.setItem("delta.content", JSON.stringify(remote)); } catch {}
    content = merge(DEFAULTS, remote); render();
  }, err => console.warn("Live content unavailable, using defaults", err));
}).catch(() => {});
