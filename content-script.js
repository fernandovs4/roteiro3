// content.js

// Detectar alterações no window.location (possível hijacking)
window.addEventListener("hashchange", function() {
    chrome.storage.local.get({ threats: [] }, function(result) {
      const threats = result.threats;
      threats.push({
        type: "HashChange",
        message: "Possível hijacking detectado via hashchange.",
        timestamp: new Date().toISOString()
      });
      chrome.storage.local.set({ threats: threats });
    });
  });
  
  // Detectar inserção de scripts ou iframes suspeitos
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          if (node.tagName === 'SCRIPT' || node.tagName === 'IFRAME') {
            chrome.storage.local.get({ threats: [] }, function(result) {
              const threats = result.threats;
              threats.push({
                type: "Injection",
                message: `Possível hook detectado: ${node.tagName} adicionado.`,
                timestamp: new Date().toISOString()
              });
              chrome.storage.local.set({ threats: threats });
            });
          }
        }
      });
    });
  });
  
  observer.observe(document.body, { childList: true, subtree: true });
  function monitorStorage() {
    // Coletar dados atuais
    updateLocalStorage();
    updateSessionStorage();
  
    // Monitorar alterações
    window.addEventListener('storage', function(event) {
      const type = event.storageArea === localStorage ? 'localStorage' : 'sessionStorage';
      chrome.storage.local.get({ storageData: [] }, function(result) {
        const storageData = result.storageData;
        storageData.push({
          type: type,
          key: event.key,
          value: event.newValue,
          timestamp: new Date().toISOString(),
        });
        chrome.storage.local.set({ storageData: storageData });
      });
    });
  }
  
  function updateLocalStorage() {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);
      storeData("localStorage", key, value);
    }
  }
  
  function updateSessionStorage() {
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      const value = sessionStorage.getItem(key);
      storeData("sessionStorage", key, value);
    }
  }
  
  function storeData(type, key, value) {
    chrome.storage.local.get({ storageData: [] }, function(result) {
      const storageData = result.storageData;
      storageData.push({
        type: type,
        key: key,
        value: value,
        timestamp: new Date().toISOString()
      });
      chrome.storage.local.set({ storageData: storageData });
    });
  }
  
  // Executar monitoramento após o carregamento da página
  window.addEventListener('load', monitorStorage);
  