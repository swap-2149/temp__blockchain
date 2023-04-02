import React from 'react'
import { useContract, useContractRead } from '@thirdweb-dev/react'
import Countdown from 'react-countdown';

type Props = {
    hours: number;
    minutes: number;
    seconds : number;
    completed : boolean;
}

function CountdownTimer() {
    const {contract} = useContract(
            process.env.NEXT_PUBLIC_LOTTERY_CONTRACT_ADDRESS
        );

    const{data: expiration, isLoading: isLoadingExpiration} = 
    useContractRead(
        contract,
        "expiration"
    );

    const renderer = ({ hours, minutes, seconds, completed}: Props) => {
        if(completed){
            return(
                <div>
                    <h2 className='text-white text-xl text-center animate-bounce'>
                        Tickets CLOSED for now</h2>

                        <div className='flex space-x-6'>
                        <div className='flex-1'>
                            <div className='countdown animate-pulse'>{hours.toString()}</div>
                            <div className='countdown-label'>hours</div>
                        </div>

                        <div className='flex-1'>
                            <div className='countdown animate-pulse'>{minutes.toString()}</div>
                            <div className='countdown-label'>minutes</div>
                        </div>

                        <div className='flex-1'>
                            <div className='countdown animate-pulse'>{seconds.toString()}</div>
                            <div className='countdown-label'>seconds</div>
                        </div>

                    </div>
                </div>
            );
        }
        else{
            return(
                <div>
                    <h3 className='text-white text-sm mb-2 italic'>Time remaining</h3>
                    <div className='flex space-x-6'>
                        <div className='flex-1'>
                            <div className='countdown'>{hours.toString()}</div>
                            <div className='countdown-label'>hours</div>
                        </div>

                        <div className='flex-1'>
                            <div className='countdown'>{minutes.toString()}</div>
                            <div className='countdown-label'>minutes</div>
                        </div>

                        <div className='flex-1'>
                            <div className='countdown'>{seconds.toString()}</div>
                            <div className='countdown-label'>seconds</div>
                        </div>

                    </div>
                </div>
            );

        }
    }

  return (
    <div>
        <Countdown date ={new Date(expiration * 1000)} renderer={renderer} />
    </div>
    );
  
}

export default CountdownTimer