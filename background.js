// background.js

// Função para detectar conexões de terceiros
chrome.webRequest.onBeforeRequest.addListener(
    function(details) {
      const url = new URL(details.url);
      const mainUrl = new URL(details.initiator || details.originUrl || "");
  
      if (mainUrl.hostname && url.hostname !== mainUrl.hostname) {
        chrome.storage.local.get({ thirdPartyConnections: [] }, function(result) {
          const connections = result.thirdPartyConnections;
          connections.push({
            url: details.url,
            domain: url.hostname,
            timestamp: new Date().toISOString()
          });
          chrome.storage.local.set({ thirdPartyConnections: connections });
        });
      }
    },
    { urls: ["<all_urls>"] },
    []
  );
  
  // Função para obter cookies e armazená-los
  chrome.cookies.onChanged.addListener(function(changeInfo) {
    chrome.storage.local.get({ cookies: [] }, function(result) {
      const cookies = result.cookies;
      cookies.push({
        name: changeInfo.cookie.name,
        domain: changeInfo.cookie.domain,
        path: changeInfo.cookie.path,
        secure: changeInfo.cookie.secure,
        httpOnly: changeInfo.cookie.httpOnly,
        sameSite: changeInfo.cookie.sameSite,
        expirationDate: changeInfo.cookie.expirationDate,
        session: changeInfo.cookie.session,
        storeId: changeInfo.cookie.storeId,
        timestamp: new Date().toISOString(),
        removed: changeInfo.removed
      });
      chrome.storage.local.set({ cookies: cookies });
    });
  });
  
  // Inicializar armazenamento
  chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set({
      thirdPartyConnections: [],
      cookies: []
    });
  });
  