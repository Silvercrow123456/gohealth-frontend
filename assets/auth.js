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
  // 如果使用者不存在，就建立一個預設的
  let user = users[key] || { id: key, createdAt: new Date().toISOString() };
  
  // 執行更新
  user = updateFn(user);
  users[key] = user;
  
  localStorage.setItem('users', JSON.stringify(users));
  return user;
}

// 登入後的路由判斷 (做過 TTM 去主畫面，沒做過 去 TTM測驗)
function routeAfterLogin(user) {
  if (user.ttm && user.ttm.isCompleted) {
    window.location.href = 'main.html';
  } else {
    window.location.href = 'ttm.html';
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

// TTM 測驗完成後，在使用者資料內打勾 (這樣下次就不會再進入測驗)
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
  // 清除當前登入狀態
  localStorage.removeItem('currentEmail');
  // 導回登入頁
  window.location.replace('index.html');
}