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
              <div key={i} className="relative rounded-3xl p-8 bg-white border border-black/8">
                {plan.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#00C853] text-white text-xs font-bold tracking-wider uppercase px-4 py-1 rounded-full">
                    Recommended
                  </div>
                )}
                <p className="text-xs font-bold tracking-widest uppercase mb-2 text-[#7A756E]">{plan.name}</p>
                <div className="text-5xl text-[#0A0A0A] mb-2" style={{fontFamily: 'Georgia, serif'}}>R{plan.price}<span className="text-sm text-[#7A756E]">/mo</span></div>
                <p className="text-sm mb-6 text-[#7A756E]">{plan.desc}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-3 text-sm">
                      <span className="text-[#00C853]">✓</span>
                      <span className="text-[#0A0A0A]">{f}</span>
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

      {/* Founder block — A real human, JHB-based, WhatsApp-reachable.
          Audit P0 #1 (founder presence) + #5 (WhatsApp on marketing site)
          + #20 (phone/WhatsApp on contact path). */}
      <section className="bg-white py-24 px-6 border-t border-black/8">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Photo */}
            <div className="relative max-w-sm mx-auto md:mx-0 md:max-w-none">
              <img
                src="/founder-andre.jpg"
                alt="Andre du Toit, founder of Quicka, in Johannesburg"
                width={800}
                height={1000}
                loading="lazy"
                className="rounded-2xl w-full h-auto object-cover shadow-lg"
              />
              <div className="absolute -bottom-3 -right-3 bg-[#00C853] text-white text-xs font-bold tracking-wider uppercase px-3 py-1.5 rounded-full shadow-md">
                Built in JHB 🇿🇦
              </div>
            </div>

            {/* Text */}
            <div>
              <p className="text-xs font-bold tracking-widest uppercase text-[#00C853] mb-3">A real human</p>
              <h2 className="text-4xl md:text-5xl text-[#0A0A0A] tracking-tight leading-tight mb-6" style={{fontFamily: 'Georgia, serif'}}>
                Hi, I'm <em className="text-[#00C853]">Andre.</em>
              </h2>
              <p className="text-[#0A0A0A] text-lg leading-relaxed mb-5">
                I'm based in Johannesburg and I built Quicka because every plumber, hair salon or food truck deserves a real website without paying big money upfront.
              </p>
              <p className="text-[#0A0A0A] text-lg leading-relaxed mb-5">
                Three promises: <strong>quick to build, it works, and I don't disappear.</strong>
              </p>
              <p className="text-[#0A0A0A] text-lg leading-relaxed mb-8">
                WhatsApp me — you won't be talking to a chatbot or a call centre, you'll be WhatsApping me directly.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
                <a
                  href="https://wa.me/27832358790?text=Hi%20Andre%2C%20I'm%20thinking%20about%20Quicka"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex bg-[#00C853] text-white px-7 py-4 rounded-full font-semibold text-base hover:bg-[#009624] transition-colors no-underline gap-2 items-center justify-center"
                >
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                  <span>WhatsApp Andre</span>
                </a>
                <a
                  href="https://www.linkedin.com/in/andredtoit/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex text-sm text-[#7A756E] hover:text-[#0A0A0A] transition-colors no-underline self-center sm:self-auto items-center gap-1"
                >
                  <span>Find me on LinkedIn</span>
                  <span aria-hidden="true">→</span>
                </a>
              </div>
            </div>
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