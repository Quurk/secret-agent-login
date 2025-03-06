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

const networks = [mainnet, arbitrum]

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
    setGameRunningState(false);
});

window.onload = () => {
  setTimeout(type, 900);
};

window.addEventListener('beforeunload', () => {
  setGameRunningState('false');
  gameWindow.close();
});


openConnectModalBtn.addEventListener('click', () => appkit.open())
manageWalletBtn.addEventListener('click', () => appkit.open())
launhGameBtn.addEventListener('click', ()=> launchGame(getWalletAddress()));


appkit.subscribeState( (newState) => onAppkitStateChanged());
createApp(App).mount('#app')



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
    setTimeout(type, 135); // Adjust the speed here (100ms for each letter)
  }
  // else{
  //   setTimeout(
  //     ()=> {
  //       const typewriter = document.getElementById('typewriter');
  //       typewriter.classList.add('no-cursor');
  //     },
  //     1500
  //   );
  // }
}
