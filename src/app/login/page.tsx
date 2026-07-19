"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";

const BRAND = "Waskita AI";

export default function LoginPage() {
  const t = useTranslations("auth");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasPassword, setHasPassword] = useState<boolean | null>(null);
  const [setupComplete, setSetupComplete] = useState<boolean | null>(null);
  const [mounted, setMounted] = useState(false);
  const [nodeVersion, setNodeVersion] = useState<string | null>(null);
  const [nodeCompatible, setNodeCompatible] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    async function checkAuth() {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

      try {
        const res = await fetch(`${baseUrl}/api/settings/require-login`, {
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          if (data.nodeVersion) setNodeVersion(data.nodeVersion);
          if (data.nodeCompatible === false) setNodeCompatible(false);
          if (data.requireLogin === false) {
            router.push("/dashboard");
            router.refresh();
            return;
          }
          setHasPassword(!!data.hasPassword);
          setSetupComplete(!!data.setupComplete);
        } else {
          setHasPassword(true);
          setSetupComplete(true);
        }
      } catch {
        clearTimeout(timeoutId);
        setHasPassword(true);
        setSetupComplete(true);
      }
    }
    checkAuth();
  }, [router]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        sessionStorage.setItem("omniroute_login_time", String(Date.now()));
        router.push("/dashboard");
        router.refresh();
      } else {
        const data = await res.json();
        if (data.needsSetup) {
          router.push("/dashboard/onboarding");
          return;
        }
        setError(data.error || t("invalidPassword"));
      }
    } catch {
      setError(t("errorOccurredRetry"));
    } finally {
      setLoading(false);
    }
  };

  const shell = (left: ReactNode, right: ReactNode) => (
    <div
      className="min-h-screen bg-black text-white font-[family-name:var(--font-login-sans)]"
      style={{ fontFamily: "var(--font-login-sans), Inter, system-ui, sans-serif" }}
    >
      {!nodeCompatible && nodeVersion ? (
        <div className="px-6 pt-6 max-w-3xl mx-auto">
          <div className="rounded-2xl border border-red-500/40 bg-red-950/60 p-5 text-sm text-red-100">
            <p className="font-semibold mb-1">{t("nodeIncompatibleTitle")}</p>
            <p className="text-red-200/80">{t("nodeIncompatibleDesc", { version: nodeVersion })}</p>
          </div>
        </div>
      ) : null}

      <header className="flex items-center justify-between px-8 md:px-12 pt-8">
        <span className="text-[22px] font-semibold tracking-tight lowercase">{BRAND}</span>
        <a
          href="/"
          className="text-sm text-white/55 hover:text-white/90 px-4 py-1.5 rounded-full bg-white/[0.06] border border-white/10 transition-colors"
        >
          Close
        </a>
      </header>

      <main
        className={`mx-auto max-w-6xl px-8 md:px-12 pt-16 pb-20 grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-center transition-all duration-700 ease-out ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
        }`}
      >
        <section className="max-w-xl">{left}</section>
        <section className="w-full max-w-md lg:justify-self-end">{right}</section>
      </main>
    </div>
  );

  const brandHeading = (title: string, lines: string[]) => (
    <>
      <div className="flex items-center gap-3 mb-8">
        <span className="text-[28px] font-semibold tracking-tight lowercase">{BRAND}</span>
        <span className="text-[10px] font-semibold tracking-[0.14em] uppercase px-2.5 py-1 rounded-md bg-[#6B5CFF] text-white">
          BETA
        </span>
      </div>
      <h1
        className="text-[42px] md:text-[52px] leading-[1.08] text-white mb-6"
        style={{ fontFamily: "var(--font-login-serif), Georgia, serif" }}
      >
        {title}
      </h1>
      <div className="space-y-3 text-[15px] leading-relaxed text-white/70 max-w-md">
        {lines.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
    </>
  );

  const fieldClass =
    "w-full h-12 px-4 rounded-xl bg-[#1a1a1a] border border-white/10 text-[15px] text-white placeholder:text-white/35 outline-none focus:border-white/30 transition-colors";

  if (hasPassword === null || setupComplete === null) {
    return shell(
      brandHeading("One gateway. Every model.", [
        "Secure access to your private AI routing layer.",
        "Sign in to manage providers, keys, and traffic.",
      ]),
      <div className="flex flex-col items-center justify-center min-h-[220px] gap-3">
        <div className="relative">
          <div className="w-10 h-10 border-2 border-white/15 rounded-full" />
          <div className="absolute inset-0 w-10 h-10 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>
        <span className="text-sm text-white/50">{t("loading")}</span>
      </div>
    );
  }

  if (!hasPassword && !setupComplete) {
    return shell(
      brandHeading("Apply for early access.", [
        "We're still fine-tuning Waskita AI and would love your feedback.",
        "Complete onboarding to shape the best gateway for your team.",
      ]),
      <div className="space-y-6">
        <p className="text-sm text-white/55 leading-relaxed">{t("runOnboardingWizard")}</p>
        <button
          type="button"
          onClick={() => router.push("/dashboard/onboarding")}
          className="w-full h-12 rounded-full bg-white text-black text-[15px] font-semibold hover:bg-white/90 transition-colors"
        >
          {t("startOnboarding")}
        </button>
      </div>
    );
  }

  if (!hasPassword && setupComplete) {
    return shell(
      brandHeading("Secure your instance.", [
        "A password is not enabled yet.",
        "Configure access control before exposing this gateway.",
      ]),
      <div className="space-y-6">
        <p className="text-sm text-white/55 leading-relaxed">{t("setPasswordDescription")}</p>
        <button
          type="button"
          onClick={() => router.push("/dashboard/onboarding")}
          className="w-full h-12 rounded-full bg-white text-black text-[15px] font-semibold hover:bg-white/90 transition-colors"
        >
          {t("configurePassword")}
        </button>
      </div>
    );
  }

  return shell(
    brandHeading("Sign in to continue.", [
      "Route Claude, GPT, Gemini and more through one private endpoint.",
      "Manage providers, fallbacks, and usage from a single dashboard.",
    ]),
    <form onSubmit={handleLogin} className="space-y-5">
      <div className="space-y-2">
        <label className="block text-[13px] text-white/55">{t("password")}</label>
        <input
          type="password"
          placeholder={t("enterPassword")}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoFocus
          className={fieldClass}
        />
        {error ? <p className="text-sm text-red-400 pt-1">{error}</p> : null}
      </div>

      <p className="text-[12px] leading-relaxed text-white/40">
        By signing in, you agree to the access policy for this private gateway instance.
      </p>

      <div className="pt-2 flex flex-col items-center gap-4">
        <button
          type="submit"
          disabled={loading}
          className="min-w-[160px] h-12 px-10 rounded-full bg-white text-black text-[15px] font-semibold hover:bg-white/90 disabled:opacity-60 transition-colors"
        >
          {loading ? t("loading") : t("continue")}
        </button>
        <a href="/forgot-password" className="text-[13px] text-white/45 underline underline-offset-2 hover:text-white/75">
          {t("forgotPassword")}
        </a>
      </div>
    </form>
  );
}
