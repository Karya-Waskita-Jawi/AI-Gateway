import type { ReactNode } from "react";
import { Instrument_Serif, Inter } from "next/font/google";

const loginSerif = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-login-serif",
  display: "swap",
});

const loginSans = Inter({
  subsets: ["latin"],
  variable: "--font-login-sans",
  display: "swap",
});

export default function LoginLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${loginSerif.variable} ${loginSans.variable} min-h-screen bg-black text-white`}>
      {children}
    </div>
  );
}
