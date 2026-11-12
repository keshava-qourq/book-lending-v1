// @ts-nocheck -- generated from the approved design under its JS runtime contract; not hand-written TypeScript.
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";

import * as UI from "@/lib/ui";
import { Icons } from "@/lib/icons";
import { brand } from "@/lib/brand";
import { useNavigate } from "@/lib/navigate";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { Input } = UI;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { Search, Edit } = Icons;

const EDITING_BOOK = {
  id: 'bk_0007',
  title: 'The Hobbit',
  author: 'J.R.R. Tolkien',
  total_copies: 3,
  on_loan: 2,
  updated_at: '2026-11-09',
};

export default function Screen() {
  const navigate = useNavigate();
  const ink = brand.primaryColor;
  const paper = brand.backgroundColor;
  const accent = brand.accentColor;
  const muted = brand.neutralColor;

  const [title, setTitle] = React.useState(EDITING_BOOK.title);
  const [author, setAuthor] = React.useState(EDITING_BOOK.author);
  const [copies, setCopies] = React.useState(String(EDITING_BOOK.total_copies));
  const [errors, setErrors] = React.useState({});
  const [saved, setSaved] = React.useState(false);

  const onLoan = EDITING_BOOK.on_loan;

  const validate = () => {
    const e = {};
    if (!title.trim()) e.title = 'Title is required. Type the name as it appears on the cover.';
    if (!author.trim()) e.author = 'Author is required. Add at least one name.';
    const c = copies.trim();
    if (!c) e.copies = 'Enter how many copies the library owns.';
    else if (!/^\d+$/.test(c)) e.copies = 'Use a whole number such as 1, 2 or 5. No decimals, signs or letters.';
    else if (parseInt(c, 10) < 1) e.copies = 'A book needs at least 1 copy.';
    else if (parseInt(c, 10) < onLoan) e.copies = 'Copies cannot be below the ' + onLoan + ' currently on loan. Set ' + onLoan + ' or more.';
    return e;
  };

  const onSubmit = (ev) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length === 0) {
      setSaved(true);
      navigate('books');
    } else {
      setSaved(false);
      const first = ['title', 'author', 'copies'].find((k) => e[k]);
      const el = document.getElementById('field-' + first);
      if (el) el.focus();
    }
  };

  const clear = (k) => setErrors((prev) => { const n = { ...prev }; delete n[k]; return n; });

  const parsed = /^\d+$/.test(copies.trim()) ? parseInt(copies.trim(), 10) : null;
  const validCopies = parsed !== null && parsed >= Math.max(1, onLoan);
  const availableAfter = validCopies ? parsed - onLoan : null;
  const delta = validCopies ? parsed - EDITING_BOOK.total_copies : 0;

  const errorKeys = Object.keys(errors);

  const monoLabel = { fontFamily: brand.fontBody, fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, color: ink };
  const inputStyle = {
    width: '100%', border: '3px solid ' + ink, borderRadius: 0, backgroundColor: 'transparent',
    color: ink, fontFamily: brand.fontBody, fontSize: 18, padding: '12px 16px', minHeight: 56,
  };

  const Field = ({ id, num, label, hint, error, children }) => (
    <div className="grid gap-3" style={{ gridTemplateColumns: '48px 1fr' }}>
      <div style={{ fontFamily: brand.fontHeading, fontSize: 32, lineHeight: 1, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }} aria-hidden="true">{num}</div>
      <div className="flex flex-col gap-2">
        <label htmlFor={'field-' + id} style={monoLabel}>{label}</label>
        {children}
        {error ? (
          <p id={'err-' + id} role="alert" className="flex items-start gap-2" style={{ backgroundColor: ink, color: paper, fontFamily: brand.fontBody, fontSize: 13, lineHeight: 1.5, padding: '8px 12px', margin: 0 }}>
            <span aria-hidden="true" style={{ flexShrink: 0, marginTop: 2 }}><Icons.AlertCircle size={16} /></span>
            <span><strong>FIX THIS &mdash; </strong>{error}</span>
          </p>
        ) : (
          <p id={'hint-' + id} style={{ fontFamily: brand.fontBody, fontSize: 13, lineHeight: 1.5, color: muted, margin: 0 }}>{hint}</p>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ backgroundColor: paper, color: ink, fontFamily: brand.fontBody }} className="w-full px-4 py-8 md:px-8 md:py-12">
      <style>{`
        .bk-focus:focus-visible { outline: 3px solid ${ink}; outline-offset: 3px; }
        .bk-field:focus { outline: none; box-shadow: 6px 6px 0 0 ${ink}; transform: translate(-2px,-2px); }
        .bk-field { transition: box-shadow 120ms ease, transform 120ms ease; }
        .bk-save { transition: transform 120ms ease, box-shadow 120ms ease; box-shadow: 6px 6px 0 0 ${ink}; }
        .bk-save:hover { transform: translate(-2px,-2px); box-shadow: 8px 8px 0 0 ${ink}; }
        .bk-save:active { transform: translate(4px,4px); box-shadow: 2px 2px 0 0 ${ink}; }
        .bk-cancel:hover { background-color: ${ink}; color: ${paper}; }
        @keyframes bk-in { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: none; } }
        .bk-enter { animation: bk-in 180ms ease-out; }
        @media (prefers-reduced-motion: reduce) {
          .bk-field, .bk-save { transition: none; }
          .bk-enter { animation: none; }
          .bk-field:focus, .bk-save:hover, .bk-save:active { transform: none; }
        }
      `}</style>

      <div style={{ maxWidth: 1120, margin: '0 auto' }}>
        {/* Row 1 */}
        <div data-wf="b-0-0" className="mb-8">
          <div style={{ ...monoLabel, color: muted, marginBottom: 16 }}>Library / Books / Edit record {EDITING_BOOK.id}</div>
          <h1 style={{ fontFamily: brand.fontHeading, fontWeight: 800, fontSize: 'clamp(48px, 9vw, 96px)', lineHeight: 0.95, letterSpacing: '-0.02em', margin: 0 }}>
            Add or edit book
          </h1>
          <div style={{ borderTop: '3px solid ' + ink, marginTop: 24 }} />
          <p style={{ fontSize: 14, lineHeight: 1.6, maxWidth: '62ch', marginTop: 16, color: muted }}>
            Any signed-in member can change the shared catalogue. Saving updates every list and search result straight away.
          </p>
        </div>

        {/* Row 2 */}
        <section data-wf="b-1-0" aria-labelledby="details-h" className="mb-12" style={{ border: '3px solid ' + ink, boxShadow: '8px 8px 0 0 ' + ink }}>
          <div className="flex flex-wrap items-baseline justify-between gap-2 px-6 py-4 md:px-8" style={{ borderBottom: '3px solid ' + ink }}>
            <h2 id="details-h" style={{ fontFamily: brand.fontHeading, fontSize: 28, fontWeight: 700, margin: 0 }}>Book details</h2>
            <span style={{ ...monoLabel, fontVariantNumeric: 'tabular-nums' }}>Editing &middot; last changed {EDITING_BOOK.updated_at}</span>
          </div>

          <div className="grid md:grid-cols-12">
            <form id="book-form" noValidate onSubmit={onSubmit} className="md:col-span-8 flex flex-col gap-8 p-6 md:p-8">
              {errorKeys.length > 0 && (
                <div role="alert" className="bk-enter" style={{ border: '3px dashed ' + ink, padding: 16 }}>
                  <strong style={{ ...monoLabel, display: 'block', marginBottom: 4 }}>Not saved &mdash; {errorKeys.length} {errorKeys.length === 1 ? 'field needs' : 'fields need'} attention</strong>
                  <span style={{ fontSize: 13, lineHeight: 1.5, color: muted }}>Your entries are still here. Fix the marked fields and save again.</span>
                </div>
              )}

              <Field id="title" num="01" label="Title" hint="As printed on the cover. Shown in lists and matched by search." error={errors.title}>
                <Input
                  id="field-title" data-wf="i-1-0-0" className="bk-field" style={inputStyle}
                  value={title} autoComplete="off"
                  aria-invalid={errors.title ? 'true' : 'false'} aria-describedby={errors.title ? 'err-title' : 'hint-title'}
                  onChange={(e) => { setTitle(e.target.value); clear('title'); setSaved(false); }}
                />
              </Field>

              <Field id="author" num="02" label="Author" hint="Full name, for example J.R.R. Tolkien. Search matches any part of it." error={errors.author}>
                <Input
                  id="field-author" data-wf="i-1-0-1" className="bk-field" style={inputStyle}
                  value={author} autoComplete="off"
                  aria-invalid={errors.author ? 'true' : 'false'} aria-describedby={errors.author ? 'err-author' : 'hint-author'}
                  onChange={(e) => { setAuthor(e.target.value); clear('author'); setSaved(false); }}
                />
              </Field>

              <Field id="copies" num="03" label="Number of copies" hint={'Total copies the library owns, whole number. ' + onLoan + ' are on loan now, so the minimum is ' + onLoan + '.'} error={errors.copies}>
                <Input
                  id="field-copies" data-wf="i-1-0-2" className="bk-field" style={{ ...inputStyle, maxWidth: 200, fontVariantNumeric: 'tabular-nums' }}
                  value={copies} inputMode="numeric" autoComplete="off"
                  aria-invalid={errors.copies ? 'true' : 'false'} aria-describedby={errors.copies ? 'err-copies' : 'hint-copies'}
                  onChange={(e) => { setCopies(e.target.value); clear('copies'); setSaved(false); }}
                />
              </Field>
            </form>

            <aside aria-label="Copy count after saving" className="md:col-span-4 p-6 md:p-8 md:border-l-[3px] border-t-[3px] md:border-t-0" style={{ borderColor: ink, borderStyle: 'solid' }}>
              <div style={{ ...monoLabel, marginBottom: 16 }}>Ledger</div>
              <dl style={{ margin: 0, fontVariantNumeric: 'tabular-nums', fontSize: 14 }}>
                {[
                  ['Record', EDITING_BOOK.id],
                  ['Total now', String(EDITING_BOOK.total_copies)],
                  ['On loan', String(onLoan)],
                  ['Available now', String(EDITING_BOOK.total_copies - onLoan)],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-baseline justify-between" style={{ borderBottom: '1px dashed ' + ink, padding: '8px 0' }}>
                    <dt style={{ color: muted }}>{k}</dt>
                    <dd style={{ margin: 0, fontWeight: 700 }}>{v}</dd>
                  </div>
                ))}
              </dl>
              <div style={{ marginTop: 24 }}>
                <div style={monoLabel}>Available after save</div>
                <div className="flex items-baseline gap-3" style={{ marginTop: 8 }}>
                  <span
                    aria-live="polite"
                    style={{ fontFamily: brand.fontHeading, fontSize: 72, lineHeight: 1, fontWeight: 800, fontVariantNumeric: 'tabular-nums', backgroundColor: validCopies ? accent : 'transparent', border: '3px solid ' + ink, padding: '4px 16px', minWidth: 96, textAlign: 'center' }}
                  >
                    {validCopies ? availableAfter : '—'}
                  </span>
                  <span style={{ fontSize: 13, color: muted, fontVariantNumeric: 'tabular-nums' }}>
                    {validCopies ? (delta === 0 ? 'no change' : (delta > 0 ? '+' : '') + delta + ' vs. now') : 'waiting for a valid count'}
                  </span>
                </div>
                <p style={{ fontSize: 13, lineHeight: 1.5, color: muted, marginTop: 16 }}>
                  Adding copies raises availability by the same amount. Copies on loan stay with their borrowers.
                </p>
              </div>
            </aside>
          </div>
        </section>

        {/* Row 3 */}
        <div className="grid gap-6 items-center md:grid-cols-2">
          <div data-wf="b-2-0">
            <button
              type="submit" form="book-form" data-wf="b-2-0"
              className="bk-save bk-focus inline-flex items-center justify-center gap-3 w-full md:w-auto"
              style={{ backgroundColor: accent, color: ink, border: '3px solid ' + ink, borderRadius: 0, fontFamily: brand.fontBody, fontWeight: 700, fontSize: 16, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '16px 32px', minHeight: 56, cursor: 'pointer' }}
            >
              <Icons.Check size={20} aria-hidden="true" />
              {saved ? 'Saved' : 'Save book'}
            </button>
          </div>
          <div data-wf="b-2-1" className="md:text-right">
            <button
              type="button" data-wf="b-2-1" onClick={() => navigate('books')}
              className="bk-cancel bk-focus inline-flex items-center gap-2"
              style={{ background: 'transparent', color: ink, border: 'none', borderBottom: '3px solid ' + ink, borderRadius: 0, fontFamily: brand.fontBody, fontWeight: 700, fontSize: 14, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '12px 8px', minHeight: 44, cursor: 'pointer' }}
            >
              <Icons.ArrowLeft size={16} aria-hidden="true" />
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
