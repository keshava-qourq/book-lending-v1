// @ts-nocheck -- generated from the approved design under its JS runtime contract; not hand-written TypeScript.
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";

import * as UI from "@/lib/ui";
import { Icons } from "@/lib/icons";
import { brand } from "@/lib/brand";
import { useNavigate } from "@/lib/navigate";
import { apiFetch, clearSessionToken } from "@/lib/api";

const { Table, THead, TBody, TR, TH, TD, Empty } = UI;

const TODAY = new Date().toISOString().slice(0, 10);

const SEED_LOANS = [
  {
    id: "ln-1041",
    title: "The Left Hand of Darkness",
    author: "Ursula K. Le Guin",
    borrowed_at: "2026-10-19",
    due_date: "2026-11-02",
    returned_at: null,
  },
  {
    id: "ln-1047",
    title: "Piranesi",
    author: "Susanna Clarke",
    borrowed_at: "2026-10-26",
    due_date: "2026-11-09",
    returned_at: null,
  },
  {
    id: "ln-1052",
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    borrowed_at: "2026-10-29",
    due_date: "2026-11-12",
    returned_at: null,
  },
  {
    id: "ln-1058",
    title: "Braiding Sweetgrass",
    author: "Robin Wall Kimmerer",
    borrowed_at: "2026-11-03",
    due_date: "2026-11-17",
    returned_at: null,
  },
  {
    id: "ln-1063",
    title: "Invisible Cities",
    author: "Italo Calvino",
    borrowed_at: "2026-11-12",
    due_date: "2026-11-26",
    returned_at: null,
  },
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function toDay(s) {
  const [y, m, d] = s.split("-").map(Number);
  return Date.UTC(y, m - 1, d) / 86400000;
}
function fmt(s) {
  const [y, m, d] = s.split("-").map(Number);
  return String(d).padStart(2, "0") + " " + MONTHS[m - 1] + " " + y;
}
function daysLeft(due) {
  return toDay(due) - toDay(TODAY);
}
function plural(n, w) {
  return n + " " + w + (n === 1 ? "" : "s");
}
function dueNote(due) {
  const n = daysLeft(due);
  if (n < 0) return plural(Math.abs(n), "day") + " late";
  if (n === 0) return "due today";
  return "in " + plural(n, "day");
}

export default function Screen() {
  const navigate = useNavigate();
  const [loans, setLoans] = React.useState(SEED_LOANS);
  const [notice, setNotice] = React.useState(null);

  const ink = brand.primaryColor;
  const paper = brand.backgroundColor;
  const accent = brand.accentColor;
  const muted = brand.neutralColor;

  const active = loans
    .filter((l) => !l.returned_at)
    .sort((a, b) => (a.due_date < b.due_date ? -1 : 1));
  const overdue = active.filter((l) => l.due_date < TODAY);

  const markReturned = (loan) => {
    setLoans((prev) =>
      prev.map((l) => (l.id === loan.id && !l.returned_at ? { ...l, returned_at: TODAY } : l)),
    );
    setNotice({ title: loan.title, late: loan.due_date < TODAY });
  };

  const box = { border: "3px solid " + ink, boxShadow: "6px 6px 0 " + ink, backgroundColor: paper };
  const mono = { fontFamily: brand.fontBody, fontVariantNumeric: "tabular-nums" };
  const label = {
    ...mono,
    fontSize: 12,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: muted,
  };
  const th = {
    ...label,
    color: ink,
    fontWeight: 700,
    textAlign: "left",
    padding: "16px 16px",
    borderBottom: "3px solid " + ink,
    whiteSpace: "nowrap",
  };
  const td = {
    ...mono,
    fontSize: 14,
    padding: "16px",
    borderBottom: "1px dashed " + muted,
    verticalAlign: "top",
    color: ink,
  };

  const cols = (prefix) =>
    ["Title", "Author", "Borrowed", "Due date", "Mark returned"].map((c, i) => (
      <TH key={c} data-wf={"i-" + prefix + "-" + i} scope="col" style={th}>
        {c}
      </TH>
    ));

  const rows = (list, prefix) =>
    list.map((l) => {
      const late = l.due_date < TODAY;
      return (
        <TR key={l.id} className="bs-row">
          <TD
            style={{
              ...td,
              fontFamily: brand.fontHeading,
              fontSize: 18,
              fontWeight: 700,
              minWidth: 200,
            }}
          >
            {l.title}
          </TD>
          <TD style={td}>{l.author}</TD>
          <TD style={{ ...td, whiteSpace: "nowrap" }}>{fmt(l.borrowed_at)}</TD>
          <TD style={{ ...td, whiteSpace: "nowrap" }}>
            <div style={{ fontWeight: 700 }}>{fmt(l.due_date)}</div>
            <div
              style={{
                marginTop: 8,
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              {late ? (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    backgroundColor: ink,
                    color: paper,
                    padding: "4px 8px",
                    fontSize: 12,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                  }}
                >
                  <Icons.AlertCircle width={14} height={14} aria-hidden="true" /> Overdue
                </span>
              ) : null}
              <span style={{ fontSize: 12, color: muted }}>{dueNote(l.due_date)}</span>
            </div>
          </TD>
          <TD style={td}>
            <button
              type="button"
              data-wf={"i-" + prefix + "-4"}
              className="bs-btn bs-return"
              onClick={() => markReturned(l)}
              aria-label={"Mark returned: " + l.title}
            >
              <Icons.Check width={16} height={16} aria-hidden="true" /> Mark returned
            </button>
          </TD>
        </TR>
      );
    });

  return (
    <div style={{ ...mono, color: ink, backgroundColor: paper, padding: "32px 0 64px" }}>
      <style>{`
        .bs-btn { font-family: ${brand.fontBody}; font-size: 13px; letter-spacing: 0.08em; text-transform: uppercase; font-weight: 700; display: inline-flex; align-items: center; gap: 8px; min-height: 44px; padding: 8px 16px; border: 3px solid ${ink}; background: ${paper}; color: ${ink}; cursor: pointer; box-shadow: 4px 4px 0 ${ink}; transition: transform .12s ease, box-shadow .12s ease, background-color .12s ease; white-space: nowrap; }
        .bs-btn:hover { background: ${accent}; transform: translate(-2px,-2px); box-shadow: 6px 6px 0 ${ink}; }
        .bs-btn:active { transform: translate(4px,4px); box-shadow: 0 0 0 ${ink}; }
        .bs-btn:focus-visible { outline: 3px solid ${ink}; outline-offset: 4px; }
        .bs-primary { background: ${accent}; }
        .bs-primary:hover { background: ${ink}; color: ${accent}; }
        .bs-row { animation: bs-in .35s ease both; }
        .bs-notice { animation: bs-in .3s ease both; }
        @keyframes bs-in { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: none; } }
        @media (prefers-reduced-motion: reduce) { .bs-row, .bs-notice { animation: none; } .bs-btn { transition: none; } .bs-btn:hover, .bs-btn:active { transform: none; } }
      `}</style>

      <div className="mx-auto w-full" style={{ maxWidth: 1120, padding: "0 24px" }}>
        {/* Row 1 */}
        <div
          className="grid grid-cols-12 gap-6 items-end"
          style={{ paddingBottom: 24, borderBottom: "3px solid " + ink }}
        >
          <div className="col-span-12 md:col-span-8">
            <p style={{ ...label, margin: "0 0 12px" }}>No. 01 — Reader's ledger · {fmt(TODAY)}</p>
            <h1
              data-wf="b-0-0"
              style={{
                fontFamily: brand.fontHeading,
                fontSize: "clamp(48px, 9vw, 96px)",
                lineHeight: 0.95,
                fontWeight: 800,
                margin: 0,
                letterSpacing: "-0.02em",
              }}
            >
              My dashboard
            </h1>
          </div>
          <div className="col-span-12 md:col-span-4 flex md:justify-end">
            <button
              type="button"
              data-wf="b-0-1"
              className="bs-btn"
              onClick={async () => {
                try {
                  await apiFetch("/auth/signout", { method: "POST" });
                } catch {
                  // Signing out locally must work whatever the server says.
                }
                clearSessionToken();
                navigate("sign-in");
              }}
            >
              Sign out <Icons.ArrowRight width={16} height={16} aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Summary */}
        <p
          style={{
            ...mono,
            fontSize: 14,
            margin: "24px 0 0",
            display: "flex",
            gap: 16,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <span
            style={{
              backgroundColor: overdue.length ? accent : "transparent",
              border: "3px solid " + ink,
              padding: "4px 12px",
              fontWeight: 700,
            }}
          >
            {overdue.length} overdue
          </span>
          <span>{plural(active.length, "book")} on loan</span>
          <span style={{ color: muted }}>Loans are 14 days. No renewals, no fines.</span>
        </p>

        <div role="status" aria-live="polite">
          {notice ? (
            <div
              className="bs-notice"
              style={{
                ...box,
                boxShadow: "4px 4px 0 " + ink,
                marginTop: 24,
                padding: "16px 24px",
                display: "flex",
                gap: 16,
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
              }}
            >
              <span style={{ display: "flex", gap: 12, alignItems: "center", fontSize: 14 }}>
                <Icons.CheckCircle width={20} height={20} aria-hidden="true" />
                <span>
                  <strong>{notice.title}</strong> marked returned{notice.late ? " (late)" : ""}. The
                  copy is back on the shelf.
                </span>
              </span>
            </div>
          ) : null}
        </div>

        {/* Row 2-3 */}
        <section aria-labelledby="overdue-h" style={{ marginTop: 48 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 16 }}>
            <span style={{ ...label, color: ink }} aria-hidden="true">
              01
            </span>
            <h2
              id="overdue-h"
              data-wf="b-1-0"
              style={{
                fontFamily: brand.fontHeading,
                fontSize: 36,
                lineHeight: 1.1,
                fontWeight: 800,
                margin: 0,
              }}
            >
              Overdue loans
            </h2>
          </div>
          <div data-wf="b-2-0" style={{ ...box, overflowX: "auto" }}>
            <Table
              className="w-full"
              style={{ minWidth: 760, borderCollapse: "collapse" }}
              aria-labelledby="overdue-h"
            >
              <THead>
                <TR>{cols("2-0")}</TR>
              </THead>
              <TBody>
                {overdue.length ? (
                  rows(overdue, "2-0")
                ) : (
                  <TR>
                    <TD colSpan={5} style={{ ...td, borderBottom: "none", padding: "32px 16px" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 12 }}>
                        <Icons.CheckCircle width={20} height={20} aria-hidden="true" />
                        Nothing is overdue. Every book you hold is inside its 14 days.
                      </span>
                    </TD>
                  </TR>
                )}
              </TBody>
            </Table>
          </div>
        </section>

        {/* Row 4-5 */}
        <section aria-labelledby="current-h" style={{ marginTop: 64 }}>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 16,
              marginBottom: 16,
              flexWrap: "wrap",
            }}
          >
            <span style={{ ...label, color: ink }} aria-hidden="true">
              02
            </span>
            <h2
              id="current-h"
              data-wf="b-3-0"
              style={{
                fontFamily: brand.fontHeading,
                fontSize: 36,
                lineHeight: 1.1,
                fontWeight: 800,
                margin: 0,
              }}
            >
              Current loans
            </h2>
            <span style={{ ...label }}>{plural(active.length, "book")}, sorted by due date</span>
          </div>
          <div data-wf="b-4-0" style={{ ...box, overflowX: "auto" }}>
            <Table
              className="w-full"
              style={{ minWidth: 760, borderCollapse: "collapse" }}
              aria-labelledby="current-h"
            >
              <THead>
                <TR>{cols("4-0")}</TR>
              </THead>
              <TBody>
                {active.length ? (
                  rows(active, "4-0")
                ) : (
                  <TR>
                    <TD
                      colSpan={5}
                      style={{ ...td, borderBottom: "none", padding: "32px 16px", color: muted }}
                    >
                      No unreturned loans on your record.
                    </TD>
                  </TR>
                )}
              </TBody>
            </Table>
          </div>
        </section>

        {/* Row 6 */}
        {active.length === 0 ? (
          <div
            data-wf="b-5-0"
            className="bs-notice"
            style={{
              ...box,
              marginTop: 48,
              padding: 48,
              display: "grid",
              gap: 24,
              justifyItems: "start",
            }}
          >
            <p style={{ ...label, margin: 0 }}>03 — Empty shelf</p>
            <p
              style={{
                fontFamily: brand.fontHeading,
                fontSize: 36,
                lineHeight: 1.15,
                fontWeight: 800,
                margin: 0,
                maxWidth: 640,
              }}
            >
              You have no current loans. Browse books to borrow one.
            </p>
            <button type="button" className="bs-btn bs-primary" onClick={() => navigate("books")}>
              Browse books <Icons.ArrowRight width={16} height={16} aria-hidden="true" />
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
