import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { createAppKit } from '@reown/appkit'
import { mainnet, arbitrum } from '@reown/appkit/networks'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'

// 1. Get a project ID at https://cloud.reown.com
const projectId = '2715a50f9ddd7801359129d5d2b8c092'
const url = "https://secret-agent-game-service.zsrc0bmba5xht.ap-southeast-1.cs.amazonlightsail.com/";

const launhGameBtn = document.getElementById('launch-game')
const openConnectModalBtn = document.getElementById('modal-connect')
const walletAddressText = document.getElementById('wallet-address');

const networks = [mainnet, arbitrum]

function setWalletAddressText(msg){
    walletAddressText.textContent = `${msg}`;
}

function launchGame(walletAddress){
    openUrlWithParams(url, walletAddress);
}

function openUrlWithParams(baseUrl, params) {
  const queryParams = new URLSearchParams(params);
  const fullUrl = `${baseUrl}?${queryParams.toString()}`;

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
