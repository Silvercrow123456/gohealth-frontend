// 取得目前登入的帳號 (Email 或 手機)
function getCurrentEmail() {
  return localStorage.getItem('currentEmail');
}

// 設定目前登入的帳號
function setCurrentEmail(email) {
  localStorage.setItem('currentEmail', email);
}

// 取得或更新使用者資料 (存放在 localStorage)
function upsertUser(key, updateFn) {
  let users = JSON.parse(localStorage.getItem('users') || '{}');
  let user = users[key] || { id: key, createdAt: new Date().toISOString() };
  
  user = updateFn(user);
  users[key] = user;
  
  localStorage.setItem('users', JSON.stringify(users));
  return user;
}

// ==========================================
// 【關鍵修改】：登入後的路由判斷 (改為非同步向後端確認)
// ==========================================
async function routeAfterLogin(user) {
  const email = getCurrentEmail();
  
  // 抓取畫面上的登入按鈕，讓它顯示載入中，避免使用者連點
  const btn = document.querySelector('button[type="submit"]');
  if(btn) {
    btn.disabled = true;
    btn.textContent = '檢查資料中...';
  }

  try {
    // 1. 先去雲端資料庫檢查該帳號有沒有做過 TTM
    // (注意：這裡的網址要跟你 main.html 的 API_BASE 一樣)
    const res = await fetch(`https://gohealth-backend.vercel.app/api/ttm/${email}`);
    const json = await res.json();
    
    // 2. 如果雲端有找到資料！
    if (json.data && json.data.scores) {
      // 幫這個新的瀏覽器補上「已完成」的打勾標記
      upsertUser(email, (u) => {
        u.ttm = { isCompleted: true };
        return u;
      });
      // 直接帶往主畫面！
      window.location.replace('main.html');
      return; 
    }
  } catch (err) {
    console.error('無法連線到雲端確認 TTM 狀態', err);
  }

  // 3. 如果雲端沒有資料，最後才檢查本機紀錄
  if (user.ttm && user.ttm.isCompleted) {
    window.location.replace('main.html');
  } else {
    // 如果兩邊都沒有，才乖乖去做測驗
    window.location.replace('ttm.html');
  }
}

// 檢查登入狀態 (如果沒登入，強制踢回登入頁)
function requireLogin(checkTtm = false) {
  const email = getCurrentEmail();
  if (!email) {
    window.location.replace('index.html');
    return null;
  }
  
  let users = JSON.parse(localStorage.getItem('users') || '{}');
  let user = users[email];

  if (!user) {
    window.location.replace('index.html');
    return null;
  }

  return user;
}

// TTM 測驗完成後，在本機資料內打勾
function markTtmCompleted(total, stage) {
  const email = getCurrentEmail();
  if (!email) return false;

  upsertUser(email, (u) => {
    u.ttm = {
      isCompleted: true,
      totalScore: total,
      stage: stage,
      completedAt: new Date().toISOString()
    };
    return u;
  });
  return true;
}

// 登出系統
function logout() {
  localStorage.removeItem('currentEmail');
  window.location.replace('index.html');
}
// 註冊 PWA 的 Service Worker (全域生效)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // 注意路徑是 './sw.js'，因為這段程式碼會被 HTML 執行，所以相對於 HTML 的位置
    navigator.serviceWorker.register('./sw.js').catch(err => {
      console.log('PWA Service Worker 註冊失敗:', err);
    });
  });
}