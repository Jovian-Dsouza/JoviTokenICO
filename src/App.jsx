import React, {useEffect, useState} from 'react';
import { ethers } from "ethers";
import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
//import myEpicNft from './assets/MyEpicNFT.json';

// Constants
const TWITTER_HANDLE = 'DsouzaJovian';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const App = () => {

  const [currentAccount, setCurrentAccount] = useState("");
  
  const checkIfWalletIsConnected =  async () => {
    const { ethereum } = window;
    if(!ethereum){
      console.log("Make sure you have metamask");
      return;
    }
    else{
      console.log("We have a ethereum object", ethereum);
    }

    const accounts = await ethereum.request({method: 'eth_accounts'});

    if(accounts.length != 0){
      const account = accounts[0]
      console.log("Found an authorized account", account);
      setCurrentAccount(account);
      setupEventListner();
    }
    else{
      console.log("Could not find authorized account");
    }
  }

  const connectWallet = async () => {
    try{
      const {ethereum} = window;
      if(!ethereum){
        console.log("Get Metamask");
        return;
      }
      const accounts = await ethereum.request({method: 'eth_requestAccounts'});
      setCurrentAccount(accounts[0]);
      setupEventListener();
    }
    catch(error) {
      console.log(error);
    }
  }

  const setupEventListener = async () => {
    try {
      const {ethereum} = window;

      if(ethereum){
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer)

        connectedContract.on("NewEpicNFTMinted", (from, token) => {
          console.log(from, tokenId.toNumber())
          alert(`Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`)
        })

         console.log("Setup event listener!")
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }
  
  const askContractToMintNft = async () => {
    const CONTRACT_ADDRESS = "0xC3a39D1A0fa31293Cd370320ED476CABAC2aC1c0";

    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);
  
        console.log("Going to pop wallet now to pay gas...")
        let nftTxn = await connectedContract.makeAnEpicNFT();
  
        console.log("Mining...please wait.")
        await nftTxn.wait();
        
        console.log(`Mined, see transaction: https://goerli.etherscan.io/tx/${nftTxn.hash}`);
  
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    }
    catch (error) {
      console.log(error)
    }
  }
  
  // Render Methods
  const renderNotConnectedContainer = () => (
    <button onClick={connectWallet} className="cta-button connect-wallet-button">
      Connect to Wallet
    </button>
  );

  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">JoviToken</p>
          <p className="sub-text">
            Buy JoviToken Now, To Get Rich In The Future. 
          </p>
          
          {currentAccount === "" ? (
            renderNotConnectedContainer()
          ) : (
            <button onClick={askContractToMintNft} className="cta-button connect-wallet-button">
              Mint NFT
            </button>
          )}
          
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          > {`built by @${TWITTER_HANDLE}`} </a>
        </div>
      </div>
    </div>
  );
};

export default App;