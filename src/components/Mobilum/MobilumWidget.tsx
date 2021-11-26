import { useEffect, useState } from 'react';
import api from '../../api/posts';
import './MobilumWidget.css'

const MobilumWidget = () => {
  const [data, setData] = useState('');

  useEffect(() => {
    const params = {
      walletAddress: '',
      cryptoCurrency: 'btc',
      userUUid: '',
      additionalData: '',
      userIdentifier: 'a1001',
      currency: 'usd',
      price: 20,
      amount: 10,
    }
    const script = document.createElement('script');
    const fetchData = async () => {
      try {
        const res = await api.post('GetWidget', params, { 
          headers:{
            apiKey: '16de9f8b-b414-4c50-b3c8-cf8355683a42'  
          }
        })
        let base64Path = res.data.result.widgetBase64Html;
        let buff = Buffer.from(base64Path, 'base64').toString('ascii');
        let base64PathScript = res.data.result.widgetBase64ScriptUrl;
        let buffScript = Buffer.from(base64PathScript, 'base64').toString('ascii');
        script.src = buffScript;
        console.log('buffscript', buffScript)
        console.log('buff', buff)
        setData(buff);
      } catch (err) {
        console.log(err);
      }
    }
    fetchData();

    
    script.async = true;

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    }
  }, [])
  return (
    <div className="widget-container" dangerouslySetInnerHTML={{__html: data}}></div>
  )
}

export default MobilumWidget
