// 這是一個最基礎的 Service Worker，主要目的是通過瀏覽器的 PWA 檢查條件
const CACHE_NAME = 'gohealth-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // 為了確保你的 API 永遠抓取最新資料，我們這裡不做網頁快取，直接放行所有網路請求
  event.respondWith(fetch(event.request));
});