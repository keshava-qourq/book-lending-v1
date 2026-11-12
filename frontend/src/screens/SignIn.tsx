// @ts-nocheck -- generated from the approved design under its JS runtime contract; not hand-written TypeScript.
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";

import { brand } from "@/lib/brand";
import { useNavigate } from "@/lib/navigate";

const PRODUCT = "Book lending - v1";
const SCREEN = "Sign in";
const MONO = 'ui-monospace, "SF Mono", Menlo, Consolas, monospace';

export default function Screen() {
  const navigate = useNavigate();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [done, setDone] = React.useState(false);
  const thick = `3px solid ${brand.primaryColor}`;
  const hard = `8px 8px 0 ${brand.primaryColor}`;
  const field = { border: thick, borderRadius: brand.radius, height: 48, backgroundColor: "transparent", fontFamily: MONO };

  return (
    <div className="flex min-h-screen flex-col px-12 py-8" style={{ color: brand.primaryColor, fontFamily: brand.fontBody }}>
      <header className="flex items-center justify-between pb-4" style={{ borderBottom: thick, fontFamily: MONO }}>
        <p className="text-sm font-bold uppercase tracking-[0.25em]">{PRODUCT}</p>
        <p className="text-xs uppercase">Vol. 01 — Issue 10 — 2026</p>
      </header>

      <div className="grid flex-1 grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] items-center gap-14 py-10">
        <h1 className="text-[120px] font-bold leading-[0.85] tracking-tight" style={{ fontFamily: brand.fontHeading }}>
          {SCREEN}
          <span style={{ color: brand.accentColor }}>.</span>
        </h1>

        <main className="p-8" style={{ border: thick, boxShadow: hard, borderRadius: brand.radius, backgroundColor: brand.backgroundColor }}>
          {done ? (
            <p role="status" className="text-2xl font-bold" style={{ fontFamily: brand.fontHeading }}>Welcome back. You are in.</p>
          ) : (
            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); setDone(true); navigate('dashboard'); }}>
              <div className="space-y-2">
                <label htmlFor="ed-email" className="block text-xs font-bold uppercase tracking-[0.2em]" style={{ fontFamily: MONO }}>01 / Email</label>
                <input id="ed-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 text-sm outline-none" style={field} />
              </div>
              <div className="space-y-2">
                <label htmlFor="ed-password" className="block text-xs font-bold uppercase tracking-[0.2em]" style={{ fontFamily: MONO }}>02 / Password</label>
                <input id="ed-password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 text-sm outline-none" style={field} />
              </div>
              <button data-wf="b-2-0" type="submit" className="h-14 w-full text-sm font-bold uppercase tracking-[0.25em] transition-transform active:translate-x-1 active:translate-y-1" style={{ backgroundColor: brand.primaryColor, color: brand.backgroundColor, border: thick, borderRadius: brand.radius, boxShadow: `4px 4px 0 ${brand.accentColor}`, fontFamily: MONO }}>
                Sign in
              </button>
            </form>
          )}
          <button data-wf="b-3-0" type="button" onClick={() => navigate('sign-up')} className="mt-6 block text-xs font-bold uppercase underline underline-offset-4" style={{ fontFamily: MONO }}>No account? Sign up</button>
        </main>
      </div>

      <footer className="flex justify-between pt-3 text-xs uppercase" style={{ borderTop: thick, fontFamily: MONO }}>
        <span>© {PRODUCT}</span>
        <span>Privacy · Terms · Help</span>
      </footer>
    </div>
  );
}
