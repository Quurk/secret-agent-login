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

let current_mode = LeaderboardMode.NONE;
let userLeaderboard;
let kolLeaderboard;
let gameWindow;

const itemsPerPage = 5;
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

function onDocumentLoaded(event){
  setGameRunningState(false);
  closeLeaderboard();
}

function onWindowLoaded(){
  setTimeout(type, 900);
}

function onWindowBeforeUnload(){
  setGameRunningState('false');
  gameWindow.close();
}


function openLeaderboard(){
  document.getElementById('leaderboard').style.display = '';
  document.getElementById('leaderboard-bg').style.display = '';

  // add a delay before close button appears
  setTimeout( () => {
    document.getElementById('btn-closeLeaderboard').classList.remove('hidden');
    document.getElementById('btn-closeLeaderboard').classList.add('fadeIn');
  }, 1000);
}

function closeLeaderboard() {
  document.getElementById('leaderboard').style.display = 'none';
  document.getElementById('leaderboard-bg').style.display = 'none';

  document.getElementById('btn-closeLeaderboard').classList.add('hidden');
}

function switchToKOLLeaderboard(kolLeaderboard){
  leaderboard_data = kolLeaderboard;
  current_mode = LeaderboardMode.KOL;

  currentPage = 1;
  totalPages = Math.ceil(kolLeaderboard.length / itemsPerPage);
  renderKOLLeaderboardPage(kolLeaderboard, currentPage);
  refreshPaginationButtons();

  document.getElementById('self-ranking').style.display = 'none';
  document.getElementById('leaderboard-label').textContent = 'Community Leaderboard';
  createHeaders(['Rank', 'KOL Codes', 'Unique Users', 'Total Points']);
}

function switchToIndividualLeaderboard(userLeaderboard){
  leaderboard_data = userLeaderboard;
  current_mode = LeaderboardMode.INDIVIDUAL;

  currentPage = 1;
  totalPages = Math.ceil(userLeaderboard.length / itemsPerPage);
  renderLeaderboardPage(userLeaderboard, currentPage);
  refreshPaginationButtons();

  document.getElementById('self-ranking').style.display = '';
  document.getElementById('leaderboard-label').textContent = 'Leaderboard';
  createHeaders(['Rank', 'UID', 'KOL Codes', 'Total Points']);
}

async function openLeaderboard_individual(){
  userLeaderboard = await fetchLeaderboard();
  switchToIndividualLeaderboard(userLeaderboard);
  openLeaderboard();
}
async function openLeaderboard_kol(){
  kolLeaderboard = await fetchKOLLeaderboard();
  switchToKOLLeaderboard(kolLeaderboard);
  openLeaderboard();
}


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
    const users = Object.values(result.data.users);
    totalPages = Math.ceil(users.length / itemsPerPage),
    currentPage = 1;
    renderLeaderboardPage(users, currentPage);

    return users;
  }
}

async function fetchKOLLeaderboard(){
  const url = 'https://4fi807plvh.execute-api.ap-southeast-1.amazonaws.com/default/SecretAgent_UserScoring?kol_leaderboard=true';
  // const url = 'https://m4asjpzuia.execute-api.ap-southeast-1.amazonaws.com/default/testPythonAPICAll'

  const result = await getRequest(url);
  if(result.success){
    const kolLeaderboard = Object.entries(result.data);
    totalPages = Math.ceil(kolLeaderboard.length / itemsPerPage),
    currentPage = 1;
    renderKOLLeaderboardPage(kolLeaderboard, currentPage);

    return kolLeaderboard;
  }
}




function nextPage(){
  currentPage += 1;

  if(current_mode === LeaderboardMode.INDIVIDUAL)
    renderLeaderboardPage(leaderboard_data, currentPage);
  else if(current_mode === LeaderboardMode.KOL)
    renderKOLLeaderboardPage(leaderboard_data, currentPage);
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

  updatePageNumber();
}

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
  const leaderboardContainer = document.getElementById('leaderboard-container');
  leaderboardContainer.className = 'container';
  leaderboardContainer.classList.add('moveRightToLeft');

  const leaderboardList = document.getElementById('leaderboard-list');


  while (leaderboardList.childNodes.length > 2) {
    if (leaderboardList.lastChild !== leaderboardList.firstChild) {
      leaderboardList.removeChild(leaderboardList.lastChild);
    } else {
      break;
    }
  }

  table.forEach((kolCodeEntry, index) => {
    const key = kolCodeEntry[0];
    const value = kolCodeEntry[1];

    const rank = index + 1;
    const kolCode = key;
    const numUniqueUsers = value.UniqueUser;
    const cumulativeScores = value.CumulativeScore;
    
    addScore_kol(rank, kolCode, numUniqueUsers, cumulativeScores);
  });

  function addScore_kol(rank, kolCode, numUniqueUsers, cumulativeScore){
    const scoreList = document.getElementById('leaderboard-list');
    const listItem = document.createElement('li');

    const rankSpan = document.createElement('span');
    rankSpan.classList.add('span');
    rankSpan.textContent = rank;
    listItem.append(rankSpan);
  
    const kolCodeSpan = document.createElement('span');
    kolCodeSpan.classList.add('span');
    kolCodeSpan.textContent = kolCode;
    listItem.append(kolCodeSpan);
  
    const numUniqueUsersSpan = document.createElement('span');
    numUniqueUsersSpan.classList.add('span');
    numUniqueUsersSpan.textContent = numUniqueUsers;
    listItem.append(numUniqueUsersSpan);
  
    const cumulativeScoreSpan = document.createElement('span');
    cumulativeScoreSpan.classList.add('span');
    cumulativeScoreSpan.textContent = cumulativeScore;
    listItem.append(cumulativeScoreSpan);
  
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
  const leaderboardContainer = document.getElementById('leaderboard-container');
  leaderboardContainer.className = 'container';
  leaderboardContainer.classList.add('moveLeftToRight');

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
    const rank = index + 1;
    const uid = user.UID;
    const KOLCodeUsed = user.KOLCodeUsed;
    const userTotalPoints = user.UserTotalPoints;


    addScore(rank, uid, KOLCodeUsed, userTotalPoints);

    // Update display for self ranking
    if (user.UID === getWalletAddress()) {
      updateRanking(rank);
    }
  });

  function addScore(rank, uid, KOLCodeUsed, totalPoints){
    const scoreList = document.getElementById('leaderboard-list');
    const listItem = document.createElement('li');

    const rankSpan = document.createElement('span');
    rankSpan.classList.add('span');
    rankSpan.textContent = rank;
    listItem.append(rankSpan);
    
    const uidSpan = document.createElement('span');
    uidSpan.classList.add('span');
    uidSpan.textContent = uid;
    listItem.append(uidSpan);
  
    const KOLCodeUsedSpan = document.createElement('span');
    KOLCodeUsedSpan.classList.add('span');
  
    let codes = '';
    KOLCodeUsed.forEach((code, index) =>{
      if(index == 0)
        codes+= `${code}`;
      else
        codes += `, ${code}`;
    });
    KOLCodeUsedSpan.textContent = codes;
    listItem.append(KOLCodeUsedSpan);
  
    const totalPointsSpan = document.createElement('span');
    totalPointsSpan.classList.add('span');
    totalPointsSpan.textContent = totalPoints;
    listItem.append(totalPointsSpan);
  
    scoreList.appendChild(listItem);
  }
}

function updateRanking(ranking) {
  const rankingElement = document.getElementById('self-ranking');
  rankingElement.textContent = `Your Ranking: #${ranking}`;
}

function updatePageNumber(){
  const pageNumberElement = document.getElementById('pageNumber');
  pageNumberElement.textContent = `${currentPage}/${totalPages}`;
}


/* 
Sample response
  {
    "body": {"statusCode": 200, "body": "{\"USER_AFTER_LOGIN\": {\"UniqueUser\": 3, \"CumulativeScore\": 100}, \"KOL_A\": {\"UniqueUser\": 2, \"CumulativeScore\": 80}, \"KOL_C\": {\"UniqueUser\": 3, \"CumulativeScore\": 80}, \"KOL_D\": {\"UniqueUser\": 1, \"CumulativeScore\": 25}, \"KOL_B\": {\"UniqueUser\": 2, \"CumulativeScore\": 80}, \"202502\": {\"UniqueUser\": 1, \"CumulativeScore\": 60}}", "headers": {"Content-Type": "application/json"}}
  }
*/
async function getRequest(url) {
  try {
    let response = await fetch(url, {
      method: 'GET'
    });

    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    let json = await response.json();
    const data = JSON.parse(json.body);
    console.log(json);
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

