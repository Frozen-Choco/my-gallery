import type {PersonalPage} from '../types';
import {Icon, type IconName} from './Icon';

const game = {title: '星屑のゆりかご', url: 'https://frozen-choco.itch.io/stardust-cradle'};
const youtube = {name: '冷凍チョコ', url: 'https://www.youtube.com/channel/UCFH81ruwAfy-d2TzVRjsJFA'};
const collections: {id: string; title: string; description: string; icon: IconName}[] = [
  {id:'styles', title:'デザインスタイル', description:'配色・文字・レイアウト', icon:'grid'},
  {id:'games', title:'ゲームUI', description:'ゲーム画面の表現', icon:'game'},
  {id:'motion', title:'モーション', description:'要素の動き', icon:'motion'},
  {id:'transitions', title:'トランジション', description:'画面の切り替え', icon:'layers'},
  {id:'models', title:'3Dモデル', description:'ローポリモデル・ダウンロード', icon:'cube'},
];

function GameArtwork() {
  return <div className="game-artwork" aria-hidden="true">
    <svg className="cradle-orbits" viewBox="0 0 640 320" fill="none">
      <ellipse cx="390" cy="170" rx="210" ry="84" transform="rotate(-25 390 170)"/>
      <ellipse cx="390" cy="170" rx="170" ry="125" transform="rotate(35 390 170)"/>
      <circle cx="390" cy="170" r="60"/><circle className="cradle-star" cx="530" cy="73" r="5"/>
      <path className="cradle-star" d="m385 149 5 15 15 6-15 5-5 16-5-16-15-5 15-6Z"/>
      <path d="M72 59v10m-5-5h10M565 245v12m-6-6h12M167 256v8m-4-4h8"/>
    </svg>
    <span className="game-artwork-title">星屑の<br/>ゆりかご</span>
  </div>;
}

function GameLink() {
  return <a className="published-game" href={game.url} target="_blank" rel="noopener noreferrer" aria-label="星屑のゆりかごをitch.ioで見る（新しいタブ）">
    <GameArtwork/>
    <div className="published-game-info"><div><span className="link-platform">itch.io · テスト版</span><h2>{game.title}</h2><p>閲覧にはパスワードが必要です。</p></div><span className="outbound-arrow" aria-hidden="true">↗</span></div>
  </a>;
}
function MediaLink() {
  return <a className="media-link" href={youtube.url} target="_blank" rel="noopener noreferrer" aria-label="冷凍チョコのYouTubeチャンネル（新しいタブ）">
    <span className="youtube-symbol" aria-hidden="true"><svg viewBox="0 0 48 34"><rect width="48" height="34" rx="10" fill="currentColor"/><path d="m20 10 12 7-12 7Z" fill="white"/></svg></span>
    <div><span className="link-platform">YouTube</span><h2>{youtube.name}</h2><p>@frozen-choco-ch</p></div><span className="outbound-arrow" aria-hidden="true">↗</span>
  </a>;
}

export function PersonalPages({page}: {page: PersonalPage}) {
  if (page === 'works') return <div className="published-games"><GameLink/></div>;
  if (page === 'media') return <div className="media-links"><MediaLink/></div>;
  return <div className="home-page">
    <p className="home-intro">冷凍チョコの作品と、創作に使える見本をまとめています。</p>
    <div className="home-destinations">
      <a className="home-game" href="#works"><GameArtwork/><div className="home-destination-label"><h2>公開ゲーム</h2><Icon name="arrow"/></div></a>
      <a className="home-media" href="#media"><span className="home-media-art" aria-hidden="true"><Icon name="video"/></span><div className="home-destination-label"><h2>メディア</h2><Icon name="arrow"/></div></a>
    </div>
    <h2 className="home-collection-title">見本</h2>
    <div className="home-collections">{collections.map(item => <a key={item.id} href={`#${item.id}`} className="collection-link"><Icon name={item.icon}/><div><h3>{item.title}</h3><p>{item.description}</p></div><span aria-hidden="true">↗</span></a>)}</div>
  </div>;
}
