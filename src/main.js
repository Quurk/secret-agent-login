import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { createAppKit } from '@reown/appkit'
import { mainnet, arbitrum } from '@reown/appkit/networks'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'

// 1. Get a project ID at https://cloud.reown.com
const projectId = import.meta.env.VITE_PROJECT_ID;
const url = import.meta.env.VITE_GAME_URL;

const launhGameBtn = document.getElementById('launch-game')
const openConnectModalBtn = document.getElementById('modal-connect')
const walletAddressText = document.getElementById('wallet-address');

const networks = [mainnet, arbitrum]

function setWalletAddressText(msg){
    walletAddressText.textContent = `${msg}`;
}

function launchGame(walletAddress){
    const params = new URLSearchParams({
      walletAddress: walletAddress
    })
    openUrlWithParams(url, params);
}

function openUrlWithParams(baseUrl, params) {
  const fullUrl = `${baseUrl}?${params.toString()}`;

  window.open(fullUrl, '_blank');
}

// 2. Set up Wagmi adapter
const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks
})

// 3. Configure the metadata
const metadata = {
  name: 'AppKit',
  description: 'AppKit Example',
  url: 'https://reown.com/appkit', // origin must match your domain & subdomain
  icons: ['https://avatars.githubusercontent.com/u/179229932']
}

// 3. Create the modal
const modal = createAppKit({
  adapters: [wagmiAdapter],
  networks: [mainnet, arbitrum],
  metadata,
  projectId,
  features: {
    analytics: true // Optional - defaults to your Cloud configuration
  }
})

const getWalletAddress = function getAddress(){
    let address = modal.getAddress();
    return address.toLowerCase();
}

modal.subscribeWalletInfo( ()=> setWalletAddressText(getWalletAddress()));
openConnectModalBtn.addEventListener('click', () => modal.open())
launhGameBtn.addEventListener('click', ()=> launchGame(getWalletAddress()));

// modal.subscribeState( () )


createApp(App).mount('#app')
