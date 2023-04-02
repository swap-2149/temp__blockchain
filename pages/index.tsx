import type { NextPage } from 'next';
import Head from 'next/head';
import Header from '../components/header'
import Login from '../components/Login';
import PrograteLoader from "react-spinners/PropagateLoader";
import getRemainingTickets from '../service/getRemainingTickets';
import CountdownTimer from '../components/CountdownTimer';
import toast from "react-hot-toast";
import Marquee from 'react-fast-marquee';
import AdminControls from '../components/AdminControls';

import{
  useContract,
  useMetamask,
  useDisconnect,
  useAddress,
  useContractRead, //useContractData(...)
  useContractWrite,
  ThirdwebProvider, //useContractCall(...)
} from "@thirdweb-dev/react";

import Loading from '../components/Loading';
import { useEffect, useState } from 'react';
import { BaseContract, ethers } from 'ethers';
import { get } from 'http';
import { currency } from '../constant';
import { MetaMaskWallet } from '@thirdweb-dev/wallets';
import { Ethereum, Polygon } from "@thirdweb-dev/chains";
import { SmartContract, ThirdwebSDK } from '@thirdweb-dev/sdk';

const Home: NextPage = () => {
  const wallet = new MetaMaskWallet(  {
    chains: [Ethereum, Polygon],
  });
  const address = useAddress();
  const[userTickets, setUserTickets] = useState(0);
  const [sdk, setSDK] = useState<ThirdwebSDK>();
  const [sdkContract, setSdkContract] = useState<SmartContract<BaseContract>>();
  const [quantity, setQuantity] = useState<number>(1);
  const {contract, isLoading} = useContract("0x4b7E9EC9f638980d4c581f88EB7bd72BAeED0CaE");
  const [remainingTicketsABI, setRemainingTickets] = useState<any>("Loading");

  const{data: expiration, isLoading: isLoadingExpiration} = useContractRead(contract,"expiration");
  const { data: remainingTickets, isLoading: remainingTicketsLoading } = useContractRead(contract, "RemainingTickets")
  const { data: maxTickets, isLoading: maxTicketLoading } = useContractRead(contract, "maxTickets")

  const { data: currentWinningReward } = useContractRead(
    contract, 
    "CurrentWinningReward"
  );

  const { data: ticketPrice, isLoading: ticketPriceLoading } = useContractRead
  (contract, 
    "ticketPrice");

    const { data: ticketCommission, isLoading: ticketCommissionLoading } = useContractRead
    (contract, 
      "ticketCommission");
  
  const{data: tickets} = useContractRead(
    contract,
    "getTickets"
  );
  
  const {mutateAsync : BuyTickets} = useContractWrite(contract,"BuyTickets");
  
  let signer:any;
  
  useEffect( () => {
    let Sdk = ThirdwebSDK.fromPrivateKey(
      "bf5e9ee59e41db370b7a649623740191e05b72320b2eba485488b891fa785a85", // Your wallet's private key (only required for write operations)
      "mumbai",
    );
    setSDK(Sdk);
   
  },[])

  useEffect( () => {
    if(sdk!=undefined){
      sdk.getContract("0x4b7E9EC9f638980d4c581f88EB7bd72BAeED0CaE").then( 
        (contract) => setSdkContract(contract)
      )
    }
  }, [sdk]);

  useEffect( () => {
    if(sdkContract){
      sdkContract.call(
        "RemainingTickets"
      ).then( (res) => setRemainingTickets(res) );
    }
  }, [sdkContract])

  useEffect( ()=> {
    wallet.connect();
  }, []);

  const { data: winnings } = useContractRead(
    contract, 
    "getWinningsForAddress", 
    address
    );

  const {mutateAsync: WithdrawWinnings} = useContractWrite(
      contract, 
      "WithdrawWinnings"
      );
  
  const {data: lastWinner} = useContractRead(contract, "lastWinner");
  const {data: lastWinnerAmount} = useContractRead(
    contract,
    "lastWinnerAmount"
  );
  

  const {data: isLotteryOperator} = useContractRead(
    contract,
    "lotteryOperator"
  );
  
  useEffect(() => {
    if(!tickets) return;
    const totalTickets: string[] = tickets;
    const noOfUserTickets = totalTickets.reduce(
      (total, ticketAddress) => (ticketAddress===address ? total +1 :
      total),
      0
      );

      setUserTickets(noOfUserTickets);
  },[tickets, address])
  
  const handleClick = async() => {
    if(!ticketPrice) return;
    console.log("Clicked");
    const notification = toast.loading("Buying your tickets...");

    if(sdkContract){
      sdkContract.call(
        "BuyTickets", // Name of your function as it is on the smart contract
        {
          value: ethers.utils.parseEther(
            (Number(ethers.utils.formatEther(ticketPrice))* quantity
            ).toString()
          ), // amount in Ether 
        },
      ).then( (data) => {
        toast.success("Tickets purchased successfully",{
          id:notification,
        });

        console.info("contract call success: ",data);
      }).catch( (error) => {
        toast.error("whoops! something went wrong",{
          id:notification,
        });
  
        console.error("contract call failure", error);
      })
    }
    else {
      alert("Contract Error");
    }

    // try{
    //   const transaction = {
    //     value: ethers.utils.parseEther(
    //       (Number(ethers.utils.formatEther(ticketPrice))* quantity
    //       ).toString()
    //     ), // amount in Ether
    //   }

    //   const signedTransaction = signer.signTransaction()
    //   const data = await BuyTickets([
    //     {
    //     value: ethers.utils.parseEther(
    //       (Number(ethers.utils.formatEther(ticketPrice))* quantity
    //       ).toString()
    //     ),
    //     },
    //   ]);

    //     toast.success("Tickets purchased successfully",{
    //       id:notification,
    //     });

    //     console.info("contract call success",data);
        
    // }catch(err){
    //   toast.error("whoops! something went wrong",{
    //     id:notification,
    //   });

    //   console.error("contract call failure", err);
    // }
  };

  const onWithdrawWinnings = async() => {
    const notification = toast.loading("Withdraw winnigs...");

    try{
      const data = await WithdrawWinnings([{}]);

      toast.success("Winnings withdrawn successfully!",{
        id:notification,
      });
    }catch(err){
      toast.error("Something went wrong",{
        id:notification,
      });
      console.error("contract call failure", err);
    }
  }
  
  if(isLoading) return (<Loading/>);
  if(!address) return (<Login />);

  return (
    <ThirdwebProvider activeChain={"mumbai"}>
    <div className="bg-[#091B18] min-h-screen flex flex-col">
      <Head>
        <title>Draw</title>
      </Head>

      
      <Header/>
      <Marquee className='bg-black-[#0A1F1C] p-5 mb-5' gradient={false} speed={100}>
        <div className='flex space-x-2 mx-10'>
          <h4 className='text-white font-bold'>Last Winner:
          {lastWinner?.toString()}</h4>
          <h4 className='text-white font-bold'>Previous Winnings:{" "}
          {lastWinnerAmount && 
          ethers.utils.formatEther(lastWinnerAmount?.toString())}{""}
          {currency}
          </h4>
        </div>
      </Marquee>

      {isLotteryOperator === address &&(
        <div className='flex justify-center'>
          <AdminControls sdkContract={sdkContract}/>
        </div>
      )}

      {winnings > 0 && (
        <div className='max-w-md md:max-w-2xl lg:max-w-4xl mx-auto
        mt-5'>
          <button onClick={onWithdrawWinnings} className='p-5 bg-gradient-to-b from-orange-500
          to-emerald-600 animate-pulse text-center rounded-xl w-full'>
            <p className='font-bold'>Winner Winner</p>
            <p>
              Total Winnings: {ethers.utils.formatEther(winnings.
                toString())}{" "}
                {currency}
            </p>
            <br />
            <p>Click here to withdraw</p>
          </button>
        </div>
      )}

        {/*Next Draw box*/}
        <div className='space-y-5 md:space-y-0 m-5 md:flex md:flex-row 
        items-start justify-center md:space-x-5'>
          <div className = 'stats-container'>
            <h1 className='text-5xl text-white font-semibold text-center'>
              The NEXT DRAW
              </h1>

            <div className='flex justify-between p-2 space-x-2'>
              <div className='stats'>
                <h2 className='text-sm'>Total Pool</h2>
                <p className='text-xl'>
                  {currentWinningReward && ethers.utils.formatEther
                  (currentWinningReward.toString()
                  )}{" "}
                  {currency}
                </p>
              </div>

              <div className='stats'>
                  <h2 className='text-sm'>Tickets Remaining</h2>
                  <p className='text-xl'>
                    {/* {remainingTicketsLoading ? (
                      ""
                    ) : (
                      remainingTickets.toString()
                    )} */}

                    {remainingTicketsABI.toString()}

                    <br/>

                    { !remainingTicketsLoading && remainingTickets.toString() }
                  </p>
              </div>
            </div>

              {/*Countdown counter*/}
              <div className='mt-5 mb-3'>
                  <CountdownTimer/>
              </div>

          </div>

          <div className='stats-container space-y-2'>
            <div>
              <div className="stats-container">
                <div className='flex justify-between items-center text-white pb-2'>
                  <h2>Price per ticket</h2>
                  <p>
                  {ticketPrice && ethers.utils.formatEther
                  (ticketPrice.toString()
                  )}{" "}
                  {currency}
                  </p>
                </div>

                <div className='flex text-white items-center space-x-2 bg-[#091B18] border-[#004337] border p-4'>
                  <p>TICKETS</p>
                  <input 
                    className='flex w-full bg-transparent text-right 
                    outline-none' 
                    type="number"
                    min={1}
                    max={10}
                    value={quantity}
                    onChange={e => setQuantity(Number(e.target.value))}
                   />
                </div>


                <div className='space-y-2 mt-5'>
                  <div className='flex items-center justify-between 
                    text-emerald-300 text-sm italic font-extrabold'>
                    <p>Total cost of tickets</p>
                    <p>
                    {ticketPrice && 
                      Number(
                        ethers.utils.formatEther
                        (ticketPrice.toString())
                    )* quantity}{" "}
                    {currency}
                    </p>
                  </div>

                  <div>
                    <div className='flex items-center justify-between 
                    text-emerald-300 text-xs italic'>
                      <p>Service fees</p>
                      <p>
                      {ticketCommission && ethers.utils.formatEther
                      (ticketCommission.toString()
                        )}{" "}
                      {currency}
                      </p>
                    </div>

                    <div className='flex items-center justify-between 
                    text-emerald-300 text-xs italic'>
                      <p>+ Network fees</p>
                      <p>TBC</p>
                    </div>
                  </div>


                  <button 
                  // disabled={expiration?.toString() < Date.now().toString()
                  // || remainingTickets?.toNumber() === 0}

                  onClick={handleClick}
                  className='mt-5 w-full bg-gradient-to-br
                  from-orange-500 to-emerald-600 px-10 py-5 rounded-md
                  text-white shadow-xl disabled:from-gray-600 disabled:text-gray-100
                  disabled: to-gray-600 disabled:cursor-not-allowed'>
                    Buy {quantity} tickets for {ticketPrice && Number(ethers.utils.formatEther(ticketPrice.toString
                      ()))* 
                      quantity }{" "}
                      {currency}
                      </button>
                </div>
                  
                  {userTickets > 0 && (
                    <div className='stats'>
                      <p className='text-lg mb-2'>
                        you have {userTickets} Tickets in this draw
                      </p>

                      <div className='flex max-w-sm flex-wrap gap-x-2 gap-y-2'>
                        {Array(userTickets)
                        .fill("")
                        .map((_, index)=>(
                          <p key={index} className='text-emerald-500/30 rounded-lg flex flex-shrink-0
                          items-center justify-center text-xs italic'>{index+1}</p>
                        ))}
                      </div>
                    </div>
                  )}

              </div>
            </div>
          </div>
        </div>
        {/*Price per ticket*/}
        <div>

        </div>
     
    </div>
    </ThirdwebProvider>
  );
}

export default Home
