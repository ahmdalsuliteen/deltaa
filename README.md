# DELTA Landing Page

صفحة هبوط ثنائية اللغة (عربي/إنجليزي) بهوية دلتا. HTML + CSS + JavaScript فقط، بدون أدوات بناء.

## الهيكل
```
index.html          الصفحة الرئيسية
admin.html          لوحة الإدارة (noindex)
css/style.css       تنسيق الصفحة      css/admin.css  تنسيق اللوحة
js/main.js          منطق الصفحة       js/admin.js    منطق اللوحة
js/defaults.js      المحتوى الافتراضي (يُستخدم قبل أول حفظ)
js/firebase.js      إعداد Firebase
assets/DELTA-Brochure.pdf   كتيب مؤقت (استبدله بالمعتمد بنفس الاسم)
assets/img/         hero.jpg (بديل الهيرو) + logo.svg + icon.svg + favicon.svg
assets/fonts/       FF Shamel Sans (Medium + Bold)
firestore.rules     قواعد الأمان
```

## التشغيل
الملفات تستخدم ES Modules، لذلك لا تعمل بالنقر المزدوج (file://). للتجربة محليًا: `python3 -m http.server 8000` ثم افتح `http://localhost:8000`.

## الإعداد المطلوب في Firebase (مرة واحدة)
1. Authentication > Sign-in method > فعّل **Email/Password**، ثم أضف المسؤولين من Authentication > Users > Add user.
2. Firestore Database > Rules > الصق محتوى `firestore.rules` ثم Publish. (القواعد الحالية `allow read, write: if false` تمنع الموقع واللوحة من العمل.)
3. Authentication > Settings > Authorized domains > أضف نطاق الموقع النهائي.

## لوحة الإدارة `/admin.html`
- تسجيل دخول بحساب مسؤول، ثم تعديل كل النصوص العربية والإنجليزية وروابط الصورة/الفيديو/الكتيب وبيانات التذييل ورقم واتساب.
- زر **حفظ ونشر** يكتب في Firestore (`site/content`) والصفحة تتحدث مباشرة عند الزوار.
- تبويب **الطلبات**: عرض وبحث وحذف وتصدير CSV.

## الفيديو
ضع رابط الفيديو في حقل "رابط الفيديو" (mp4). يعمل تلقائيًا بتكرار وبدون نص فوقه، ويظهر زر تشغيل/كتم الصوت.

## إرسال الطلبات إلى Excel في SharePoint (بدون قاعدة بيانات)
1. في Power Automate أنشئ Flow بمشغّل **When an HTTP request is received**.
2. الإجراء: **Excel Online (Business) > Add a row into a table** على ملف SharePoint (جدول بأعمدة: firstName, lastName, phone, email, language, submittedAt).
3. انسخ رابط الـ HTTP POST URL والصقه في اللوحة عند "رابط Power Automate".
4. لتعطيل التخزين في Firestore اجعل `saveToFirestore` = false.
الصفحة ترسل JSON نصيًا (`text/plain`) لتفادي CORS preflight؛ اجعل الـ Flow يحلل الجسم بـ `json(triggerBody())` أو Parse JSON.

## Google Analytics (GA4)
أدخل معرّف القياس `G-XXXXXXXXXX` في اللوحة. الأحداث الجاهزة: page_view، generate_lead (نجاح النموذج)، file_download (الكتيب)، whatsapp_click، language_switch.

## النشر
مناسب لأي استضافة ثابتة مع HTTPS. مع Firebase Hosting: `firebase init hosting` ثم `firebase deploy`.
