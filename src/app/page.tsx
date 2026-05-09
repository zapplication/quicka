import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F5F2ED]">
      {/* Ticker */}
      <div className="bg-[#0A0A0A] overflow-hidden py-2">
        <div className="flex whitespace-nowrap animate-marquee">
          {[
            "Built in 60 Seconds", "No Design Fees", "Free .co.za Domain",
            "SSL Included", "Hosting Included", "5–10 Changes/Month",
            "Mobile Optimised", "Contact Form", "WhatsApp Button",
            "No Hidden Costs", "Blog Included", "AI Content"
          ].map((item, i) => (
            <span key={i} className="px-7 text-xs font-bold tracking-widest uppercase text-white flex items-center gap-7">
              {item}
              <span className="opacity-30">✦</span>
            </span>
          ))}
          {[
            "Built in 60 Seconds", "No Design Fees", "Free .co.za Domain",
            "SSL Included", "Hosting Included", "5–10 Changes/Month",
            "Mobile Optimised", "Contact Form", "WhatsApp Button",
            "No Hidden Costs", "Blog Included", "AI Content"
          ].map((item, i) => (
            <span key={`dup-${i}`} className="px-7 text-xs font-bold tracking-widest uppercase text-white flex items-center gap-7">
              {item}
              <span className="opacity-30">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#F5F2ED]/95 backdrop-blur-lg border-b border-black/8">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl text-[#0A0A0A]" style={{fontFamily: 'Georgia, serif', fontStyle: 'italic'}}>
            Quick<span className="text-[#00C853]">a</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="text-sm text-[#7A756E] font-medium hover:text-[#0A0A0A] transition-colors no-underline">How it works</a>
            <a href="#pricing" className="text-sm text-[#7A756E] font-medium hover:text-[#0A0A0A] transition-colors no-underline">Pricing</a>
          </div>
          <Link href="/build" className="bg-[#00C853] text-white px-6 py-3 rounded-full font-semibold text-sm hover:bg-[#009624] transition-colors no-underline">
            Build free preview →
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="min-h-[90vh] flex flex-col justify-center relative overflow-hidden px-6 pt-32 pb-20">
        <div className="absolute inset-0 opacity-40" style={{backgroundImage: 'radial-gradient(circle at 1px 1px,rgba(0,0,0,0.05) 1px,transparent 0)', backgroundSize: '28px 28px'}} />
        <div className="absolute top-1/4 right-0 w-96 h-96 rounded-full opacity-20 bg-[#00C853] blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-[#EDE8DF] border border-black/8 rounded-full px-4 py-2 mb-8 text-sm font-medium">
            <span className="bg-[#00C853] text-white rounded-full px-2.5 py-0.5 text-xs font-bold">🇿🇦</span>
            <span className="text-[#7A756E]">AI websites for South African businesses</span>
          </div>

          <h1 className="text-5xl md:text-7xl text-[#0A0A0A] leading-none tracking-tight mb-6" style={{fontFamily: 'Georgia, serif'}}>
            Your business needs a <span className="text-[#00C853] italic">website</span>.
          </h1>

          <p className="text-[#7A756E] text-xl leading-relaxed max-w-xl mb-8">
            Answer 8 questions. AI builds your complete website in <strong className="text-[#0A0A0A]">60 seconds</strong> — with your own <strong className="text-[#0A0A0A]">.co.za domain</strong>, contact form, WhatsApp button and more. From <strong className="text-[#0A0A0A]">R99/month</strong>.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/build" className="inline-flex bg-[#00C853] text-white px-8 py-4 rounded-full font-semibold text-base hover:bg-[#009624] transition-colors no-underline text-center">
              ⚡ Build my free preview →
            </Link>
            <p className="text-sm text-[#7A756E] self-center">No credit card · 60-min preview</p>
          </div>

          <div className="flex gap-12 mt-12 pt-8 border-t border-black/8">
            {[
              ["60s", "Build time"],
              ["R99", "From/month"],
              ["R0", "Upfront"]
            ].map(([num, label]) => (
              <div key={num}>
                <div className="text-4xl text-[#0A0A0A]" style={{fontFamily: 'Georgia, serif'}}>{num}</div>
                <div className="text-xs text-[#7A756E] mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-[#0A0A0A] py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs font-bold tracking-widest uppercase text-[#00C853] mb-3">Why Quicka</p>
          <h2 className="text-4xl md:text-5xl text-white tracking-tight leading-tight mb-3" style={{fontFamily: 'Georgia, serif'}}>
            Everything included. <em className="text-[#00C853]">Nothing extra.</em>
          </h2>
          <p className="text-white/40 text-sm mb-16 max-w-lg">
            Traditional web agencies charge R5,000–R20,000 upfront. Quicka builds in 60 seconds.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              {icon: "🚀", title: "Built in 60 Seconds", desc: "AI generates your complete site"},
              {icon: "💰", title: "No Design Fees", desc: "Zero upfront costs"},
              {icon: "🔒", title: "No Hidden Costs", desc: "One simple price"},
              {icon: "🌐", title: ".co.za Domain", desc: "Included on every plan"},
              {icon: "🔐", title: "SSL Included", desc: "Secure site"},
              {icon: "📱", title: "Mobile Optimised", desc: "Works on any device"},
              {icon: "🏠", title: "Hosting Included", desc: "Fast hosting"},
              {icon: "✏️", title: "Changes Included", desc: "5–10 per month"},
              {icon: "📋", title: "Contact Form", desc: "Leads to email"},
              {icon: "💬", title: "WhatsApp Button", desc: "Customers contact you"},
            ].map((b, i) => (
              <div key={i} className="bg-white/5 border border-white/8 rounded-2xl p-6 hover:bg-white/10 transition-colors">
                <div className="text-3xl mb-4">{b.icon}</div>
                <h3 className="text-white font-semibold text-sm mb-2">{b.title}</h3>
                <p className="text-white/40 text-xs">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-white py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-bold tracking-widest uppercase text-[#00C853] mb-3">How it works</p>
          <h2 className="text-4xl md:text-5xl text-[#0A0A0A] tracking-tight mb-12" style={{fontFamily: 'Georgia, serif'}}>
            From zero to live <em className="text-[#00C853]">in minutes.</em>
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {n: "1", icon: "📝", title: "Answer 8 questions", desc: "Tell us about your business, services and preferences."},
              {n: "2", icon: "⚡", title: "AI builds your site", desc: "We generate your complete website in 60 seconds."},
              {n: "3", icon: "👀", title: "Preview for free", desc: "See your site for 60 minutes before paying anything."},
              {n: "4", icon: "🚀", title: "Go live today", desc: "Pay and your .co.za website goes live instantly."},
            ].map((s, i) => (
              <div key={i} className="relative">
                <div className="w-10 h-10 bg-[#00C853]/10 text-[#00C853] rounded-full flex items-center justify-center text-sm font-bold mb-4">{s.n}</div>
                <div className="text-4xl mb-4">{s.icon}</div>
                <h3 className="font-bold text-[#0A0A0A] text-lg mb-2">{s.title}</h3>
                <p className="text-[#7A756E] text-sm">{s.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-16">
            <Link href="/build" className="inline-flex bg-[#00C853] text-white px-10 py-4 rounded-full font-semibold text-lg hover:bg-[#009624] transition-colors no-underline">
              Get started free →
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-[#F5F2ED] py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs font-bold tracking-widest uppercase text-[#00C853] mb-3">Pricing</p>
          <h2 className="text-4xl md:text-5xl text-[#0A0A0A] tracking-tight mb-3" style={{fontFamily: 'Georgia, serif'}}>
            Simple pricing. <em className="text-[#00C853]">No surprises.</em>
          </h2>
          <p className="text-[#7A756E] text-sm mb-16 max-w-lg">
            Every plan includes .co.za domain, SSL, contact form and WhatsApp button. Preview free. Cancel anytime.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {name: "Basic", price: 99, desc: "One clean page. Everything you need to get found online.", features: ["1-page site", "Custom .co.za domain", "SSL certificate", "Up to 5 services", "Contact form", "WhatsApp button", "5 changes/month"]},
              {name: "Growth", price: 149, featured: true, desc: "More pages, blog and AI content to grow your reach.", features: ["5 pages", "Everything in Basic", "8 services", "AI content", "3 blog posts", "SEO setup", "8 changes/month"]},
              {name: "Business", price: 249, desc: "Full online presence with store, gallery and ordering.", features: ["5 pages", "Everything in Growth", "12 services", "5 blog posts", "Photo gallery", "Online store", "10 changes/month", "Priority support"]},
            ].map((plan, i) => (
              <div key={i} className={`relative rounded-3xl p-8 ${plan.featured ? 'bg-[#0A0A0A] text-white' : 'bg-white border border-black/8'}`}>
                {plan.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#00C853] text-white text-xs font-bold tracking-wider uppercase px-4 py-1 rounded-full">
                    Recommended
                  </div>
                )}
                <p className={`text-xs font-bold tracking-widest uppercase mb-2 ${plan.featured ? 'text-white/40' : 'text-[#7A756E]'}`}>{plan.name}</p>
                <div className="text-5xl text-[#0A0A0A] mb-2" style={{fontFamily: 'Georgia, serif'}}>R{plan.price}<span className={`text-sm ${plan.featured ? 'text-white/40' : 'text-[#7A756E]'}`}>/mo</span></div>
                <p className={`text-sm mb-6 ${plan.featured ? 'text-white/55' : 'text-[#7A756E]'}`}>{plan.desc}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-3 text-sm">
                      <span className="text-[#00C853]">✓</span>
                      <span className={plan.featured ? 'text-white/80' : 'text-[#0A0A0A]'}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/build" className={`block w-full py-4 rounded-full font-semibold text-sm text-center no-underline ${plan.featured ? 'bg-[#00C853] text-white' : 'bg-[#0A0A0A] text-white'}`}>
                  Build free preview →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer — shared component with full legal entity details, links to
          Terms / Privacy / Refund / Contact / About. Required for PayFast
          merchant review and POPIA compliance. */}
      <SiteFooter />
    </main>
  );
}