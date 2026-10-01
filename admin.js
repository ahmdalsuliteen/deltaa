import DEFAULTS from "./defaults.js";
import { db, auth, doc, getDoc, setDoc, collection, getDocs, deleteDoc, query, orderBy,
  signInWithEmailAndPassword, signOut, onAuthStateChanged } from "./firebase.js";

const $ = s => document.querySelector(s);
const clone = o => JSON.parse(JSON.stringify(o));
const isObj = v => v && typeof v === "object" && !Array.isArray(v);
const isLoc = v => isObj(v) && "ar" in v && "en" in v && Object.keys(v).length === 2;
const merge = (b, o) => { if (!isObj(b) || !isObj(o)) return o === undefined ? b : o; const r = { ...b }; for (const k in o) r[k] = merge(b[k], o[k]); return r; };

const LABELS = {
  meta: "بيانات SEO", hero: "قسم الهيرو (صورة أو فيديو)", brochure: "الكتيب", contact: "نموذج التواصل", footer: "التذييل وواتساب",
  lang: "اللغة", integrations: "التكامل (GA4 وإكسل)", title: "العنوان", description: "الوصف", image: "رابط الصورة", video: "رابط الفيديو (اتركه فارغًا لاستخدام الصورة)",
  alt: "النص البديل", soundOn: "زر تشغيل الصوت", soundOff: "زر كتم الصوت", tagline: "الشعار اللفظي", button: "نص الزر", file: "مسار ملف الكتيب",
  firstName: "الاسم الأول", lastName: "اسم العائلة", phone: "الجوال", email: "البريد", submit: "زر الإرسال", sending: "نص الإرسال", required: "رسالة حقل مطلوب",
  invalidEmail: "بريد غير صحيح", invalidPhone: "جوال غير صحيح", error: "رسالة الخطأ", successTitle: "رسالة نجاح الإرسال", close: "زر الإغلاق",
  instagram: "رابط إنستغرام", x: "رابط X", whatsapp: "رقم واتساب (بصيغة دولية بدون +)", whatsappMessage: "رسالة واتساب الجاهزة", whatsappLabel: "وصف زر واتساب",
  rights: "نص الحقوق", default: "اللغة الافتراضية (ar أو en)", switchLabel: "زر تبديل اللغة", ga4MeasurementId: "معرّف GA4 (مثال G-XXXXXXXXXX)",
  excelWebhookUrl: "رابط Power Automate لإرسال الطلبات إلى إكسل في SharePoint", saveToFirestore: "حفظ الطلبات في Firestore (true/false)"
};
let data = clone(DEFAULTS), dirty = false;

function mark(d) { dirty = d; const s = $("#state"); s.textContent = d ? "توجد تغييرات غير محفوظة" : "كل التغييرات محفوظة"; s.className = d ? "dirty" : "ok"; }
function field(label, value, set, area) {
  const l = document.createElement("label");
  const sp = document.createElement("span"); sp.textContent = label; l.append(sp);
  const i = document.createElement(area ? "textarea" : "input"); if (area) i.rows = 2;
  i.value = typeof value === "boolean" ? String(value) : value ?? "";
  i.addEventListener("input", () => { set(typeof value === "boolean" ? i.value === "true" : i.value); mark(true); });
  l.append(i); return l;
}
function build(node, key, host, path) {
  const label = LABELS[key] || key;
  if (isLoc(node)) {
    const w = document.createElement("div"); w.className = "grid two";
    [["ar", "العربية"], ["en", "English"]].forEach(([k, n]) => { const f = field(`${label} (${n})`, node[k], v => node[k] = v, (node[k] || "").length > 55); if (k === "en") f.querySelector("input,textarea").dir = "ltr"; w.append(f); });
    host.append(w);
  } else if (Array.isArray(node)) {
    node.forEach((it, i) => { const d = document.createElement("div"); d.className = "item"; const x = document.createElement("button"); x.className = "x"; x.textContent = "حذف"; x.onclick = () => { node.splice(i, 1); mark(true); redraw(); }; d.append(x); build(it, i + 1, d, path); host.append(d); });
    const a = document.createElement("button"); a.className = "ghost"; a.textContent = "إضافة عنصر"; a.onclick = () => { const t = clone(node[node.length - 1] || {}); (function wipe(o) { for (const k in o) typeof o[k] === "string" ? o[k] = "" : wipe(o[k]); })(t); node.push(t); mark(true); redraw(); }; host.append(a);
  } else if (isObj(node)) {
    for (const k of Object.keys(node)) {
      const v = node[k];
      if (isObj(v) && !isLoc(v) || Array.isArray(v)) { const fs = document.createElement("fieldset"); const lg = document.createElement("legend"); lg.textContent = LABELS[k] || k; fs.append(lg); build(v, k, fs, path + "." + k); host.append(fs); }
      else if (isLoc(v)) build(v, k, host, path);
      else host.append(field(LABELS[k] || k, v, nv => node[k] = nv, typeof v === "string" && v.length > 70));
    }
    host.classList.add("grid");
  }
}
function redraw() { const ed = $("#editor"); ed.innerHTML = ""; build(data, "", ed, ""); }

async function load() {
  try { const s = await getDoc(doc(db, "site", "content")); if (s.exists()) data = merge(clone(DEFAULTS), s.data()); } catch (e) { console.warn(e); }
  redraw(); mark(false);
}
$("#save").onclick = async () => {
  const b = $("#save"); b.disabled = true; b.textContent = "جارٍ الحفظ…";
  try { await setDoc(doc(db, "site", "content"), clone(data)); mark(false); } catch (e) { alert("تعذّر الحفظ: " + e.message); }
  b.disabled = false; b.textContent = "حفظ ونشر";
};
$("#reset").onclick = () => { if (confirm("استعادة المحتوى الافتراضي؟ لن يُنشر قبل الضغط على حفظ.")) { data = clone(DEFAULTS); redraw(); mark(true); } };
addEventListener("beforeunload", e => { if (dirty) { e.preventDefault(); e.returnValue = ""; } });

/* الطلبات */
let subs = [];
async function loadSubs() {
  const snap = await getDocs(query(collection(db, "submissions"), orderBy("createdAt", "desc")));
  subs = snap.docs.map(d => ({ id: d.id, ...d.data(), _t: d.data().createdAt?.toDate?.() }));
  drawSubs();
}
function drawSubs() {
  const q = $("#q").value.trim().toLowerCase(), tb = $("#rows"); tb.innerHTML = "";
  const list = subs.filter(s => !q || [s.firstName, s.lastName, s.phone, s.email].join(" ").toLowerCase().includes(q));
  $("#count").textContent = `${list.length} طلب`;
  list.forEach(s => {
    const tr = document.createElement("tr");
    [s._t ? s._t.toLocaleString("en-GB") : "", s.firstName, s.lastName, s.phone, s.email, s.language].forEach(v => { const td = document.createElement("td"); td.textContent = v ?? ""; tr.append(td); });
    const td = document.createElement("td"), b = document.createElement("button"); b.textContent = "حذف";
    b.onclick = async () => { if (confirm("حذف هذا الطلب؟")) { await deleteDoc(doc(db, "submissions", s.id)); subs = subs.filter(x => x.id !== s.id); drawSubs(); } };
    td.append(b); tr.append(td); tb.append(tr);
  });
}
$("#q").oninput = drawSubs;
$("#csv").onclick = () => {
  const esc = v => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const rows = [["Date", "First Name", "Last Name", "Phone", "Email", "Language"], ...subs.map(s => [s._t?.toISOString(), s.firstName, s.lastName, s.phone, s.email, s.language])];
  const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob(["\ufeff" + rows.map(r => r.map(esc).join(",")).join("\n")], { type: "text/csv" }));
  a.download = "delta-submissions.csv"; a.click();
};

document.querySelectorAll("nav button").forEach(b => b.onclick = () => {
  document.querySelectorAll("nav button").forEach(x => x.classList.toggle("on", x === b));
  $("#tab-content").hidden = b.dataset.tab !== "content"; $("#tab-subs").hidden = b.dataset.tab !== "subs";
  $(".savebar").hidden = b.dataset.tab !== "content"; if (b.dataset.tab === "subs") loadSubs().catch(e => alert(e.message));
});
$("#loginForm").onsubmit = async e => {
  e.preventDefault(); $("#loginErr").textContent = "";
  try { await signInWithEmailAndPassword(auth, $("#em").value, $("#pw").value); } catch { $("#loginErr").textContent = "بيانات الدخول غير صحيحة."; }
};
$("#out").onclick = () => signOut(auth);
onAuthStateChanged(auth, u => { $("#login").hidden = !!u; $("#app").hidden = !u; if (u) load(); });
