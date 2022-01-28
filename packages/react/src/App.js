import React, { useEffect, useState } from 'react';
import twitterLogo from './assets/twitter-logo.svg';
import './App.css';

import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, transformCharacterData } from './constants';
import nftGame from './utils/NftGame.json';
import LoadingIndicator from './Components/LoadingIndicator';
import SelectCharacter from './Components/SelectCharacter';
import Arena from './Components/Arena';

// Constants
const TWITTER_HANDLE = 'zh';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const App = () => {
  const [rightNetwork, setRightNetwork] = useState(false);
  const [currentAccount, setCurrentAccount] = useState(null);
  const [characterNFT, setCharacterNFT] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  /*
   * Since this method will take some time, make sure to declare it as async
   */
  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log('Make sure you have MetaMask!');
        /*
         * We set isLoading here because we use return in the next line
         */
        setIsLoading(false);
        return;
      } else {
        console.log('We have the ethereum object', ethereum);

        let chainId = await ethereum.request({ method: 'eth_chainId' });
        console.log('Connected to chain ' + chainId);
        // String, hex code of the chainId of the Rinkebey test network
        const rinkebyChainId = '0x4';
        setRightNetwork(chainId === rinkebyChainId);
        if (chainId !== rinkebyChainId) {
          setIsLoading(false);
          return;
        }

        /*
         * Check if we're authorized to access the user's wallet
         */
        const accounts = await ethereum.request({ method: 'eth_accounts' });

        /*
         * User can have multiple authorized accounts, we grab the first one if its there!
         */
        if (accounts.length !== 0) {
          const account = accounts[0];
          console.log('Found an authorized account:', account);
          setCurrentAccount(account);
        } else {
          console.log('No authorized account found');
        }
      }
    } catch (error) {
      console.log(error);
    }
    /*
     * We release the state property after all the function logic
     */
    setIsLoading(false);
  };

  useEffect(() => {
    /*
     * Anytime our component mounts, make sure to immiediately set our loading state
     */
    setIsLoading(true);
    checkIfWalletIsConnected();
  }, []);

  /*
   * Add this useEffect right under the other useEffect where you are calling checkIfWalletIsConnected
   */
  useEffect(() => {
    /*
     * The function we will call that interacts with out smart contract
     */
    const fetchNFTMetadata = async () => {
      console.log('Checking for Character NFT on address:', currentAccount);

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const gameContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        nftGame.abi,
        signer
      );

      const txn = await gameContract.checkIfUserHasNFT();
      console.log('NFT: ', txn);
      if (txn.name) {
        const transformedData = transformCharacterData(txn);
        if (transformedData.hp > 0) {
          console.log('User has character NFT');
          setCharacterNFT(transformedData);
        } else {
          console.log('Characted NFT is dead, mint a new one.');
        }
      } else {
        console.log('No character NFT found');
      }

      /*
       * Once we are done with all the fetching, set loading state to false
       */
      setIsLoading(false);
    };

    /*
     * We only want to run this, if we have a connected wallet
     */
    if (currentAccount) {
      console.log('CurrentAccount:', currentAccount);
      fetchNFTMetadata();
    }
  }, [currentAccount]);

  /*
   * Implement your connectWallet method here
   */
  const connectWalletAction = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log('Get MetaMask!');
        return;
      }

      /*
       * Fancy method to request access to account.
       */
      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });

      /*
       * Boom! This should print out public address once we authorize Metamask.
       */
      console.log('Connected', accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  // Render Methods
  const renderContent = () => {
    /*
     * If the app is currently loading, just render out LoadingIndicator
     */
    if (isLoading) {
      return <LoadingIndicator />;
    }

    /*
     * Not right network 0 return reconnect warning
     */
    if (!rightNetwork) {
      return <p className="sub-text">Please connect to Rinkeby and reload</p>;
    }

    if (!currentAccount) {
      return (
        <div className="connect-wallet-container">
          <img
            src="https://bestanimations.com/media/star-wars/1472638832star-wars-the-force-awakens-animated-gif-17.gif"
            alt="Star Wars Heroes"
          />
          <button
            className="cta-button connect-wallet-button"
            onClick={connectWalletAction}
          >
            Connect Wallet To Get Started
          </button>
        </div>
      );
    } else if (currentAccount && !characterNFT) {
      return <SelectCharacter setCharacterNFT={setCharacterNFT} />;
      /*
       * If there is a connected wallet and characterNFT, it's time to battle!
       */
    } else if (currentAccount && characterNFT) {
      return (
        <Arena characterNFT={characterNFT} setCharacterNFT={setCharacterNFT} />
      );
    }
  };

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">Star Wars Heroes</p>
          <p className="sub-text">Team up to fight the dark force!</p>
          <div className="connect-wallet-container">{renderContent()}</div>
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built by @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
