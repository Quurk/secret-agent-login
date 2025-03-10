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

const launhGameBtn = document.getElementById('btn-launchGame')
const openConnectModalBtn = document.getElementById('btn-connect')
const walletAddressText = document.getElementById('wallet-address');
const manageWalletBtn = document.getElementById('btn-manageWallet');
const leaderboardBtn = document.getElementById('toggleBtn-leaderboard');
const leaderboard = document.getElementById('leaderboard');

const networks = [mainnet, arbitrum]

const users = [
  { name: 'Player1', points: 1200 },
  { name: 'Player2', points: 1100 },
  { name: 'Player3', points: 1000 },
  { name: 'Player4', points: 900 },
  { name: 'Player1', points: 1200 },
  { name: 'Player2', points: 1100 },
  { name: 'Player3', points: 1000 },
  { name: 'Player4', points: 900 },
  { name: 'Player1', points: 1200 },
  { name: 'Player2', points: 1100 },
  { name: 'Player3', points: 1000 },
  { name: 'Player4', points: 900 },
  { name: 'Player1', points: 1200 },
  { name: 'Player2', points: 1100 },
  { name: 'Player3', points: 1000 },
  { name: 'Player4', points: 900 },
  { name: 'Player1', points: 1200 },
  { name: 'Player2', points: 1100 },
  { name: 'Player3', points: 1000 },
  { name: 'Player4', points: 900 },
  { name: 'Player1', points: 1200 },
  { name: 'Player2', points: 1100 },
  { name: 'Player3', points: 1000 },
  { name: 'Player4', points: 900 },
  { name: 'Player1', points: 1200 },
  { name: 'Player2', points: 1100 },
  { name: 'Player3', points: 1000 },
  { name: 'Player4', points: 900 },
  { name: 'Player1', points: 1200 },
  { name: 'Player2', points: 1100 },
  { name: 'Player3', points: 1000 },
  { name: 'Player4', points: 900 },
  { name: 'Player1', points: 1200 },
  { name: 'Player2', points: 1100 },
  { name: 'Player3', points: 1000 },
  { name: 'Player4', points: 900 },
  { name: 'Player1', points: 1200 },
  { name: 'Player2', points: 1100 },
  { name: 'Player3', points: 1000 },
  { name: 'Player4', points: 900 },
  { name: 'Player1', points: 1200 },
  { name: 'Player2', points: 1100 },
  { name: 'Player3', points: 1000 },
  { name: 'Player4', points: 900 },
  { name: 'Player1', points: 1200 },
  { name: 'Player2', points: 1100 },
  { name: 'Player3', points: 1000 },
  { name: 'Player4', points: 900 },
];

let gameWindow;

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

 populateLeaderboard(users);

openConnectModalBtn.addEventListener('click', () => appkit.open())
manageWalletBtn.addEventListener('click', () => appkit.open())
launhGameBtn.addEventListener('click', ()=> launchGame(getWalletAddress()));
appkit.subscribeState( (newState) => onAppkitStateChanged());

//addToggle('toggleBtn-leaderboard', 'leaderboard')

createApp(App).mount('#app')


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
function populateLeaderboard(table) {
  const leaderboardList = document.getElementById('leaderboard-list');
  leaderboardList.innerHTML = ''; // Clear existing content

  table.forEach((user, index) => {
    const listItem = document.createElement('li');
    listItem.textContent = `${index + 1}. ${user.name} - ${user.points} points`;
    leaderboardList.appendChild(listItem);
  });
}
