import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import epicNft from './utils/EpicNFT.json';

// Constants
const TWITTER_HANDLE = 'enriikke';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = 'https://testnets.opensea.io/assets';
const COLLECTION_LINK = 'https://testnets.opensea.io/collection/squarenft-auvdfw9qrp'
const TOTAL_MINT_COUNT = 50;
const CONTRACT_ADDRESS = "0x27a0B56e7A181b3A985E0805EC16C15BAaF78B59";
const RINKEBY_CHAIN_ID = "0x4";

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [isMinting, setIsMinting] = React.useState(false);
  const [mintCount, setMintCount] = React.useState(0);

  const checkIfWalletIsConnected = async () => {
    /*
    * First make sure we have access to window.ethereum
    */
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have metamask!");
      return;
    } else {
      console.log("We have the ethereum object", ethereum);
    }

    const accounts = await ethereum.request({ method: 'eth_accounts' });
    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      setCurrentAccount(account)
      setupEventListener()
    } else {
        console.log("No authorized account found")
    }
  }

  const checkMintCount = async () => {
    try {
      const network = ethers.providers.getNetwork("rinkeby");
      const provider = ethers.getDefaultProvider(network);
      const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, epicNft.abi, provider);

      const num = await connectedContract.getTotalNFTsMintedSoFar();
      setMintCount(Number(num));
      console.log("Updated mint count!");
    } catch (error) {
      console.log(error);
    }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      /*
      * Fancy method to request access to account.
      */
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      /*
      * Boom! This should print out public address once we authorize Metamask.
      */
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
      setupEventListener()

      let chainId = await ethereum.request({ method: 'eth_chainId' });
      console.log("Connected to chain " + chainId);

      // String, hex code of the chainId of the Rinkebey test network
      if (chainId !== RINKEBY_CHAIN_ID) {
        alert("You are not connected to the Rinkeby Test Network!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  const setupEventListener = async () => {
    // Most of this looks the same as our function askContractToMintNft
    try {
      const { ethereum } = window;

      if (ethereum) {
        // Same stuff again
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, epicNft.abi, signer);

        // THIS IS THE MAGIC SAUCE.
        // This will essentially "capture" our event when our contract throws it.
        // If you're familiar with webhooks, it's very similar to that!
        connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber())
          alert(`Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: ${OPENSEA_LINK}/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`)
        });

        console.log("Setup event listener!")

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  const askContractToMintNft = async () => {
    setIsMinting(true);

    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, epicNft.abi, signer);

        console.log("Going to pop wallet now to pay gas...")
        let nftTxn = await connectedContract.makeAnEpicNFT();

        console.log("Mining...please wait.")
        await nftTxn.wait();

        console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }

    setIsMinting(false);
}

  useEffect(() => {
    checkIfWalletIsConnected();
    checkMintCount();
  // eslint-disable-next-line
  }, [])

  const renderCTA = () => {
    if (currentAccount === "") {
      return(
        <button onClick={connectWallet} className="cta-button connect-wallet-button">
          Connect to Wallet
        </button>
      );
    } else {
      return (
        <button onClick={askContractToMintNft} className="cta-button connect-wallet-button" disabled={isMinting}>
          {isMinting ? 'Minting...' : 'Mint NFT'}
        </button>
      );
    }
  }

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">My NFT Collection</p>
          <p className="sub-text">
            Each unique. Each beautiful. Discover your NFT today.
          </p>
          {renderCTA()}
        </div>

        <div className="mint-count-container">
          <p className="mint-count">
            {mintCount}/{TOTAL_MINT_COUNT} NFTs minted so far!
          </p>
        </div>

        <div>
          <a className="collection-link" href={COLLECTION_LINK} target="_blank" rel="noreferrer">
            🌊 View Collection on OpenSea
          </a>
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
