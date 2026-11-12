// @ts-nocheck -- generated from the approved design under its JS runtime contract; not hand-written TypeScript.

import React from "react";

import * as UI from "@/lib/ui";
import { Icons } from "@/lib/icons";
import { ApiError, apiFetch } from "@/lib/api";
import { brand } from "@/lib/brand";
import { useNavigate } from "@/lib/navigate";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function Screen() {
  const navigate = useNavigate();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [errors, setErrors] = React.useState({});
  const [banner, setBanner] = React.useState("idle"); // idle | duplicate | invalid
  const [submitting, setSubmitting] = React.useState(false);
  const timer = React.useRef(null);

  React.useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const ink = brand.primaryColor;
  const paper = brand.backgroundColor;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (submitting) return;
    const cleanEmail = email.trim();
    const next = {};
    if (!EMAIL_PATTERN.test(cleanEmail)) {
      next.email = cleanEmail
        ? "That does not look like an email. Use the form name@example.com."
        : "Enter your email address.";
    }
    if (!password) {
      next.password = "Enter a password. It cannot be empty.";
    }
    if (Object.keys(next).length > 0) {
      setErrors(next);
      setBanner("invalid");
      return;
    }
    setErrors({});
    setBanner("idle");
    setSubmitting(true);
    apiFetch("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email: cleanEmail, password }),
    })
      .then(() => navigate("sign-in"))
      .catch((err) => {
        setSubmitting(false);
        if (err instanceof ApiError && err.status === 409) {
          setErrors({ email: err.detail });
          setBanner("duplicate");
        } else if (err instanceof ApiError && err.status === 422) {
          const fields = {};
          for (const item of err.errors) {
            const key = String(item.field).split(".").pop();
            fields[key] = item.message;
          }
          setErrors(fields);
          setBanner("invalid");
        } else {
          setErrors({ email: "Could not create the account. Please try again." });
          setBanner("invalid");
        }
      });
  };

  const fieldStyle = (hasError) => ({
    width: "100%",
    border: "3px solid " + ink,
    borderRadius: 0,
    backgroundColor: paper,
    color: ink,
    fontFamily: brand.fontBody,
    fontSize: 16,
    padding: "12px 16px",
    minHeight: 48,
    boxShadow: hasError ? "inset 0 -6px 0 0 " + ink : "none",
  });

  const labelStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    fontFamily: brand.fontBody,
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: ink,
    marginBottom: 8,
  };

  const isError = banner !== "idle";
  const bannerText =
    banner === "duplicate"
      ? "An account with this email already exists. Enter a valid email and a password."
      : banner === "invalid"
        ? "Enter a valid email and a password."
        : "Your email is your sign-in name, matched without regard to letter case. Your password is stored only as a hash.";

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: paper,
        color: ink,
        fontFamily: brand.fontBody,
      }}
    >
      <style>{`
        .bs-field:focus-visible, .bs-btn:focus-visible, .bs-link:focus-visible {
          outline: 3px solid ${ink};
          outline-offset: 4px;
        }
        .bs-btn { transition: transform 120ms ease, box-shadow 120ms ease; }
        .bs-btn:hover:not(:disabled) { transform: translate(2px, 2px); box-shadow: 4px 4px 0 0 ${ink} !important; }
        .bs-btn:active:not(:disabled) { transform: translate(6px, 6px); box-shadow: 0 0 0 0 ${ink} !important; }
        .bs-btn:disabled { cursor: progress; }
        .bs-link { text-decoration: underline; text-underline-offset: 4px; text-decoration-thickness: 2px; }
        .bs-link:hover { background-color: ${ink}; color: ${paper}; text-decoration-color: transparent; }
        .bs-banner { animation: bs-in 220ms ease-out; }
        @keyframes bs-in { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: none; } }
        @keyframes bs-bar { from { background-position: 0 0; } to { background-position: 32px 0; } }
        @media (prefers-reduced-motion: reduce) {
          .bs-banner { animation: none; }
          .bs-btn, .bs-btn:hover:not(:disabled), .bs-btn:active:not(:disabled) { transition: none; transform: none; }
          .bs-bar { animation: none !important; }
        }
      `}</style>

      <main
        style={{
          maxWidth: 760,
          margin: "0 auto",
          padding: "64px 24px 64px",
        }}
      >
        <div
          data-wf="b-0-0"
          style={{ borderTop: "3px solid " + ink, paddingTop: 16, marginBottom: 48 }}
        >
          <p
            style={{
              fontSize: 12,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              fontWeight: 700,
              margin: 0,
              marginBottom: 24,
              display: "flex",
              justifyContent: "space-between",
              gap: 16,
            }}
          >
            <span>Nº 01 — Membership</span>
            <span style={{ fontVariantNumeric: "tabular-nums" }}>Loan period: 14 days</span>
          </p>
          <h1
            style={{
              fontFamily: brand.fontHeading,
              fontWeight: 900,
              fontSize: "clamp(48px, 11vw, 96px)",
              lineHeight: 0.95,
              letterSpacing: "-0.02em",
              margin: 0,
            }}
          >
            Create your account
          </h1>
        </div>

        <div
          style={{
            border: "3px solid " + ink,
            boxShadow: "8px 8px 0 0 " + ink,
            backgroundColor: paper,
            marginLeft: 0,
          }}
        >
          <div
            style={{
              borderBottom: "3px solid " + ink,
              padding: "12px 24px",
              fontSize: 12,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              fontWeight: 700,
              backgroundColor: ink,
              color: paper,
            }}
          >
            § 1 — Sign up form
          </div>

          <form
            id="sign-up-form"
            data-wf="b-1-0"
            onSubmit={handleSubmit}
            noValidate
            aria-label="Sign up form"
            style={{ padding: 24, display: "flex", flexDirection: "column", gap: 24 }}
          >
            <div>
              <UI.Label htmlFor="su-email" style={labelStyle}>
                <span>01 / Email</span>
              </UI.Label>
              <UI.Input
                id="su-email"
                data-wf="i-1-0-0"
                className="bs-field"
                type="email"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={errors.email ? "true" : "false"}
                aria-describedby={errors.email ? "su-email-error" : undefined}
                disabled={submitting}
                placeholder="name@example.com"
                style={fieldStyle(!!errors.email)}
              />
              {errors.email && (
                <p
                  id="su-email-error"
                  className="bs-banner"
                  style={{
                    margin: "8px 0 0",
                    fontSize: 13,
                    fontWeight: 700,
                    display: "flex",
                    gap: 8,
                    alignItems: "flex-start",
                  }}
                >
                  <Icons.AlertCircle
                    aria-hidden="true"
                    width={16}
                    height={16}
                    style={{ flexShrink: 0, marginTop: 2 }}
                  />
                  <span>Fix this: {errors.email}</span>
                </p>
              )}
            </div>

            <div>
              <UI.Label htmlFor="su-password" style={labelStyle}>
                <span>02 / Password</span>
              </UI.Label>
              <UI.Input
                id="su-password"
                data-wf="i-1-0-1"
                className="bs-field"
                type="password"
                name="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={errors.password ? "true" : "false"}
                aria-describedby={errors.password ? "su-password-error" : undefined}
                disabled={submitting}
                style={fieldStyle(!!errors.password)}
              />
              {errors.password && (
                <p
                  id="su-password-error"
                  className="bs-banner"
                  style={{
                    margin: "8px 0 0",
                    fontSize: 13,
                    fontWeight: 700,
                    display: "flex",
                    gap: 8,
                    alignItems: "flex-start",
                  }}
                >
                  <Icons.AlertCircle
                    aria-hidden="true"
                    width={16}
                    height={16}
                    style={{ flexShrink: 0, marginTop: 2 }}
                  />
                  <span>Fix this: {errors.password}</span>
                </p>
              )}
            </div>
          </form>

          <div style={{ borderTop: "3px dashed " + ink }} />

          <div
            data-wf="b-2-0"
            role={isError ? "alert" : "status"}
            aria-live="polite"
            key={banner}
            className="bs-banner"
            style={{
              padding: "16px 24px",
              fontSize: 14,
              lineHeight: 1.6,
              display: "flex",
              gap: 12,
              alignItems: "flex-start",
              backgroundColor: isError ? ink : "transparent",
              color: isError ? paper : brand.neutralColor,
            }}
          >
            {isError ? (
              <Icons.AlertCircle
                aria-hidden="true"
                width={20}
                height={20}
                style={{ flexShrink: 0, marginTop: 2 }}
              />
            ) : (
              <Icons.FileText
                aria-hidden="true"
                width={20}
                height={20}
                style={{ flexShrink: 0, marginTop: 2 }}
              />
            )}
            <p style={{ margin: 0 }}>
              {isError && (
                <strong
                  style={{
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    fontSize: 12,
                    display: "block",
                    marginBottom: 4,
                  }}
                >
                  Not created
                </strong>
              )}
              {bannerText}
            </p>
          </div>
        </div>

        <div style={{ marginTop: 48 }}>
          <UI.Button
            data-wf="b-3-0"
            className="bs-btn"
            type="submit"
            form="sign-up-form"
            disabled={submitting}
            style={{
              width: "100%",
              minHeight: 64,
              border: "3px solid " + ink,
              borderRadius: 0,
              backgroundColor: brand.accentColor,
              color: ink,
              boxShadow: "8px 8px 0 0 " + ink,
              fontFamily: brand.fontBody,
              fontSize: 16,
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              cursor: submitting ? "progress" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
            }}
          >
            {submitting ? (
              <span>Creating account…</span>
            ) : (
              <>
                <span>Sign up</span>
                <Icons.ArrowRight aria-hidden="true" width={20} height={20} />
              </>
            )}
          </UI.Button>
          {submitting && (
            <div
              className="bs-bar"
              aria-hidden="true"
              style={{
                height: 8,
                marginTop: 16,
                border: "3px solid " + ink,
                backgroundImage:
                  "repeating-linear-gradient(90deg, " + ink + " 0 16px, transparent 16px 32px)",
                backgroundSize: "32px 100%",
                animation: "bs-bar 600ms linear infinite",
              }}
            />
          )}
        </div>

        <div
          style={{
            marginTop: 48,
            borderTop: "1px dashed " + ink,
            paddingTop: 24,
          }}
        >
          <button
            type="button"
            data-wf="b-4-0"
            className="bs-link"
            onClick={() => navigate("sign-in")}
            style={{
              background: "none",
              border: "none",
              padding: "8px 4px",
              minHeight: 44,
              fontFamily: brand.fontBody,
              fontSize: 15,
              fontWeight: 700,
              color: ink,
              cursor: "pointer",
            }}
          >
            Already have an account? Sign in
          </button>
        </div>
      </main>
    </div>
  );
}
