

## المشكلة
1. التاجر (`merchant`) ما عنده طريقة وصول واضحة لـ `/merchant` — مفيش رابط في القوائم ولا البوتم نافيقيشن.
2. صفحة `MerchantDashboard` فيها إدارة موظفين فقط، ما فيها **إضافة منتج** ولا **إدارة منتجاته**.
3. لما التاجر يفتح التطبيق، يشوف نفس واجهة المستخدم العادي، بدون لوحة تحكم خاصة به.
4. الموظف (`merchant_employee`) ما عنده واجهة خاصة كمان، مع أن صلاحياته معرّفة في DB.

## الحل المقترح: هيكلية تاجر/موظف متكاملة

### 1. توسيع `MerchantDashboard` ليصير لوحة تحكم حقيقية بتبويبات
بدل صفحة موظفين فقط، نحوّلها لـ Tabs:
- **نظرة عامة**: إحصائيات (عدد المنتجات، المشاهدات، الموظفين)، آخر المنتجات، إجراءات سريعة
- **منتجاتي**: قائمة منتجات التاجر مع بحث/فلتر + زر "إضافة منتج جديد" + تعديل/حذف/تفعيل-إيقاف
- **إضافة منتج**: نموذج كامل (عنوان، وصف، سعر، فئة، صور، فيديو، حقول ديناميكية حسب الفئة) — نعيد استخدام منطق `PropertyManagement` الإداري لكن مع `agent_id = user.id` تلقائياً
- **الموظفون**: نفس المحتوى الحالي (إضافة/صلاحيات/حذف) — يظهر فقط لو عنده `can_manage_employees` أو هو التاجر الأصلي
- **إعدادات المتجر**: اسم المتجر، الشعار، رقم تواصل، عنوان (مرتبطة بـ `profiles`)

### 2. توحيد الوصول للموظفين
الموظف (المسجل في `merchant_employees`) يدخل على `/merchant/:merchantId` ويشوف لوحة التاجر اللي شغّال عنده، لكن:
- يشوف فقط التبويبات اللي صلاحياته تسمح بها (`can_add_products` → تبويب الإضافة، `can_edit_products` → تبويب المنتجات بزر تعديل، إلخ)
- لو عنده عدة أصحاب عمل، نعرض Selector في الأعلى لاختيار التاجر

### 3. توسيع `useRoles` بـ `useMerchantContext` جديد
hook جديد يرجع:
- `isMerchant` (هل عنده دور merchant؟)
- `employerMerchants[]` (قائمة التجار اللي يشتغل عندهم بصلاحياتهم)
- `effectiveAgentId` (التاجر المختار حالياً للعمل تحت اسمه)
- `permissions` (الصلاحيات الفعلية تحت التاجر المختار)

### 4. ربط التنقل (Discovery)
- **`HeaderMobile` و `HeaderNew`**: نضيف عنصر "**لوحة التاجر**" (أيقونة `Store`) في `DropdownMenu` يظهر إذا `isMerchant || employerMerchants.length > 0`، فوق "لوحة الإدارة"
- **`BottomNavigation`**: للتجار/الموظفين فقط، نضيف زر رابع "**متجري**" (أيقونة `Store`) يروح لـ `/merchant`. للمستخدم العادي يبقى 3 أزرار كما هو
- **`Index.tsx`**: لو المستخدم تاجر، نظهر بانر/كرت بارز "أهلاً بك يا تاجر — افتح لوحتك" فوق الأقسام
- **زر FAB عائم**: في الصفحة الرئيسية، زر `+` (إضافة منتج) للتجار/الموظفين الذين لديهم `can_add_products` يفتح فورم الإضافة مباشرة

### 5. الراوتس الجديدة في `App.tsx`
```
/merchant                    → MerchantDashboard (الخاص بالتاجر نفسه)
/merchant/:merchantId        → نفس اللوحة لكن للموظف عن صاحب عمله (مع فحص merchant_employees)
/merchant/products/new       → فورم إضافة منتج
/merchant/products/:id/edit  → فورم تعديل منتج
```
كل الراوتس ملفوفة بـ `MerchantGuard` جديد (مشابه `AdminGuard`) يتأكد إن المستخدم `isMerchant` أو موظف عند `merchantId` المطلوب.

### 6. مكون `MerchantGuard.tsx` جديد
- يفحص `isMerchant || isAdmin || (employerMerchants includes merchantId)`
- يعيد التوجيه لـ `/` لو ما عنده صلاحية، مع toast "هذه الصفحة للتجار فقط"

### 7. إعادة استخدام مكونات إدارة المنتجات
`PropertyManagement` الحالي مخصص للأدمن. ننشئ مكوّن مشترك `ProductForm` (يستخرج النموذج من `PropertyManagement`) ونستخدمه في:
- الأدمن (كل المنتجات)
- التاجر (منتجاته فقط، `agent_id` ثابت)
- الموظف (منتجات صاحب العمل، `agent_id = merchantId`)

## الملفات المتأثرة
**جديدة:**
- `src/components/MerchantGuard.tsx`
- `src/hooks/useMerchantContext.tsx`
- `src/components/merchant/MerchantOverview.tsx`
- `src/components/merchant/MerchantProducts.tsx`
- `src/components/merchant/MerchantEmployees.tsx` (نقل من MerchantDashboard)
- `src/components/merchant/MerchantSettings.tsx`
- `src/components/merchant/ProductForm.tsx` (مشترك)
- `src/components/FloatingAddButton.tsx`

**معدّلة:**
- `src/pages/MerchantDashboard.tsx` (تبويبات + استخدام المكونات الجديدة)
- `src/components/HeaderMobile.tsx` + `HeaderNew.tsx` (إضافة رابط لوحة التاجر)
- `src/components/BottomNavigation.tsx` (زر متجري للتجار)
- `src/pages/Index.tsx` (بانر ترحيب التاجر + FAB)
- `src/App.tsx` (راوتس جديدة)

## ملاحظات أمنية
- كل العمليات تعتمد على RLS الموجود (`has_merchant_permission`، `can_add_products`، إلخ) — مفيش حاجة نغيرها في DB
- الـ Guard في الفرونت للـ UX فقط، الحماية الحقيقية في DB

