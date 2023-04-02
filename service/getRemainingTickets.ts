import { useContract, useContractRead } from "@thirdweb-dev/react";

export default function getRemainingTickets() {
  const { contract } = useContract("0x4b7E9EC9f638980d4c581f88EB7bd72BAeED0CaE");
  const { data, isLoading } = useContractRead(contract, "RemainingTickets")
  return {remainingTickets:data, isLoadingRemainingTickets: isLoading};
}