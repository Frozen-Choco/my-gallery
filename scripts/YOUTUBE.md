# YouTube動画の自動反映

`.github/workflows/sync-youtube.yml` が毎時23分（UTC）に公開フィードを取得し、`public/videos.json` に蓄積する。GitHub Actionsの実行は遅延する場合がある。公開動画がまだない時点から収集を開始している。

- フィードの掲載範囲から外れた過去動画は削除しない。タイトル変更は取得範囲内で更新する。
- フィード取得失敗時は保存済み一覧を維持する。Actionsの失敗として確認できる。
- フィードは直近の動画だけを返す。長期間の取得停止や短時間の大量投稿で取得範囲から漏れた動画は、一覧への補完が必要。厳密な全件再照合が必要になった場合はYouTube Data APIのuploads playlistへ移行する。
- 削除・非公開化された動画は自動削除しない。`public/videos.json` から対象を削除してビルドする。
- 同期日は1日1回更新される。定期コミットが、リポジトリ無更新によるスケジュール停止を防ぐ。
- `GITHUB_TOKEN` のpushではPagesが再ビルドされないため、画面はmainの公開JSONを直接取得する。失敗時はビルドに含めた一覧へ戻る。`docs/`も`npm run build`で再生成して一緒に保存する。
- 公開ゲームは`src/catalog/publications.ts`の`publishedGames`へ新しい順で追加する。

確認: `python3 -m unittest discover -s scripts -p 'test_*.py'`
