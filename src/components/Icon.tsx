const paths = {
  home: 'm3 10 9-7 9 7M5 9v12h5v-7h4v7h5V9',
  web: 'M3 4h18v16H3zM3 9h18M7 6.5h.01M10 6.5h.01',
  video: 'M4 5h16v14H4zM10 9l5 3-5 3z',
  arrow: 'M5 12h14m-6-6 6 6-6 6',
  cube: 'm12 3 9 5v8l-9 5-9-5V8zM3 8l9 5 9-5M12 13v8M7.5 5.5l9 5',
  game: 'M7 7h10c3 0 5 10 3 11-2 1-4-3-4-3H8s-2 4-4 3C2 17 4 7 7 7ZM8 9v5M5.5 11.5h5M15 10h.01M18 13h.01',
  motion: 'm10 6 9 6-9 6zM4 7v10', layers: 'm12 3 10 6-10 6L2 9zM3 13l9 5 9-5M3 17l9 5 9-5',
  search: 'm16 16 5 5', list: 'M9 5h12M9 12h12M9 19h12M3 5h1M3 12h1M3 19h1',
  collapse: 'M4 3h16a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1ZM8 3v18m8-13-4 4 4 4',
  close: 'm6 6 12 12M18 6 6 18', copy: 'M16 8V3H3v13h5', menu: 'M4 6h16M4 12h16M4 18h16', grid: '',
};
export type IconName = keyof typeof paths;
export function Icon({name}: {name: IconName}) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {name === 'grid' ? <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></> : <path d={paths[name]}/>}
    {name === 'search' && <circle cx="10.5" cy="10.5" r="6.5"/>}
    {name === 'copy' && <rect x="8" y="8" width="12" height="13" rx="2"/>}
  </svg>;
}
