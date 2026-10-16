import {useLayoutEffect, useRef, useState} from 'react';
import {promptForItem} from '../catalog';
import type {Selection} from '../types';
import {Icon} from './Icon';
import {ModelDetail} from './ModelPreview';
import {Specimen} from './Specimen';

export function DetailDialog({selection, onClose, onToast}: {selection: Selection; onClose: () => void; onToast: (message: string) => void}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [prompt, setPrompt] = useState(() => selection.page === 'models' ? '' : promptForItem(selection.page, selection.item));
  useLayoutEffect(() => {
    const dialog = ref.current!;
    const lastFocus = document.activeElement as HTMLElement | null;
    dialog.showModal(); document.body.classList.add('modal-open'); dialog.scrollTop = 0;
    dialog.querySelector<HTMLButtonElement>('.close-dialog')?.focus();
    return () => {dialog.close(); document.body.classList.remove('modal-open'); if (lastFocus?.isConnected) lastFocus.focus();};
  }, []);
  async function copy() {
    try {await navigator.clipboard.writeText(prompt); onToast('指示例をコピーしました');}
    catch {
      const area = document.createElement('textarea'); area.value = prompt; area.style.position = 'fixed'; area.style.opacity = '0';
      ref.current!.append(area); area.focus(); area.select();
      const success = document.execCommand('copy'); area.remove();
      onToast(success ? '指示例をコピーしました' : 'コピーできませんでした。指示例を選択してコピーしてください。');
    }
  }
  return <dialog id="detail-dialog" aria-label="見本の詳細" ref={ref} onCancel={event => {event.preventDefault(); onClose();}} onClick={event => {
    const dialog = event.currentTarget, rect = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) onClose();
  }}><div id="detail-content">
    <div className="dialog-top"><h2>{selection.item.ja}</h2><button className="icon-button close-dialog" aria-label="閉じる" onClick={onClose}><Icon name="close"/></button></div>
    {selection.page === 'models' ? <ModelDetail model={selection.item}/> : <>
      <div className="detail-layout"><div className="detail-visual"><Specimen page={selection.page} item={selection.item} detail/></div>
        <div className="detail-notes">
          <div className="detail-block"><h3>特徴</h3><ul className="trait-list">{selection.item.traits.map(trait => <li key={trait}>{trait}</li>)}</ul></div>
          <div className="detail-block"><h3>用途</h3><p>{selection.item.use}</p></div>
          <div className="detail-block"><h3>注意点</h3><p>{selection.item.avoid}</p></div>
        </div>
      </div>
      <details className="prompt-section"><summary>AIへの指示例</summary><label htmlFor="prompt-text" className="sr-only">編集できるAIへの指示例</label>
        <textarea id="prompt-text" spellCheck={false} value={prompt} onChange={event => setPrompt(event.target.value)}/>
        <button className="primary-button" id="copy-prompt" onClick={copy}><Icon name="copy"/> コピー</button>
      </details>
    </>}
  </div></dialog>;
}
