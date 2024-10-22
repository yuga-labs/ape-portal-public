import { ApproveTokenArgs } from '@decent.xyz/box-hooks';
import {
  Address,
  BoxActionResponse,
  ChainId,
  EvmAddress,
} from '@decent.xyz/box-common';
import { erc20Abi } from 'viem';
import { type Config, readContract, writeContract } from '@wagmi/core';
import { maxUint256 } from 'viem';

const getAllowance = async ({
  user,
  token,
  spender,
  chainId,
  wagmiConfig,
}: {
  user: Address;
  spender: Address;
  token: Address;
  chainId: ChainId;
  wagmiConfig: Config;
}) => {
  return await readContract(wagmiConfig, {
    address: token as EvmAddress,
    abi: erc20Abi,
    functionName: 'allowance',
    args: [user as EvmAddress, spender as EvmAddress],
    chainId: chainId,
  });
};

/**
 * Approve token for spending
 * @param token - token address
 * @param spender - spender address
 * @param amount - amount to approve
 * @param wagmiConfig - wagmi config
 * @param chainId - chain id
 * @returns transaction hash. If failed, returns undefined. The transaction is *not* awaited for completion - this
 *   is left up to the caller.
 */
const approveToken = async (
  { token, spender, amount, wagmiConfig }: ApproveTokenArgs,
  chainId: ChainId,
) => {
  try {
    const result = await writeContract(wagmiConfig, {
      address: token as EvmAddress,
      abi: erc20Abi,
      functionName: 'approve',
      args: [spender as EvmAddress, amount],
      chainId,
    });
    return result;
  } catch (error) {
    console.log('Error approving token', error);
  }
};

const userHasApproval = async ({
  token,
  spender,
  user,
  amount,
  chainId,
  wagmiConfig,
}: {
  token: EvmAddress;
  spender: EvmAddress;
  user: EvmAddress;
  amount: bigint;
  chainId: ChainId;
  wagmiConfig: Config;
}) => {
  const allowance = await getAllowance({
    token,
    spender,
    user,
    chainId,
    wagmiConfig,
  });
  return allowance >= amount;
};

export const isApprovalNeeded = async ({
  boxActionResponse,
  user,
  srcChainId,
  wagmiConfig,
}: {
  boxActionResponse: BoxActionResponse;
  user: EvmAddress;
  srcChainId: ChainId;
  wagmiConfig: Config;
}): Promise<boolean> => {
  const { tokenPayment, tx } = boxActionResponse;
  if (!tokenPayment || !tx) {
    return false;
  }
  const { to: spender } = tx;
  const { isNative, amount, tokenAddress: token } = tokenPayment;
  if (isNative) return false;

  const hasApproval = await userHasApproval({
    token: token as `0x${string}`,
    spender: spender as `0x${string}`,
    user,
    amount,
    chainId: srcChainId,
    wagmiConfig,
  });
  const needsApproval = hasApproval ? false : true;

  return needsApproval;
};

export const approveTokenHandler = async ({
  boxActionResponse,
  userAddress,
  srcChainId,
  wagmiConfig,
}: {
  boxActionResponse: BoxActionResponse;
  userAddress: Address;
  srcChainId: ChainId;
  wagmiConfig: Config;
}) => {
  if (!boxActionResponse || !userAddress) return;
  const { tokenPayment, tx } = boxActionResponse;
  if (!tokenPayment || !tx) {
    return;
  }

  const { to: spender } = tx;
  const { isNative, tokenAddress: token } = tokenPayment;
  if (isNative) return;

  const amount = maxUint256;
  const approveTxHash = await approveToken(
    {
      token,
      spender,
      amount,
      wagmiConfig,
    },
    srcChainId,
  );
  return approveTxHash;
};
