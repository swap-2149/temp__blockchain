import type { NextPage } from 'next';
import Head from 'next/head';
import Header from '../components/header'
import Login from '../components/Login';
import PrograteLoader from "react-spinners/PropagateLoader";

import{
  useContract,
  useMetamask,
  useDisconnect,
  useAddress,
  useContractData,
  useContractCall,
} from "@thirdweb-dev/react";
import Loading from '../components/Loading';

const Home: NextPage = () => {
  const address = useAddress();
  const {contract, isLoading} = useContract(process.env.NEXT_PUBLIC_LOTTERY_CONTRACT_ADDRESS);
  console.log(address);

  if(isLoading) return (<Loading/>);
  

  if(!address) return (<Login />);

  return (
    <div className="bg-[#091B18] min-h-screen flex flex-col">
      <Head>
        <title>Draw</title>
      </Head>

      <Header/>

        {/*Next Draw*/}
        <div>
          <div className = 'stats-container'>
            <h1 className='text-5xl text-white font-semibold text-center'>The NEXT DRAW</h1>

            <div className='felx justify-between p-2 space-x-2'>
              <div className='stats'>
                <h2 className='text-sm'>Total Pool</h2>
                <p className='text-xl'>0.1 MATIC</p>
              </div>
            </div>
          </div>
        </div>

        {/*Price per ticket*/}
        <div>

        </div>
     
    </div>
  );
}

export default Home
