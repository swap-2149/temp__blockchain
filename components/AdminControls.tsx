import React from 'react'

import{
    StarIcon,
    CurrencyDollarIcon,
    ArrowPathIcon,
    ArrowUturnDownIcon,
} from "@heroicons/react/24/solid"

import{
    useContract,
    useMetamask,
    useDisconnect,
    useAddress,
    useContractRead, //useContractData(...)
    useContractWrite,
    ThirdwebProvider, //useContractCall(...)
  } from "@thirdweb-dev/react";
import { BaseContract, ethers } from 'ethers';
import { currency } from '../constant';
import { SmartContract } from '@thirdweb-dev/sdk';

function AdminControls({sdkContract}:any) {
    const {contract, isLoading} = useContract("0x4b7E9EC9f638980d4c581f88EB7bd72BAeED0CaE");

    const {data: totalCommission} = useContractRead(
        contract, 
        "operatorTotalCommission"
    );

        const {mutateAsync: DrawWinnerTicket} = useContractWrite(
            contract, 
            "DrawWinnerTicket"
            );
        
  
        const {mutateAsync: RefundAll} = useContractWrite(
            contract, 
            "RefundAll"
           );

        const {mutateAsync: restartDraw} = useContractWrite(
            contract, 
            "restartDraw"
         );

        const {mutateAsync: WithdrawCommission} = useContractWrite(
            contract, 
            "WithdrawCommission"
        );

    // const drawWinner = async () => {

    // }

  const getWinner = () => {
    console.log("Drawing Winner")
    if(sdkContract){
        sdkContract.call(
            "DrawWinnerTicket", // Name of your function as it is on the smart contract
        ).then( (res:any) => {
            console.log("Winner Drawn: " + res);
        }).catch( (err:any) => console.log(err));
    }
  }

  const WithdrawComm = () => {
    console.log("WithdrawCommission")
    if(sdkContract){
        sdkContract.call(
            "WithdrawCommission", // Name of your function as it is on the smart contract
        ).then( (res:any) => {
            console.log(res);
        }).catch( (err:any) => console.log(err));
    }
  }

  const restart = () => {
    console.log("restartDraw")
    if(sdkContract){
        sdkContract.call(
            "restartDraw", // Name of your function as it is on the smart contract
        ).then( (res:any) => {
            console.log("restarted Draw: " + res);
        }).catch( (err:any) => console.log(err));
    }
  }

  const refund = () => {
    console.log("RefundAll")
    if(sdkContract){
        sdkContract.call(
            "RefundAll", // Name of your function as it is on the smart contract
        ).then( (res:any) => {
            console.log("Draw Refunded: " + res);
        }).catch( (err:any) => console.log(err));
    }
  }

  return (
    <div className='text-white text-center px-5 py-3 rounded-md border-emerald-300/20 border'>
        <h2 className='font-bold'>Admin Controls</h2>
        <p className='mb-5'>Total Commission to be withdrawn:{" "}
        {totalCommission && 
            ethers.utils.formatEther(totalCommission?.toString())}{" "}
            {currency}
        </p>

        <div className='flex flex-col space-y-2 md:flex-row md:space-y-0
        md:space-x-2'>
            <button className='admin-button' onClick={()=>getWinner()}>
                <StarIcon className='h-6 mx-auto mb-2'/> 
                Draw Winner
            </button>

            <button className='admin-button ' onClick={() => WithdrawComm()}>
                <CurrencyDollarIcon className='h-6 mx-auto mb-2'/>
                Withdraw Commission
            </button>

            <button className='admin-button' onClick={() => restart() }>
                <ArrowPathIcon className='h-6 mx-auto mb-2'/>
                Restart Draw
            </button>

            <button className='admin-button' onClick={() => refund() }>
                <ArrowUturnDownIcon className='h-6 mx-auto mb-2'/>
                Refund All
            </button>
        </div>
    </div>
  );
}

export default AdminControls