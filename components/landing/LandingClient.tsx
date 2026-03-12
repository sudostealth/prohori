"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useScroll, useTransform, type Variants } from "framer-motion";
import { 
  Shield, Activity, Brain, Users, CreditCard, CheckCircle, 
  ArrowRight, Zap, Lock, Globe, ChevronRight, Star, Menu, X
} from "lucide-react";
import type { SubscriptionPlan, PlatformContent } from "@/types";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface LandingClientProps {
  plans: SubscriptionPlan[];
  announcements: PlatformContent[];
}

const FEATURES = [
  {
    icon: Activity,
    title: "Unified SIEM Dashboard",
    desc: "Real-time security event monitoring with AI-powered threat detection. See your server health, alerts, and activity streams in one place.",
    color: "from-cyan-500/20 to-cyan-600/5",
    border: "border-cyan-500/20",
    iconColor: "text-cyan-400",
  },
  {
    icon: Brain,
    title: "AI Security Analyst",
    desc: "Ask your AI analyst complex security questions in plain language — even in বাংলা. Get instant, actionable explanations of every threat.",
    color: "from-purple-500/20 to-purple-600/5",
    border: "border-purple-500/20",
    iconColor: "text-purple-400",
  },
  {
    icon: Lock,
    title: "CSA 2023 Compliance",
    desc: "Automated compliance reports aligned with Bangladesh's Cyber Security Act 2023. One-click PDF certificates for your auditors.",
    color: "from-green-500/20 to-green-600/5",
    border: "border-green-500/20",
    iconColor: "text-green-400",
  },
  {
    icon: Users,
    title: "HRM & Access Control",
    desc: "Role-based access management (Owner → Viewer). Add team members, define granular permissions, and maintain audit trails automatically.",
    color: "from-orange-500/20 to-orange-600/5",
    border: "border-orange-500/20",
    iconColor: "text-orange-400",
  },
  {
    icon: CreditCard,
    title: "Local Billing (bKash/Nagad)",
    desc: "Pay easily via bKash, Nagad, or bank transfer. Flexible monthly and yearly plans designed for Bangladeshi SMEs.",
    color: "from-pink-500/20 to-pink-600/5",
    border: "border-pink-500/20",
    iconColor: "text-pink-400",
  },
  {
    icon: Globe,
    title: "Zero-Trust Architecture",
    desc: "Hybrid cloud design with Google Cloud VM + Supabase. Every access is verified; no implicit trust anywhere in your network.",
    color: "from-blue-500/20 to-blue-600/5",
    border: "border-blue-500/20",
    iconColor: "text-blue-400",
  },
];

const STATS = [
  { value: "99.9%", label: "Uptime SLA" },
  { value: "< 1s", label: "Alert Latency" },
  { value: "CSA 2023", label: "Compliant" },
  { value: "বাংলা", label: "Language Support" },
];

const fadeUpVariant: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

export default function LandingClient({ plans, announcements }: LandingClientProps) {
  const [navOpen, setNavOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeBanner, setActiveBanner] = useState<PlatformContent | null>(null);
  const particleRef = useRef<HTMLCanvasElement>(null);
  
  const { scrollYProgress } = useScroll();
  const opacityHero = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const yHero = useTransform(scrollYProgress, [0, 0.2], [0, 100]);

  useEffect(() => {
    const banner = announcements.find((a) => a.type === "banner" || a.type === "notification");
    if (banner) setActiveBanner(banner);
  }, [announcements]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Particle canvas effect
  useEffect(() => {
    const canvas = particleRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: { x: number; y: number; vx: number; vy: number; size: number; alpha: number }[] = [];
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.4 + 0.1,
      });
    }

    let animId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 212, 255, ${p.alpha})`;
        ctx.fill();
      });
      // Draw connections
      particles.forEach((a, i) => {
        particles.slice(i + 1).forEach((b) => {
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(0, 212, 255, ${0.1 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });
      animId = requestAnimationFrame(animate);
    };
    animate();
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", handleResize); };
  }, []);

  const formatPrice = (price: number, cycle: string) => {
    if (price === 0) return "Free";
    return `৳${price.toLocaleString()}/${cycle === "monthly" ? "mo" : "yr"}`;
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-navy-900 selection:bg-cyan-500/30">
      {/* Particle bg */}
      <canvas ref={particleRef} className="fixed inset-0 pointer-events-none z-0" />

      {/* Announcement banner */}
      <AnimatePresence>
        {activeBanner && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }} 
            animate={{ height: "auto", opacity: 1 }} 
            exit={{ height: 0, opacity: 0 }}
            className="relative z-50 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-cyan-500/20 border-b border-cyan-500/20 py-2 px-4 text-center text-sm text-cyan-300 flex items-center justify-center gap-2 overflow-hidden"
          >
            <Zap className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{activeBanner.title}</span>
            {activeBanner.body && <span className="text-gray-400 hidden sm:inline truncate">— {activeBanner.body}</span>}
            <button onClick={() => setActiveBanner(null)} className="ml-2 text-gray-500 hover:text-gray-300 transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navbar */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`sticky top-0 z-40 transition-all duration-300 ${scrolled ? "bg-navy-900/80 backdrop-blur-xl border-b border-white/5 shadow-glass" : "bg-transparent"}`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <motion.div 
              whileHover={{ rotate: 15, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/20"
            >
              <Shield className="w-4.5 h-4.5 text-white" />
            </motion.div>
            <div>
              <span className="text-xl font-bold gradient-text-cyan">প্রহরী</span>
              <span className="text-gray-500 text-xs ml-1 font-medium tracking-wide border-l border-white/10 pl-2">Prohori</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
            {["Features", "Pricing", "Docs", "Blog"].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="hover:text-cyan-400 transition-colors relative group">
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-cyan-400 transition-all duration-300 group-hover:w-full rounded-full"></span>
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/auth/login" className={buttonVariants({ variant: "ghost", className: "text-gray-300 hover:text-white hover:bg-white/5" })}>
              Sign In
            </Link>
            <Link href="/auth/signup" className={buttonVariants({ className: "bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white border-0 shadow-lg shadow-cyan-500/20 rounded-full px-6 transition-all hover:scale-105 active:scale-95" })}>
              Get Started
            </Link>
          </div>

          <button className="md:hidden text-gray-400 hover:text-white" onClick={() => setNavOpen(!navOpen)}>
            {navOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        {/* Mobile menu */}
        <AnimatePresence>
          {navOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden glass-card mx-4 mb-4 p-4 space-y-3"
            >
              {["Features", "Pricing", "Docs"].map((item) => (
                <a key={item} href={`#${item.toLowerCase()}`} className="block text-gray-300 hover:text-cyan-400 hover:bg-white/5 px-3 py-2 rounded-md transition-colors font-medium" onClick={() => setNavOpen(false)}>
                  {item}
                </a>
              ))}
              <div className="pt-2 border-t border-white/5 flex flex-col gap-2">
                <Link href="/auth/login" className={buttonVariants({ variant: "ghost", className: "w-full justify-start text-gray-300" })}>
                  Sign In
                </Link>
                <Link href="/auth/signup" className={buttonVariants({ className: "w-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-full" })}>
                  Get Started →
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Hero */}
      <motion.section 
        style={{ opacity: opacityHero, y: yHero }}
        className="relative z-10 pt-20 pb-32 px-6 text-center max-w-5xl mx-auto"
      >
        <motion.div 
          initial="hidden" 
          animate="visible" 
          variants={staggerContainer}
          className="flex flex-col items-center"
        >
          <motion.div variants={fadeUpVariant} className="mb-8">
            <Badge variant="outline" className="px-4 py-1.5 rounded-full border-cyan-500/30 bg-cyan-500/10 text-cyan-400 shadow-[0_0_15px_rgba(0,212,255,0.1)] backdrop-blur-md">
              <Zap className="w-3.5 h-3.5 mr-2 animate-pulse text-cyan-300" />
              <span className="font-semibold tracking-wide">Designed for Bangladesh&apos;s SMEs — CSA 2023 Ready</span>
            </Badge>
          </motion.div>

          <motion.h1 variants={fadeUpVariant} className="text-5xl md:text-7xl font-extrabold text-white leading-tight mb-6 tracking-tight">
            Your Digital{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 animate-gradient bg-300%">Watchguard</span>
            <br />
            <span className="text-4xl md:text-6xl font-bold text-gray-300 mt-2 block">প্রহরী রাখে সুরক্ষিত</span>
          </motion.h1>

          <motion.p variants={fadeUpVariant} className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed mb-10 font-light">
            Enterprise-grade SIEM + AI security analyst + compliance automation, all at an affordable price point.
            <span className="text-gray-300 font-medium ml-1">Protect your business without hiring a full security team.</span>
          </motion.p>

          <motion.div variants={fadeUpVariant} className="flex flex-col sm:flex-row gap-4 justify-center w-full sm:w-auto">
            <Link href="/auth/signup" className={buttonVariants({ size: "lg", className: "h-14 px-8 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white border-0 shadow-[0_0_40px_rgba(0,212,255,0.3)] transition-all hover:scale-105 hover:shadow-[0_0_60px_rgba(124,58,237,0.4)] text-base font-semibold group" })}>
              Start Free Trial
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a href="#features" className={buttonVariants({ size: "lg", variant: "outline", className: "h-14 px-8 rounded-full border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 hover:text-cyan-300 bg-transparent backdrop-blur-sm text-base font-semibold group" })}>
              See How It Works 
              <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </a>
          </motion.div>

          {/* Stats */}
          <motion.div variants={fadeUpVariant} className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
            {STATS.map((s) => (
              <motion.div 
                key={s.label} 
                whileHover={{ y: -5, scale: 1.02 }}
                className="relative overflow-hidden group rounded-2xl border border-white/5 bg-white/5 backdrop-blur-lg p-5 text-center transition-colors hover:border-cyan-500/30 hover:bg-white/10"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-br from-white to-gray-400 group-hover:from-cyan-400 group-hover:to-purple-400 transition-colors mb-1">
                  {s.value}
                </div>
                <div className="text-xs text-gray-500 uppercase tracking-widest font-semibold">{s.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Separator Line */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />

      {/* Features */}
      <section id="features" className="relative z-10 py-32 px-6 overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUpVariant}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
              Everything you need to <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">stay secure</span>
            </h2>
            <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto font-light">
              From SIEM monitoring to AI-powered incident response, Prohori covers your entire security lifecycle with intelligent automation.
            </p>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {FEATURES.map((f) => (
              <motion.div key={f.title} variants={fadeUpVariant}>
                <Card className="h-full bg-navy-800/40 backdrop-blur-xl border-white/5 hover:border-cyan-500/30 transition-all duration-300 group overflow-hidden relative">
                  {/* Hover gradient background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${f.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  
                  <CardContent className="p-8 relative z-10">
                    <div className={`w-14 h-14 rounded-2xl bg-navy-900 border border-white/10 flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-500 group-hover:border-${f.iconColor.split('-')[1]}/30`}>
                      <f.icon className={`w-6 h-6 ${f.iconColor} drop-shadow-[0_0_8px_currentColor]`} />
                    </div>
                    <h3 className="text-white font-bold text-xl mb-3 group-hover:text-cyan-100 transition-colors">{f.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed group-hover:text-gray-300 transition-colors">{f.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="relative z-10 py-32 px-6 bg-navy-950/50 border-y border-white/5">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUpVariant}
            className="text-center mb-20"
          >
            <Badge variant="outline" className="mb-4 border-purple-500/30 bg-purple-500/10 text-purple-300">Flexible Pricing</Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
              Simple, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-500">transparent</span> pricing
            </h2>
            <p className="text-gray-400 text-lg md:text-xl font-light">
              Start free, scale as you grow. No hidden fees. Local payment gateways supported.
            </p>
          </motion.div>

          {plans.length > 0 ? (
            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch"
            >
              {plans.map((plan, index) => {
                const isPopular = index === 1; // Or read from plan.is_popular if available
                return (
                  <motion.div key={plan.id} variants={fadeUpVariant} className={`h-full ${isPopular ? 'lg:-translate-y-4' : ''}`}>
                    <Card className={`h-full relative flex flex-col backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 rounded-2xl ${isPopular ? "bg-navy-900 border-cyan-500/50 shadow-[0_0_30px_rgba(0,212,255,0.2)]" : "bg-navy-900/60 border-white/10 hover:border-white/20"}`}>

                      {isPopular && (
                        <div className="absolute -top-px left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-purple-500 to-cyan-400 rounded-t-2xl z-20" />
                      )}

                      {isPopular && (
                        <div className="absolute -top-4 inset-x-0 flex justify-center z-20">
                          <span className="py-1 px-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-[10px] sm:text-xs font-bold text-white uppercase tracking-widest rounded-full shadow-lg border border-white/10">
                            Most Popular
                          </span>
                        </div>
                      )}
                      
                      <CardContent className={`p-6 sm:p-8 flex-1 flex flex-col relative z-10 ${isPopular ? "pt-10" : "pt-8"}`}>
                        <div className="mb-6">
                          <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">{plan.name}</h3>
                          <div className="flex items-baseline gap-1 mt-4">
                            <span className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-300">
                              {formatPrice(plan.price, plan.billing_cycle).split('/')[0]}
                            </span>
                            <span className="text-gray-400 font-medium tracking-wide text-sm sm:text-base">
                              /{plan.billing_cycle === "monthly" ? "mo" : "yr"}
                            </span>
                          </div>
                        </div>

                        <div className="w-full h-px bg-white/10 my-6" />

                        <ul className="space-y-4 flex-1 mb-8">
                          {(plan.features || []).map((feature, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                              <CheckCircle className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                              <span className="leading-relaxed">{feature}</span>
                            </li>
                          ))}
                        </ul>

                        <div className="mt-auto">
                          <Link href="/auth/signup" className={buttonVariants({ size: "lg", className: `w-full rounded-xl font-bold text-sm sm:text-base py-6 transition-all ${isPopular ? "bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-navy-900 shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] border-0" : "bg-white/5 hover:bg-white/10 text-white border border-white/10"}` })}>
                            Get Started
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            // Fallback static plans if DB is empty
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
              {[
                { name: "Starter", price: "৳2,500/mo", features: ["5 servers", "10 users", "AI analyst (100 queries/mo)", "Email alerts", "Monthly compliance report"] },
                { name: "Professional", price: "৳7,500/mo", features: ["25 servers", "50 users", "AI analyst (unlimited)", "Priority support", "Custom compliance reports", "HRM module"], popular: true },
                { name: "Enterprise", price: "Custom", features: ["Unlimited servers", "Unlimited users", "Dedicated AI analyst", "SLA guarantee", "On-premise option", "24/7 support"] },
              ].map((plan) => (
                <motion.div key={plan.name} variants={fadeUpVariant} className={`h-full ${plan.popular ? 'lg:-translate-y-4' : ''}`}>
                  <Card className={`h-full relative flex flex-col backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 rounded-2xl ${plan.popular ? "bg-navy-900 border-cyan-500/50 shadow-[0_0_30px_rgba(0,212,255,0.2)]" : "bg-navy-900/60 border-white/10 hover:border-white/20"}`}>

                    {plan.popular && (
                      <div className="absolute -top-px left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-purple-500 to-cyan-400 rounded-t-2xl z-20" />
                    )}

                    {plan.popular && (
                      <div className="absolute -top-4 inset-x-0 flex justify-center z-20">
                        <span className="py-1 px-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-[10px] sm:text-xs font-bold text-white uppercase tracking-widest rounded-full shadow-lg border border-white/10">
                          Most Popular
                        </span>
                      </div>
                    )}

                    <CardContent className={`p-6 sm:p-8 flex-1 flex flex-col relative z-10 ${plan.popular ? "pt-10" : "pt-8"}`}>
                      <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">{plan.name}</h3>
                      <div className="flex items-baseline gap-1 mt-4">
                        <span className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-300">{plan.price.split('/')[0]}</span>
                        <span className="text-gray-400 font-medium tracking-wide text-sm sm:text-base">/{plan.price.split('/')[1] || ''}</span>
                      </div>

                      <div className="w-full h-px bg-white/10 my-6" />

                      <ul className="space-y-4 flex-1 mb-8">
                        {plan.features.map((f, j) => (
                          <li key={j} className="flex items-start gap-3 text-sm text-gray-300">
                            <CheckCircle className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                            <span className="leading-relaxed">{f}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="mt-auto">
                        <Link href="/auth/signup" className={buttonVariants({ size: "lg", className: `w-full rounded-xl font-bold text-sm sm:text-base py-6 transition-all ${plan.popular ? "bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-navy-900 shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] border-0" : "bg-white/5 hover:bg-white/10 text-white border border-white/10"}` })}>
                          Get Started
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-32 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-3xl p-12 md:p-20 bg-gradient-to-br from-cyan-500/10 via-navy-800 to-purple-600/10 border border-white/10 shadow-2xl shadow-cyan-500/5 relative overflow-hidden"
          >
            {/* Inner glow effect */}
            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-cyan-500/5 to-transparent animate-pulse-slow" />

            <div className="relative z-10">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center mx-auto mb-8 shadow-xl shadow-cyan-500/20">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
                Ready to protect your business?
              </h2>
              <p className="text-gray-400 text-lg md:text-xl mb-10 max-w-2xl mx-auto font-light">
                Join businesses across Bangladesh who trust Prohori for their cybersecurity needs. Setup takes less than 5 minutes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth/signup" className={buttonVariants({ size: "lg", className: "h-14 px-10 rounded-full bg-white text-navy-900 hover:bg-gray-100 font-bold text-base hover:scale-105 transition-transform shadow-xl shadow-white/10" })}>
                  Start for Free <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
                <Link href="/auth/login" className={buttonVariants({ size: "lg", variant: "outline", className: "h-14 px-10 rounded-full border-white/20 text-white hover:bg-white/10 bg-black/20 backdrop-blur-md font-semibold text-base" })}>
                  Sign In
                </Link>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 mt-12">
                {["No credit card required", "CSA 2023 compliant", "Cancel anytime"].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-gray-400 font-medium">
                    <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                      <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                    </div>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-12 px-6 bg-black/20 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-xl text-white tracking-wide">প্রহরী</span>
            <span className="text-gray-500 text-sm font-medium border-l border-white/10 pl-3 ml-3">Digital Resilience Suite</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white/5 rounded-full px-4 py-1.5 border border-white/5">
            {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />)}
            <span className="text-gray-400 text-sm font-medium ml-2 tracking-wide">Trusted by 500+ businesses</span>
          </div>
          <p className="text-gray-500 text-sm font-medium">
            © {new Date().getFullYear()} Prohori. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
