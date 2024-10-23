// popup.js

document.addEventListener('DOMContentLoaded', function() {
  displayThirdPartyConnections();
  displayThreats();
  displayStorageData();
  displayCookies();
  updateLocalStorage();
  displayFingerprint(); // Chamada para exibir a fingerprint
  assessPrivacy(window.location.href); // Avalia a privacidade da página atual
  document.getElementById('clear-data').addEventListener('click', clearData);
});

// Função para avaliar a privacidade da página
function assessPrivacy(url) {
  let score = 0;

  // Verificar Política de Privacidade
  if (checkPrivacyPolicy(url)) {
      score += 2; // Adiciona 2 pontos se a política existir
  }

  // Verificar Consentimento do Usuário
  if (checkUserConsent(url)) {
      score += 2; // Adiciona 2 pontos se o consentimento for solicitado
  }

  // Verificar Transparência de Dados
  if (checkDataTransparency(url)) {
      score += 2; // Adiciona 2 pontos se houver transparência
  }

  // Verificar Opções de Exclusão
  if (checkDataDeletionOptions(url)) {
      score += 2; // Adiciona 2 pontos se houver opções de exclusão
  }

  // Verificar Segurança de Dados
  if (checkDataSecurity(url)) {
      score += 2; // Adiciona 2 pontos se a segurança for garantida
  }

  // Exibir a pontuação
  const privacyScoreDiv = document.getElementById('privacy-score');
  privacyScoreDiv.textContent = `Pontuação de Privacidade: ${score} / 10`;
}

// Função para verificar a existência da política de privacidade
function checkPrivacyPolicy(url) {
  const policies = ["privacy", "policy", "termos"]; // Exemplos de palavras-chave
  return policies.some(policy => url.includes(policy));
}

// Função para verificar se o consentimento é solicitado
function checkUserConsent(url) {
  // Verifica se a página contém formulários ou banners de consentimento
  return document.body.innerHTML.includes('consent') || document.body.innerHTML.includes('accept cookies');
}

// Função para verificar a transparência de dados
function checkDataTransparency(url) {
  // Verifica se a página menciona a transparência em relação ao uso de dados
  return document.body.innerHTML.includes('transparente') || document.body.innerHTML.includes('dados coletados');
}

// Função para verificar opções de exclusão
function checkDataDeletionOptions(url) {
  // Verifica se a página fornece informações sobre como excluir dados
  return document.body.innerHTML.includes('excluir dados') || document.body.innerHTML.includes('remover conta');
}

function displayThirdPartyConnections() {
  chrome.storage.local.get('thirdPartyConnections', function(data) {
      const list = document.getElementById('third-party-connections');
      list.innerHTML = '';
      if (!data.thirdPartyConnections || data.thirdPartyConnections.length === 0) {
          list.innerHTML = '<li>Nenhuma conexão de terceiros detectada.</li>';
          return;
      }
      data.thirdPartyConnections.forEach(conn => {
          const li = document.createElement('li');
          li.textContent = `${conn.timestamp}: ${conn.url} (${conn.domain})`;
          list.appendChild(li);
      });
  });
}

function displayThreats() {
  chrome.storage.local.get('threats', function(data) {
      const list = document.getElementById('threats');
      list.innerHTML = '';
      if (!data.threats || data.threats.length === 0) {
          list.innerHTML = '<li>Nenhuma ameaça detectada.</li>';
          return;
      }
      data.threats.forEach(threat => {
          const li = document.createElement('li');
          li.textContent = `${threat.timestamp}: [${threat.type}] ${threat.message}`;
          list.appendChild(li);
      });
  });
}

function displayStorageData() {
  const list = document.getElementById('storage-data');
  list.innerHTML = '';

  // Função para resgatar os dados do localStorage
  function getLocalStorageData() {
      let localStorageData = [];
      for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          localStorageData.push({
              key: key,
              value: localStorage.getItem(key),
              type: 'localStorage',
              timestamp: new Date().toISOString() // Timestamp para exibição
          });
      }
      return localStorageData;
  }

  // Função para resgatar os dados do sessionStorage
  function getSessionStorageData() {
      let sessionStorageData = [];
      for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          sessionStorageData.push({
              key: key,
              value: sessionStorage.getItem(key),
              type: 'sessionStorage',
              timestamp: new Date().toISOString() // Timestamp para exibição
          });
      }
      return sessionStorageData;
  }

  const storageData = [...getLocalStorageData(), ...getSessionStorageData()];

  if (storageData.length === 0) {
      list.innerHTML = '<li>Nenhum dado de armazenamento detectado.</li>';
      return;
  }

  storageData.forEach(item => {
      const li = document.createElement('li');
      li.textContent = `${item.timestamp}: [${item.type}] ${item.key} = ${item.value}`;
      list.appendChild(li);
  });
}


function displayCookies() {
  chrome.storage.local.get('cookies', function(data) {
      const list = document.getElementById('cookies');
      list.innerHTML = '';
      if (!data.cookies || data.cookies.length === 0) {
          list.innerHTML = '<li>Nenhum cookie detectado.</li>';
          return;
      }
      data.cookies.forEach(cookie => {
          const li = document.createElement('li');
          const type = cookie.session ? 'Sessão' : 'Persistente';
          const party = cookie.domain.startsWith('.') ? 'Terceira Parte' : 'Primeira Parte';
          li.textContent = `${cookie.timestamp}: ${cookie.name} (${party}, ${type}) - Dominio: ${cookie.domain}`;
          list.appendChild(li);
      });
  });
}

function updateLocalStorage() {
  for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);
      console.log(`Capturando localStorage: ${key} = ${value}`);
      storeData("localStorage", key, value);
  }
}

function clearData() {
  chrome.storage.local.clear(function() {
      displayThirdPartyConnections();
      displayThreats();
      displayStorageData();
      displayCookies();
  });
}

async function displayFingerprint() {
  const fp = await FingerprintJS.load();
  const result = await fp.get();
  const fingerprintDiv = document.getElementById('fingerprint');
  fingerprintDiv.textContent = `Fingerprint: ${result.visitorId}`;
}
