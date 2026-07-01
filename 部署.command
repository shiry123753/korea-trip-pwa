#!/bin/bash
# 一鍵部署到「正式」網址（main 分支）
# 雙擊即可執行，不用開終端機打指令。

# 切換到這個檔案所在的專案資料夾
cd "$(dirname "$0")" || { echo "❌ 找不到專案資料夾"; echo "按任意鍵關閉…"; read -n 1 -s; exit 1; }

echo "🚀 正式部署（main）"
echo "📁 專案：$(pwd)"
echo "════════════════════════════════════"

# 清掉可能殘留的鎖檔，避免 git 卡住
rm -f .git/index.lock 2>/dev/null

# 確保在 main 分支（把目前的修改帶過去）
git checkout main 2>/dev/null

# 把所有修改加入
git add -A

# 沒有任何修改就優雅跳過 commit，不要噴錯
if git diff --cached --quiet; then
  echo "ℹ️  沒有新的修改，略過 commit"
else
  git commit -m "update"
fi

echo ""
echo "⏫ 推送到 main 分支…"
if git push origin main; then
  echo ""
  echo "✅ 已推送，Vercel 會自動開始部署"
  echo "   正式網址：https://korea-trip-pwa.vercel.app"
else
  echo ""
  echo "❌ 推送失敗，請看上面的錯誤訊息"
  echo "   （常見原因：還沒 git 登入，或有衝突需要先處理）"
fi

echo ""
echo "────────────────────────────────────"
echo "按任意鍵關閉視窗…"
read -n 1 -s
