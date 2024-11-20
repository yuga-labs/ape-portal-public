import { BrowserProvider, JsonRpcSigner } from 'ethers';
import { useMemo } from 'react';
import type { Account, Chain, Client, Transport } from 'viem';
import { type Config, useAccount, useConnectorClient } from 'wagmi';

/**
 * wagmi to ethers.js signer
 * credit: https://wagmi.sh/react/guides/ethers
 */
export function clientToSigner(client: Client<Transport, Chain, Account>) {
  const { account, chain, transport } = client;
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };
  const provider = new BrowserProvider(transport, network);
  const signer = new JsonRpcSigner(provider, account.address);
  return signer;
}

/** Hook to convert a viem Wallet Client to an ethers.js Signer. */
export function useEthersSigner({ chainId }: { chainId?: number } = {}) {
  const { address } = useAccount();
  const { data: client } = useConnectorClient<Config>({
    account: address,
    chainId,
  });
  return useMemo(() => (client ? clientToSigner(client) : undefined), [client]);
}
