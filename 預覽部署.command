#!/bin/bash
# 一鍵部署到「預覽」網址（dev 分支）
# 先在預覽版測試新功能，滿意後再手動合併回 main 正式上線。
# 雙擊即可執行，不用開終端機打指令。

# 切換到這個檔案所在的專案資料夾
cd "$(dirname "$0")" || { echo "❌ 找不到專案資料夾"; echo "按任意鍵關閉…"; read -n 1 -s; exit 1; }

echo "🔬 預覽部署（dev）"
echo "📁 專案：$(pwd)"
echo "════════════════════════════════════"

# 清掉可能殘留的鎖檔，避免 git 卡住
rm -f .git/index.lock 2>/dev/null

# 切到 dev 分支（不存在就建立），把目前的修改帶過去
git checkout dev 2>/dev/null || git checkout -b dev

# 把所有修改加入
git add -A

# 沒有任何修改就優雅跳過 commit，不要噴錯
if git diff --cached --quiet; then
  echo "ℹ️  沒有新的修改，略過 commit"
else
  git commit -m "update"
fi

echo ""
echo "⏫ 推送到 dev 分支…"
if git push -u origin dev; then
  echo ""
  echo "✅ 已推送，Vercel 會自動開始部署"
  echo "   預覽網址會出現在 Vercel 專案的 Deployments 頁"
else
  echo ""
  echo "❌ 推送失敗，請看上面的錯誤訊息"
  echo "   （常見原因：還沒 git 登入，或有衝突需要先處理）"
fi

echo ""
echo "────────────────────────────────────"
echo "按任意鍵關閉視窗…"
read -n 1 -s
