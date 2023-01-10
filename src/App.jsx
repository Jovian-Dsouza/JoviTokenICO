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

  const buyToken = async (amount) => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const crowdsale = new ethers.Contract(CROWDSALE_ADDRESS, JoviTokenCrowdsale.abi, signer);

        let nftTxn = await crowdsale.buyTokens(currentAccount, { value: ethers.utils.parseEther(amount) });

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

  async function getTotalSupply() {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(TOKEN_ADDRESS, JoviToken.abi, signer);

        let totalSupply = await contract.totalSupply();
        let decimals = await contract.decimals();
        totalSupply = ethers.utils.formatUnits(totalSupply, decimals);
        totalSupply = ethers.utils.commify(totalSupply);

        return totalSupply;

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    }
    catch (error) {
      console.log(error)
    }
  }

  async function registerTotalSupplyChange(onChange) {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(TOKEN_ADDRESS, JoviToken.abi, signer);
        const decimals = await contract.decimals();

        contract.on("Transfer", (from, to, value, event) => {
          if (from === ethers.constants.AddressZero) {
            // const supplyIncrease = ethers.utils.formatUnits(value, decimals);
            onChange();
          }
        })

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    }
    catch (error) {
      console.log(error)
    }
  }

  async function getCrowdsaleData() {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const crowdsale = new ethers.Contract(CROWDSALE_ADDRESS, JoviTokenCrowdsale.abi, signer);
        const contract = new ethers.Contract(TOKEN_ADDRESS, JoviToken.abi, signer);

        // closing time
        let closingTime = await crowdsale.closingTime();
        closingTime = closingTime.mul(1000).toNumber();

        // stage
        let stage = await crowdsale.stage();
        if (stage == 0) {
          stage = "Presale";
        }
        else {
          stage = "ICO";
        }

        // rate
        let rate = await crowdsale.rate();
        rate = rate.toNumber();

        // investor min max amount
        let decimals = await contract.decimals();
        let investorMinAmount = await crowdsale.investorMinCap();
        investorMinAmount = ethers.utils.formatUnits(investorMinAmount, decimals);
        investorMinAmount = investorMinAmount.toString();
        let investorMaxAmount = await crowdsale.investorMaxCap();
        investorMaxAmount = ethers.utils.formatUnits(investorMaxAmount, decimals);
        investorMaxAmount = investorMaxAmount.toString();


        return { closingTime, stage, rate, investorMinAmount, investorMaxAmount };

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    }
    catch (error) {
      console.log(error)
    }
  }


  // Render Methods
  function Wallet() {
    return (
      currentAccount === "" ? (
        <button onClick={connectWallet} className="cta-button connect-wallet-button">
          Connect Wallet
        </button>
      ) : (
        <div>
          <p className='wallet-address'><span className='bold'>Connected:</span> {currentAccount}</p>
        </div>
      )
    );
  }

  function TimeBox(props) {
    const [timeleft, setTimeleft] = useState(0);

    useEffect(() => {
      let timer = setInterval(() => {
        setTimeleft((new Date(props.closingTime)) - (new Date()));
      }, 1000);

      return function cleanup() {
        clearInterval(timer);
      }
    });

    return (
      <div className='row sale-row timeBox-row'>
        <div className='col-3 timeBox mx-auto'>
          <p className='timeHeader'>{Math.floor(timeleft / (1000 * 60 * 60 * 24))}</p>
          <p className='timeBody'>DAYS</p>
        </div>

        <div className='col-3 timeBox mx-auto'>
          <p className='timeHeader'>{Math.floor((timeleft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))}</p>
          <p className='timeBody'>HOURS</p>
        </div>

        <div className='col-3 timeBox mx-auto'>
          <p className='timeHeader'>{Math.floor((timeleft % (1000 * 60 * 60)) / (1000 * 60))}</p>
          <p className='timeBody'>MINS</p>
        </div>

        <div className='col-3 timeBox mx-auto'>
          <p className='timeHeader'>{Math.floor((timeleft % (1000 * 60)) / 1000)}</p>
          <p className='timeBody'>SECS</p>
        </div>
      </div>
    );
  }

  function Buy(props) {
    const [tokenAmount, setTokenAmount] = useState("");

    function handleAmountInput(e) {
      setTokenAmount(e.target.value);
    }

    function handleBuy() {
      if (tokenAmount >= props.min && tokenAmount <= props.max) {
        buyToken(tokenAmount);
        setTokenAmount("");
      }
    }

    return (

      <div>
        <div className='row sale-row'>
          <div class="input-group">
            <div class="input-group-prepend">
              <span class="input-group-text">ETH</span>
            </div>

            <input type="number" min={props.min} max={props.max} step="any" onChange={handleAmountInput} value={tokenAmount} class="form-control" placeholder="Enter Amount" />

          </div>
        </div>

        <div className='row sale-row'>
          <button onClick={handleBuy} className="cta-button connect-wallet-button">
            Buy JoviToken
          </button>
        </div>
      </div>
    );
  }


  function TokenSupply(props) {
    const [totalSupply, setTotalSupply] = useState("");
    const [stateChange, setStateChange] = useState(false);

    useEffect(() => {
      (async () => {
        await registerTotalSupplyChange(() => {
          setStateChange(!stateChange);
        });
        setTotalSupply(await getTotalSupply());
      })();
    });

    return (
      <p className='saleDesc'>{props.stage} Supply: <span class="saleDescVal">{totalSupply}</span></p>
    );
  }

  function SaleCard() {
    const [closingTime, setClosingTime] = useState("");
    const [stage, setStage] = useState("");
    const [rate, setRate] = useState();
    const [investorMinAmount, setInvestorMinAmount] = useState("");
    const [investorMaxAmount, setInvestorMaxAmount] = useState("");

    useEffect(() => {

      (async () => {
        const crowdsaleData = await getCrowdsaleData();
        setClosingTime(crowdsaleData.closingTime);
        setStage(crowdsaleData.stage);
        setRate(crowdsaleData.rate);
        setInvestorMinAmount(crowdsaleData.investorMinAmount);
        setInvestorMaxAmount(crowdsaleData.investorMaxAmount);

      })();

    });

    return (

      (currentAccount === "") ? (
        ""
      ) : (
        <div className="col-lg-6">
          <div className="saleCard">
            <div className='row sale-row'>
              <p className="SaleHeader">{stage} Ends in: </p>
            </div>

            <TimeBox closingTime={closingTime} />

            <div className='row sale-row'>
              <p className='saleDesc'>Token Name: <span class="saleDescVal">JOVI</span></p>
              <TokenSupply stage={stage} />
              <p className='saleDesc'>{stage} Price: <span class="saleDescVal">1 ETH = {rate} JOVI</span></p>
            </div>

            <Buy min={investorMinAmount} max={investorMaxAmount} />

          </div>
        </div>
      )
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
          {Wallet()}
        </div>


      </nav>

      <div className="row app-row app-container">
        <div className="col-lg-6">
          <p className="sub-text">
            Buy JoviToken Now, To Get Rich In The Future.
          </p>

          <p className="sub-sub-text">
            JoviToken is more than just a Defi Token. It's the best DeFi Token and you can learn here about this crypto
          </p>

        </div>



        {SaleCard()}


        {Footer()}

      </div>
    </div>
  );
};

export default App;