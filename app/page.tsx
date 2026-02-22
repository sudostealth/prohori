import Link from 'next/link';
import { Shield, Lock, ArrowRight, Activity, Cpu, CheckCircle2 } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white selection:bg-primary/30">
      
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-[#0A0A0A]/80 backdrop-blur-md border-b border-[#222]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="font-display font-bold text-xl tracking-wide">PROHORI</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-text-muted">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#compliance" className="hover:text-white transition-colors">Compliance</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors">
              Sign In
            </Link>
            <Link href="/signup" className="px-4 py-2 bg-white text-black text-sm font-medium rounded-md hover:bg-gray-200 transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1A1A1A] border border-[#333] text-primary text-sm font-medium mb-8">
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
            Prohori 2.0 is now live for Early Access
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight mb-6 leading-tight">
            Next-Gen Security for <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">
              Bangladeshi Enterprises
            </span>
          </h1>
          <p className="text-lg md:text-xl text-text-muted max-w-2xl mx-auto mb-10 leading-relaxed">
            Enterprise-grade SIEM, automated compliance tracking, and continuous threat intelligence. Specifically localized for the BD market infrastructure.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup" className="px-8 py-4 bg-primary text-[#0A0A0A] font-bold rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2 w-full sm:w-auto justify-center">
              Start Free Trial <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="#demo" className="px-8 py-4 bg-[#1A1A1A] text-white font-medium rounded-md border border-[#333] hover:bg-[#222] transition-colors w-full sm:w-auto justify-center">
              Book a Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-10 border-y border-[#222] bg-[#111]">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-text-muted">
           <div>
             <h4 className="text-3xl font-display font-bold text-white mb-2">99.9%</h4>
             <p className="text-sm">Threat Detection Rate</p>
           </div>
           <div>
             <h4 className="text-3xl font-display font-bold text-white mb-2">24/7</h4>
             <p className="text-sm">Continuous Monitoring</p>
           </div>
           <div>
             <h4 className="text-3xl font-display font-bold text-white mb-2">&lt;50ms</h4>
             <p className="text-sm">Avg Alert Latency</p>
           </div>
           <div>
             <h4 className="text-3xl font-display font-bold text-white mb-2">100%</h4>
             <p className="text-sm">Data Localized in BD</p>
           </div>
        </div>
      </section>

      {/* Features Matrix */}
      <section id="features" className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
             <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Complete Security Arsenal</h2>
             <p className="text-text-muted max-w-2xl mx-auto">Everything you need to secure your cloud and on-premise infrastructure without the overhead of a traditional SOC.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-8 rounded-2xl bg-[#111] border border-[#222] hover:border-primary/50 transition-colors group">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Activity className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-display font-bold mb-3">Real-time SIEM</h3>
              <p className="text-text-muted leading-relaxed">Advanced log analysis and anomaly detection powered by Wazuh, giving you instant visibility.</p>
            </div>

            <div className="p-8 rounded-2xl bg-[#111] border border-[#222] hover:border-primary/50 transition-colors group">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Cpu className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-display font-bold mb-3">AI Security Analyst</h3>
              <p className="text-text-muted leading-relaxed">Ask questions in plain English. Powered by advanced Llama 3 models tailored for SecOps.</p>
            </div>

            <div className="p-8 rounded-2xl bg-[#111] border border-[#222] hover:border-primary/50 transition-colors group">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Lock className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-display font-bold mb-3">Compliance Ready</h3>
              <p className="text-text-muted leading-relaxed">Automated mapping for local regulatory requirements including BRPD and ICT acts.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing / CTA */}
      <section id="pricing" className="py-24 px-6 border-t border-[#222] bg-[#0A0A0A] relative overflow-hidden">
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">Securing the Nation&apos;s Digital Future.</h2>
          <p className="text-xl text-text-muted mb-10">Join 50+ innovative Bangladeshi companies scaling securely with Prohori.</p>
          
          <div className="p-8 rounded-2xl bg-[#111] border border-[#333] inline-flex flex-col items-center max-w-md w-full text-left">
            <div className="w-full text-center mb-6">
              <p className="text-primary font-bold tracking-widest text-sm uppercase">Early Adopter</p>
              <h3 className="text-4xl font-display font-bold mt-2">৳0 <span className="text-lg text-text-muted font-normal">/month</span></h3>
            </div>
            
            <ul className="space-y-4 mb-8 w-full">
              {['Full SIEM Dashboard Access', '10 Agent Deployments', 'AI Security Analyst Demo', 'Community Support'].map((feature, i) => (
                <li key={i} className="flex items-center text-text-muted">
                   <CheckCircle2 className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                   {feature}
                </li>
              ))}
            </ul>

            <Link href="/signup" className="w-full px-6 py-4 bg-white text-black font-bold text-center rounded-md hover:bg-gray-200 transition-colors">
              Claim Your Spot
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#222] bg-[#0A0A0A] py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <span className="font-display font-bold">PROHORI</span>
          </div>
          <p className="text-text-muted text-sm">© 2026 Prohori Security Solutions. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
