import { useEffect, useRef, useState } from "react";
import LedgerLiveApi, { BitcoinTransaction, EthereumTransaction, FAMILIES, WindowMessageTransport } from "@ledgerhq/live-app-sdk";
import BigNumber from "bignumber.js";
import "./App.css";
import MobilumWidget from "./components/Mobilum/MobilumWidget";

const App = () => {
  // Define the Ledger Live API variable used to call api methods
  const api = useRef<LedgerLiveApi>();
  const [currency, setCurrency] = useState('');
  const [el, setEl] = useState(false);
  // componentDidMount = () => {
  //   const divElement = document.getElementbyId('id');
  //   if (divElement) {
  //      this.doStuffWith(divElement);
  //   } else {
  //      this.observer = new MutationObserver(() => {
  //         const divElement = document.getElementbyId('id');
  //         if (divElement) {
  //            this.removeObserver();
  //            this.doStuffWith(divElement);
  //         }
  //      });
  //      this.observer.observe(document, {subtree: true, childList: true});
  //   }
  // }
  // componentWillUnmount = () => {
  //     this.removeObserver();
  // }
  // removeObserver = () => {
  //     if (this.observer) {
  //         this.observer.disconnect();
  //         this.observer = null;
  //     }
  // }
  // Instantiate the Ledger Live API on component mount
  useEffect(() => {
    let observer = new MutationObserver(() => {
      const divElement = document.getElementsByClassName('MBMWidget_Phaze_Card_Checkout_Crypto_Wallet');;
      if (divElement) {
        const getEl: any = document.getElementsByClassName('MBMWidget_Phaze_Card_Checkout_Crypto_Wallet');
        const ele = (getEl.length) ? true : false;
        setEl(ele);
        console.log('el :', el);
      }
    });
    observer.observe(document, {subtree: true, childList: true});
    
    const llapi = new LedgerLiveApi(new WindowMessageTransport());
    llapi.connect();
    if (llapi) {
      api.current = llapi;
    }
    // Cleanup the Ledger Live API on component unmount
    return () => {
      api.current = undefined;
      void llapi.disconnect();
      if (observer) {
          observer.disconnect();
          observer = null;
      }
    };
  }, [el]);

  // A very basic test call to request an account
  const requestAccount = async () => {
    if (!api.current) {
      return;
    }

    const result = await api.current
      .requestAccount()
      .catch((error) => console.error({ error }));

    // console.log(result);
    if(result)
      signAndBroadcastTransaction(result);
  };

  const signAndBroadcastTransaction = async (data: any) => {
    if (!data) {
      return;
    }
    setCurrency(data.currency);
    const tx = await getTxnObj(currency);
    // console.log('txn', tx);
    const id = data.id;
    const signedTxn = await api.current
      .signTransaction(id, tx)
      .catch((error) => console.error({ error }));

    // console.log(signedTxn);
    if(signedTxn)
      await api.current
        .broadcastSignedTransaction(id, signedTxn)
        .catch((error) => console.error({ error }));
  };

  const getTxnObj = async(currency: string) => {
    const getElAddress: any = document.getElementsByClassName('MBMWidget_Phaze_Card_Checkout_Crypto_Wallet_Address');
    const address = (getElAddress.length) ? getElAddress[0].children[0].innerHTML : 'no';
    const getElAmount: any = document.getElementsByClassName('MBMWidget_Phaze_Card_Checkout_Crypto_Wallet_Amount');
    let amount = (getElAmount.length) ? getElAmount[0].children[0].innerHTML : 'bo';
    amount = amount.slice(0, -3);
    
    switch(currency) {
      case 'bitcoin_testnet':
        amount = new BigNumber(+amount).multipliedBy(100000000).toFixed(0, 2);
        const bitcoinTxn: BitcoinTransaction = {
          family: FAMILIES.BITCOIN,
          amount: amount,
          recipient: address,
        };
        return bitcoinTxn;
      case 'ethereum_ropsten':
        amount = new BigNumber(+amount).multipliedBy(1000000000000000000).toFixed(0, 2);
        const ethereumTxn: EthereumTransaction = {
          family: FAMILIES.ETHEREUM,
          amount: amount,
          recipient: address,
        };
        return ethereumTxn
      default:
        amount = new BigNumber(+amount).multipliedBy(100000000).toFixed(0, 2);
        const btcTxn: BitcoinTransaction = {
          family: FAMILIES.BITCOIN,
          amount: amount,
          recipient: address,
        };
        return btcTxn;
    }
  }

  return (
    <div className="App">
       <MobilumWidget />
       {el?
          <header className="App-header">
            <button className='payButton' onClick={requestAccount}>Pay with Ledger</button>
          </header> : ''
       }
    </div>
  );
};

export default App;
