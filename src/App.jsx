import React, { useEffect, useState } from 'react';
import { ethers } from "ethers";
import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import JoviToken from './assets/JoviToken.json'
import JoviTokenCrowdsale from './assets/JoviTokenCrowdsale.json';

// Constants
const TOKEN_ADDRESS = '0x3CF0E053EE1b554E5054300B56EBa1EaD7162a25';
const CROWDSALE_ADDRESS = '0xfD8c0325BA3520bCF9399d7EACBAe8cb00369765';
const TWITTER_HANDLE = 'DsouzaJovian';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

function Footer() {
  return (
    <div className="footer-container">
      <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
      <a
        className="footer-text"
        href={TWITTER_LINK}
        target="_blank"
        rel="noreferrer"
      > {`built by @${TWITTER_HANDLE}`} </a>
    </div>
  );
}

function App() {

  const [currentAccount, setCurrentAccount] = useState("");

  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;
    if (!ethereum) {
      console.log("Make sure you have metamask");
      return;
    }
    else {
      console.log("We have a ethereum object", ethereum);
    }

    const accounts = await ethereum.request({ method: 'eth_accounts' });

    if (accounts.length != 0) {
      const account = accounts[0]
      console.log("Found an authorized account", account);
      setCurrentAccount(account);
    }
    else {
      console.log("Could not find authorized account");
    }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        console.log("Get Metamask");
        return;
      }
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      setCurrentAccount(accounts[0]);
    }
    catch (error) {
      console.log(error);
    }
  }

  const buyToken = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const crowdsale = new ethers.Contract(CROWDSALE_ADDRESS, JoviTokenCrowdsale.abi, signer);

        console.log("Going to pop wallet now to pay gas...")
        let nftTxn = await crowdsale.buyTokens(currentAccount, { value: ethers.utils.parseEther("0.003") });

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

  const checkBalance = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(TOKEN_ADDRESS, JoviToken.abi, signer);

        console.log("Going to pop wallet now to pay gas...")
        let balance = await contract.balanceOf(currentAccount);
        console.log("Balance ", ethers.utils.formatEther(balance));

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

    currentAccount === "" ? (
      <button onClick={connectWallet} className="cta-button connect-wallet-button">
        Connect Wallet
      </button>
    ) : (
      <div>
        <button onClick={buyToken} className="cta-button connect-wallet-button">
          Buy JoviToken
        </button>
      </div>
    )


  );

  function saleCard() {
    return (
      <div className="saleCard">
        <div className='row sale-row'>
          <p className="SaleHeader">Presale Ends in: </p>
        </div>

        <div className='row sale-row'>
          <div className='col-3 timeBox'>
            <p className='timeHeader'>15</p>
            <p className='timeBody'>DAYS</p>
          </div>

          <div className='col-3 timeBox'>
            <p className='timeHeader'>02</p>
            <p className='timeBody'>HOURS</p>
          </div>

          <div className='col-3 timeBox'>
            <p className='timeHeader'>45</p>
            <p className='timeBody'>MINS</p>
          </div>

          <div className='col-3 timeBox'>
            <p className='timeHeader'>53</p>
            <p className='timeBody'>SECS</p>
          </div>
        </div>

        <div className='row sale-row'>
          <p className='saleDesc'>Token Name: <span class="saleDescVal">JOVI</span></p>
          <p className='saleDesc'>Presale Supply: <span class="saleDescVal">100,000</span></p>
          <p className='saleDesc'>Presale Price: <span class="saleDescVal">1 ETH = 500</span></p>
        </div>

        <div className='row sale-row'>
          <div class="input-group">
            <input type="text" class="form-control" placeholder="Enter Amount of Token" />
          </div>
        </div>

        <div className='row sale-row'>
          <button onClick={buyToken} className="cta-button connect-wallet-button">
            Buy JoviToken
          </button>
        </div>
      </div>
    );
  }

  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])

  return (
    <div className="App container-fluid">
      <nav className="navbar">
        <div className="header-container">
          <p className="header gradient-text">JoviToken</p>
        </div>

        <div className="wallet-container">
          {renderNotConnectedContainer()}
        </div>


      </nav>

      <div className="row app-row app-container">
        <div className="col-6">
          <p className="sub-text">
            Buy JoviToken Now, To Get Rich In The Future.
          </p>

          <p className="sub-sub-text">
            JoviToken is more than just a Defi Token. It's the best DeFi Token and you can learn here about this crypto
          </p>

        </div>

        <div className="col-6">
          {saleCard()}
        </div>

        {Footer()}

      </div>
    </div>
  );
};

export default App;