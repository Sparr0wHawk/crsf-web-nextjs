# 旧システム分析サマリー - CRS/CRF Web System

## 🎯 PoC 対象ページの特定

### **ページ ID: PT04000**

**ページ名**: Web 稼働表

### **ファイルの場所**

#### フロントエンド:

```
HTML:
└── refer/crsf-web-dev_CHAR-VALID/crsf-web-presentation/
    └── src/main/webapp/WEB-INF/views/PT04/PT04000.html

JavaScript:
└── refer/crsf-web-dev_CHAR-VALID/crsf-web-presentation/
    └── src/main/javascript/app/PT04000/
        ├── app.js                              # エントリーポイント
        ├── model/WebOperationTableModel.js     # Backboneモデル
        └── view/WebOperationTableView.js       # Backboneビュー
```

#### バックエンド:

```
Controller/Resource:
└── refer/crsf-web-dev_CHAR-VALID/crsf-web-presentation/
    └── src/main/java/.../presentation/PT04/
        ├── WebOperationTableController.java
        └── WebOperationTableResource.java

Business Logic:
└── refer/crsf-web-dev_CHAR-VALID/crsf-web-logic/
    └── src/main/java/.../logic/PT04000/facade/
        ├── WebOperationTableScreenDefaultDisplayFacade.java
        └── OperationStatusSearchFacade.java
```

---

## 🔗 メニューからのナビゲーション

### **メニューページ: OT02000**

**ファイル**: `refer/crsf-web-dev_CHAR-VALID/.../views/OT02/OT02000.html`

**該当箇所** (294 行目):

```html
<div class="menu-item" data-th-if="${isCRFHeadOfficeOrShopOrNrs}">
  <button class="btn dropdown-toggle menu" id="webOperationTableLink">
    <span>35.Web稼働表</span>
  </button>
</div>
```

**アクセス条件**: CRF 本社/営業所/NRS 権限が必要

---

## 📊 稼働表の主要機能

### **1. 検索条件フォーム**

| 項目           | 型               | 必須 | 説明                              |
| -------------- | ---------------- | ---- | --------------------------------- |
| 日付           | テキスト ×3      | ✅   | 年/月/日 + 曜日自動表示           |
| 部             | プルダウン       | -    | 部門選択                          |
| ブロック       | プルダウン       | -    | 部に紐づくブロック（連動）        |
| 営業所         | テキスト+選択    | -    | コード/名称                       |
| クラス         | テキスト ×5      | -    | 車両クラスコード                  |
| グループクラス | チェックボックス | -    | グループ指定                      |
| 車種コード     | テキスト         | -    | 車種コード                        |
| 配備/運用区分  | プルダウン       | -    | すべて/配備/運用                  |
| 車両区分       | プルダウン       | -    | 配備/運用区分に連動               |
| 並び順         | プルダウン       | -    | クラス/配備営業所/運用営業所/車名 |
| 仮引当実施     | ラジオボタン     | -    | する/しない                       |
| 検索範囲       | ラジオボタン     | -    | 72 時間/2 週間                    |

**重要な連動処理**:

- 「部」選択 → 「ブロック」リストが更新
- 「配備/運用区分」選択 → 「車両区分」リストが更新

---

### **2. 稼働グラフ（タイムチャート）**

#### **構造**:

```
┌────────┬────────┬───┬──────────────────────────────┐
│登録番号│ 車種   │条件│  時間軸（横スクロール）      │
│        │        │   │ ██████░░░░████░░░░░░░░      │ ← ステータスバー
├────────┼────────┼───┼──────────────────────────────┤
│C  │WCL│配備営業│運用│                              │
│   │   │麻生駅前│札幌│                              │
└───┴───┴────────┴───┴──────────────────────────────┘
```

#### **データ構造**:

```javascript
// ヘッダー
operationTableGraphHeader: {
  datewriteList: ["02/10(水)", "02/11(木)", ...],
  timewriteList: ["0", "6", "12", "18"],
  graphMeshCount: 180,      // グラフの総列数
  datewriteMeshCount: 48,   // 1日あたりの列数
  timewriteMeshCount: 2     // 1時間あたりの列数
}

// データ行（車両ごと）
operationTableGraphDataList: [{
  registNumber: "1123022224",
  carName: "アルファード",
  condition: "1234567",
  selfAndOthersDivision: "C",
  classCode: "WCL",
  dispositionShopName: "麻生駅前",
  usingShopName: "札幌駅北口",

  // ステータスバー構成要素
  pieceInformationList: [{
    pieceLength: 12,          // 占めるセル数（時間幅）
    pieceColor: "#FF5733",    // 背景色
    tooltipMessage: "貸渡中\n予約番号: xxx\n...",
    pieceJson: {...}          // 詳細データ
  }, {
    pieceLength: 24,
    pieceColor: "#33FF57",
    tooltipMessage: "アイドル\n...",
    pieceJson: {...}
  }]
}]
```

#### **色分け**:

- 各ステータス（貸渡中、アイドル、整備中、チャーター等）は色で識別
- `pieceColor`で動的に背景色を設定
- 印刷時も色を保持

---

### **3. インタラクション**

| 機能               | 実装                                 |
| ------------------ | ------------------------------------ |
| **ツールチップ**   | マウスオーバーでステータス詳細を表示 |
| **詳細モーダル**   | バークリックで詳細情報をモーダル表示 |
| **複数ステータス** | 重複がある場合は連続してモーダル表示 |
| **横スクロール**   | 長時間表示時のスクロール対応         |
| **印刷**           | ボタンで印刷プレビュー（色保持）     |
| **営業所選択**     | リンククリックで選択ダイアログ表示   |

---

## 🚀 React 移行のポイント

### **サーバーサイドレンダリング → クライアントサイド**

**旧システム (Thymeleaf)**:

```html
<td
  data-th-each="piece: *{pieceInformationListDisplay}"
  class="item piece"
  data-th-style="'background-color: ' + ${piece.pieceColor}"
  data-th-colspan="${piece.pieceLength}"
></td>
```

**新システム (React)**:

```typescript
{
  operation.pieceInformationList.map((piece, idx) => (
    <td
      key={idx}
      colSpan={piece.pieceLength}
      style={{ backgroundColor: piece.pieceColor }}
      onClick={() => handlePieceClick(piece)}
    />
  ));
}
```

---

### **Backbone → React Hooks**

**旧システム**:

```javascript
// Model
var WebOperationTableModel = Backbone.Model.extend({
  urlRoot: "/web-operation-table",
  defaults: { ... }
});

// View
var WebOperationTableView = Backbone.View.extend({
  events: {
    "change:sectionNameSelectValue": "updateBlockList"
  }
});
```

**新システム**:

```typescript
// Custom Hook
function useOperationTableData() {
  const { data, isLoading } = useQuery({
    queryKey: ["operationTable", searchParams],
    queryFn: () => fetchOperationTableData(searchParams),
  });
  return { data, isLoading };
}

// Component
function SearchForm() {
  const [section, setSection] = useState("");
  const { data: blocks } = useBlockList(section);

  useEffect(() => {
    // 部が変更されたらブロックをリセット
    setBlock("");
  }, [section]);
}
```

---

### **ドラッグ&ドロップ（PoC 新機能）**

**実装イメージ**:

```typescript
import { DndContext, useDraggable, useDroppable } from "@dnd-kit/core";

function DraggableStatusBar({ piece }) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: piece.id,
    data: piece,
  });

  return (
    <td
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      colSpan={piece.pieceLength}
      style={{
        backgroundColor: piece.pieceColor,
        cursor: "grab",
      }}
    />
  );
}

function OperationTableGraph() {
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (over) {
      // ドロップ先に応じてスケジュール更新
      updateSchedule({
        pieceId: active.id,
        newTime: over.data.time,
        newVehicle: over.data.vehicleId,
      });
    }
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <table>{/* グラフ内容 */}</table>
    </DndContext>
  );
}
```

---

## 📦 必要な API エンドポイント

### **既存のバックエンドを活用する場合**:

```
GET  /api/operation-table/init
     → 初期表示データ（部リスト、車両区分リスト、デフォルト値）

POST /api/operation-table/search
     → 検索実行（条件に基づく稼働データ取得）

GET  /api/operation-table/blocks?sectionCode={code}
     → ブロックリスト取得（部に紐づく）

GET  /api/operation-table/status-detail?{params}
     → ステータス詳細情報取得

PUT  /api/operation-table/update-schedule (PoC新機能)
     → ドラッグ&ドロップによるスケジュール更新
```

---

## 🎨 UI ライブラリの使い方

### **検索フォーム → MUI Components**:

```typescript
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  Radio,
  RadioGroup
} from '@mui/material';

// 日付入力
<TextField
  label="年"
  value={year}
  onChange={(e) => setYear(e.target.value)}
  inputProps={{ maxLength: 2 }}
/>

// プルダウン
<FormControl fullWidth>
  <InputLabel>部</InputLabel>
  <Select value={section} onChange={(e) => setSection(e.target.value)}>
    {sectionList.map(s => (
      <MenuItem key={s.code} value={s.code}>{s.name}</MenuItem>
    ))}
  </Select>
</FormControl>
```

### **稼働グラフ → Tailwind CSS + MUI**:

```typescript
<div className="overflow-x-auto max-w-full">
  <table className="min-w-full border-collapse">
    <thead>
      <tr>
        {header.datewriteList.map((date) => (
          <th key={date} className="border px-2 py-1 text-xs">
            {date}
          </th>
        ))}
      </tr>
    </thead>
    <tbody>{/* 車両行 */}</tbody>
  </table>
</div>
```

### **ツールチップ → MUI Tooltip**:

```typescript
import { Tooltip } from "@mui/material";

<Tooltip title={piece.tooltipMessage} arrow>
  <td style={{ backgroundColor: piece.pieceColor }}>{/* 内容 */}</td>
</Tooltip>;
```

### **モーダル → MUI Dialog**:

```typescript
import { Dialog, DialogTitle, DialogContent } from "@mui/material";

<Dialog open={open} onClose={handleClose}>
  <DialogTitle>ステータス内容詳細</DialogTitle>
  <DialogContent>{/* 詳細情報 */}</DialogContent>
</Dialog>;
```

---

## ✅ チェックリスト

### **理解度確認**:

- [x] PT04000 が稼働表のページ ID であることを確認
- [x] ファイルの場所を特定
- [x] メニュー(OT02000)からのナビゲーションを確認
- [x] データ構造（ヘッダー・データ行・ピース情報）を理解
- [x] 連動処理（部 → ブロック、配備/運用 → 車両区分）を理解
- [x] ドラッグ&ドロップが PoC 追加要件であることを確認

### **次のアクション**:

- [ ] MUI テーマの設定
- [ ] フォルダ構造の作成
- [ ] メニューページの実装
- [ ] 検索フォームの実装
- [ ] 稼働グラフの表示実装
- [ ] ドラッグ&ドロップの実装

---

## 📞 質問・確認事項

1. **バックエンド連携**:
   - 既存の Java API を使う？ それともモックデータ？
2. **認証**:
   - PoC で認証機能は必要？
3. **優先順位**:
   - 機能の完全性 vs. ドラッグ&ドロップの洗練度
4. **タイムライン**:
   - PoC 完成の目標時期は？

---

**準備完了！次のステップに進みましょう！** 🚀
