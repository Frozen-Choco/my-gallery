import {Fragment} from 'react';

export const contentPageSize = 24;
export function pageNumbers(page: number, pages: number): (number | 'gap')[] {
  const numbers = [...new Set([1, page - 1, page, page + 1, pages])].filter(value => value > 0 && value <= pages).sort((a, b) => a - b);
  return numbers.flatMap((value, index) => {
    const previous = numbers[index - 1];
    if (index && value - previous === 2) return [previous + 1, value];
    return index && value - previous > 2 ? ['gap' as const, value] : [value];
  });
}
export function Pagination({page, pages, top = false, onChange}: {page: number; pages: number; top?: boolean; onChange: (page: number) => void}) {
  if (pages <= 1) return null;
  return <nav className={`pagination${top ? ' pagination-top' : ''}`} aria-label={`ページ送り（${top ? '上部' : '下部'}）`}>
    <button type="button" aria-label="前のページ" disabled={page === 1} onClick={() => onChange(page - 1)}><span aria-hidden="true">‹</span></button>
    {top ? <select data-page-select aria-label="ページを選択" value={page} onChange={event => onChange(Number(event.target.value))}>
      {Array.from({length:pages}, (_, index) => <option key={index + 1} value={index + 1}>{index + 1} / {pages}</option>)}
    </select> : pageNumbers(page, pages).map((value, index) => <Fragment key={index}>{value === 'gap' ? <span className="pagination-gap" aria-hidden="true">…</span> : <button type="button" aria-label={`${value}ページ`} aria-current={page === value ? 'page' : undefined} onClick={() => {if (page !== value) onChange(value);}}>{value}</button>}</Fragment>)}
    <button type="button" aria-label="次のページ" disabled={page === pages} onClick={() => onChange(page + 1)}><span aria-hidden="true">›</span></button>
  </nav>;
}
