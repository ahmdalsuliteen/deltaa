/* المحتوى الافتراضي: يُستخدم إذا لم يُحفظ محتوى في Firestore بعد.
   النصوص ثنائية اللغة على شكل { ar, en } وكلها قابلة للتعديل من لوحة الإدارة. */
export default {
  meta: {
    title: { ar: "دلتا", en: "DELTA" },
    description: {
      ar: "دلتا: وجهة متوازنة حول الحياة. حمّل الكتيب وتواصل معنا.",
      en: "DELTA: a destination balanced around life. Download the brochure and get in touch."
    }
  },
  hero: {
    image: "assets/img/hero.jpg",
    video: "",
    alt: { ar: "لوحة دلتا الإعلانية على واجهة بحرية", en: "DELTA hoarding on a waterfront wall" },
    soundOn: { ar: "تشغيل الصوت", en: "Turn sound on" },
    soundOff: { ar: "كتم الصوت", en: "Turn sound off" }
  },
  brochure: {
    tagline: { ar: "متوازن حول الحياة", en: "Balanced around life" },
    button: { ar: "حمل الكتيب", en: "Download Brochure" },
    file: "assets/DELTA-Brochure.pdf"
  },
  contact: {
    title: { ar: "تواصل معنا", en: "Contact Us" },
    firstName: { ar: "الاسم الأول", en: "First Name" },
    lastName: { ar: "اسم العائلة", en: "Last Name" },
    phone: { ar: "رقم الجوال", en: "Phone Number" },
    email: { ar: "البريد الإلكتروني", en: "Email" },
    submit: { ar: "إرسال", en: "Submit" },
    sending: { ar: "جارٍ الإرسال", en: "Sending" },
    required: { ar: "حقل مطلوب", en: "Required field" },
    invalidEmail: { ar: "أدخل بريدًا إلكترونيًا صحيحًا", en: "Enter a valid email address" },
    invalidPhone: { ar: "أدخل رقم جوال صحيحًا", en: "Enter a valid phone number" },
    error: { ar: "تعذّر الإرسال. حاول مرة أخرى بعد قليل.", en: "We could not send your details. Please try again shortly." },
    successTitle: { ar: "تم استلام طلبكم بنجاح.", en: "Thank you for your submission." },
    close: { ar: "إغلاق", en: "Close" }
  },
  footer: {
    email: "info@example.com",
    instagram: "https://www.instagram.com/",
    x: "https://x.com/",
    whatsapp: "966500000000",
    whatsappMessage: { ar: "مرحبًا، أرغب في الاستفسار عن دلتا.", en: "Hello, I would like to enquire about DELTA." },
    whatsappLabel: { ar: "تواصل عبر واتساب", en: "Chat on WhatsApp" },
    rights: { ar: "جميع الحقوق محفوظة", en: "All rights reserved" }
  },
  lang: { default: "ar", switchLabel: { ar: "English", en: "العربية" } },
  integrations: {
    ga4MeasurementId: "",
    excelWebhookUrl: "",
    saveToFirestore: true
  }
};
