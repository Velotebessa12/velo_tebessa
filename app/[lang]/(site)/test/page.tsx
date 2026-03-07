"use client";

import { useState, useEffect } from "react";
import {
  Store, BarChart3, Globe, Zap, Package, CreditCard, Truck,
  Headphones, Check, ArrowRight, Menu, X, Star, TrendingUp,
  Smartphone, Lock, ChevronDown, ShoppingCart, Search, Bell,
  Sparkles, Shield, Palette, MonitorSmartphone, ChevronRight,
} from "lucide-react";

export default function BifihShopPage() {
  const [navOpen, setNavOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <div style={{ fontFamily: "'Cairo', 'Tajawal', sans-serif" }} className="bg-white text-gray-900 overflow-x-hidden">

      {/* ── Google Font ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        .card-hover { transition: all 0.25s ease; }
        .card-hover:hover { transform: translateY(-3px); box-shadow: 0 20px 60px rgba(13,148,136,0.10); }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes pulse-ring { 0%{transform:scale(1);opacity:0.6} 100%{transform:scale(1.5);opacity:0} }
        .float { animation: float 4s ease-in-out infinite; }
        .pulse-dot::after { content:''; position:absolute; inset:0; border-radius:9999px; background:currentColor; animation: pulse-ring 1.5s ease-out infinite; }
      `}</style>

      {/* ═══════════════════════════════════════════════
          NAVBAR
      ═══════════════════════════════════════════════ */}
      <nav dir="rtl" className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/90 backdrop-blur-xl shadow-sm border-b border-gray-100" : "bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between">

          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-teal-500 flex items-center justify-center shadow-lg shadow-teal-400/30">
              <Store size={17} className="text-white" />
            </div>
            <span className="font-black text-lg text-gray-900">بيفيه شوب</span>
          </div>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {["خدماتنا", "كيف تعمل", "الأسعار", "الأسئلة الشائعة"].map(l => (
              <a key={l} href="#" className="text-sm text-gray-500 hover:text-teal-600 font-medium transition-colors">{l}</a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <a href="#" className="text-sm text-gray-500 hover:text-gray-800 font-medium transition-colors">تسجيل الدخول</a>
            <a href="#" className="inline-flex items-center gap-1.5 text-sm font-bold bg-teal-500 hover:bg-teal-600 text-white px-5 py-2.5 rounded-2xl transition-all shadow-lg shadow-teal-400/25">
              <Sparkles size={14} /> ابدأ مجاناً
            </a>
          </div>

          {/* Mobile */}
          <button className="md:hidden p-2 text-gray-600" onClick={() => setNavOpen(!navOpen)}>
            {navOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {navOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-5 py-5 flex flex-col gap-4 shadow-lg">
            {["خدماتنا", "كيف تعمل", "الأسعار", "الأسئلة الشائعة"].map(l => (
              <a key={l} href="#" className="text-gray-600 font-medium text-sm">{l}</a>
            ))}
            <a href="#" className="text-center text-sm font-bold bg-teal-500 text-white px-4 py-3 rounded-2xl shadow-lg shadow-teal-400/20">ابدأ مجاناً</a>
          </div>
        )}
      </nav>

      {/* ═══════════════════════════════════════════════
          HERO
      ═══════════════════════════════════════════════ */}
      <section dir="rtl" className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-teal-50 via-white to-white pt-16">

        {/* Decorative orbs */}
        <div className="absolute top-20 right-0 w-[600px] h-[600px] rounded-full bg-teal-100/60 blur-[120px] pointer-events-none -translate-y-1/4 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-teal-50 blur-[80px] pointer-events-none translate-y-1/4 -translate-x-1/4" />

        {/* Dashed circles — like reference image */}
        <div className="absolute top-1/3 left-20 w-56 h-56 rounded-full border-2 border-dashed border-teal-300/50 pointer-events-none" />
        <div className="absolute bottom-28 right-16 w-20 h-20 rounded-full border border-dashed border-teal-300/40 pointer-events-none" />
        <div className="absolute top-24 left-1/2 w-8 h-8 rounded-full border border-dashed border-teal-400/30 pointer-events-none" />

        {/* Dot accents */}
        <div className="absolute top-40 right-32 w-3 h-3 rounded-full bg-teal-400 opacity-60" />
        <div className="absolute bottom-48 left-40 w-2 h-2 rounded-full bg-teal-300 opacity-50" />
        <div className="absolute top-1/2 left-12 w-1.5 h-1.5 rounded-full bg-teal-500 opacity-40" />

        <div className="relative max-w-7xl mx-auto px-6 w-full py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Left: text */}
            <div>
              {/* Badge pill */}
              <div className="inline-flex items-center gap-2 bg-teal-500/10 border border-teal-400/20 text-teal-700 text-xs font-bold px-4 py-2 rounded-full mb-8">
                <Sparkles size={12} />
                منصة التجارة الإلكترونية الجزائرية الأولى
              </div>

              {/* Big headline — matches reference typography weight */}
              <h1 className="text-6xl md:text-7xl font-black text-gray-900 leading-[1.08] mb-6" style={{ letterSpacing: "-0.02em" }}>
                أنشئ متجرك
                <br />
                <span className="text-teal-500">في ثوانٍ</span>
                <br />
                معدودة
              </h1>

              <p className="text-gray-500 text-lg md:text-xl leading-relaxed mb-10 max-w-lg">
                من فكرة بسيطة إلى تطبيق ويب/موبايل احترافي. بدون صداع التقنية أو التعقيدات. مصمم خصيصاً للتاجر الجزائري.
              </p>

              {/* CTA buttons — pill shaped like reference */}
              <div className="flex flex-wrap gap-4 mb-10">
                <a href="#" className="inline-flex items-center gap-2.5 bg-teal-500 hover:bg-teal-600 text-white font-black px-8 py-4 rounded-full transition-all shadow-2xl shadow-teal-400/30 text-base">
                  <Sparkles size={16} /> ابدأ الآن مجاناً
                </a>
                <a href="#" className="inline-flex items-center gap-2.5 bg-white border-2 border-gray-200 hover:border-teal-300 text-gray-700 font-bold px-8 py-4 rounded-full transition-all text-base">
                  شاهد الفيديو <ChevronRight size={16} />
                </a>
              </div>

              {/* Trust badges — matching reference bottom badges */}
              <div className="flex flex-wrap gap-6 text-sm text-gray-400">
                {[
                  { icon: <Shield size={14} />, text: "آمن 100%" },
                  { icon: <Zap size={14} />, text: "إطلاق سريع" },
                  { icon: <TrendingUp size={14} />, text: "قابل للتوسع" },
                ].map((b, i) => (
                  <span key={i} className="flex items-center gap-1.5 text-gray-500">{b.icon}{b.text}</span>
                ))}
              </div>
            </div>

            {/* Right: floating dashboard card */}
            <div className="relative hidden lg:flex items-center justify-center">
              <div className="float relative w-full max-w-md">
                {/* Main card */}
                <div className="bg-white rounded-3xl shadow-2xl shadow-teal-100/80 border border-gray-100 overflow-hidden">
                  {/* Card topbar */}
                  <div className="bg-teal-500 px-5 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white">
                      <Store size={16} />
                      <span className="font-bold text-sm">لوحة التحكم</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Bell size={15} className="text-white/70" />
                      <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold">م</div>
                    </div>
                  </div>

                  <div className="p-5 bg-gray-50/50">
                    {/* Stat chips */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      {[
                        { label: "المبيعات", v: "124K دج", up: "+18%" },
                        { label: "الطلبات", v: "38", up: "+7%" },
                        { label: "الزوار", v: "1,240", up: "+12%" },
                      ].map(s => (
                        <div key={s.label} className="bg-white rounded-2xl p-3 border border-gray-100 shadow-sm">
                          <p className="text-gray-400 text-xs mb-1">{s.label}</p>
                          <p className="text-gray-900 font-bold text-sm">{s.v}</p>
                          <span className="text-teal-500 text-xs font-bold flex items-center gap-0.5">
                            <TrendingUp size={10} />{s.up}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Orders table */}
                    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-50">
                        <span className="text-xs font-bold text-gray-600">آخر الطلبات</span>
                        <span className="text-xs text-teal-500 font-semibold cursor-pointer">عرض الكل</span>
                      </div>
                      {[
                        { id: "#1042", name: "أيمن حمادي", s: "تم الشحن", amt: "3,200 دج", sc: "bg-teal-50 text-teal-600" },
                        { id: "#1041", name: "نور الهدى", s: "قيد المعالجة", amt: "7,500 دج", sc: "bg-amber-50 text-amber-600" },
                        { id: "#1040", name: "كريم بلعيد", s: "تم التسليم", amt: "1,800 دج", sc: "bg-emerald-50 text-emerald-600" },
                      ].map(o => (
                        <div key={o.id} className="flex items-center justify-between px-4 py-2.5 border-b border-gray-50 last:border-0 text-xs">
                          <span className="text-gray-400">{o.id}</span>
                          <span className="text-gray-700 font-semibold">{o.name}</span>
                          <span className={`px-2.5 py-0.5 rounded-full font-semibold text-xs ${o.sc}`}>{o.s}</span>
                          <span className="text-gray-900 font-bold">{o.amt}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Floating notification pill */}
                <div className="absolute -top-5 -right-5 bg-white border border-gray-100 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-xl shadow-gray-200/80">
                  <div className="relative w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-500">
                    <Bell size={14} />
                    <span className="pulse-dot absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-teal-500 text-teal-500" />
                  </div>
                  <div>
                    <p className="text-gray-900 text-xs font-bold">طلب جديد!</p>
                    <p className="text-gray-400 text-xs">منذ ثانيتين</p>
                  </div>
                </div>

                {/* Growth pill */}
                <div className="absolute -bottom-5 -left-5 bg-teal-500 text-white rounded-2xl px-4 py-3 shadow-xl shadow-teal-400/30">
                  <p className="text-xs font-black">+42% هذا الشهر</p>
                  <p className="text-teal-100 text-xs">مقارنة بالشهر الماضي</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          STATS BAR
      ═══════════════════════════════════════════════ */}
      <section dir="rtl" className="bg-teal-500 py-12">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { v: "500+", l: "متجر نشط" },
            { v: "99.9%", l: "وقت التشغيل" },
            { v: "48h", l: "دعم سريع" },
            { v: "58", l: "ولاية مُغطّاة" },
          ].map(s => (
            <div key={s.l}>
              <p className="text-4xl font-black text-white mb-1">{s.v}</p>
              <p className="text-teal-100 text-sm font-medium">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          FEATURES
      ═══════════════════════════════════════════════ */}
      <section dir="rtl" className="py-28 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-1.5 bg-teal-50 border border-teal-200 text-teal-600 text-xs font-bold px-4 py-2 rounded-full mb-4">
              <Zap size={12} /> المميزات
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4" style={{ letterSpacing: "-0.02em" }}>كل ما تحتاجه في مكان واحد</h2>
            <p className="text-gray-400 max-w-xl mx-auto text-lg">بيفيه شوب يوفر أدوات متكاملة تناسب السوق الجزائري.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: <Store size={22} />, title: "متجر جاهز في دقائق", desc: "أنشئ متجرك الاحترافي بدون أي خبرة تقنية. قوالب جاهزة قابلة للتخصيص الكامل." },
              { icon: <Package size={22} />, title: "إدارة المخزون", desc: "تتبّع مخزونك في الوقت الفعلي وتلقّ تنبيهات فورية عند نفاد المنتجات." },
              { icon: <CreditCard size={22} />, title: "مدفوعات آمنة", desc: "استقبل المدفوعات عبر CCP، باردي موب، والدفع عند الاستلام بكل أمان." },
              { icon: <Truck size={22} />, title: "توصيل لكل الولايات", desc: "تكامل مع شركات الشحن الجزائرية الكبرى لتوصيل طلباتك لكل ولاية." },
              { icon: <BarChart3 size={22} />, title: "تقارير وتحليلات", desc: "داشبورد متكامل يُظهر مبيعاتك وزوارك وأفضل المنتجات أداءً." },
              { icon: <Globe size={22} />, title: "ثنائي اللغة", desc: "متجرك يدعم العربية والفرنسية والإنجليزية لأكبر شريحة من الزبائن." },
              { icon: <Smartphone size={22} />, title: "متوافق مع الجوال", desc: "يعمل بشكل مثالي على الهواتف حيث يتسوّق معظم الجزائريين." },
              { icon: <Headphones size={22} />, title: "دعم فني بالعربية", desc: "فريق دعم متخصص يتحدث العربية لمساعدتك في كل خطوة." },
              { icon: <Zap size={22} />, title: "سرعة فائقة", desc: "بنية تحتية تضمن تحميل متجرك في أقل من ثانيتين لتجربة مثالية." },
            ].map((f, i) => (
              <div key={i} className="card-hover group bg-white border border-gray-100 rounded-3xl p-6 hover:border-teal-200 cursor-default">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-500 mb-4 group-hover:bg-teal-500 group-hover:text-white group-hover:border-teal-500 transition-all duration-300">
                  {f.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-base">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          HOW IT WORKS
      ═══════════════════════════════════════════════ */}
      <section dir="rtl" className="py-28 bg-gray-50/70">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-1.5 bg-teal-50 border border-teal-200 text-teal-600 text-xs font-bold px-4 py-2 rounded-full mb-4">
              <ChevronRight size={12} /> كيف يعمل
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4" style={{ letterSpacing: "-0.02em" }}>أربع خطوات فقط</h2>
            <p className="text-gray-400 text-lg">من الفكرة إلى متجر جاهز للبيع في أقل من ساعة.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { n: "01", title: "أنشئ حسابك", desc: "سجّل مجاناً في أقل من دقيقة دون الحاجة لبطاقة بنكية." },
              { n: "02", title: "خصّص متجرك", desc: "اختر قالباً واضف شعارك وألوانك وابدأ إضافة منتجاتك." },
              { n: "03", title: "فعّل الدفع والشحن", desc: "اربط متجرك بطرق الدفع الجزائرية وشركات التوصيل." },
              { n: "04", title: "ابدأ البيع", desc: "شارك رابط متجرك وابدأ استقبال الطلبات فوراً." },
            ].map((s, i) => (
              <div key={i} className="card-hover bg-white border border-gray-100 rounded-3xl p-7 hover:border-teal-200">
                <div className="w-14 h-14 rounded-2xl bg-teal-500 flex items-center justify-center text-white text-2xl font-black mb-5 shadow-lg shadow-teal-400/30">
                  {s.n}
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{s.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <a href="#" className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white font-black px-10 py-4 rounded-full transition-all shadow-xl shadow-teal-400/25 text-base">
              ابدأ الآن مجاناً <ArrowRight size={18} />
            </a>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          STOREFRONT PREVIEW
      ═══════════════════════════════════════════════ */}
      <section dir="rtl" className="py-28 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">

          {/* Text */}
          <div>
            <div className="inline-flex items-center gap-1.5 bg-teal-50 border border-teal-200 text-teal-600 text-xs font-bold px-4 py-2 rounded-full mb-6">
              <Palette size={12} /> واجهة متجرك
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 leading-tight" style={{ letterSpacing: "-0.02em" }}>
              متجر يُبهر<br /><span className="text-teal-500">زبائنك</span>
            </h2>
            <p className="text-gray-400 text-lg leading-relaxed mb-8">
              اختر من بين قوالب احترافية مصممة لزيادة المبيعات. كل قالب قابل للتخصيص الكامل بألوانك وشعارك ومحتواك.
            </p>
            <div className="space-y-4">
              {[
                { icon: <Palette size={15} />, t: "قوالب جاهزة قابلة للتخصيص" },
                { icon: <MonitorSmartphone size={15} />, t: "متوافق مع جميع الأجهزة" },
                { icon: <Search size={15} />, t: "محسّن لمحركات البحث SEO" },
                { icon: <Lock size={15} />, t: "شهادة SSL مجانية" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-500 shrink-0">{item.icon}</div>
                  <span className="text-gray-600 font-semibold text-sm">{item.t}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Store mockup */}
          <div className="relative">
            <div className="absolute -inset-4 bg-teal-50 rounded-3xl blur-2xl opacity-60" />
            <div className="relative bg-white rounded-3xl border border-gray-200 shadow-2xl shadow-teal-100/60 overflow-hidden">
              {/* Browser bar */}
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-100">
                <div className="flex gap-1.5">
                  {["bg-red-400", "bg-yellow-400", "bg-green-400"].map(c => <div key={c} className={`w-3 h-3 rounded-full ${c}`} />)}
                </div>
                <div className="flex-1 text-center text-xs text-gray-400 bg-white rounded-lg py-1">متجري.bifihshop.dz</div>
              </div>
              {/* Store nav */}
              <div className="bg-teal-500 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-white text-sm font-bold"><Store size={14} /> متجر الإلكترونيات</div>
                <div className="flex gap-3"><Search size={14} className="text-white/70" /><ShoppingCart size={14} className="text-white/70" /></div>
              </div>
              {/* Products */}
              <div className="p-4 bg-gray-50/50">
                <p className="text-gray-400 text-xs font-bold mb-3">المنتجات الجديدة</p>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { name: "سماعات بلوتوث", price: "4,500 دج", badge: "جديد", bc: "bg-teal-500" },
                    { name: "شاحن لاسلكي", price: "2,200 دج", badge: "", bc: "" },
                    { name: "كابل USB-C", price: "800 دج", badge: "-20%", bc: "bg-red-500" },
                  ].map(p => (
                    <div key={p.name} className="bg-white border border-gray-100 rounded-2xl p-2.5 shadow-sm">
                      {p.badge && <span className={`text-white text-xs font-bold px-1.5 py-0.5 rounded-lg mb-1.5 inline-block ${p.bc}`}>{p.badge}</span>}
                      <div className="h-14 bg-teal-50 rounded-xl mb-2 flex items-center justify-center">
                        <Package size={20} className="text-teal-300" />
                      </div>
                      <p className="text-gray-700 text-xs font-semibold leading-tight mb-1">{p.name}</p>
                      <p className="text-teal-500 text-xs font-black">{p.price}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          PRICING
      ═══════════════════════════════════════════════ */}
      <section dir="rtl" className="py-28 bg-gray-50/70">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-1.5 bg-teal-50 border border-teal-200 text-teal-600 text-xs font-bold px-4 py-2 rounded-full mb-4">
              <CreditCard size={12} /> الأسعار
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4" style={{ letterSpacing: "-0.02em" }}>اختر الخطة المناسبة</h2>
            <p className="text-gray-400 text-lg">ابدأ مجاناً وطوّر خطتك مع نمو أعمالك. لا رسوم خفية.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-5 items-start">
            {[
              { name: "مجاني", price: "0", features: ["حتى 20 منتج", "نطاق فرعي مجاني", "الدفع عند الاستلام", "دعم عبر البريد"], cta: "ابدأ مجاناً", hot: false },
              { name: "احترافي", price: "2,900", features: ["منتجات غير محدودة", "نطاق مخصص", "جميع طرق الدفع", "تكامل شركات الشحن", "تقارير متقدمة", "دعم ذو أولوية"], cta: "ابدأ 14 يوم مجاناً", hot: true },
              { name: "أعمال", price: "7,500", features: ["كل ما في الاحترافي", "متعدد المستخدمين", "API كامل", "تقارير مخصصة", "مدير حساب مخصص", "SLA مضمون"], cta: "تواصل معنا", hot: false },
            ].map(p => (
              <div key={p.name} className={`relative rounded-3xl p-8 transition-all ${p.hot ? "bg-teal-500 scale-105 shadow-2xl shadow-teal-400/30" : "bg-white border border-gray-100 shadow-sm card-hover"}`}>
                {p.hot && <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 text-xs font-black px-5 py-1.5 rounded-full shadow-lg">الأكثر شعبية</div>}
                <h3 className={`font-black text-xl mb-4 ${p.hot ? "text-white" : "text-gray-900"}`}>{p.name}</h3>
                <div className="mb-6">
                  <span className={`text-5xl font-black ${p.hot ? "text-white" : "text-teal-500"}`}>{p.price}</span>
                  <span className={`text-sm mr-1 ${p.hot ? "text-teal-100" : "text-gray-400"}`}>دج / شهر</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {p.features.map(f => (
                    <li key={f} className="flex items-center gap-2.5 text-sm">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${p.hot ? "bg-white/25" : "bg-teal-50 border border-teal-100"}`}>
                        <Check size={11} className={p.hot ? "text-white" : "text-teal-500"} />
                      </div>
                      <span className={p.hot ? "text-teal-50" : "text-gray-500"}>{f}</span>
                    </li>
                  ))}
                </ul>
                <a href="#" className={`block text-center font-black py-3.5 rounded-2xl transition-all text-sm ${p.hot ? "bg-white text-teal-600 hover:bg-teal-50" : "bg-teal-500 text-white hover:bg-teal-600 shadow-lg shadow-teal-400/20"}`}>
                  {p.cta}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          TESTIMONIALS
      ═══════════════════════════════════════════════ */}
      <section dir="rtl" className="py-28 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-1.5 bg-teal-50 border border-teal-200 text-teal-600 text-xs font-bold px-4 py-2 rounded-full mb-4">
              <Star size={12} /> آراء العملاء
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4" style={{ letterSpacing: "-0.02em" }}>ماذا يقول أصحاب المتاجر</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              { name: "ياسين بوخليفة", role: "إلكترونيات · قسنطينة", text: "بيفيه شوب غيّر طريقة عملي كلياً. أبيع الآن ثلاثة أضعاف مقارنة بالمبيعات على فيسبوك." },
              { name: "سارة معاش", role: "ملابس تقليدية · تلمسان", text: "أخيراً منصة تفهمنا كجزائريين. الدفع عند الاستلام والشحن لكل الولايات هو ما كنت أبحث عنه." },
              { name: "رضا قاسم", role: "مستحضرات تجميل · الجزائر العاصمة", text: "الدعم الفني بالعربية ميزة لا تُقدّر. أي مشكلة تحلّ في دقائق." },
            ].map((t, i) => (
              <div key={i} className="card-hover bg-white border border-gray-100 rounded-3xl p-7 hover:border-teal-200 shadow-sm">
                <div className="flex gap-0.5 mb-5">
                  {Array(5).fill(0).map((_, j) => <Star key={j} size={14} className="fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-gray-500 text-sm leading-relaxed mb-6 italic">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-teal-100 flex items-center justify-center text-teal-600 font-black text-sm shrink-0">{t.name[0]}</div>
                  <div>
                    <p className="text-gray-900 font-bold text-sm">{t.name}</p>
                    <p className="text-gray-400 text-xs">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          FAQ
      ═══════════════════════════════════════════════ */}
      <section dir="rtl" className="py-28 bg-gray-50/70">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-1.5 bg-teal-50 border border-teal-200 text-teal-600 text-xs font-bold px-4 py-2 rounded-full mb-4">
              <Search size={12} /> الأسئلة الشائعة
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4" style={{ letterSpacing: "-0.02em" }}>لديك سؤال؟</h2>
          </div>

          <div className="space-y-3">
            {[
              { q: "هل أحتاج لخبرة تقنية لإنشاء متجري؟", a: "لا على الإطلاق. بيفيه شوب مصمم ليكون بسيطاً للجميع. إذا كنت تستطيع استخدام الهاتف الذكي، فبإمكانك إنشاء متجرك في دقائق." },
              { q: "ما هي طرق الدفع المتاحة للزبائن الجزائريين؟", a: "ندعم الدفع عند الاستلام، CCP، Baridimob، وبطاقات Edahabia. نعمل على إضافة المزيد باستمرار." },
              { q: "هل يمكنني ربط متجري بشركات الشحن الجزائرية؟", a: "نعم، لدينا تكامل مع Yalitec، Maystro، Procolis وغيرها. يمكنك إدارة طلباتك وتتبع الشحنات مباشرة من لوحة التحكم." },
              { q: "هل بياناتي وبيانات زبائني محفوظة؟", a: "أمان بياناتك أولويتنا القصوى. نستخدم تشفير SSL وخوادم آمنة مع نسخ احتياطية يومية تلقائية." },
              { q: "هل يمكنني استخدام نطاقي الخاص؟", a: "بالتأكيد! في الخطة الاحترافية وما فوق يمكنك ربط أي نطاق خاص لإعطاء متجرك مظهراً احترافياً." },
            ].map((f, i) => (
              <div key={i} className={`rounded-2xl border overflow-hidden transition-all ${faqOpen === i ? "border-teal-200 bg-white shadow-sm shadow-teal-100/50" : "border-gray-100 bg-white"}`}>
                <button className="w-full flex items-center justify-between px-6 py-4 text-right gap-4" onClick={() => setFaqOpen(faqOpen === i ? null : i)}>
                  <span className="font-bold text-gray-800 text-sm">{f.q}</span>
                  <ChevronDown size={16} className={`text-teal-500 transition-transform shrink-0 ${faqOpen === i ? "rotate-180" : ""}`} />
                </button>
                {faqOpen === i && (
                  <div className="px-6 pb-5 text-gray-400 text-sm leading-relaxed border-t border-gray-50 pt-4">{f.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          CTA BANNER
      ═══════════════════════════════════════════════ */}
      <section dir="rtl" className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="relative bg-teal-500 rounded-3xl p-14 text-center overflow-hidden">
            {/* Decorative shapes */}
            <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-white/10 blur-2xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-52 h-52 rounded-full bg-teal-400/40 blur-xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />
            <div className="absolute top-8 left-8 w-16 h-16 rounded-full border-2 border-dashed border-white/20 pointer-events-none" />
            <div className="absolute bottom-8 right-12 w-10 h-10 rounded-full border border-dashed border-white/15 pointer-events-none" />

            <div className="relative">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-5" style={{ letterSpacing: "-0.02em" }}>جاهز لفتح متجرك؟</h2>
              <p className="text-teal-100 text-lg mb-10 max-w-xl mx-auto">
                انضم لمئات التجار الجزائريين الذين يحققون مبيعاتهم يومياً عبر بيفيه شوب.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <a href="#" className="inline-flex items-center gap-2 bg-white text-teal-600 font-black px-9 py-4 rounded-full hover:bg-teal-50 transition-all shadow-xl text-base">
                  ابدأ مجاناً الآن <ArrowRight size={18} />
                </a>
                <a href="#" className="inline-flex items-center gap-2 border-2 border-white/40 text-white font-bold px-9 py-4 rounded-full hover:bg-white/10 transition-all text-base">
                  تحدث مع فريقنا
                </a>
              </div>
              <p className="text-teal-200/70 text-sm mt-7">لا حاجة لبطاقة بنكية · إلغاء في أي وقت · دعم باللغة العربية</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════════════ */}
      <footer dir="rtl" className="bg-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            <div>
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-9 h-9 rounded-2xl bg-teal-500 flex items-center justify-center"><Store size={16} className="text-white" /></div>
                <span className="font-black text-white text-lg">بيفيه شوب</span>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed">منصة التجارة الإلكترونية المصممة للسوق الجزائري.</p>
            </div>
            {[
              { title: "المنصة", links: ["المميزات", "الأسعار", "القوالب", "تكاملات"] },
              { title: "الشركة", links: ["من نحن", "المدونة", "الشراكات", "اتصل بنا"] },
              { title: "الدعم", links: ["مركز المساعدة", "التوثيق", "حالة المنصة", "سياسة الخصوصية"] },
            ].map(col => (
              <div key={col.title}>
                <h4 className="font-bold text-white text-sm mb-4">{col.title}</h4>
                <ul className="space-y-2.5">
                  {col.links.map(l => (
                    <li key={l}><a href="#" className="text-gray-500 text-sm hover:text-teal-400 transition-colors">{l}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-gray-600 text-xs">جميع الحقوق محفوظة © 2025 بيفيه شوب</p>
            <p className="text-gray-600 text-xs">صُنع بكل حب للتاجر الجزائري</p>
          </div>
        </div>
      </footer>

    </div>
  );
}