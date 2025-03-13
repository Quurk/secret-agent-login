import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { createAppKit } from '@reown/appkit'
import { updateElementsVisibility } from './utils/dom'
import { mainnet, arbitrum } from '@reown/appkit/networks'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'

// Get a project ID at https://cloud.reown.com
// In local testing, gets from ".env" file. In production, gets from Github Secrets and Environment Variables in the repo.
const projectId = import.meta.env.VITE_REOWN_PROJECT_ID;
const url = import.meta.env.VITE_GAME_URL;
const url_leaderboard = import.meta.env.VITE_LEADERBOARD_URL;

const launhGameBtn = document.getElementById('btn-launchGame')
const openConnectModalBtn = document.getElementById('btn-connect')
const walletAddressText = document.getElementById('wallet-address');
const manageWalletBtn = document.getElementById('btn-manageWallet');

const networks = [mainnet, arbitrum]

let leaderboard_data;

const LeaderboardMode = {
  INDIVIDUAL: 'individual',
  KOL: 'kol',
  NONE: 'none'
};
let current_mode =LeaderboardMode.NONE;

const users = [
  {uid: '0x01', KOLCodes: ['KOLCode_A', 'KOLCode_B'], totalPoints: 35},
  {uid: '0x02', KOLCodes: ['KOLCode_A'], totalPoints: 345},
  {uid: '0x03', KOLCodes: ['KOLCode_A', 'KOLCode_B', "KOLCode_C"], totalPoints: 15},
  {uid: '0x01', KOLCodes: ['KOLCode_A', 'KOLCode_B'], totalPoints: 35},
  {uid: '0x02', KOLCodes: ['KOLCode_A'], totalPoints: 345},
  {uid: '0x03', KOLCodes: ['KOLCode_A', 'KOLCode_B', "KOLCode_C"], totalPoints: 15},
  {uid: '0x01', KOLCodes: ['KOLCode_A', 'KOLCode_B'], totalPoints: 35},
  {uid: '0x02', KOLCodes: ['KOLCode_A'], totalPoints: 345},
  {uid: '0x03', KOLCodes: ['KOLCode_A', 'KOLCode_B', "KOLCode_C"], totalPoints: 15},
  {uid: '0x01', KOLCodes: ['KOLCode_A', 'KOLCode_B'], totalPoints: 35},
  {uid: '0x02', KOLCodes: ['KOLCode_A'], totalPoints: 345},
  {uid: '0x03', KOLCodes: ['KOLCode_A', 'KOLCode_B', "KOLCode_C"], totalPoints: 15},
  {uid: '0x01', KOLCodes: ['KOLCode_A', 'KOLCode_B'], totalPoints: 35},
  {uid: '0x02', KOLCodes: ['KOLCode_A'], totalPoints: 345},
  {uid: '0x03', KOLCodes: ['KOLCode_A', 'KOLCode_B', "KOLCode_C"], totalPoints: 15},
  {uid: '0x01', KOLCodes: ['KOLCode_A', 'KOLCode_B'], totalPoints: 35},
  {uid: '0x02', KOLCodes: ['KOLCode_A'], totalPoints: 345},
  {uid: '0x03', KOLCodes: ['KOLCode_A', 'KOLCode_B', "KOLCode_C"], totalPoints: 15},
  {uid: '0x01', KOLCodes: ['KOLCode_A', 'KOLCode_B'], totalPoints: 35},
  {uid: '0x02', KOLCodes: ['KOLCode_A'], totalPoints: 345},
  {uid: '0x03', KOLCodes: ['KOLCode_A', 'KOLCode_B', "KOLCode_C"], totalPoints: 15},
  // {uid: '0x01', KOLCodes: ['KOLCode_A', 'KOLCode_B'], totalPoints: 35},
  // {uid: '0x02', KOLCodes: ['KOLCode_A'], totalPoints: 345},
  // {uid: '0x03', KOLCodes: ['KOLCode_A', 'KOLCode_B', "KOLCode_C"], totalPoints: 15},
];

const kolLeaderboard = [
  {kolCode: 'KOLCode_A', numUniqueUsers: 3, totalPoints: 99},
  {kolCode: 'KOLCode_B', numUniqueUsers: 3, totalPoints: 99},
  {kolCode: 'KOLCode_C', numUniqueUsers: 3, totalPoints: 99},
  {kolCode: 'KOLCode_A', numUniqueUsers: 3, totalPoints: 99},
  {kolCode: 'KOLCode_A', numUniqueUsers: 3, totalPoints: 99},
  {kolCode: 'KOLCode_A', numUniqueUsers: 3, totalPoints: 99},
  {kolCode: 'KOLCode_B', numUniqueUsers: 7, totalPoints: 33 },
  {kolCode: 'KOLCode_D', numUniqueUsers: 2, totalPoints: 84 },
  {kolCode: 'KOLCode_C', numUniqueUsers: 9, totalPoints: 77 },
  {kolCode: 'KOLCode_A', numUniqueUsers: 4, totalPoints: 15 },
  {kolCode: 'KOLCode_A', numUniqueUsers: 3, totalPoints: 99},
  {kolCode: 'KOLCode_A', numUniqueUsers: 3, totalPoints: 99},
  {kolCode: 'KOLCode_A', numUniqueUsers: 3, totalPoints: 99},
  {kolCode: 'KOLCode_A', numUniqueUsers: 3, totalPoints: 99},
  {kolCode: 'KOLCode_A', numUniqueUsers: 3, totalPoints: 99},
]

let gameWindow;
const itemsPerPage = 10;
let currentPage = 1;
let totalPages = -1;

const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks
})

const metadata = {
  name: 'AppKit',
  description: 'AppKit Example',
  url: 'https://reown.com/appkit', // origin must match your domain & subdomain
  icons: ['https://avatars.githubusercontent.com/u/179229932']
}

const appkit = createAppKit({
  adapters: [wagmiAdapter],
  networks: [mainnet, arbitrum],
  metadata,
  projectId,
  features: {
  analytics: true // Optional - defaults to your Cloud configuration
  }
})

document.addEventListener('DOMContentLoaded', (event) => {
  onDocumentLoaded(event);
});

window.onload = () => {
  onWindowLoaded();
};

window.addEventListener('beforeunload', () => {
  onWindowBeforeUnload();
});



document.getElementById('btn-nextPage').addEventListener('click', nextPage);
document.getElementById('btn-previousPage').addEventListener('click', previousPage);
document.getElementById('btn-openLeaderboard-individual').addEventListener('click', openLeaderboard_individual);
document.getElementById('btn-openLeaderboard-kol').addEventListener('click', openLeaderboard_kol);
document.getElementById('btn-closeLeaderboard').addEventListener('click', closeLeaderboard);


openConnectModalBtn.addEventListener('click', () => appkit.open())
manageWalletBtn.addEventListener('click', () => appkit.open())
launhGameBtn.addEventListener('click', ()=> launchGame(getWalletAddress()));
appkit.subscribeState( (newState) => onAppkitStateChanged());


createApp(App).mount('#app')







function onDocumentLoaded(event){
  setGameRunningState(false);
  closeLeaderboard();
  //fetchLeaderboard();
}

function onWindowLoaded(){
  setTimeout(type, 900);
}

function onWindowBeforeUnload(){
  setGameRunningState('false');
  gameWindow.close();
}


function openLeaderboard(){
  //fetchLeaderboard();

  document.getElementById('leaderboard').style.display = '';
  document.getElementById('leaderboard-bg').style.display = '';
}

function closeLeaderboard() {
  document.getElementById('leaderboard').style.display = 'none';
  document.getElementById('leaderboard-bg').style.display = 'none';
}

function switchToKOLLeaderboard(){
  leaderboard_data = kolLeaderboard;
  current_mode = LeaderboardMode.KOL;

  currentPage = 1;
  totalPages = Math.ceil(kolLeaderboard.length / itemsPerPage);
  renderKOLLeaderboardPage(kolLeaderboard, currentPage);
  refreshPaginationButtons();

  document.getElementById('self-ranking').style.display = 'none';
  document.getElementById('leaderboard-label').textContent = 'KOL Leaderboard';
  createHeaders(['KOL Codes', 'Unique Users', 'Total Points']);
}

function switchToIndividualLeaderboard(){
  leaderboard_data = users;
  current_mode = LeaderboardMode.INDIVIDUAL;

  currentPage = 1;
  totalPages = Math.ceil(users.length / itemsPerPage);
  renderLeaderboardPage(users, currentPage);
  refreshPaginationButtons();

  document.getElementById('self-ranking').style.display = '';
  document.getElementById('leaderboard-label').textContent = 'Leaderboard';
  createHeaders(['UID', 'KOL Codes', 'Total Points']);
}

function openLeaderboard_individual(){
  switchToIndividualLeaderboard();
  openLeaderboard();
}
function openLeaderboard_kol(){
  switchToKOLLeaderboard();
  openLeaderboard();
}

// function openLeaderboard_kol(){
//   //fetchLeaderboard();
//   currentPage = 1;
//   totalPages = Math.ceil(kolLeaderboard.length / itemsPerPage);
//   renderKOLLeaderboardPage(kolLeaderboard, currentPage);
//   refreshPaginationButtons_kol();
//   console.log("open");

//   document.getElementById('kol-leaderboard').style.display = '';
//   document.getElementById('kol-leaderboard-bg').style.display = '';
// }

// function closeLeaderboard_kol() {
//   document.getElementById('kol-leaderboard').style.display = 'none';
//   document.getElementById('kol-leaderboard-bg').style.display = 'none';
// }


function onAppkitStateChanged(newState){
  const isConnected = appkit.getIsConnectedState();

  updateElementsVisibility(isConnected);
  
  if(!isConnected){
    setWalletAddressText("Not Connected");
    openConnectModalBtn.textContent = "Connect";
  }
  else{
    setWalletAddressText(`${getWalletAddress()}`);
    openConnectModalBtn.textContent = "Connected \u2713";
  }
}

const getWalletAddress = function getAddress(){
  let address = appkit.getAddress();
  return address.toLowerCase();
}

function setWalletAddressText(msg){
  walletAddressText.textContent = `${msg}`;
}

function launchGame(walletAddress){
  if (isGameRunning()) {
    alert('The game is already running in another tab.');
    return;
  } 
  else {
    setGameRunningState('true');

    const params = new URLSearchParams({
      walletAddress: walletAddress
    })
    openUrlWithParams(url, params);
  }
}

function isGameRunning() {
  return localStorage.getItem('gameRunning') === 'true';
}

// Set the game state in local storage
function setGameRunningState(state) {
  localStorage.setItem('gameRunning', state);
}


function openUrlWithParams(baseUrl, params) {
  const fullUrl = `${baseUrl}?${params.toString()}`;
  gameWindow = createGameWindow(fullUrl);
}

function createGameWindow(fullUrl){
  const gameWindow = window.open(fullUrl, '_blank');
  gameWindow.addEventListener('beforeunload', () => {
    setGameRunningState('false');
  });

  const checkWindowClosed = setInterval(() => {
    if (gameWindow.closed) {
        setGameRunningState('false');
        clearInterval(checkWindowClosed);
    }
  }, 1000);

  gameWindow.addEventListener('focus', () => {
      setGameRunningState('true');
  });

  return gameWindow;
}

const element = document.getElementById('typewriter');
const text = element.innerHTML;

let index = 0;
element.innerHTML = "";
function type() {
  if (index < text.length) {
    element.innerHTML += text.charAt(index);
    index++;
    setTimeout(type, 135); // Speed for each letter to appear (ms)
  }
}


async function fetchLeaderboard(){
  const url = 'https://4fi807plvh.execute-api.ap-southeast-1.amazonaws.com/default/SecretAgent_UserScoring?limit=100';

  const result = await getRequest(url);
  if(result.success){
    totalPages = Math.ceil(data.length / itemsPerPage),
    currentPage = 1;
    renderLeaderboardPage(data, currentPage);
  }
}

async function fetchKOLLeaderboard(){
  const url = 'https://4fi807plvh.execute-api.ap-southeast-1.amazonaws.com/default/SecretAgent_UserScoring?kol_leaderboard=true';

  const result = await getRequest(url);
  if(result.success){
    totalPages = Math.ceil(data.length / itemsPerPage),
    currentPage = 1;
    renderLeaderboardPage(data, currentPage);
  }
}

async function getRequest(url) {
  try {
    let response = await fetch(url, {
      method: 'GET'
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    let data = await response.json();
    console.log(data);

    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.error('Error fetching leaderboard:', error);

    return {
      success: false,
      error: error.message
    };
  }
}


// async function fetchLeaderboard(all = false) {
//   const itemsPerPage = 1;
//   if(all){
//     const url = `https://4fi807plvh.execute-api.ap-southeast-1.amazonaws.com/default/SecretAgent_UserScoring`;
//     try {
//       let response = await fetch(url, {
//           method: 'GET', // or 'POST' if you're making a POST request
//       });
      
//       if (!response.ok) {
//           throw new Error(`HTTP error! Status: ${response.status}`);
//       }
//       let data = await response.json();
//       console.log(data);

//       totalPages = Math.ceil(data.length / itemsPerPage),
//       currentPage = 1;
//       renderLeaderboardPage(data, currentPage);

//       // Process the leaderboard data here
//     } catch (error) {
//         console.error('Error fetching leaderboard:', error);
//     }
//   }
//   else{
//     const url = `https://4fi807plvh.execute-api.ap-southeast-1.amazonaws.com/default/SecretAgent_UserScoring?limit=${itemsPerPage}`;
//     try {
//         let response = await fetch(url, {
//             method: 'GET', // or 'POST' if you're making a POST request
//         });
        
//         if (!response.ok) {
//             throw new Error(`HTTP error! Status: ${response.status}`);
//         }
//         let data = await response.json();
//         console.log(data);
  
//         //renderLeaderboard(data);
  
//         // Process the leaderboard data here
//     } catch (error) {
//         console.error('Error fetching leaderboard:', error);
//     }
//   }

// }

// function nextPage_kol(){
//   currentPage += 1;
//   renderKOLLeaderboardPage(kolLeaderboard, currentPage);
// }

// function previousPage_kol(){
//   currentPage -= 1;
//   renderKOLLeaderboardPage(kolLeaderboard, currentPage);
// }


function nextPage(){
  currentPage += 1;

  if(current_mode === LeaderboardMode.INDIVIDUAL)
    renderLeaderboardPage(leaderboard_data, currentPage);
  else if(current_mode === LeaderboardMode.KOL)
    renderKOLLeaderboardPage(leaderboard_data, currentPage);
  console.log('next');
}

function previousPage(){
  currentPage -= 1;

  if(current_mode === LeaderboardMode.INDIVIDUAL)
    renderLeaderboardPage(leaderboard_data, currentPage);
  else if(current_mode === LeaderboardMode.KOL)
    renderKOLLeaderboardPage(leaderboard_data, currentPage);
}

function refreshPaginationButtons(){
  if(currentPage == 1)
    document.getElementById("btn-previousPage").classList.add('invisible');
  else 
    document.getElementById("btn-previousPage").classList.remove('invisible');

  if(currentPage == totalPages)
    document.getElementById("btn-nextPage").classList.add('invisible');
  else 
    document.getElementById("btn-nextPage").classList.remove('invisible');
}

// function refreshPaginationButtons_kol(){
//   if(currentPage == 1)
//     document.getElementById("btn-previousPage-kol").classList.add('invisible');
//   else 
//     document.getElementById("btn-previousPage-kol").classList.remove('invisible');

//   if(currentPage == totalPages)
//     document.getElementById("btn-nextPage-kol").classList.add('invisible');
//   else 
//     document.getElementById("btn-nextPage-kol").classList.remove('invisible');
// }


function processPageItems(data, pageNumber){
  const startIndex = (pageNumber - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const pageItems = data.slice(startIndex, endIndex);
  return pageItems;
}

function renderKOLLeaderboardPage(data, pageNumber){
  const pageItems = processPageItems(data, pageNumber);
  renderKOLLeaderboard(pageItems);
  refreshPaginationButtons();
}

function renderKOLLeaderboard(table){
  const leaderboardList = document.getElementById('leaderboard-list');


  while (leaderboardList.childNodes.length > 2) {
    if (leaderboardList.lastChild !== leaderboardList.firstChild) {
      leaderboardList.removeChild(leaderboardList.lastChild);
    } else {
      break;
    }
  }

  table.forEach((kolCodeEntry, index) => {
    const rank = index+1;
    addEntry(kolCodeEntry.kolCode, kolCodeEntry.numUniqueUsers, kolCodeEntry.totalPoints);
  });

  function addEntry(kolCode, numUniqueUsers, totalPoints){
    const scoreList = document.getElementById('leaderboard-list');
    const listItem = document.createElement('li');
    
    const kolCodeSpan = document.createElement('span');
    kolCodeSpan.classList.add('span');
    kolCodeSpan.textContent = kolCode;
    listItem.append(kolCodeSpan);

    const numUniqueUsersSpan = document.createElement('span');
    numUniqueUsersSpan.classList.add('span');
    numUniqueUsersSpan.textContent = numUniqueUsers;
    listItem.append(numUniqueUsersSpan);

    const totalPointsSpan = document.createElement('span');
    totalPointsSpan.classList.add('span');
    totalPointsSpan.textContent = totalPoints;
    listItem.append(totalPointsSpan);

    scoreList.appendChild(listItem);
  }
}

function renderLeaderboardPage(data, pageNumber){
  const pageItems = processPageItems(data, pageNumber);
  renderLeaderboard(pageItems);
  refreshPaginationButtons();
}

function createHeaders(headers){
  const leaderboardList = document.getElementById('leaderboard-list');
  const header = leaderboardList.querySelector('.header');

  // clear existing headers
  while(header.childNodes.length > 1){
    header.removeChild(header.lastChild);
  }

  headers.forEach((label, index) => {
    const labelSpan = document.createElement('span');
    labelSpan.classList.add(`col${index+1}`);
    labelSpan.textContent = label;
    header.appendChild(labelSpan);
  });
}

function renderLeaderboard(table) {
  const leaderboardList = document.getElementById('leaderboard-list');

  // clear entries
  while (leaderboardList.childNodes.length > 2) {
    if (leaderboardList.lastChild !== leaderboardList.firstChild) {
      leaderboardList.removeChild(leaderboardList.lastChild);
    } else {
      break;
    }
  }


  table.forEach((user, index) => {
    const rank = index+1;
    addScore(user.uid, user.KOLCodes, user.totalPoints);

    // Update display for self ranking
    if (user.uid === '0x01') {
      updateRanking(user.totalPoints);
    }
  });

  function addScore(uid, KOLCodes, totalPoints){
    const scoreList = document.getElementById('leaderboard-list');
    const listItem = document.createElement('li');
    
    const uidSpan = document.createElement('span');
    uidSpan.classList.add('span');
    uidSpan.textContent = uid;
    listItem.append(uidSpan);

    const KOLCodesSpan = document.createElement('span');
    KOLCodesSpan.classList.add('span');

    let codes = '';
    KOLCodes.forEach((code, index) =>{
      if(index == 0)
        codes+= `${code}`;
      else
        codes += `, ${code}`;
    });
    KOLCodesSpan.textContent = codes;
    listItem.append(KOLCodesSpan);

    const totalPointsSpan = document.createElement('span');
    totalPointsSpan.classList.add('span');
    totalPointsSpan.textContent = totalPoints;
    listItem.append(totalPointsSpan);

    scoreList.appendChild(listItem);
  }
}

function updateRanking(ranking) {
  const rankingElement = document.getElementById('self-ranking');
  rankingElement.textContent = `Your Total Points: ${ranking}`;
}
