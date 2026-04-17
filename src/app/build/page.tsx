"use client";

import { useState, useEffect } from "react";

export default function BuildPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [bizName, setBizName] = useState("");
  const [plan, setPlan] = useState("Growth");
  const [bizType, setBizType] = useState<"Service" | "Product">("Service");
  const [generating, setGenerating] = useState(false);

  const plans = {
    Basic: { price: 99, items: 5 },
    Growth: { price: 149, items: 8 },
    Business: { price: 249, items: 12 },
  };

  const totalSteps = 5;

  const handleNext = () => {
    if (step === 1 && !email.includes("@")) return;
    if (step === 2 && !bizName.trim()) return;
    if (step < totalSteps) setStep(s => s + 1);
  };

  const handleGenerate = () => {
    setGenerating(true);
    // Simulate generation - in real app, call API
    setTimeout(() => {
      setGenerating(false);
      alert("In production, this would generate your AI website!");
    }, 3000);
  };

  // Handle enter key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !generating) handleNext();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [step, email, bizName, generating]);

  return (
    <main className="min-h-screen bg-[#F5F2ED] flex flex-col">
      {/* Header */}
      <header className="bg-[#0A0A0A] px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div className="text-xl text-white" style={{fontFamily: 'Georgia, serif', fontStyle: 'italic'}}>
          Quick<span className="text-[#00C853]">a</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            {[1,2,3,4,5].map(i => (
              <div key={i} className={`w-2 h-2 rounded-full ${i <= step ? 'bg-[#00C853]' : 'bg-white/20'}`} />
            ))}
          </div>
          <span className="text-white/50 text-xs">Step {step} of {totalSteps}</span>
        </div>
      </header>

      {/* Progress bar */}
      <div className="h-1 bg-[#EDE8DF]">
        <div className="h-full bg-[#00C853] transition-all" style={{width: `${(step/totalSteps)*100}%`}} />
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-xl">
          {/* Step 1: Email */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl text-[#0A0A0A] mb-2" style={{fontFamily: 'Georgia, serif'}}>Let's build your website.</h1>
                <p className="text-[#7A756E]">Start with your email address.</p>
              </div>
              
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="hello@yourbusiness.co.za"
                autoFocus
                className="w-full px-5 py-4 rounded-2xl border-2 border-black/8 bg-white text-[#0A0A0A] text-lg outline-none focus:border-[#00C853] transition-colors"
              />

              <button
                onClick={handleNext}
                disabled={!email.includes("@")}
                className="w-full bg-[#00C853] text-white py-4 rounded-2xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#009624] transition-colors"
              >
                Continue →
              </button>
            </div>
          )}

          {/* Step 2: Business Type */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl text-[#0A0A0A] mb-2" style={{fontFamily: 'Georgia, serif'}}>What do you offer?</h1>
                <p className="text-[#7A756E]">This helps us shape your website.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setBizType("Service")}
                  className={`p-6 rounded-2xl border-2 text-left transition-all ${bizType === "Service" ? "border-[#00C853] bg-[#00C853]/5" : "border-black/8 bg-white hover:border-black/16"}`}
                >
                  <div className="text-4xl mb-3">🛠️</div>
                  <div className="font-bold text-[#0A0A0A]">Service Business</div>
                  <p className="text-sm text-[#7A756E] mt-1">Hair salon, plumber, tutor, cleaner...</p>
                </button>
                <button
                  onClick={() => setBizType("Product")}
                  className={`p-6 rounded-2xl border-2 text-left transition-all ${bizType === "Product" ? "border-[#00C853] bg-[#00C853]/5" : "border-black/8 bg-white hover:border-black/16"}`}
                >
                  <div className="text-4xl mb-3">🛍️</div>
                  <div className="font-bold text-[#0A0A0A]">Product Business</div>
                  <p className="text-sm text-[#7A756E] mt-1">Online store, clothing, food...</p>
                </button>
              </div>

              <button
                onClick={handleNext}
                className="w-full bg-[#00C853] text-white py-4 rounded-2xl font-semibold text-lg hover:bg-[#009624] transition-colors"
              >
                Continue →
              </button>
            </div>
          )}

          {/* Step 3: Business Name */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl text-[#0A0A0A] mb-2" style={{fontFamily: 'Georgia, serif'}}>What's your business called?</h1>
                <p className="text-[#7A756E]">This appears on your website and domain.</p>
              </div>
              
              <input
                type="text"
                value={bizName}
                onChange={e => setBizName(e.target.value)}
                placeholder="e.g. Sarah's Hair Studio"
                autoFocus
                className="w-full px-5 py-4 rounded-2xl border-2 border-black/8 bg-white text-[#0A0A0A] text-lg outline-none focus:border-[#00C853] transition-colors"
              />

              {bizName && (
                <div className="p-4 bg-[#00C853]/10 border border-[#00C853]/20 rounded-xl">
                  <p className="text-xs text-[#7A756E] mb-1">Your domain will be</p>
                  <p className="text-[#00C853] font-bold">{bizName.toLowerCase().replace(/\s+/g, '')}.co.za</p>
                </div>
              )}

              <button
                onClick={handleNext}
                disabled={!bizName.trim()}
                className="w-full bg-[#00C853] text-white py-4 rounded-2xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#009624] transition-colors"
              >
                Continue →
              </button>
            </div>
          )}

          {/* Step 4: Plan */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl text-[#0A0A0A] mb-2" style={{fontFamily: 'Georgia, serif'}}>Choose your plan.</h1>
                <p className="text-[#7A756E]">You can upgrade anytime.</p>
              </div>

              <div className="space-y-3">
                {Object.entries(plans).map(([name, p], i) => (
                  <button
                    key={name}
                    onClick={() => setPlan(name)}
                    className={`w-full p-5 rounded-2xl border-2 text-left flex items-center justify-between transition-all ${plan === name ? "border-[#00C853] bg-[#00C853]/5" : "border-black/8 bg-white hover:border-black/16"}`}
                  >
                    <div>
                      <span className={`font-bold ${plan === name ? "text-[#00C853]" : "text-[#0A0A0A]"}`}>{name}</span>
                      <span className="text-[#7A756E] text-sm ml-3">{p.items} items · {name === "Basic" ? "1 page" : "5 pages"}</span>
                    </div>
                    <div className="text-2xl text-[#0A0A0A]" style={{fontFamily: 'Georgia, serif'}}>R{p.price}<span className="text-sm text-[#7A756E]">/mo</span></div>
                  </button>
                ))}
              </div>

              <button
                onClick={handleNext}
                className="w-full bg-[#00C853] text-white py-4 rounded-2xl font-semibold text-lg hover:bg-[#009624] transition-colors"
              >
                Continue →
              </button>
            </div>
          )}

          {/* Step 5: Generate */}
          {step === 5 && (
            <div className="space-y-6 text-center">
              {generating ? (
                <div className="py-12">
                  <div className="text-6xl mb-6 animate-bounce">⚡</div>
                  <h2 className="text-2xl text-[#0A0A0A] mb-2" style={{fontFamily: 'Georgia, serif'}}>Building your site...</h2>
                  <p className="text-[#7A756E]">AI is working its magic ✨</p>
                </div>
              ) : (
                <>
                  <div className="text-6xl mb-4">🚀</div>
                  <h1 className="text-3xl text-[#0A0A0A] mb-2" style={{fontFamily: 'Georgia, serif'}}>Ready to build!</h1>
                  <p className="text-[#7A756E] mb-8">We'll generate your complete website in about 60 seconds.</p>

                  <div className="bg-white rounded-2xl p-6 text-left border border-black/8 mb-6">
                    <div className="flex justify-between py-3 border-b border-black/8">
                      <span className="text-[#7A756E]">Email</span>
                      <span className="font-semibold text-[#0A0A0A]">{email}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-black/8">
                      <span className="text-[#7A756E]">Business</span>
                      <span className="font-semibold text-[#0A0A0A]">{bizName}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-black/8">
                      <span className="text-[#7A756E]">Type</span>
                      <span className="font-semibold text-[#0A0A0A]">{bizType}</span>
                    </div>
                    <div className="flex justify-between py-3">
                      <span className="text-[#7A756E]">Plan</span>
                      <span className="font-bold text-[#00C853]">R{plans[plan as keyof typeof plans].price}/mo</span>
                    </div>
                  </div>

                  <button
                    onClick={handleGenerate}
                    className="w-full bg-[#00C853] text-white py-4 rounded-2xl font-semibold text-lg hover:bg-[#009624] transition-colors"
                  >
                    ⚡ Build my free preview →
                  </button>
                  <p className="text-xs text-[#7A756E] mt-3">No payment until you approve your site</p>
                </>
              )}
            </div>
          )}

          {/* Back button */}
          {step > 1 && step < 5 && (
            <button 
              onClick={() => setStep(s => s - 1)} 
              className="w-full text-center text-[#7A756E] py-3 mt-4 hover:text-[#0A0A0A] transition-colors"
            >
              ← Back
            </button>
          )}
        </div>
      </div>
    </main>
  );
}