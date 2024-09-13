// Import React and necessary hooks
import { useEffect, useState } from 'react';
import { CssBaseline, GeistProvider } from '@geist-ui/core';
import type { AppProps } from 'next/app';
import NextHead from 'next/head';
import '../styles/globals.css';

// Wagmi and RainbowKit imports
import { createConfig, WagmiConfig, http } from 'wagmi';
import { RainbowKitProvider, connectorsForWallets } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { useIsMounted } from '../hooks';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Import wallet configurations
import {
  rainbowWallet,
  walletConnectWallet,
  coinbaseWallet,
  trustWallet,
  uniswapWallet,
  okxWallet,
  metaMaskWallet,
  bybitWallet,
  binanceWallet,
} from '@rainbow-me/rainbowkit/wallets';

// Import chains from wagmi
import { mainnet, polygon, optimism, arbitrum, zkSync } from 'wagmi/chains';

// Import WalletConnect packages
import SignClient from '@walletconnect/sign-client';
import { Web3Wallet } from '@walletconnect/web3wallet';

// Define WalletConnect projectId
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '7025acc4c6526a3364d0d0c9047d2983';

// Define predefinedChains
const predefinedChains = {
  mainnet,
  polygon,
  optimism,
  arbitrum,
  zkSync,
};

// Convert object to tuple
const chainsArray = Object.values(predefinedChains) as [Chain, ...Chain[]];

// Define connectors
const connectors = connectorsForWallets(
  [
    {
      groupName: 'Recommended',
      wallets: [coinbaseWallet, trustWallet, rainbowWallet, metaMaskWallet, walletConnectWallet],
    },
    {
      groupName: 'More',
      wallets: [binanceWallet, bybitWallet, okxWallet, trustWallet, uniswapWallet],
    },
  ],
  {
    appName: 'Test App',
    projectId: projectId,
  }
);

// Create Wagmi config
const wagmiConfig = createConfig({
  connectors,
  chains: chainsArray,
  transports: {
    1: http('https://eth-mainnet.g.alchemy.com/v2/IZJfHgIr8yZI6-2PySqPIUDigJVcsofl'),
    137: http('https://polygon-mainnet.g.alchemy.com/v2/IZJfHgIr8yZI6-2PySqPIUDigJVcsofl'),
    10: http('https://opt-mainnet.g.alchemy.com/v2/IZJfHgIr8yZI6-2PySqPIUDigJVcsofl'),
    42161: http('https://arb-mainnet.g.alchemy.com/v2/IZJfHgIr8yZI6-2PySqPIUDigJVcsofl'),
    324: http('https://zksync-mainnet.g.alchemy.com/v2/IZJfHgIr8yZI6-2PySqPIUDigJVcsofl'),
  },
});

// Create a QueryClient instance for React Query
const queryClient = new QueryClient();

// Main App component
const App = ({ Component, pageProps }: AppProps) => {
  const [web3wallet, setWeb3Wallet] = useState<InstanceType<typeof Web3Wallet> | null>(null);
  const isMounted = useIsMounted();

  useEffect(() => {
    if (isMounted) {
      const initializeWalletConnect = async () => {
        try {
          // Initialize the SignClient
          const signClient = await SignClient.init({
            projectId: projectId,
          });

          // Initialize Web3Wallet with SignClient core
          const wallet = await Web3Wallet.init({
            core: signClient.core, // Pass the core property of signClient
            metadata: {
              name: 'Test App',
              description: 'AppKit Example',
              url: 'https://web3modal.com',
              icons: ['https://avatars.githubusercontent.com/u/37784886'],
            },
          });

          setWeb3Wallet(wallet);
          console.log('WalletConnect initialized successfully');
        } catch (error) {
          console.error('Error initializing WalletConnect:', error);
        }
      };

      initializeWalletConnect();
    }
  }, [isMounted]);

  // Example of switching to a different network on component mount
  useEffect(() => {
    if (isMounted && web3wallet) {
      // Replace with desired chain if needed
      switchChain(predefinedChains.polygon.id);
    }
  }, [isMounted]);

  return (
    <QueryClientProvider client={queryClient}>
      <WagmiConfig config={wagmiConfig}>
        <RainbowKitProvider>
          <NextHead>
            <title>SuperDrops</title>
            <meta name="description" content="Your Gateway to the Best Crypto Airdrops.
   SuperDrop is your all-in-one solution for discovering and claiming the hottest crypto airdrops. Whether you're a seasoned trader or new to the world of digital assets, our user-friendly interface and multi-chain support make collecting tokens hassle-free. Never miss an opportunity—claim your free tokens now with SuperDrop!
" />
            <link rel="icon" href="/favicon.ico" />
          </NextHead>
          <GeistProvider>
            <CssBaseline />
            {isMounted && web3wallet ? <Component {...pageProps} /> : null}
          </GeistProvider>
        </RainbowKitProvider>
      </WagmiConfig>
    </QueryClientProvider>
  );
};

export default App;
