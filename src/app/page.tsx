"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useScroll, useSpring, useTransform, useReducedMotion } from "framer-motion";
import { div as MotionDiv, section as MotionSection } from "framer-motion/client";
import {
  CalendarCheck2,
  ListChecks,
  UsersRound,
  Sparkles,
  ArrowRight,
  Brain,
  Zap,
  Globe,
  CheckCircle2,
  Clock,
  Shield,
  MessageSquare,
  BarChart3,
  Users,
  FileText,
  Check,
  X,
  Building2,
  Layers,
  TrendingUp,
  ChevronRight,
} from "lucide-react";

import { HashSessionCapture } from "@/components/auth/hash-session-capture";
import { HeroDashboardPreview } from "@/components/landing/hero-dashboard-preview";

/* ─────────────────────────────────────────
   Data
───────────────────────────────────────── */

const CULTURES = [
  { emoji: "🌾", name: "Punjabi" },
  { emoji: "🏮", name: "Tamil" },
  { emoji: "🔔", name: "Bengali" },
  { emoji: "🌸", name: "Marathi" },
  { emoji: "🎊", name: "Gujarati" },
  { emoji: "🙏", name: "Hindu" },
  { emoji: "✨", name: "Jain" },
  { emoji: "🌺", name: "Rajasthani" },
  { emoji: "🎵", name: "Telugu" },
  { emoji: "🌿", name: "Kannada" },
  { emoji: "🌙", name: "Muslim" },
  { emoji: "✝️", name: "Christian" },
  { emoji: "⭐", name: "Sikh" },
  { emoji: "🌼", name: "Odia" },
  { emoji: "🎨", name: "Kashmiri" },
  { emoji: "🌊", name: "Goan" },
  { emoji: "🏔️", name: "Himachali" },
  { emoji: "🌻", name: "Assamese" },
  { emoji: "💫", name: "Sindhi" },
];

const PRICING_TIERS = [
  {
    id: "starter",
    name: "Solo",
    tagline: "Just starting out",
    price: { monthly: 0, annual: 0 },
    color: "#71717a",
    glow: "rgba(113,113,122,0.08)",
    border: "rgba(255,255,255,0.07)",
    cta: "Get Started Free",
    ctaBg: "rgba(255,255,255,0.06)",
    ctaBorder: "rgba(255,255,255,0.1)",
    ctaColor: "#a1a1aa",
    features: [
      { text: "5 active weddings", ok: true },
      { text: "Task & timeline management", ok: true },
      { text: "Basic budget tracking", ok: true },
      { text: "2 team members", ok: true },
      { text: "Client-facing portals", ok: false },
      { text: "AI budget allocation", ok: false },
      { text: "Vendor contract management", ok: false },
      { text: "Advanced reporting", ok: false },
      { text: "White-label branding", ok: false },
    ],
  },
  {
    id: "studio",
    name: "Studio",
    tagline: "The complete planner toolkit",
    price: { monthly: 5499, annual: 3999 },
    color: "#FF8C42",
    glow: "rgba(255,140,66,0.14)",
    border: "rgba(255,140,66,0.35)",
    popular: true,
    cta: "Start Free Trial",
    ctaBg: "linear-gradient(135deg, #FF8C42, #E8567A)",
    ctaBorder: "transparent",
    ctaColor: "white",
    features: [
      { text: "25 active weddings", ok: true },
      { text: "Task & timeline management", ok: true },
      { text: "AI budget allocation", ok: true },
      { text: "8 team members", ok: true },
      { text: "Client-facing portals", ok: true },
      { text: "Vendor contract management", ok: true },
      { text: "Advanced reporting", ok: true },
      { text: "White-label branding", ok: false },
      { text: "Dedicated account manager", ok: false },
    ],
  },
  {
    id: "agency",
    name: "Agency",
    tagline: "For high-volume operations",
    price: { monthly: 13999, annual: 9999 },
    color: "#9B5DE5",
    glow: "rgba(155,93,229,0.12)",
    border: "rgba(155,93,229,0.3)",
    cta: "Contact Sales",
    ctaBg: "rgba(155,93,229,0.12)",
    ctaBorder: "rgba(155,93,229,0.3)",
    ctaColor: "#9B5DE5",
    features: [
      { text: "Unlimited weddings", ok: true },
      { text: "Task & timeline management", ok: true },
      { text: "AI budget allocation", ok: true },
      { text: "Unlimited team members", ok: true },
      { text: "Client-facing portals", ok: true },
      { text: "Vendor contract management", ok: true },
      { text: "Advanced reporting & analytics", ok: true },
      { text: "White-label branding", ok: true },
      { text: "Dedicated account manager", ok: true },
    ],
  },
];

/* ─────────────────────────────────────────
   Mock UI Components (other sections)
───────────────────────────────────────── */

function TaskBoardMock() {
  return (
    <div
      style={{
        background: "#111113",
        border: "1px solid rgba(155,93,229,0.18)",
        borderRadius: "12px",
        overflow: "hidden",
        fontFamily: "var(--font-sans)",
        boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 60px rgba(155,93,229,0.08)",
        width: "100%",
        maxWidth: "340px",
      }}
    >
      <div
        style={{
          background: "#0d0d0f",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          padding: "10px 14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", gap: "5px" }}>
          {["#3f3f46", "#3f3f46", "#3f3f46"].map((c, i) => (
            <div key={i} style={{ width: "7px", height: "7px", borderRadius: "50%", background: c }} />
          ))}
        </div>
        <span style={{ color: "#52525b", fontSize: "10px", fontFamily: "var(--font-geist-mono)" }}>
          Tasks · Sharma Wedding
        </span>
        <div
          style={{
            background: "rgba(255,140,66,0.12)",
            color: "#FF8C42",
            fontSize: "8px",
            padding: "2px 6px",
            borderRadius: "3px",
            fontWeight: 600,
          }}
        >
          Apr 12
        </div>
      </div>

      <div style={{ padding: "12px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
        {[
          {
            col: "To Do",
            color: "#52525b",
            items: [
              { text: "Book pandit", tag: "Family", tagColor: "#9B5DE5" },
              { text: "Finalise menu", tag: "Vendor", tagColor: "#06D6A0" },
              { text: "Print invites", tag: "Studio", tagColor: "#FF8C42" },
            ],
          },
          {
            col: "In Progress",
            color: "#FFD166",
            items: [
              { text: "Venue decor", tag: "Vendor", tagColor: "#06D6A0" },
              { text: "Bridal outfit", tag: "Bride", tagColor: "#E8567A" },
            ],
          },
          {
            col: "Done",
            color: "#06D6A0",
            items: [
              { text: "STL booking", tag: "Studio", tagColor: "#FF8C42" },
              { text: "Mehendi artist", tag: "Vendor", tagColor: "#06D6A0" },
              { text: "Guest list", tag: "Couple", tagColor: "#9B5DE5" },
            ],
          },
        ].map((col) => (
          <div key={col.col}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                marginBottom: "8px",
              }}
            >
              <div
                style={{ width: "5px", height: "5px", borderRadius: "50%", background: col.color }}
              />
              <span style={{ color: col.color, fontSize: "9px", fontWeight: 600 }}>{col.col}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              {col.items.map((item) => (
                <div
                  key={item.text}
                  style={{
                    background: "#171719",
                    border: "1px solid rgba(255,255,255,0.04)",
                    borderRadius: "6px",
                    padding: "7px 8px",
                  }}
                >
                  <p style={{ color: "#a1a1aa", fontSize: "9.5px", marginBottom: "4px" }}>
                    {item.text}
                  </p>
                  <span
                    style={{
                      background: `${item.tagColor}15`,
                      color: item.tagColor,
                      fontSize: "7.5px",
                      padding: "1px 4px",
                      borderRadius: "2px",
                      fontWeight: 600,
                    }}
                  >
                    {item.tag}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function VendorMock() {
  return (
    <div
      style={{
        background: "#111113",
        border: "1px solid rgba(6,214,160,0.18)",
        borderRadius: "12px",
        overflow: "hidden",
        fontFamily: "var(--font-sans)",
        boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 60px rgba(6,214,160,0.07)",
        width: "300px",
      }}
    >
      <div
        style={{
          background: "#0d0d0f",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          padding: "10px 14px",
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        {["#3f3f46", "#3f3f46", "#3f3f46"].map((c, i) => (
          <div key={i} style={{ width: "7px", height: "7px", borderRadius: "50%", background: c }} />
        ))}
        <span
          style={{
            color: "#52525b",
            fontSize: "10px",
            fontFamily: "var(--font-geist-mono)",
            marginLeft: "6px",
          }}
        >
          Vendors · Gupta Wedding
        </span>
      </div>

      <div style={{ padding: "12px" }}>
        {[
          { name: "Raj Photography", type: "Photographer", status: "Confirmed", statusColor: "#06D6A0", amount: "₹2.8L", paid: "₹1L" },
          { name: "Dreams Decor", type: "Decorator", status: "In Review", statusColor: "#FFD166", amount: "₹4.2L", paid: "₹0" },
          { name: "Royal Caterers", type: "Catering", status: "Confirmed", statusColor: "#06D6A0", amount: "₹6.0L", paid: "₹2L" },
          { name: "Sur Sangeet", type: "Music & DJ", status: "Pending", statusColor: "#E8567A", amount: "₹1.2L", paid: "₹0" },
        ].map((v) => (
          <div
            key={v.name}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "8px 0",
              borderBottom: "1px solid rgba(255,255,255,0.04)",
            }}
          >
            <div>
              <p style={{ color: "#e4e4e7", fontSize: "11px", fontWeight: 600 }}>{v.name}</p>
              <p style={{ color: "#52525b", fontSize: "9px" }}>{v.type}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  background: `${v.statusColor}14`,
                  color: v.statusColor,
                  fontSize: "8px",
                  padding: "2px 5px",
                  borderRadius: "3px",
                  fontWeight: 600,
                  marginBottom: "3px",
                  display: "inline-block",
                }}
              >
                {v.status}
              </div>
              <p style={{ color: "#71717a", fontSize: "9px" }}>
                {v.amount}{" "}
                <span style={{ color: "#3f3f46" }}>· paid {v.paid}</span>
              </p>
            </div>
          </div>
        ))}

        <div
          style={{
            marginTop: "10px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "#171719",
            borderRadius: "6px",
            padding: "8px 10px",
          }}
        >
          <span style={{ color: "#52525b", fontSize: "9.5px" }}>Total contracted</span>
          <span style={{ color: "#06D6A0", fontSize: "12px", fontWeight: 700 }}>₹14.2L</span>
        </div>
      </div>
    </div>
  );
}

function BudgetAllocationMock() {
  const rows = [
    { cat: "Venue & Décor", pct: 32, amt: "₹8,00,000", color: "#FF8C42" },
    { cat: "Catering", pct: 22, amt: "₹5,50,000", color: "#E8567A" },
    { cat: "Photography", pct: 12, amt: "₹3,00,000", color: "#9B5DE5" },
    { cat: "Bridal Outfits", pct: 10, amt: "₹2,50,000", color: "#06D6A0" },
    { cat: "Music & Entertainment", pct: 8, amt: "₹2,00,000", color: "#FFD166" },
    { cat: "Mehendi & Priests", pct: 6, amt: "₹1,50,000", color: "#6B8CEF" },
    { cat: "Misc & Contingency", pct: 10, amt: "₹2,50,000", color: "#71717a" },
  ];
  return (
    <div
      style={{
        background: "#0d0d0f",
        border: "1px solid rgba(155,93,229,0.22)",
        borderRadius: "12px",
        overflow: "hidden",
        width: "280px",
        fontFamily: "var(--font-sans)",
        boxShadow: "0 24px 60px rgba(0,0,0,0.5), 0 0 80px rgba(155,93,229,0.1)",
      }}
    >
      <div
        style={{
          padding: "12px 14px",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ color: "#a1a1aa", fontSize: "11px", fontWeight: 600 }}>
          Budget Allocation
        </span>
        <span
          style={{
            background: "rgba(155,93,229,0.12)",
            color: "#9B5DE5",
            fontSize: "8px",
            padding: "2px 6px",
            borderRadius: "3px",
            fontWeight: 600,
          }}
        >
          AI GENERATED
        </span>
      </div>
      <div style={{ padding: "12px 14px" }}>
        <div style={{ marginBottom: "10px" }}>
          <p style={{ color: "#52525b", fontSize: "9px" }}>Total Budget</p>
          <p style={{ color: "#fafafa", fontSize: "18px", fontWeight: 700, letterSpacing: "-0.03em" }}>
            ₹25,00,000
          </p>
        </div>
        {rows.map((r) => (
          <div key={r.cat} style={{ marginBottom: "7px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "3px",
              }}
            >
              <span style={{ color: "#71717a", fontSize: "9.5px" }}>{r.cat}</span>
              <span style={{ color: "#a1a1aa", fontSize: "9px" }}>
                {r.pct}% · {r.amt}
              </span>
            </div>
            <div
              style={{
                height: "3px",
                background: "rgba(255,255,255,0.05)",
                borderRadius: "99px",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${r.pct * 3}%`,
                  background: r.color,
                  borderRadius: "99px",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Page
───────────────────────────────────────── */
export default function Home() {
  const [billing, setBilling] = useState<"monthly" | "annual">("annual");
  const marqueeItems = [...CULTURES, ...CULTURES];

  const budgetSectionRef = useRef<HTMLElement | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: budgetSectionRef,
    offset: ["start 0.92", "start 0.18"],
  });

  const spreadRaw = useTransform(scrollYProgress, [0, 1], [0, 1], { clamp: true });
  const spread = useSpring(spreadRaw, {
    stiffness: prefersReducedMotion ? 420 : 44,
    damping: prefersReducedMotion ? 52 : 18,
    mass: 0.82,
  });

  const motion = prefersReducedMotion ? 0 : 1;

  /* Stacked / overlapped at t≈0 (straight, nudged toward center), fan out dramatically by t≈1 */
  const terminalX = useTransform(spread, (t) => motion * ((1 - t) * 96 - t * 58));
  const terminalRotate = useTransform(spread, (t) => motion * t * -13);

  const budgetX = useTransform(spread, (t) => motion * (-(1 - t) * 8 + t * 22));
  const budgetRotate = useTransform(spread, (t) => motion * t * 6);

  const taskX = useTransform(spread, (t) => motion * (-(1 - t) * 102 + t * 62));
  const taskRotate = useTransform(spread, (t) => motion * t * 12);

  const glowParallaxPx = useTransform(scrollYProgress, [0, 0.5, 1], [0, -22, 0]);
  const glowY = useTransform(glowParallaxPx, (px) => `calc(-50% + ${px}px)`);

  return (
    <div
      style={{ background: "#09090b", color: "#fafafa", fontFamily: "var(--font-sans)" }}
      className="min-h-screen overflow-x-hidden"
    >
      <HashSessionCapture />

      {/* ── NAV ── */}
      <nav
        style={{
          background: "rgba(9,9,11,0.8)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderBottom: "1px solid rgba(255,255,255,0.055)",
        }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3.5 md:px-10"
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              background: "linear-gradient(135deg, #FF8C42, #E8567A)",
              borderRadius: "8px",
              width: "30px",
              height: "30px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "14px",
            }}
          >
            🪷
          </div>
          <span style={{ fontWeight: 700, fontSize: "15px", letterSpacing: "-0.02em" }}>
            Shaadi
          </span>
          <span
            style={{
              background: "rgba(255,140,66,0.1)",
              border: "1px solid rgba(255,140,66,0.2)",
              color: "#FF8C42",
              fontSize: "9px",
              fontWeight: 700,
              padding: "2px 6px",
              borderRadius: "4px",
              letterSpacing: "0.05em",
            }}
          >
            FOR PLANNERS
          </span>
        </div>

        <div
          className="hidden md:flex items-center gap-7 text-sm"
          style={{ color: "#71717a" }}
        >
          {[
            { label: "Features", href: "#features" },
            { label: "Pricing", href: "#pricing" },
            { label: "Traditions", href: "#cultures" },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              style={{ textDecoration: "none", color: "inherit" }}
              className="hover:text-white transition-colors duration-200"
            >
              {item.label}
            </a>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Link
            href="/auth"
            style={{
              color: "#71717a",
              fontSize: "13px",
              fontWeight: 500,
              textDecoration: "none",
            }}
            className="hidden md:block hover:text-white transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/auth"
            style={{
              background: "linear-gradient(135deg, #FF8C42, #E8567A)",
              borderRadius: "8px",
              color: "white",
              fontSize: "13px",
              fontWeight: 600,
              padding: "8px 18px",
              textDecoration: "none",
              letterSpacing: "-0.01em",
            }}
            className="hover:opacity-90 transition-opacity"
          >
            Start for free →
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative overflow-visible pt-16">
        {/* Background orbs */}
        <div
          className="absolute pointer-events-none lp-glow-a"
          style={{
            width: "700px",
            height: "700px",
            top: "-100px",
            right: "-100px",
            background: "radial-gradient(circle, rgba(255,140,66,0.2) 0%, transparent 65%)",
            borderRadius: "50%",
          }}
        />
        <div
          className="absolute pointer-events-none lp-glow-b"
          style={{
            width: "600px",
            height: "600px",
            top: "200px",
            left: "-150px",
            background: "radial-gradient(circle, rgba(232,86,122,0.15) 0%, transparent 65%)",
            borderRadius: "50%",
          }}
        />
        {/* Dot grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        {/* Floating emojis */}
        {[
          { e: "🪷", top: "14%", left: "5%", size: "2.2rem", a: "lp-float" },
          { e: "🌸", top: "20%", right: "7%", size: "1.8rem", a: "lp-float-b" },
          { e: "✨", bottom: "40%", left: "8%", size: "1.5rem", a: "lp-float-b" },
          { e: "🎊", top: "60%", right: "5%", size: "2rem", a: "lp-float" },
        ].map((f, i) => (
          <span
            key={i}
            className={`absolute pointer-events-none select-none ${f.a}`}
            style={{
              fontSize: f.size,
              top: f.top,
              bottom: f.bottom,
              left: f.left,
              right: f.right,
              opacity: 0.4,
            }}
          >
            {f.e}
          </span>
        ))}

        {/* Hero text — centered */}
        <div className="relative z-10 text-center max-w-4xl mx-auto px-6 pt-24 pb-14">
          <div
            className="lp-fade-up inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold mb-7"
            style={{
              background: "rgba(255,140,66,0.08)",
              border: "1px solid rgba(255,140,66,0.22)",
              color: "#FF8C42",
            }}
          >
            <Sparkles className="w-3 h-3" />
            The #1 Platform for Professional Wedding Planners
          </div>

          <h1
            className="lp-fade-up-1 font-bold tracking-tight"
            style={{
              fontSize: "clamp(40px, 7.5vw, 88px)",
              lineHeight: 1.04,
              letterSpacing: "-0.035em",
            }}
          >
            Run a wedding{" "}
            <br className="hidden sm:block" />
            business that{" "}
            <span
              style={{
                background:
                  "linear-gradient(100deg, #FF8C42 0%, #F5C842 35%, #E8567A 65%, #9B5DE5 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              scales.
            </span>
          </h1>

          <p
            className="lp-fade-up-2 mt-6 max-w-2xl mx-auto"
            style={{ color: "#71717a", fontSize: "clamp(15px, 1.8vw, 18px)", lineHeight: 1.7 }}
          >
            Shaadi is the operating system for wedding planners — manage every client, coordinate
            your team, track vendor contracts, and deploy AI to allocate budgets across all 19
            Indian cultural traditions. From one command center.
          </p>

          <div className="lp-fade-up-3 mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/auth"
              style={{
                background: "linear-gradient(135deg, #FF8C42, #E8567A)",
                borderRadius: "11px",
                color: "white",
                fontWeight: 700,
                padding: "14px 32px",
                fontSize: "15px",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                letterSpacing: "-0.015em",
                boxShadow: "0 8px 32px rgba(255,140,66,0.28)",
              }}
              className="hover:opacity-90 transition-opacity"
            >
              Start Managing Weddings
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#features"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "11px",
                color: "#a1a1aa",
                fontWeight: 500,
                padding: "14px 28px",
                fontSize: "15px",
                textDecoration: "none",
              }}
              className="hover:text-white hover:border-white/15 transition-all duration-200"
            >
              See the Platform
            </a>
          </div>

          {/* Social proof strip */}
          <div
            className="lp-fade-up-4 mt-10 flex flex-wrap items-center justify-center gap-6"
          >
            {[
              { n: "500+", label: "Active Planners" },
              { n: "2,400+", label: "Weddings Delivered" },
              { n: "19", label: "Traditions Supported" },
              { n: "₹0", label: "to Get Started" },
            ].map((s) => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <p
                  style={{
                    fontSize: "18px",
                    fontWeight: 700,
                    letterSpacing: "-0.03em",
                    color: "#fafafa",
                  }}
                >
                  {s.n}
                </p>
                <p style={{ fontSize: "11px", color: "#3f3f46", marginTop: "1px" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* App dashboard snapshot — overlaps into marquee below */}
        <div
          className="relative z-20 mx-auto hidden w-full max-w-6xl justify-center md:flex md:px-4 lg:px-6"
          style={{ marginBottom: "-120px" }}
        >
          <div className="w-full overflow-hidden rounded-2xl">
            <HeroDashboardPreview />
          </div>
        </div>
      </section>

      {/* ── MARQUEE ── */}
      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.045)",
          borderBottom: "1px solid rgba(255,255,255,0.045)",
          background: "rgba(255,255,255,0.012)",
          overflow: "hidden",
          padding: "18px 0",
          position: "relative",
          zIndex: 10,
          marginTop: "220px",
        }}
      >
        <div className="lp-marquee flex whitespace-nowrap" style={{ width: "max-content" }}>
          {marqueeItems.map((c, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-2 px-6"
              style={{ color: "#52525b", fontSize: "12px", fontWeight: 500 }}
            >
              <span style={{ fontSize: "16px" }}>{c.emoji}</span>
              {c.name}
              <span style={{ color: "rgba(255,255,255,0.07)", marginLeft: "10px" }}>·</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── PLANNER POWER STRIP ── */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {
              icon: Layers,
              title: "Multi-Wedding Command",
              body: "One dashboard across every active wedding. Switch contexts in seconds.",
              color: "#FF8C42",
            },
            {
              icon: Users,
              title: "Team Delegation",
              body: "Assign tasks across your planners, coordinators, and assistants with accountability.",
              color: "#9B5DE5",
            },
            {
              icon: BarChart3,
              title: "Revenue Intelligence",
              body: "Track client billing, vendor payments, and business metrics in real time.",
              color: "#06D6A0",
            },
            {
              icon: FileText,
              title: "Client Portals",
              body: "Give each couple a branded workspace — budgets, timelines, vendor status.",
              color: "#E8567A",
            },
          ].map((card) => (
            <div
              key={card.title}
              style={{
                background: "#111113",
                border: "1px solid rgba(255,255,255,0.055)",
                borderRadius: "14px",
                padding: "22px",
                transition: "transform 0.2s, border-color 0.2s",
              }}
              className="hover:-translate-y-0.5 hover:border-white/10"
            >
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "9px",
                  background: `${card.color}15`,
                  border: `1px solid ${card.color}25`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "14px",
                }}
              >
                <card.icon style={{ width: "16px", height: "16px", color: card.color }} />
              </div>
              <h3
                style={{
                  color: "#e4e4e7",
                  fontSize: "13.5px",
                  fontWeight: 700,
                  letterSpacing: "-0.015em",
                  marginBottom: "6px",
                }}
              >
                {card.title}
              </h3>
              <p style={{ color: "#52525b", fontSize: "12px", lineHeight: 1.6 }}>{card.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <div
              className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold mb-5"
              style={{
                background: "rgba(155,93,229,0.08)",
                border: "1px solid rgba(155,93,229,0.22)",
                color: "#9B5DE5",
              }}
            >
              <Zap className="w-3 h-3" />
              Built for Planners
            </div>
            <h2
              className="font-bold tracking-tight"
              style={{
                fontSize: "clamp(28px, 5vw, 52px)",
                lineHeight: 1.08,
                letterSpacing: "-0.03em",
              }}
            >
              Every tool your studio needs.
              <br />
              <span style={{ color: "#52525b" }}>Nothing you don't.</span>
            </h2>
          </div>

          {/* Row 1: Large feature + side panel */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-3">
            {/* Multi-wedding - big */}
            <div
              style={{
                background:
                  "radial-gradient(ellipse at top left, rgba(255,140,66,0.1), transparent 60%), #111113",
                border: "1px solid rgba(255,255,255,0.055)",
                borderRadius: "16px",
                padding: "28px",
                gridColumn: "span 3",
                position: "relative",
                overflow: "hidden",
              }}
              className="md:col-span-3 hover:border-white/10 transition-all"
            >
              <div
                className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold mb-3"
                style={{
                  background: "rgba(255,140,66,0.12)",
                  color: "#FF8C42",
                  border: "1px solid rgba(255,140,66,0.2)",
                }}
              >
                Multi-Wedding Dashboard
              </div>
              <h3
                style={{
                  color: "#fafafa",
                  fontSize: "20px",
                  fontWeight: 700,
                  letterSpacing: "-0.025em",
                  marginBottom: "10px",
                }}
              >
                Manage 20+ weddings
                <br />
                from one command center
              </h3>
              <p style={{ color: "#71717a", fontSize: "13.5px", lineHeight: 1.65, maxWidth: "380px" }}>
                Switch between clients, track live milestones, and monitor every wedding's health
                at a glance — without context switching between spreadsheets or tabs.
              </p>
              {/* Mini wedding cards preview */}
              <div
                style={{
                  marginTop: "20px",
                  display: "flex",
                  gap: "8px",
                  overflow: "hidden",
                }}
              >
                {[
                  { name: "Sharma × Kapoor", tag: "Punjabi", pct: 72, color: "#FF8C42", date: "Apr 12" },
                  { name: "Gupta × Sharma", tag: "Hindu", pct: 44, color: "#9B5DE5", date: "May 5" },
                  { name: "Verma × Patel", tag: "Gujarati", pct: 18, color: "#06D6A0", date: "Jun 22" },
                ].map((w) => (
                  <div
                    key={w.name}
                    style={{
                      background: "#171719",
                      border: "1px solid rgba(255,255,255,0.05)",
                      borderRadius: "8px",
                      padding: "10px 12px",
                      flex: "1",
                      minWidth: 0,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                      <span
                        style={{
                          background: `${w.color}18`,
                          color: w.color,
                          fontSize: "8px",
                          padding: "1px 5px",
                          borderRadius: "3px",
                          fontWeight: 600,
                        }}
                      >
                        {w.tag}
                      </span>
                      <span style={{ color: "#3f3f46", fontSize: "9px" }}>{w.date}</span>
                    </div>
                    <p style={{ color: "#e4e4e7", fontSize: "10px", fontWeight: 600, marginBottom: "6px" }}>
                      {w.name}
                    </p>
                    <div style={{ height: "2px", background: "rgba(255,255,255,0.04)", borderRadius: "1px" }}>
                      <div style={{ height: "100%", width: `${w.pct}%`, background: w.color, borderRadius: "1px" }} />
                    </div>
                    <p style={{ color: "#3f3f46", fontSize: "8px", marginTop: "3px" }}>{w.pct}% planned</p>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Budget - side */}
            <div
              style={{
                background:
                  "radial-gradient(ellipse at top right, rgba(155,93,229,0.1), transparent 60%), #111113",
                border: "1px solid rgba(255,255,255,0.055)",
                borderRadius: "16px",
                padding: "28px",
                gridColumn: "span 2",
              }}
              className="md:col-span-2 hover:border-white/10 transition-all"
            >
              <div
                className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold mb-3"
                style={{
                  background: "rgba(155,93,229,0.12)",
                  color: "#9B5DE5",
                  border: "1px solid rgba(155,93,229,0.2)",
                }}
              >
                <Brain className="w-3 h-3 mr-1.5" />
                Claude AI
              </div>
              <h3
                style={{
                  color: "#fafafa",
                  fontSize: "18px",
                  fontWeight: 700,
                  letterSpacing: "-0.025em",
                  marginBottom: "10px",
                }}
              >
                AI budget allocation in seconds
              </h3>
              <p style={{ color: "#71717a", fontSize: "13px", lineHeight: 1.65 }}>
                Claude reads your culture, guest count, venue tier, and destination — then
                splits the budget perfectly across every category.
              </p>
              <div
                style={{
                  marginTop: "18px",
                  background: "#0d0d0f",
                  borderRadius: "9px",
                  padding: "12px",
                  border: "1px solid rgba(155,93,229,0.12)",
                }}
              >
                {[
                  { cat: "Venue & Décor", pct: 32, color: "#FF8C42" },
                  { cat: "Catering", pct: 22, color: "#E8567A" },
                  { cat: "Photography", pct: 12, color: "#9B5DE5" },
                  { cat: "Outfits", pct: 10, color: "#06D6A0" },
                ].map((r) => (
                  <div key={r.cat} style={{ marginBottom: "8px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
                      <span style={{ color: "#71717a", fontSize: "10px" }}>{r.cat}</span>
                      <span style={{ color: "#a1a1aa", fontSize: "10px" }}>{r.pct}%</span>
                    </div>
                    <div style={{ height: "3px", background: "rgba(255,255,255,0.04)", borderRadius: "99px" }}>
                      <div
                        style={{
                          height: "100%",
                          width: `${r.pct * 3}%`,
                          background: r.color,
                          borderRadius: "99px",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Row 2: 3 equal cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              {
                icon: CalendarCheck2,
                tag: "Timeline",
                title: "From roka to bidaai",
                body: "Build event timelines with owners, due dates, and live progress — mapped to every cultural ceremony.",
                color: "#06D6A0",
                glow: "rgba(6,214,160,0.08)",
              },
              {
                icon: UsersRound,
                tag: "Vendors",
                title: "Vendor command center",
                body: "Manage photographers, caterers, decorators with contracts, milestones, and payment tracking.",
                color: "#E8567A",
                glow: "rgba(232,86,122,0.08)",
              },
              {
                icon: ListChecks,
                tag: "Tasks",
                title: "Delegate with clarity",
                body: "Assign tasks to family, planners, or vendors with priority levels — never drop the ball.",
                color: "#FFD166",
                glow: "rgba(255,209,102,0.08)",
              },
            ].map((f) => (
              <div
                key={f.title}
                style={{
                  background: `radial-gradient(ellipse at top, ${f.glow}, transparent 55%), #111113`,
                  border: "1px solid rgba(255,255,255,0.055)",
                  borderRadius: "16px",
                  padding: "26px",
                  transition: "transform 0.2s, border-color 0.2s",
                }}
                className="hover:-translate-y-0.5 hover:border-white/10"
              >
                <div
                  style={{
                    width: "38px",
                    height: "38px",
                    borderRadius: "9px",
                    background: `${f.color}14`,
                    border: `1px solid ${f.color}22`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "16px",
                  }}
                >
                  <f.icon style={{ width: "16px", height: "16px", color: f.color }} />
                </div>
                <div
                  className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold mb-2"
                  style={{
                    background: `${f.color}12`,
                    color: f.color,
                    border: `1px solid ${f.color}20`,
                  }}
                >
                  {f.tag}
                </div>
                <h3
                  style={{
                    color: "#fafafa",
                    fontSize: "16px",
                    fontWeight: 700,
                    letterSpacing: "-0.02em",
                    marginBottom: "8px",
                  }}
                >
                  {f.title}
                </h3>
                <p style={{ color: "#71717a", fontSize: "13px", lineHeight: 1.65 }}>{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI SECTION — terminal + overlapping mocks ── */}
      <MotionSection
        ref={budgetSectionRef}
        style={{
          background: "linear-gradient(180deg, #09090b 0%, #0c0a12 50%, #09090b 100%)",
          borderTop: "1px solid rgba(155,93,229,0.1)",
          borderBottom: "1px solid rgba(155,93,229,0.1)",
          position: "relative",
          overflow: "visible",
          padding: "100px 0 120px",
        }}
      >
        {/* Background glow */}
        <MotionDiv
          className="absolute pointer-events-none lp-glow-b"
          style={{
            width: "700px",
            height: "700px",
            top: "50%",
            left: "50%",
            x: "-50%",
            y: glowY,
            background: "radial-gradient(circle, rgba(155,93,229,0.1) 0%, transparent 65%)",
            borderRadius: "50%",
          }}
        />

        <div className="relative z-10 max-w-6xl mx-auto px-6">
          {/* Section header */}
          <div className="text-center mb-16">
            <div
              className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold mb-5"
              style={{
                background: "rgba(155,93,229,0.1)",
                border: "1px solid rgba(155,93,229,0.25)",
                color: "#9B5DE5",
              }}
            >
              <Brain className="w-3 h-3" />
              Powered by Claude AI
            </div>
            <h2
              className="font-bold tracking-tight"
              style={{
                fontSize: "clamp(28px, 5vw, 52px)",
                lineHeight: 1.08,
                letterSpacing: "-0.03em",
              }}
            >
              Budget intelligence that thinks
              <br />
              <span style={{ color: "#52525b" }}>like your best planner.</span>
            </h2>
            <p
              className="mt-4 max-w-xl mx-auto"
              style={{ color: "#71717a", fontSize: "15px", lineHeight: 1.7 }}
            >
              Stop agonising over budget splits. Claude AI reads every parameter of the wedding
              and generates the optimal allocation in seconds — so you can focus on the magic.
            </p>
          </div>

          {/* Three cards: terminal (left), budget (center), tasks (right) — centered so scroll can fan from a tight stack */}
          <div className="relative mx-auto hidden min-h-[480px] w-full max-w-6xl items-start justify-center gap-0 md:flex md:px-2 lg:px-4">
            {/* Left: AI terminal */}
            <MotionDiv
              className="z-10 flex min-w-0 max-w-[min(100%,420px)] shrink-0 justify-end pt-6 md:pt-8 md:-mr-10 lg:-mr-14 xl:-mr-16"
              style={{ x: terminalX, rotate: terminalRotate }}
            >
              <div
                className="w-full max-w-[380px]"
                style={{
                  background: "#0d0d0f",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: "14px",
                  overflow: "hidden",
                  boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
                  fontFamily: "var(--font-geist-mono)",
                  fontSize: "12px",
                }}
              >
                <div
                  style={{
                    background: "#111114",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                    padding: "10px 14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  {["#3f3f46", "#3f3f46", "#3f3f46"].map((c, i) => (
                    <div key={i} style={{ width: "8px", height: "8px", borderRadius: "50%", background: c }} />
                  ))}
                  <span style={{ color: "#3f3f46", marginLeft: "8px", fontSize: "11px" }}>
                    shaadi · claude-budget-ai
                  </span>
                </div>
                <div style={{ padding: "18px 20px" }}>
                  <div style={{ color: "#3f3f46", marginBottom: "10px" }}>
                    <span style={{ color: "#9B5DE5" }}>$</span> analyzing wedding parameters...
                  </div>
                  {[
                    { label: "Client", value: "Sharma × Kapoor Wedding" },
                    { label: "Total budget", value: "₹25,00,000" },
                    { label: "Guest count", value: "350 guests" },
                    { label: "Culture", value: "Punjabi + Hindu" },
                    { label: "Venue tier", value: "Premium" },
                    { label: "Destination", value: "No" },
                  ].map((r) => (
                    <div key={r.label} style={{ display: "flex", marginBottom: "5px" }}>
                      <span style={{ color: "#3f3f46", width: "130px", flexShrink: 0 }}>✓ {r.label}</span>
                      <span style={{ color: "#71717a" }}>{r.value}</span>
                    </div>
                  ))}
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", margin: "14px 0 10px" }} />
                  <div style={{ color: "#9B5DE5", marginBottom: "8px" }}>
                    ✦ Generating optimal allocation...
                  </div>
                  <div
                    style={{
                      height: "4px",
                      background: "rgba(155,93,229,0.1)",
                      borderRadius: "2px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: "100%",
                        background: "linear-gradient(90deg, #9B5DE5, #6B8CEF)",
                        borderRadius: "2px",
                      }}
                    />
                  </div>
                  <div style={{ color: "#06D6A0", marginTop: "10px" }}>✓ Allocation complete</div>
                </div>
              </div>
            </MotionDiv>

            {/* Center: budget allocation (hero) */}
            <MotionDiv
              className="relative z-20 shrink-0 -translate-y-1 md:-translate-y-2"
              style={{ x: budgetX, rotate: budgetRotate }}
            >
              <BudgetAllocationMock />
            </MotionDiv>

            {/* Right: task board */}
            <MotionDiv
              className="z-10 flex min-w-0 max-w-[min(100%,360px)] shrink-0 justify-start pt-5 md:pt-7 md:-ml-10 lg:-ml-14 xl:-ml-16"
              style={{ x: taskX, rotate: taskRotate }}
            >
              <TaskBoardMock />
            </MotionDiv>
          </div>

          {/* Mobile: single primary mock */}
          <div className="mx-auto w-full max-w-sm md:hidden">
            <BudgetAllocationMock />
          </div>
        </div>
      </MotionSection>

      {/* ── VENDOR SECTION ── */}
      <section
        style={{
          position: "relative",
          overflow: "visible",
          padding: "100px 0 80px",
        }}
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Left: Copy */}
            <div>
              <div
                className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold mb-6"
                style={{
                  background: "rgba(6,214,160,0.08)",
                  border: "1px solid rgba(6,214,160,0.22)",
                  color: "#06D6A0",
                }}
              >
                <UsersRound className="w-3 h-3" />
                Vendor Management
              </div>
              <h2
                className="font-bold tracking-tight mb-5"
                style={{
                  fontSize: "clamp(26px, 4vw, 44px)",
                  lineHeight: 1.1,
                  letterSpacing: "-0.03em",
                }}
              >
                Stop chasing vendors.
                <br />
                <span
                  style={{
                    background: "linear-gradient(135deg, #06D6A0, #118AB2)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Start owning them.
                </span>
              </h2>
              <p style={{ color: "#71717a", fontSize: "15px", lineHeight: 1.7, marginBottom: "28px" }}>
                Every vendor, every contract, every payment milestone — tracked in one place
                per wedding. No more WhatsApp chains or missed follow-ups.
              </p>
              <div className="space-y-3">
                {[
                  { icon: CheckCircle2, text: "Contract & scope management per wedding" },
                  { icon: TrendingUp, text: "Milestone-based payment tracking" },
                  { icon: MessageSquare, text: "Direct vendor communication channel" },
                  { icon: Shield, text: "Dispute & revision history logs" },
                ].map((item) => (
                  <div key={item.text} className="flex items-start gap-3">
                    <item.icon style={{ width: "15px", height: "15px", color: "#06D6A0", flexShrink: 0, marginTop: "2px" }} />
                    <p style={{ color: "#a1a1aa", fontSize: "14px" }}>{item.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Vendor mock + overlapping budget card */}
            <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
              <VendorMock />
              {/* Overlapping floating card */}
              <div
                style={{
                  position: "absolute",
                  bottom: "-30px",
                  left: "-40px",
                  zIndex: 10,
                  transform: "rotate(-4deg)",
                }}
                className="hidden lg:block"
              >
                <div
                  style={{
                    background: "#111113",
                    border: "1px solid rgba(255,209,102,0.2)",
                    borderRadius: "10px",
                    padding: "12px 16px",
                    boxShadow: "0 16px 40px rgba(0,0,0,0.5)",
                    width: "200px",
                  }}
                >
                  <p style={{ color: "#52525b", fontSize: "9px", marginBottom: "4px" }}>
                    Upcoming payment
                  </p>
                  <p style={{ color: "#fafafa", fontSize: "14px", fontWeight: 700 }}>₹1,40,000</p>
                  <p style={{ color: "#71717a", fontSize: "9px" }}>Dreams Decor · Apr 8</p>
                  <div
                    style={{
                      marginTop: "8px",
                      background: "rgba(255,209,102,0.1)",
                      border: "1px solid rgba(255,209,102,0.2)",
                      borderRadius: "5px",
                      padding: "4px 8px",
                      fontSize: "9px",
                      color: "#FFD166",
                      fontWeight: 600,
                      display: "inline-block",
                    }}
                  >
                    DUE IN 3 DAYS
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section
        id="pricing"
        style={{
          background: "#0a0a0c",
          borderTop: "1px solid rgba(255,255,255,0.04)",
          padding: "100px 0 120px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Bg glow */}
        <div
          className="absolute pointer-events-none lp-glow-a"
          style={{
            width: "900px",
            height: "900px",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "radial-gradient(circle, rgba(255,140,66,0.07) 0%, transparent 60%)",
            borderRadius: "50%",
          }}
        />

        <div className="relative z-10 max-w-6xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-14">
            <div
              className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold mb-5"
              style={{
                background: "rgba(255,140,66,0.08)",
                border: "1px solid rgba(255,140,66,0.2)",
                color: "#FF8C42",
              }}
            >
              <Sparkles className="w-3 h-3" />
              Pricing
            </div>
            <h2
              className="font-bold tracking-tight mb-4"
              style={{
                fontSize: "clamp(30px, 5vw, 54px)",
                lineHeight: 1.08,
                letterSpacing: "-0.035em",
              }}
            >
              Grow your studio.
              <br />
              <span style={{ color: "#52525b" }}>Pay as you scale.</span>
            </h2>
            <p style={{ color: "#71717a", fontSize: "15px", maxWidth: "440px", margin: "0 auto 24px" }}>
              Every plan includes a 14-day free trial. No credit card required.
            </p>

            {/* Billing toggle */}
            <div
              style={{
                display: "inline-flex",
                background: "#111113",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "10px",
                padding: "4px",
                gap: "2px",
              }}
            >
              {(["monthly", "annual"] as const).map((b) => (
                <button
                  key={b}
                  onClick={() => setBilling(b)}
                  style={{
                    padding: "7px 18px",
                    borderRadius: "7px",
                    fontSize: "12px",
                    fontWeight: 600,
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    background: billing === b ? "rgba(255,255,255,0.08)" : "transparent",
                    color: billing === b ? "#fafafa" : "#52525b",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  {b === "annual" ? "Annual" : "Monthly"}
                  {b === "annual" && (
                    <span
                      style={{
                        background: "rgba(6,214,160,0.15)",
                        color: "#06D6A0",
                        fontSize: "9px",
                        padding: "1px 5px",
                        borderRadius: "3px",
                        fontWeight: 700,
                      }}
                    >
                      SAVE 27%
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Pricing cards */}
          <div className="grid md:grid-cols-3 gap-4 items-start">
            {PRICING_TIERS.map((tier, idx) => (
              <div
                key={tier.id}
                style={{
                  background: tier.popular
                    ? `radial-gradient(ellipse at top, ${tier.glow}, transparent 50%), #141416`
                    : "#111113",
                  border: `1px solid ${tier.border}`,
                  borderRadius: "18px",
                  padding: "32px",
                  position: "relative",
                  transform: tier.popular ? "translateY(-16px)" : "none",
                  boxShadow: tier.popular
                    ? `0 0 0 1px ${tier.border}, 0 32px 80px rgba(255,140,66,0.12)`
                    : "none",
                  transition: "transform 0.2s",
                }}
                className={tier.popular ? "" : "hover:-translate-y-1"}
              >
                {/* Popular badge */}
                {tier.popular && (
                  <div
                    style={{
                      position: "absolute",
                      top: "-14px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: "linear-gradient(135deg, #FF8C42, #E8567A)",
                      color: "white",
                      fontSize: "10px",
                      fontWeight: 700,
                      padding: "4px 16px",
                      borderRadius: "99px",
                      letterSpacing: "0.04em",
                      boxShadow: "0 4px 16px rgba(255,140,66,0.4)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    MOST POPULAR
                  </div>
                )}

                {/* Tier name + tagline */}
                <div style={{ marginBottom: "20px" }}>
                  <h3
                    style={{
                      color: tier.color,
                      fontSize: "12px",
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                      marginBottom: "4px",
                    }}
                  >
                    {tier.name.toUpperCase()}
                  </h3>
                  <p style={{ color: "#71717a", fontSize: "13px" }}>{tier.tagline}</p>
                </div>

                {/* Price */}
                <div style={{ marginBottom: "24px" }}>
                  {tier.price.annual === 0 ? (
                    <div>
                      <span
                        style={{
                          fontSize: "48px",
                          fontWeight: 800,
                          letterSpacing: "-0.04em",
                          color: "#fafafa",
                          lineHeight: 1,
                        }}
                      >
                        Free
                      </span>
                      <p style={{ color: "#52525b", fontSize: "12px", marginTop: "4px" }}>
                        forever
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: "4px" }}>
                        <span style={{ color: "#71717a", fontSize: "18px", fontWeight: 500, marginTop: "8px" }}>
                          ₹
                        </span>
                        <span
                          style={{
                            fontSize: "52px",
                            fontWeight: 800,
                            letterSpacing: "-0.04em",
                            color: "#fafafa",
                            lineHeight: 1,
                          }}
                        >
                          {(billing === "annual"
                            ? tier.price.annual
                            : tier.price.monthly
                          ).toLocaleString("en-IN")}
                        </span>
                      </div>
                      <p style={{ color: "#52525b", fontSize: "12px", marginTop: "6px" }}>
                        per month
                        {billing === "annual" && (
                          <span style={{ color: "#3f3f46" }}>
                            {" "}
                            · billed ₹{(tier.price.annual * 12).toLocaleString("en-IN")}/yr
                          </span>
                        )}
                      </p>
                    </div>
                  )}
                </div>

                {/* CTA */}
                <a
                  href="/auth"
                  style={{
                    display: "block",
                    textAlign: "center",
                    padding: "11px 20px",
                    borderRadius: "9px",
                    background: tier.ctaBg,
                    border: `1px solid ${tier.ctaBorder || "transparent"}`,
                    color: tier.ctaColor,
                    fontSize: "13px",
                    fontWeight: 700,
                    textDecoration: "none",
                    marginBottom: "24px",
                    transition: "opacity 0.2s",
                  }}
                  className="hover:opacity-90"
                >
                  {tier.cta}
                </a>

                {/* Divider */}
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.055)", marginBottom: "20px" }} />

                {/* Features list */}
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {tier.features.map((feat) => (
                    <li
                      key={feat.text}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        marginBottom: "10px",
                        opacity: feat.ok ? 1 : 0.4,
                      }}
                    >
                      {feat.ok ? (
                        <Check style={{ width: "13px", height: "13px", color: tier.color, flexShrink: 0 }} />
                      ) : (
                        <X style={{ width: "13px", height: "13px", color: "#52525b", flexShrink: 0 }} />
                      )}
                      <span
                        style={{
                          color: feat.ok ? "#a1a1aa" : "#3f3f46",
                          fontSize: "12.5px",
                        }}
                      >
                        {feat.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Enterprise banner */}
          <div
            style={{
              marginTop: "32px",
              background: "linear-gradient(135deg, #0f0a1a, #0a0f0a)",
              border: "1px solid rgba(155,93,229,0.2)",
              borderRadius: "16px",
              padding: "28px 36px",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "20px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "11px",
                  background: "rgba(155,93,229,0.12)",
                  border: "1px solid rgba(155,93,229,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Building2 style={{ width: "20px", height: "20px", color: "#9B5DE5" }} />
              </div>
              <div>
                <h4
                  style={{
                    color: "#fafafa",
                    fontSize: "16px",
                    fontWeight: 700,
                    letterSpacing: "-0.02em",
                    marginBottom: "3px",
                  }}
                >
                  Enterprise — Built for large agencies
                </h4>
                <p style={{ color: "#52525b", fontSize: "13px" }}>
                  Unlimited everything · Custom SLA · Dedicated success manager · SSO & SAML ·
                  Data export · Custom integrations
                </p>
              </div>
            </div>
            <a
              href="/auth"
              style={{
                background: "rgba(155,93,229,0.12)",
                border: "1px solid rgba(155,93,229,0.3)",
                borderRadius: "9px",
                color: "#9B5DE5",
                fontSize: "13px",
                fontWeight: 700,
                padding: "11px 24px",
                textDecoration: "none",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
              className="hover:opacity-90 transition-opacity"
            >
              Talk to Sales
              <ChevronRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Pricing footnote */}
          <p
            style={{
              textAlign: "center",
              color: "#3f3f46",
              fontSize: "12px",
              marginTop: "24px",
            }}
          >
            All prices in INR · GST applicable · Cancel anytime
          </p>
        </div>
      </section>

      {/* ── PERSONAS ── */}
      <section id="personas" className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-14">
          <h2
            className="font-bold tracking-tight"
            style={{
              fontSize: "clamp(28px, 5vw, 50px)",
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
            }}
          >
            One platform.
            <br />
            <span style={{ color: "#52525b" }}>Built for everyone in the wedding.</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {[
            {
              emoji: "📋",
              title: "For Planners",
              subtitle: "Your business command center",
              color: "#FF8C42",
              glowColor: "rgba(255,140,66,0.12)",
              borderColor: "rgba(255,140,66,0.22)",
              features: [
                "Multi-wedding dashboard",
                "Team task delegation",
                "Client portals per wedding",
                "AI budget allocation",
                "Revenue & business analytics",
              ],
              badge: "Primary",
            },
            {
              emoji: "💑",
              title: "For Couples",
              subtitle: "Transparency into your big day",
              color: "#E8567A",
              glowColor: "rgba(232,86,122,0.1)",
              borderColor: "rgba(232,86,122,0.18)",
              features: [
                "Live budget visibility",
                "Vendor status updates",
                "Timeline & milestones",
                "Task accountability",
                "Direct planner messaging",
              ],
              badge: null,
            },
            {
              emoji: "🎪",
              title: "For Vendors",
              subtitle: "Collaborate without friction",
              color: "#06D6A0",
              glowColor: "rgba(6,214,160,0.08)",
              borderColor: "rgba(6,214,160,0.15)",
              features: [
                "Contract & scope access",
                "Payment milestone tracking",
                "Assigned task visibility",
                "Wedding timeline context",
                "Planner communication",
              ],
              badge: null,
            },
          ].map((p) => (
            <div
              key={p.title}
              style={{
                background: `radial-gradient(ellipse at top, ${p.glowColor}, transparent 55%), #111113`,
                border: `1px solid ${p.borderColor}`,
                borderRadius: "18px",
                padding: "30px",
                position: "relative",
                transition: "transform 0.2s",
              }}
              className="hover:-translate-y-1"
            >
              {p.badge && (
                <div
                  style={{
                    position: "absolute",
                    top: "20px",
                    right: "20px",
                    background: "rgba(255,140,66,0.12)",
                    border: "1px solid rgba(255,140,66,0.25)",
                    color: "#FF8C42",
                    fontSize: "9px",
                    fontWeight: 700,
                    padding: "3px 8px",
                    borderRadius: "5px",
                    letterSpacing: "0.05em",
                  }}
                >
                  PRIMARY AUDIENCE
                </div>
              )}
              <span style={{ fontSize: "36px", marginBottom: "18px", display: "block" }}>
                {p.emoji}
              </span>
              <h3
                style={{
                  color: "#fafafa",
                  fontSize: "19px",
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                  marginBottom: "3px",
                }}
              >
                {p.title}
              </h3>
              <p style={{ color: p.color, fontSize: "12.5px", fontWeight: 500, marginBottom: "20px" }}>
                {p.subtitle}
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "9px" }}>
                {p.features.map((feat) => (
                  <li key={feat} style={{ display: "flex", alignItems: "center", gap: "9px", color: "#71717a", fontSize: "13px" }}>
                    <CheckCircle2 style={{ width: "13px", height: "13px", color: p.color, flexShrink: 0 }} />
                    {feat}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ── CULTURES ── */}
      <section
        id="cultures"
        style={{
          background: "#0b0b0d",
          borderTop: "1px solid rgba(255,255,255,0.04)",
          borderBottom: "1px solid rgba(255,255,255,0.04)",
          padding: "80px 0",
        }}
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <div
              className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold mb-5"
              style={{
                background: "rgba(232,86,122,0.08)",
                border: "1px solid rgba(232,86,122,0.2)",
                color: "#E8567A",
              }}
            >
              <Globe className="w-3 h-3" />
              19 Traditions Supported
            </div>
            <h2
              className="font-bold tracking-tight"
              style={{
                fontSize: "clamp(26px, 4vw, 44px)",
                lineHeight: 1.1,
                letterSpacing: "-0.03em",
              }}
            >
              Every Indian tradition.
              <br />
              <span style={{ color: "#52525b" }}>Deeply built in.</span>
            </h2>
            <p style={{ color: "#52525b", fontSize: "14px", marginTop: "14px" }}>
              Culture-specific event templates, ceremony naming, and AI budget defaults —
              ready for every client.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 justify-center">
            {CULTURES.map((c) => (
              <div
                key={c.name}
                style={{
                  background: "rgba(255,255,255,0.025)",
                  border: "1px solid rgba(255,255,255,0.065)",
                  borderRadius: "9px",
                  padding: "9px 14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "7px",
                  cursor: "default",
                  transition: "all 0.15s",
                }}
                className="hover:bg-white/[0.05] hover:border-white/15"
              >
                <span style={{ fontSize: "17px" }}>{c.emoji}</span>
                <span style={{ color: "#a1a1aa", fontSize: "12.5px", fontWeight: 500 }}>{c.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div
          style={{
            background: "linear-gradient(135deg, #120c06 0%, #0c0612 60%, #060c0a 100%)",
            border: "1px solid rgba(255,140,66,0.15)",
            borderRadius: "24px",
            padding: "clamp(48px, 6vw, 80px)",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div className="absolute pointer-events-none lp-glow-a" style={{ width: "500px", height: "500px", top: "-150px", right: "-100px", background: "radial-gradient(circle, rgba(255,140,66,0.14) 0%, transparent 65%)", borderRadius: "50%" }} />
          <div className="absolute pointer-events-none lp-glow-b" style={{ width: "400px", height: "400px", bottom: "-100px", left: "-80px", background: "radial-gradient(circle, rgba(155,93,229,0.1) 0%, transparent 65%)", borderRadius: "50%" }} />

          <div className="relative z-10">
            <div
              className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold mb-6"
              style={{
                background: "rgba(255,140,66,0.1)",
                border: "1px solid rgba(255,140,66,0.25)",
                color: "#FF8C42",
              }}
            >
              <Sparkles className="w-3 h-3" />
              Free 14-day trial · No credit card
            </div>

            <h2
              className="font-bold tracking-tight mb-5"
              style={{
                fontSize: "clamp(30px, 5vw, 58px)",
                lineHeight: 1.05,
                letterSpacing: "-0.035em",
              }}
            >
              Ready to scale your
              <br />
              <span
                style={{
                  background: "linear-gradient(100deg, #FF8C42 0%, #F5C842 30%, #E8567A 65%, #9B5DE5 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                wedding business?
              </span>
            </h2>

            <p
              style={{ color: "#71717a", fontSize: "15px", lineHeight: 1.65, maxWidth: "420px", margin: "0 auto 32px" }}
            >
              Join 500+ professional planners who run their studios on Shaadi — the platform
              built from the ground up for Indian weddings.
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", justifyContent: "center" }}>
              <Link
                href="/auth"
                style={{
                  background: "linear-gradient(135deg, #FF8C42, #E8567A)",
                  borderRadius: "11px",
                  color: "white",
                  fontWeight: 700,
                  padding: "15px 36px",
                  fontSize: "15px",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  letterSpacing: "-0.01em",
                  boxShadow: "0 8px 40px rgba(255,140,66,0.3)",
                }}
                className="hover:opacity-90 transition-opacity"
              >
                Start Managing Weddings
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#pricing"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "11px",
                  color: "#a1a1aa",
                  fontWeight: 500,
                  padding: "15px 28px",
                  fontSize: "15px",
                  textDecoration: "none",
                }}
                className="hover:text-white hover:border-white/20 transition-all"
              >
                View Pricing
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.04)", padding: "28px 0" }}>
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                background: "linear-gradient(135deg, #FF8C42, #E8567A)",
                borderRadius: "6px",
                width: "24px",
                height: "24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
              }}
            >
              🪷
            </div>
            <span style={{ fontWeight: 600, fontSize: "13px", color: "#71717a" }}>Shaadi</span>
            <span style={{ color: "#27272a", fontSize: "12px" }}>·</span>
            <span style={{ color: "#27272a", fontSize: "12px" }}>Wedding Operations Platform</span>
          </div>
          <p style={{ color: "#27272a", fontSize: "11px" }}>
            © 2025 Shaadi · Powered by Claude AI
          </p>
          <div style={{ display: "flex", gap: "20px" }}>
            {[
              { label: "Features", href: "#features" },
              { label: "Pricing", href: "#pricing" },
              { label: "Traditions", href: "#cultures" },
              { label: "Sign In", href: "/auth" },
            ].map((l) => (
              <a
                key={l.href}
                href={l.href}
                style={{ color: "#3f3f46", fontSize: "12px", textDecoration: "none" }}
                className="hover:text-white transition-colors"
              >
                {l.label}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
