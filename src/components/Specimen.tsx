import {useEffect, useMemo, useRef} from 'react';
import {specimenMarkup} from '../catalog';
import {mountMotions} from '../catalog/motion';
import type {CatalogItem, ExamplePage} from '../types';

export function Specimen({page, item, detail = false, paused = false, onOpen}: {page: ExamplePage; item: CatalogItem; detail?: boolean; paused?: boolean; onOpen?: () => void}) {
  const ref = useRef<HTMLDivElement>(null);
  const html = useMemo(() => specimenMarkup(page, item, detail), [page, item, detail]);
  useEffect(() => {
    const root = ref.current;
    if (!root || paused) return;
    return mountMotions(root);
  }, [html, paused]);
  // Only local, trusted specimen markup is inserted here. Remote catalog fields
  // are rendered as React text by the model components.
  return <div className="specimen-root" ref={ref} dangerouslySetInnerHTML={{__html: html}} onClick={onOpen ? e => {if ((e.target as Element).closest('[data-detail]')) onOpen();} : undefined}/>;
}
