// @ts-nocheck -- generated from the approved design under its JS runtime contract; not hand-written TypeScript.
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";

import * as UI from "@/lib/ui";
import { Icons } from "@/lib/icons";
import { brand } from "@/lib/brand";
import { useNavigate } from "@/lib/navigate";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { Switch, Table, THead, TBody, TR, TH, TD, Empty } = UI;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { Search, Check, Home, Edit, ArrowLeft, ArrowRight } = Icons;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const TODAY = new Date(2026, 10, 12);
const LOAN_DAYS = 14;

function fmtDate(d) {
  return DAYS[d.getDay()] + ' ' + d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear();
}
function fmtShort(d) {
  return d.getDate() + ' ' + MONTHS[d.getMonth()];
}
function dueFromToday() {
  return new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate() + LOAN_DAYS);
}

const INITIAL_BOOKS = [
  { id: 'bk_01', title: 'The Hobbit', author: 'J.R.R. Tolkien', total_copies: 3, available_copies: 1 },
  { id: 'bk_02', title: 'Middlemarch', author: 'George Eliot', total_copies: 2, available_copies: 2 },
  { id: 'bk_03', title: 'The Left Hand of Darkness', author: 'Ursula K. Le Guin', total_copies: 2, available_copies: 1 },
  { id: 'bk_04', title: 'Braiding Sweetgrass', author: 'Robin Wall Kimmerer', total_copies: 4, available_copies: 3 },
  { id: 'bk_05', title: 'Piranesi', author: 'Susanna Clarke', total_copies: 1, available_copies: 0 },
  { id: 'bk_06', title: 'The Remains of the Day', author: 'Kazuo Ishiguro', total_copies: 2, available_copies: 0 },
  { id: 'bk_07', title: "Giovanni's Room", author: 'James Baldwin', total_copies: 2, available_copies: 1 },
  { id: 'bk_08', title: 'A Gentleman in Moscow', author: 'Amor Towles', total_copies: 3, available_copies: 3 },
  { id: 'bk_09', title: 'Annihilation', author: 'Jeff VanderMeer', total_copies: 1, available_copies: 1 },
  { id: 'bk_10', title: 'The Dispossessed', author: 'Ursula K. Le Guin', total_copies: 2, available_copies: 2 },
  { id: 'bk_11', title: 'Pale Fire', author: 'Vladimir Nabokov', total_copies: 1, available_copies: 0 },
  { id: 'bk_12', title: 'Underland', author: 'Robert Macfarlane', total_copies: 2, available_copies: 2 },
];

// Loans held by the signed-in user: book id -> due date
const INITIAL_MY_LOANS = {
  bk_03: new Date(2026, 10, 19),
  bk_07: new Date(2026, 10, 24),
};

export default function Screen() {
  const navigate = useNavigate();
  const P = brand.primaryColor;
  const A = brand.accentColor;
  const N = brand.neutralColor;
  const BG = brand.backgroundColor;

  const [books, setBooks] = React.useState(INITIAL_BOOKS);
  const [myLoans, setMyLoans] = React.useState(INITIAL_MY_LOANS);
  const [query, setQuery] = React.useState('');
  const [tab, setTab] = React.useState('available');
  const [pendingId, setPendingId] = React.useState(null);
  const [deleteError, setDeleteError] = React.useState('');
  const [notice, setNotice] = React.useState(null);

  const searchRef = React.useRef(null);
  const tabRefs = React.useRef({});
  const dialogRef = React.useRef(null);
  const cancelRef = React.useRef(null);
  const returnFocusRef = React.useRef(null);

  const pendingBook = books.find((b) => b.id === pendingId) || null;

  React.useEffect(() => {
    if (pendingId && cancelRef.current) {
      cancelRef.current.focus();
    }
  }, [pendingId]);

  const q = query.trim().toLowerCase();
  const visible = books
    .filter((b) => (tab === 'available' ? b.available_copies > 0 : true))
    .filter((b) => !q || b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q))
    .slice()
    .sort((a, b) => a.title.localeCompare(b.title));

  const availableCount = books.filter((b) => b.available_copies > 0).length;

  function borrow(book) {
    const mine = myLoans[book.id];
    if (mine) {
      setNotice({
        kind: 'refused',
        label: 'Refused',
        text: 'You already have “' + book.title + '” on loan, due ' + fmtDate(mine) + '. Return it before borrowing it again.',
      });
      return;
    }
    if (book.available_copies <= 0) {
      setNotice({
        kind: 'refused',
        label: 'Refused',
        text: 'No copies of “' + book.title + '” are available right now. Nothing was borrowed.',
      });
      return;
    }
    const due = dueFromToday();
    setBooks((prev) => prev.map((b) => (b.id === book.id ? { ...b, available_copies: b.available_copies - 1 } : b)));
    setMyLoans((prev) => ({ ...prev, [book.id]: due }));
    setNotice({
      kind: 'success',
      label: 'Borrowed',
      text: '“' + book.title + '” is yours until ' + fmtDate(due) + ' (' + LOAN_DAYS + ' days). ' +
        (book.available_copies - 1 === 0 ? 'That was the last available copy.' : (book.available_copies - 1) + ' left on the shelf.'),
    });
  }

  function openDelete(book, e) {
    returnFocusRef.current = e.currentTarget;
    setDeleteError('');
    setPendingId(book.id);
  }

  function closeDelete() {
    setPendingId(null);
    setDeleteError('');
    const el = returnFocusRef.current;
    setTimeout(() => {
      if (el && document.body.contains(el)) el.focus();
      else if (searchRef.current) searchRef.current.focus();
    }, 0);
  }

  function confirmDelete() {
    if (!pendingBook) return;
    const onLoan = pendingBook.total_copies - pendingBook.available_copies;
    if (onLoan > 0) {
      setDeleteError(
        '“' + pendingBook.title + '” is currently on loan (' + onLoan + ' of ' + pendingBook.total_copies +
        ' ' + (pendingBook.total_copies === 1 ? 'copy is' : 'copies are') + ' out), so it cannot be deleted. The book stays in the library. Try again once every copy is returned.'
      );
      return;
    }
    const title = pendingBook.title;
    setBooks((prev) => prev.filter((b) => b.id !== pendingBook.id));
    setNotice({ kind: 'success', label: 'Deleted', text: '“' + title + '” was removed from the library and from search.' });
    returnFocusRef.current = null;
    closeDelete();
  }

  function onDialogKey(e) {
    if (e.key === 'Escape') {
      e.stopPropagation();
      closeDelete();
      return;
    }
    if (e.key === 'Tab' && dialogRef.current) {
      const f = dialogRef.current.querySelectorAll('button:not([disabled])');
      if (!f.length) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  const TAB_LIST = [
    { key: 'available', label: 'Available', id: 'i-1-1-0', count: availableCount },
    { key: 'all', label: 'All books', id: 'i-1-1-1', count: books.length },
  ];

  function onTabKey(e, idx) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft' || e.key === 'Home' || e.key === 'End') {
      e.preventDefault();
      let next = idx;
      if (e.key === 'ArrowRight') next = (idx + 1) % TAB_LIST.length;
      if (e.key === 'ArrowLeft') next = (idx - 1 + TAB_LIST.length) % TAB_LIST.length;
      if (e.key === 'Home') next = 0;
      if (e.key === 'End') next = TAB_LIST.length - 1;
      setTab(TAB_LIST[next].key);
      const el = tabRefs.current[TAB_LIST[next].key];
      if (el) el.focus();
    }
  }

  const mono = brand.fontBody;
  const serif = brand.fontHeading;

  const labelStyle = {
    fontFamily: mono,
    fontSize: 12,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: N,
    fontWeight: 700,
  };
  const thStyle = {
    fontFamily: mono,
    fontSize: 12,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    fontWeight: 700,
    color: P,
    padding: '16px',
    textAlign: 'left',
    borderBottom: '3px solid ' + P,
    backgroundColor: 'transparent',
    whiteSpace: 'nowrap',
  };
  const tdStyle = {
    fontFamily: mono,
    fontSize: 14,
    padding: '16px',
    borderBottom: '1px dashed ' + N,
    verticalAlign: 'middle',
    color: P,
    fontVariantNumeric: 'tabular-nums',
  };

  const emptyDescription = (() => {
    if (books.length === 0) return 'The shelf is bare. Add the first book and it will show up here with every copy available.';
    if (q) return 'Nothing in ' + (tab === 'available' ? 'the available books' : 'the library') + ' has “' + query.trim() + '” in its title or author. Check the spelling or try a shorter word.';
    return 'Every copy is out on loan right now. Switch to All books to see the full catalogue.';
  })();

  return (
    <div className="bs-root" style={{ backgroundColor: BG, color: P, fontFamily: mono, padding: '32px 24px 64px', minHeight: '100%' }}>
      <style>{`
        .bs-root *:focus-visible { outline: 3px solid ${P}; outline-offset: 3px; }
        .bs-btn { transition: transform 120ms ease, box-shadow 120ms ease, background-color 120ms ease; cursor: pointer; }
        .bs-btn:hover:not([aria-disabled="true"]) { transform: translate(-2px, -2px); box-shadow: 6px 6px 0 ${P}; }
        .bs-btn:active:not([aria-disabled="true"]) { transform: translate(2px, 2px); box-shadow: 0 0 0 ${P}; }
        .bs-btn[aria-disabled="true"] { cursor: not-allowed; }
        .bs-tab { transition: background-color 120ms ease, color 120ms ease; cursor: pointer; }
        .bs-tab:hover { background-color: ${A}; color: ${P}; }
        .bs-row { transition: background-color 120ms ease; }
        .bs-row:hover { background-color: rgba(10,10,10,0.04); }
        .bs-rise { animation: bs-rise 220ms ease-out both; }
        .bs-fade { animation: bs-fade 160ms ease-out both; }
        @keyframes bs-rise { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
        @keyframes bs-fade { from { opacity: 0; } to { opacity: 1; } }
        .bs-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
        @media (prefers-reduced-motion: reduce) {
          .bs-btn, .bs-tab, .bs-row { transition: none; }
          .bs-rise, .bs-fade { animation: none; }
          .bs-btn:hover:not([aria-disabled="true"]), .bs-btn:active:not([aria-disabled="true"]) { transform: none; }
        }
      `}</style>

      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Masthead strip */}
        <div style={{ borderTop: '3px solid ' + P, borderBottom: '1px solid ' + P, padding: '8px 0', marginBottom: 32, display: 'flex', flexWrap: 'wrap', gap: '8px 24px', justifyContent: 'space-between', ...labelStyle, color: P }}>
          <span>No. 01 — The shared shelf</span>
          <span style={{ fontVariantNumeric: 'tabular-nums' }}>{fmtDate(TODAY)}</span>
          <span>Loan period: {LOAN_DAYS} days</span>
        </div>

        {/* Row 1 */}
        <div className="grid grid-cols-12" style={{ gap: 24, alignItems: 'end', marginBottom: 48 }}>
          <div className="col-span-12 md:col-span-8" data-wf="b-0-0">
            <h1 style={{ fontFamily: serif, fontWeight: 800, fontSize: 'clamp(48px, 8vw, 96px)', lineHeight: 0.95, letterSpacing: '-0.025em', margin: 0 }}>
              Library books
            </h1>
            <p style={{ marginTop: 16, maxWidth: 560, fontSize: 14, lineHeight: 1.6, color: N }}>
              One shelf, shared by everyone signed in. Find a book, borrow it for {LOAN_DAYS} days, or fix the catalogue.
            </p>
          </div>
          <div className="col-span-12 md:col-span-4" style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <button
              type="button"
              data-wf="b-0-1"
              className="bs-btn"
              onClick={() => navigate('book-form')}
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                minHeight: 56, padding: '0 32px', width: '100%',
                backgroundColor: A, color: P, border: '3px solid ' + P, borderRadius: 0,
                boxShadow: '6px 6px 0 ' + P, fontFamily: mono, fontSize: 14, fontWeight: 800,
                letterSpacing: '0.1em', textTransform: 'uppercase',
              }}
            >
              <Icons.Plus className="w-5 h-5" aria-hidden="true" />
              Add book
            </button>
          </div>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-12" style={{ gap: 24, alignItems: 'end', marginBottom: 32 }}>
          <div className="col-span-12 md:col-span-8" data-wf="b-1-0">
            <form role="search" onSubmit={(e) => e.preventDefault()}>
              <label htmlFor="book-search" style={{ ...labelStyle, display: 'block', marginBottom: 8 }}>
                § 01 — Search by title or author
              </label>
              <div style={{ position: 'relative' }}>
                <span aria-hidden="true" style={{ position: 'absolute', left: 16, top: 0, bottom: 0, display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
                  <Icons.Search className="w-5 h-5" />
                </span>
                <input
                  id="book-search"
                  ref={searchRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Try “hobbit” or “le guin”"
                  autoComplete="off"
                  style={{
                    width: '100%', minHeight: 56, padding: '0 56px 0 48px', fontFamily: mono, fontSize: 16,
                    color: P, backgroundColor: '#ffffff', border: '3px solid ' + P, borderRadius: 0,
                    boxShadow: '6px 6px 0 ' + P,
                  }}
                />
                {query && (
                  <button
                    type="button"
                    aria-label="Clear search"
                    onClick={() => { setQuery(''); if (searchRef.current) searchRef.current.focus(); }}
                    className="bs-btn"
                    style={{ position: 'absolute', right: 4, top: 4, bottom: 4, width: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', color: P, borderRadius: 0 }}
                  >
                    <Icons.X className="w-5 h-5" aria-hidden="true" />
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="col-span-12 md:col-span-4" data-wf="b-1-1">
            <div style={{ ...labelStyle, marginBottom: 8 }} id="tabs-label">§ 02 — Show</div>
            <div role="tablist" aria-labelledby="tabs-label" style={{ display: 'flex', border: '3px solid ' + P, backgroundColor: '#ffffff', boxShadow: '6px 6px 0 ' + P }}>
              {TAB_LIST.map((t, i) => {
                const active = tab === t.key;
                return (
                  <button
                    key={t.key}
                    ref={(el) => { tabRefs.current[t.key] = el; }}
                    type="button"
                    role="tab"
                    id={'tab-' + t.key}
                    aria-selected={active}
                    aria-controls="book-results"
                    tabIndex={active ? 0 : -1}
                    data-wf={t.id}
                    className="bs-tab"
                    onClick={() => setTab(t.key)}
                    onKeyDown={(e) => onTabKey(e, i)}
                    style={{
                      flex: 1, minHeight: 50, padding: '0 16px', fontFamily: mono, fontSize: 13, fontWeight: 800,
                      letterSpacing: '0.08em', textTransform: 'uppercase', borderRadius: 0,
                      border: 'none', borderLeft: i === 0 ? 'none' : '3px solid ' + P,
                      backgroundColor: active ? P : 'transparent', color: active ? BG : P,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    }}
                  >
                    {t.label}
                    <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 700, opacity: 0.85 }}>{t.count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Notice */}
        {notice && (
          <div
            key={notice.text}
            className="bs-rise"
            role={notice.kind === 'refused' ? 'alert' : 'status'}
            style={{ display: 'flex', alignItems: 'stretch', border: '3px solid ' + P, backgroundColor: '#ffffff', boxShadow: '6px 6px 0 ' + P, marginBottom: 32 }}
          >
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '16px', borderRight: '3px solid ' + P,
              backgroundColor: notice.kind === 'success' ? A : 'transparent', color: P,
              fontSize: 12, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', minWidth: 128,
            }}>
              {notice.kind === 'success'
                ? <Icons.CheckCircle className="w-5 h-5" aria-hidden="true" />
                : <Icons.AlertCircle className="w-5 h-5" aria-hidden="true" />}
              {notice.label}
            </div>
            <div style={{ flex: 1, padding: '16px', fontSize: 14, lineHeight: 1.6, fontVariantNumeric: 'tabular-nums' }}>
              {notice.text}
            </div>
          </div>
        )}

        {/* Rows 3 and 4 */}
        <div id="book-results" role="tabpanel" aria-labelledby={'tab-' + tab}>
          {visible.length > 0 ? (
            <section data-wf="b-2-0" aria-labelledby="books-heading" style={{ border: '3px solid ' + P, backgroundColor: '#ffffff', boxShadow: '8px 8px 0 ' + P }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', justifyContent: 'space-between', gap: 8, padding: '24px 24px 16px' }}>
                <h2 id="books-heading" style={{ fontFamily: serif, fontSize: 32, fontWeight: 800, letterSpacing: '-0.01em', margin: 0, lineHeight: 1.1 }}>
                  Books
                </h2>
                <p aria-live="polite" style={{ ...labelStyle, margin: 0, fontVariantNumeric: 'tabular-nums' }}>
                  Showing {visible.length} of {books.length} · {tab === 'available' ? 'with copies free' : 'whole catalogue'}
                </p>
              </div>
              <div style={{ overflowX: 'auto', borderTop: '3px solid ' + P }}>
                <Table style={{ width: '100%', minWidth: 960, borderCollapse: 'collapse' }}>
                  <THead>
                    <TR>
                      <TH data-wf="i-2-0-0" style={thStyle}>Title</TH>
                      <TH data-wf="i-2-0-1" style={thStyle}>Author</TH>
                      <TH data-wf="i-2-0-2" style={{ ...thStyle, textAlign: 'center' }}>Available copies</TH>
                      <TH data-wf="i-2-0-3" style={{ ...thStyle, textAlign: 'center' }}>Total copies</TH>
                      <TH data-wf="i-2-0-4" style={thStyle}>Borrow</TH>
                      <TH data-wf="i-2-0-5" style={thStyle}>Edit</TH>
                      <TH data-wf="i-2-0-6" style={thStyle}>Delete</TH>
                    </TR>
                  </THead>
                  <TBody>
                    {visible.map((b) => {
                      const mine = myLoans[b.id];
                      const out = b.available_copies <= 0;
                      const blocked = !!mine || out;
                      return (
                        <TR key={b.id} className="bs-row bs-fade">
                          <TD style={{ ...tdStyle, minWidth: 240 }}>
                            <div style={{ fontFamily: serif, fontSize: 20, fontWeight: 800, lineHeight: 1.2 }}>{b.title}</div>
                            {mine && (
                              <div style={{ ...labelStyle, marginTop: 4, color: P }}>
                                On loan to you · due {fmtShort(mine)}
                              </div>
                            )}
                          </TD>
                          <TD style={{ ...tdStyle, color: N }}>{b.author}</TD>
                          <TD style={{ ...tdStyle, textAlign: 'center' }}>
                            <span style={{ fontSize: 20, fontWeight: 800 }}>{b.available_copies}</span>
                            {out && <div style={{ ...labelStyle, marginTop: 4 }}>All out</div>}
                          </TD>
                          <TD style={{ ...tdStyle, textAlign: 'center', color: N }}>{b.total_copies}</TD>
                          <TD style={tdStyle}>
                            <button
                              type="button"
                              className="bs-btn"
                              aria-disabled={blocked}
                              aria-label={(mine ? 'Already borrowed: ' : out ? 'No copies left: ' : 'Borrow ') + b.title}
                              onClick={() => borrow(b)}
                              style={{
                                display: 'inline-flex', alignItems: 'center', gap: 8, minHeight: 44, padding: '0 16px',
                                fontFamily: mono, fontSize: 13, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase',
                                borderRadius: 0, whiteSpace: 'nowrap',
                                backgroundColor: blocked ? 'transparent' : P, color: blocked ? N : BG,
                                border: blocked ? '2px dashed ' + N : '3px solid ' + P,
                              }}
                            >
                              {mine ? <Icons.Check className="w-4 h-4" aria-hidden="true" /> : <Icons.ArrowRight className="w-4 h-4" aria-hidden="true" />}
                              {mine ? 'Borrowed' : out ? 'None left' : 'Borrow'}
                            </button>
                          </TD>
                          <TD style={tdStyle}>
                            <button
                              type="button"
                              className="bs-btn"
                              aria-label={'Edit ' + b.title}
                              onClick={() => navigate('book-form')}
                              style={{
                                display: 'inline-flex', alignItems: 'center', gap: 8, minHeight: 44, padding: '0 16px',
                                fontFamily: mono, fontSize: 13, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase',
                                borderRadius: 0, backgroundColor: 'transparent', color: P, border: '2px solid ' + P,
                              }}
                            >
                              <Icons.Edit className="w-4 h-4" aria-hidden="true" />
                              Edit
                            </button>
                          </TD>
                          <TD style={tdStyle}>
                            <button
                              type="button"
                              className="bs-btn"
                              aria-label={'Delete ' + b.title}
                              onClick={(e) => openDelete(b, e)}
                              style={{
                                display: 'inline-flex', alignItems: 'center', gap: 8, minHeight: 44, padding: '0 16px',
                                fontFamily: mono, fontSize: 13, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase',
                                borderRadius: 0, backgroundColor: 'transparent', color: P, border: '2px solid ' + P,
                              }}
                            >
                              <Icons.Trash className="w-4 h-4" aria-hidden="true" />
                              Delete
                            </button>
                          </TD>
                        </TR>
                      );
                    })}
                  </TBody>
                </Table>
              </div>
              <p style={{ ...labelStyle, margin: 0, padding: '16px 24px', borderTop: '3px solid ' + P }}>
                A book on loan cannot be deleted. You can hold one copy of a title at a time.
              </p>
            </section>
          ) : (
            <div data-wf="b-3-0" className="bs-rise" style={{ border: '3px solid ' + P, backgroundColor: '#ffffff', boxShadow: '8px 8px 0 ' + P, padding: '32px 24px' }}>
              <div style={{ ...labelStyle, marginBottom: 8 }}>§ 03 — Results</div>
              <Empty
                title="No books found"
                description={emptyDescription}
                action={
                  q ? (
                    <button
                      type="button"
                      className="bs-btn"
                      onClick={() => { setQuery(''); if (searchRef.current) searchRef.current.focus(); }}
                      style={{ minHeight: 44, padding: '0 24px', fontFamily: mono, fontSize: 13, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', backgroundColor: 'transparent', color: P, border: '3px solid ' + P, borderRadius: 0 }}
                    >
                      Clear search
                    </button>
                  ) : tab === 'available' && books.length > 0 ? (
                    <button
                      type="button"
                      className="bs-btn"
                      onClick={() => setTab('all')}
                      style={{ minHeight: 44, padding: '0 24px', fontFamily: mono, fontSize: 13, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', backgroundColor: 'transparent', color: P, border: '3px solid ' + P, borderRadius: 0 }}
                    >
                      Show all books
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="bs-btn"
                      onClick={() => navigate('book-form')}
                      style={{ minHeight: 44, padding: '0 24px', fontFamily: mono, fontSize: 13, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', backgroundColor: 'transparent', color: P, border: '3px solid ' + P, borderRadius: 0 }}
                    >
                      Add the first book
                    </button>
                  )
                }
              />
            </div>
          )}
        </div>
      </div>

      {/* Row 5: delete modal */}
      {pendingBook && (
        <div
          data-wf="b-4-0"
          onKeyDown={onDialogKey}
          style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
        >
          <div className="bs-fade" onClick={closeDelete} aria-hidden="true" style={{ position: 'absolute', inset: 0, backgroundColor: P, opacity: 0.6 }} />
          <div
            ref={dialogRef}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-title"
            aria-describedby="delete-desc"
            className="bs-rise"
            style={{ position: 'relative', width: '100%', maxWidth: 560, backgroundColor: BG, border: '3px solid ' + P, boxShadow: '10px 10px 0 ' + P, padding: 32, maxHeight: '100%', overflowY: 'auto' }}
          >
            <div style={{ ...labelStyle, marginBottom: 8 }}>Confirm — removes from library and search</div>
            <h2 id="delete-title" style={{ fontFamily: serif, fontSize: 36, fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.015em', margin: 0 }}>
              Delete this book?
            </h2>
            <p id="delete-desc" style={{ fontSize: 14, lineHeight: 1.6, color: N, margin: '16px 0 0' }}>
              It cannot be deleted while on loan.
            </p>
            <div style={{ margin: '24px 0', padding: '16px', border: '1px dashed ' + P, backgroundColor: '#ffffff' }}>
              <div style={{ fontFamily: serif, fontSize: 22, fontWeight: 800, lineHeight: 1.2 }}>{pendingBook.title}</div>
              <div style={{ fontSize: 14, color: N, marginTop: 4 }}>{pendingBook.author}</div>
              <div style={{ ...labelStyle, marginTop: 8, fontVariantNumeric: 'tabular-nums' }}>
                {pendingBook.available_copies} of {pendingBook.total_copies} copies on the shelf
              </div>
            </div>
            {deleteError && (
              <div role="alert" className="bs-rise" style={{ display: 'flex', gap: 12, alignItems: 'flex-start', border: '3px solid ' + P, backgroundColor: '#ffffff', padding: 16, marginBottom: 24, fontSize: 14, lineHeight: 1.6 }}>
                <Icons.AlertCircle className="w-5 h-5" aria-hidden="true" style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <strong style={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: 12 }}>Refused. </strong>
                  {deleteError}
                </div>
              </div>
            )}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
              <button
                type="button"
                data-wf="i-4-0-0"
                className="bs-btn"
                onClick={confirmDelete}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, minHeight: 48, padding: '0 24px', fontFamily: mono, fontSize: 13, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', backgroundColor: P, color: BG, border: '3px solid ' + P, borderRadius: 0 }}
              >
                <Icons.Trash className="w-4 h-4" aria-hidden="true" />
                Delete
              </button>
              <button
                type="button"
                ref={cancelRef}
                data-wf="i-4-0-1"
                className="bs-btn"
                onClick={closeDelete}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, minHeight: 48, padding: '0 24px', fontFamily: mono, fontSize: 13, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', backgroundColor: 'transparent', color: P, border: '3px solid ' + P, borderRadius: 0 }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
