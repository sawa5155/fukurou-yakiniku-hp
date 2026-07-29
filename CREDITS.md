# 画像クレジット

写真は **店舗提供の実写**（`assets/images/fukurou_images/`）と、
まだ実写が用意できていない箇所の **Pexels / Pixabay のロイヤリティフリー素材** が混在しています。
ストック素材はいずれも商用利用可・クレジット表記義務なしです。
Pixabay の規約に従い、画像はホットリンクせず `assets/images/` に設置しています。

- Pexels ライセンス: https://www.pexels.com/ja-jp/license/
- Pixabay ライセンス: https://pixabay.com/ja/service/license-summary/

## 1. 店舗提供の実写（差し替え済み）

`assets/images/fukurou_images/` の原版（6016×4016）から、各スロットの寸法に
中央基準でトリミング・リサイズして書き出しています。
再生成は `python3 mkimg.py write`（スクリプトは下記「再生成について」参照）。

| ファイル | 用途 | 原版 | 内容 |
| --- | --- | --- | --- |
| `hero`（動画のポスター） | ファーストビュー | `fukurou_hp24.JPG` | 焼き台に立ちのぼる煙と炎 |
| `omoi-chef` | 想い 01（大きな縦長写真） | `fukurou_hp5.JPG` | 焼き台で炙られる黒毛和牛 |
| `omoi-hands` | 想い 01（散らした写真A） | `fukurou_hp4.JPG` | そぼろの小鉢（**縦位置の原版**） |
| `tare` | 想い 02（大きな縦長写真） | `fukurou_hp3.JPG` | 卓に並ぶ黒毛和牛 |
| `meat-main` | こだわり（黒毛和牛） | `fukurou_hp32.JPG` | 特製ダレに浸かった黒毛和牛 |
| `meat-plate` | 旨さの秘訣 01 | `fukurou_hp49.JPG` | 卓に並ぶ黒毛和牛 |
| `flame` | 予約導線の背景 | `fukurou_hp28.JPG` | トングと肉・煙・炎 |

> ⚠️ **`tare`（hp3）と `meat-plate`（hp49）は、ほぼ同じ卓を同じ角度から撮った写真です。**
> 想い 02 と 旨さの秘訣 01 は離れているので並んで見えることはありませんが、
> 見比べると重複に気づきます。片方を別カットにしたい場合は
> `資料/実写書き出しスクリプト.py` の `MAP` で原版名を差し替えてください
> （盛り合わせ系の候補: `hp1` `hp2` `hp17` `hp18` `hp41` `hp46`）。

> **`hero` は静止画（ポスター）だけが実写で、動画本体はまだストック素材です。**
> 通常の閲覧では動画が再生されるため、ファーストビューで実際に見えるのは
> ストック映像のほうです。詳細は下記「動画について」を参照。

## 2. まだ実写に差し替えられていない箇所

提供いただいた50枚は**すべて料理と焼き台の写真**のため、以下は実写がなく
ストック素材のままです。**公開前に実写が必要です。**

| ファイル | 用途 | 必要な写真 |
| --- | --- | --- |
| `shop-kitajima` | 店舗（北島本店） | 店舗外観 |
| `shop-second` | 店舗（弐番館） | 店舗外観 |
| `space-poster` | 空間（固定背景の帯） | 店内・レトロな内装 |
| `sake` | 旨さの秘訣 04 | 店内に並ぶお酒 |
| `cattle-bw` | 阿波華牛（モノクロ） | 牛・牛舎 |
| `cattle` | 旨さの秘訣 03 | 牧場の牛 |
| `farm` | 旨さの秘訣 02 | 徳島の田園風景 |
| `video/hero-*.mp4` | ファーストビューの動画 | 焼き台の動画 |

`cattle` `cattle-bw` `farm` は花補佐牧場、`shop-*` は店舗の撮影が必要です。

## 3. ストック素材の一覧

| ファイル | 用途 | 提供元 | 撮影者 | 元ページ |
| --- | --- | --- | --- | --- |
| `video/hero-1280.mp4` `video/hero-640.mp4` | ファーストビュー（動画） | Pexels | Denys Gromov | https://www.pexels.com/video/close-up-shot-of-grilled-steak-6577410/ |
| `meat-grill` | 予備（未使用） | Pexels | makafood | https://www.pexels.com/photo/grilling-of-korean-bbq-meat-8914623/ |
| `cattle-bw` | 阿波華牛（モノクロ） | Pexels | yavuz selim korku | https://www.pexels.com/photo/cattle-in-black-and-white-16651363/ |
| `cattle` | 旨さの秘訣 03 | Pexels | Emre Simsek | https://www.pexels.com/photo/a-cow-eating-grass-in-a-field-27061035/ |
| `farm` | 旨さの秘訣 02（徳島の自然） | Pexels | Dr. Mohammad Hoque | https://www.pexels.com/photo/japanese-countryside-with-rice-fields-and-houses-32063338/ |
| `sake` | 旨さの秘訣 04（お酒） | Pixabay | ngd3 | https://pixabay.com/photos/drinks-bottle-sake-shabu-2140700/ |
| `space-main` | 予備（未使用） | Pexels | Iban Lopez Luna | https://www.pexels.com/photo/authentic-tokyo-izakaya-scene-with-lanterns-37919989/ |
| `space-wall` | 予備（未使用） | Pexels | Afham Hamsyari | https://www.pexels.com/photo/vintage-japanese-wall-posters-collection-35089102/ |
| `space-poster` | 空間（固定背景の帯） | Pexels | Afham Hamsyari | https://www.pexels.com/photo/cozy-japanese-izakaya-with-vintage-decor-35089099/ |
| `space-counter` | 予備（未使用） | Pexels | Eva Bronzini | https://www.pexels.com/photo/wooden-table-with-chairs-5761694/ |
| `space-shelf` | 想い 01（散らした写真B） | Pexels | Richard L | https://www.pexels.com/photo/rustic-kitchen-interior-with-bottles-and-shelves-32722826/ |
| `space-table` | 想い 02（散らした写真） | Pexels | Erik Mclean | https://www.pexels.com/photo/gourmet-food-on-a-serving-dish-18426529/ |
| `space-crowd` | 予備（未使用） | Pexels | Photo Trips | https://www.pexels.com/photo/authentic-izakaya-experience-in-shinjuku-tokyo-35970322/ |
| `shop-kitajima` | 店舗（北島本店） | Pixabay | djedj | https://pixabay.com/photos/restaurant-japanese-ancient-dining-5509577/ |
| `shop-second` | 店舗（弐番館） | Pexels | Mustafa Bodur | https://www.pexels.com/photo/interior-of-a-japanese-restaurant-17250068/ |
| `smoke` | こだわり背景の煙（3か所で使い回し） | Pexels | Egor Piskov | https://www.pexels.com/photo/white-smoke-on-black-background-10154563/ |
| `texture` | 全体の紙テクスチャ | Pexels | Plato Terentev | https://www.pexels.com/photo/close-up-photo-of-a-textured-surface-9817495/ |

各画像は `.jpg`（フォールバック）と `.webp`（優先配信）の2形式を用意し、
`<picture>` で出し分けています。差し替える際は**両形式**を同名で置き換えてください。

差し替え前のストック素材は `assets/images/_stock-backup/` に退避しています
（不要になったら削除して構いません）。

### 実写の再生成について

`fukurou_images/` の原版から書き出す処理は、スロットごとの出力寸法と
注視点（トリミングの中心）を表にした小さな Python スクリプトで行っています。

```python
# slot: (元写真, 幅, 高さ, 横の注視点0-1, 縦の注視点0-1)
'hero':       ('hp24', 1280,  720, 0.50, 0.52),
'omoi-chef':  ('hp5',  1200, 1500, 0.58, 0.50),
'omoi-hands': ('hp4',  1084,  920, 0.50, 0.62),
'tare':       ('hp3',  1200, 1500, 0.50, 0.55),
'meat-main':  ('hp32', 2000, 1333, 0.50, 0.50),
'meat-plate': ('hp49', 1800, 1192, 0.50, 0.52),
'flame':      ('hp28', 2000, 1333, 0.50, 0.50),
```

出力は jpg（quality 82 / progressive）と webp（quality 80 / method 6）。
別の写真に差し替えたい・トリミング位置を変えたいときは、この表の
原版名と注視点を書き換えて再実行してください。

**出力比は CSS の表示比に合わせること。** ずれていると `object-fit: cover` で
もう一度切られ、注視点で狙った構図から外れます。

| スロット | CSS の表示比 | 出力比 |
| --- | --- | --- |
| `.omoi__main`（`omoi-chef` `tare`） | `aspect-ratio: 4 / 5` = 0.800 | 1200×1500 |
| `.omoi__accent--a`（`omoi-hands`） | `aspect-ratio: 271 / 230` = 1.178 | 1084×920 |

原版は 47枚が横位置（3:2）、3枚だけ縦位置（`hp4` `hp23` `hp48`）です。

- 横位置から 4:5 を切ると**左右は 53% しか残りません**（`omoi-chef` `tare`）。
  被写体が端にあるときは横の注視点をずらしてください。
- 縦位置から 1.178 を切ると**上下は 57% しか残りません**（`omoi-hands` の `hp4`）。
  `hp4` は丼が下寄りなので縦の注視点を 0.62 にして上の暗い余白を落としています。

スクリプトは `資料/実写書き出しスクリプト.py` に置いています。

```
python3 資料/実写書き出しスクリプト.py preview   # トリミング結果の確認シートだけ作る
python3 資料/実写書き出しスクリプト.py write     # assets/images/ を実際に差し替える
```

`fukurou_images/` の50枚は1枚あたり2〜3MB・6016×4016 あります。
**Web では使わない原版なので、公開時は `assets/images/fukurou_images/` を
デプロイ対象から除外してください**（合計約200MB）。

### 店内見取り図について

空間セクションの見取り図は**写真ではなく、自作のインライン SVG** です
（ストック素材ではないため権利上の制約はありません）。

食べログ掲載の実席数に合わせて作図しています。

| | 内容 |
| --- | --- |
| カウンター | 焼き台4口・8席（1口2席） |
| テーブル | 4名席×3 ＋ 2名席×1 ＝ 14席 |
| 合計 | 22席 |

作図に使った Python スクリプトは `資料/店内見取り図_生成スクリプト.py` に置いています。
席の配置や数を変えたい場合はこれを編集して再生成し、
出力された SVG を `index.html` の `.kukan-floor` 内と差し替えてください。

> ⚠️ 実際の店内レイアウト（テーブルの位置関係、厨房・入口の向き）は
> 確認できていないため、席数のみ実データに合わせた**概念図**です。
> 正確な間取りが分かる場合はスクリプトの座標を修正してください。

### 動画について

ファーストビューの動画は肉のアップに炎が立ちのぼる9秒のクリップです（音声なし）。

- `hero-1280.mp4`（1280×720 / 3.10MB）… Pexels 提供の mp4 をそのまま使用
- `hero-640.mp4`（640×360 / 1.31MB）… macOS の `avconvert` で作成
  （Pexels の「640×360」表記のファイルは実体が 426×240 と粗く、
  スマホの全画面背景には使えなかったため 1280 版から作り直しています）

> ⚠️ **ポスター画像だけ実写に差し替えたため、動画とは別の絵になっています。**
> もともと `images/hero.jpg` はこの動画の1フレームで、読み込み前後で絵が飛びませんでした。
> 現在はポスターが実写（`fukurou_hp24`）・動画がストック素材なので、
> 動画の読み込みが完了した瞬間に絵が切り替わります。
> どちらも「暗い焼き台に炎と煙」で系統は近いものの、厳密には別カットです。
>
> 対応は次のいずれかです。
>
> 1. **焼き台の動画を実写で用意して差し替える**（推奨）
> 2. **動画をやめて実写1枚にする** … `index.html` の `<video>` から
>    `data-src-sm` / `data-src-lg` を外せば、JS は動画を読み込まずポスターのまま表示します
> 3. ポスターを動画のフレームに戻す … `資料/実写書き出しスクリプト.py` の
>    `MAP` から `'hero'` の行を削除し、`_stock-backup/hero.jpg` `hero.webp` を戻す

さらに軽くしたい場合は ffmpeg で WebM/AV1 を追加すると
半分程度まで削減できます（現状は環境に ffmpeg がないため mp4 のみ）。

### 未使用（差し替え候補として残しているファイル）

`meat-grill` `space-counter` `space-crowd` `space-main` `space-shelf` `space-table` `space-wall`
の7点（計約3.2MB）は現在どこからも参照していません。
写真を差し替えたいときの候補として残していますが、
不要であれば `assets/images/` から削除して構いません（HTML／CSS の修正は不要です）。

---

`smoke` は CSS の `background-image`（`image-set()` で webp / jpg を出し分け）で読み込み、
右上・左下・右下の3か所に**同じ1枚を反転・回転して使い回して**います。
正方形に整え、黒を締めてスクリーン合成に最適化しています。

## Web フォント

- Shippori Mincho / Zen Kaku Gothic New / EB Garamond — Google Fonts（SIL Open Font License 1.1）

参考サイトが使用している筑紫Aオールド明朝（FONTPLUS / Typekit）は有償のため、
無償で近い印象のオールドスタイル明朝「Shippori Mincho」を採用しています。
本番で筑紫書体を導入する場合は `--ff-serif` を差し替えてください。
