# 🦧 Ape Portal

![badge](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/dash-yuga/faa3e657c8184734c4458b72f2a1f85a/raw/ape-portal__heads_main.json)

**React components enabling seamless interaction with ApeChain.**

✨ **Bridge**, 💱 **Swap**, and 🛒 **Buy** portals can be used independently, or as an all-in-one [portal](./lib/components/portal/portal.md).

💻 **Developer?** Check out the [contributing guidelines](./CONTRIBUTING.md) to get involved!

---

## ℹ️ User Support

If users require support with transactions they have already sent, all components have visible links for users to obtain support through the same means. Furthermore:

- To get help with Bridge or Swap transactions, please use see [decent.xyz support for ApePortal](https://help.apeportal.xyz/).
- To get help with fiat Onramp transactions:
  - **If you have already submitted a transaction**: Please reach out directly to the provider you transacted through (Moonpay, Stripe, Transak) for any transaction-related issues.
  - **If you encounter functional issues and cannot complete the transaction flow**: If you are unable to proceed with the onramp process or face any functional issues, please contact Halliday at **support _at_ halliday **dot** xyz**

---

## 🚀 Hosting the ApeChain Portal

Ape Portal is designed for use in a web3 application with a wagmi provider.  
The easiest way to get started creating a web3 app is with [RainbowKit](https://www.rainbowkit.com/docs/installation), which provides a script to quickly set up a NextJS + web3 app.

### 🛠 Installation

1. Copy our `.npmrc` file to your repo to ensure `@yuga-labs` scoped packages are read from GitHub's package registry rather than `npm`:

```bash
curl -sSL -o .npmrc https://raw.githubusercontent.com/yuga-labs/ape-portal-public/2bd5d6c85cbb8dfc276c054ddeb0f55a1df459aa/.npmrc
```

2. Accessing the GitHub npm registry requires a GitHub account. Ensure you have a GitHub personal access token `GITHUB_TOKEN` in your environment, authorized with `read:package` permissions. For more information, see [GitHub documentation on personal access tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#creating-a-personal-access-token-classic).

3. Install the ApeChain Portal using `npm`, `yarn`, or `pnpm`:

```bash
npm i --save @yuga-labs/ape-portal-public
```

```bash
yarn add @yuga-labs/ape-portal-public
```

```bash
pnpm i @yuga-labs/ape-portal-public
```

---

## 🔧 Requirements

- **React** `^18`
- **Wagmi and Viem**
  - `viem@^2.21.32` contains the `apeChain` network
  - Import `ApeChain` as a provider chain via `getDefaultConfig` or `createConfig`.
  - **Bridge functionality** requires a multi-chain setup with at least 2 chains, including **dedicated RPC providers in production** ([more info below](#bridge-and-swap-rpc-providers)).

Example:

```js
import { http, createConfig } from '@wagmi/core';
import { arbitrum, base, mainnet, apeChain } from 'viem/chains';

export const config = createConfig({
  chains: [
    apeChain,
    {
      ...mainnet,
      rpcUrls: {
        default: {
          http: ['https://eth-mainnet.g.alchemy.com/v2/<YOUR-ALCHEMY-KEY>'],
        },
      },
    },
    arbitrum,
    base,
  ],
  transports: {
    [apeChain.id]: http(),
    [mainnet.id]: http(),
    [arbitrum.id]: http(),
    [base.id]: http(),
  },
});
```

- Import the `ape-portal` stylesheet in your root app/layout:

```ts
// _app.tsx
import "@yuga-labs/ape-portal-public/dist/assets/style.css";
import type { AppProps } from "next/app";

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default MyApp;
```

### 🌉 Bridge and Swap RPC Providers

It is **strongly recommended** to explicitly specify RPC URL providers for production. At the time of writing, the default Ethereum mainnet RPC provider (`cloudflare-eth.com`) has sporadic caching issues with ETH balance amounts, causing gas estimation errors.

---

## ⚙️ Configuration

The [`ApeProvider`](lib/providers/ape/apeProvider.tsx) is used to pass configuration options and callbacks to ApeChain portals. **All top level UI components** (Bridge, Swap, Buy) and the all-in-one **ApePortal** require an ApeProvider.

```js
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { ApeConfig, ApeProvider, ApePortal } from "@yuga-labs/ape-portal-public";

const Home = () => {
  const { openConnectModal = () => {} } = useConnectModal();
  const apeConfig: ApeConfig = { openConnectModal };

  return (
    <ApeProvider config={apeConfig}>
      <ApePortal />
    </ApeProvider>
  );
};
```

---

### 📝 Note on semantics

**Bridge** means to move tokens from one chain to another, for example from Ethereum mainnet to ApeChain mainnet.

**Swap** means to change from one token to another _on the same chain_.

These definitions are reflected in the use and features of **ApePortal**.

---

### 🛒 Note on Onramp / Buy Component

The **Onramp** component allows purchase of ApeChain $APE with fiat funding sources.

Usage of the **Onramp** component requires prior approval from Yuga Labs.  
If you're not approved, the **ApePortal** ONRAMP tab or **Buy** component will fail due to CORS errors.

To request permission, email **support _at_ yugalabs **dot** io** with the subject line: `Ape Portal: Onramp Request`. This email is only for dev support to become a partner and host the Onramp. General user support for Bridge, Swap or Onramp transactions is handled elsewhere.

---

## 🏗️ Usage

### Option 1: All-In-One Portal

Include `<ApePortal>` as a component in your React files to display the **Bridge**, **Swap**, and **Buy** portals in a tabbed interface. `<ApePortal>` includes branding elements like the logo and gradient border.

- **ApeProvider** is still required higher in the component tree.
- Optional props are available:
  - `initialTab={PortalType...}`: Set the initial tab.
  - `onTransactionSuccess` and `onTransactionError`: Callbacks for transaction success/failure.
  - `tokenConfig`: Customize token defaults ([discussed below](#setting-custom-token-defaults)).

```js
import React from 'react';
import { ApePortal } from '@yuga-labs/ape-portal-public';

function App() {
  return <ApePortal />;
}

export default App;
```

### Option 2: Individual Components

Alternatively, use **Bridge**, **Swap**, or **Buy** components individually:

```js
import React from 'react';
import { Bridge, Buy, Swap } from '@yuga-labs/ape-portal-public';

function App() {
  return (
    <>
      <Bridge />
      <Swap />
      <Buy />
    </>
  );
}

export default App;
```

---

## 🎯 Special Use Cases

### Setting Custom Token Defaults

Both the source and destination tokens can be independently set to a custom default token by passing the token
information (`DefaultTokenInfo`) to the `TokenConfig` object to the Portal or the individual Bridge or Swap component.

The tokens can be set with or without an amount. When an amount is set the input field for that token will be pre-filled
and the calculation for the other token will be updated automatically.
This amount should be a string representation of the amount (i.e. "0.1" for 0.1 tokens). Do not use wei amounts.

Note: Only 1 token can have an amount set. The token the amount is targeting is denoted by the `type` property in
the `DefaultTokenAmount` object.

If either token is on a chain that is not supported by the current Wagmi provider, then the respective token will remain
unchanged.

Lastly, we expose both `DefaultTokenInfo` and `DefaultTokenAmount` to ensure values conformed to the config.

Example of setting both a source and destination token:

```js
<ApePortal
  tokenConfig={{
    defaultSourceToken: {
      chainId: 1,
      address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    },
    defaultDestinationToken: {
      chainId: 137,
      address: '0x0000000000000000000000000000000000000000',
    },
  }}
/>
```

Example of setting a source token with an amount (0.125 tokens):

```js
<ApePortal
  tokenConfig={{
    defaultSourceToken: {
      chainId: 1,
      address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    },
    defaultTokenAmount: {
      type: InputType.Source,
      amount: '0.125',
    },
  }}
/>
```

Example of using the `TokenConfig` object with the Bridge component:

```js
<Bridge
  tokenConfig={{
    defaultSourceToken: {
      chainId: 1,
      address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    },
  }}
/>
```

### Force bridge/swap to a specific token

To facilitate onboarding users to your app or service, it may be desirable to only allow bridge/swap to a specific chain/token. Use the `TokenConfig` boolean `lockDestinationToken` for this purpose.

If `lockDestinationToken` is true, users will only be allowed to bridge or swap to the default destination token/chain, which is currently ApeCoin. This default can be overridden by setting the `defaultDestinationToken` in the `TokenConfig` object.

```js
<ApePortal
  tokenConfig={{
    lockDestinationToken: true,
  }}
/>
```

## Tab Configuration

When the portal is used with the all-in-one `ApePortal` component, the tabs can be configured to show or hide specific tabs and select an initial tab. This is done by passing an array to the `tabConfig` property to the `ApePortal` component.

This array accepts 2-3 elements. These elements can be one of the following:

- `InitialPortalType`
- `PortalType`

The array will only accept 1 `InitialPortalType` element at a time, and 1 or 2 `PortalType` elements. If you decide not to set an initial tab, the array can consist of 3 `PortalType`s.

The `InitialPortalType` element will determine the initial tab that is shown when the portal is opened. The `PortalType` elements will determine the tabs that are shown in the portal.

Lastly, the order of the elements in the array will determine the order of the tabs in the portal.

Example of showing only the Bridge and Swap tabs with the Bridge tab as the initial tab:

```js
<ApePortal tabConfig={[InitialPortalType.Bridge, PortalType.Swap]} />
```

Example of all three tabs shown without setting an initial tab:

```js
<ApePortal
  tabConfig={[PortalType.Bridge, PortalType.Swap, PortalType.Onramp]}
/>
```

### Enabling the portal hash router

The portal hash router is a feature that allows **ApePortal** to be navigated using the URL hash. This is useful for sharing a link to a specific tab of **ApePortal**.

Please note this is not compatible with NextJS 14+ and will require extra code in the NextJS host app - see [Hash router NextJS incompatibility](#hash-router-nextjs-incompatibility) below.

To enable the hash router, set the `useHashRouter` property in the `ApeConfig` object to `true`. It is disabled by default.

The router works by look for hash fragments in the URL, and parsing them to determine the tab of the portal. The following hash fragments are supported:

- `#bridge`
- `#swap`
- `#onramp`

These can be used by adding the hash to the URL, for example: `https://yourapp.com/#swap`.

```js
  const apeConfig: ApeConfig = {
    openConnectModal,
    useHashRouter: true,
  };
```

#### Using #swap to preload tokens

The `#swap` hash also supports an optional chain and token address parameter, to force the `<Swap>` widget or **ApePortal swab tab** to initialize to that chain and token pair.

The expected URL format is `#swap/chainId/contractAddress`.

Example URL:

- Chain ID 1, ApeCoin ERC20 contract: `/your-ape-portal/#swap/1/0x4d224452801ACEd8B2F0aebE155379bb5D594381`

#### Hash router NextJS incompatibility

The NextJS 14+ router does not trigger `window.hashchange` events ([ref](https://github.com/vercel/next.js/issues/69256)). For Ape Portal hash router to work in this environment, please add the following code to manually trigger `window.hashchange` events:

```js
import { useParams } from 'next/navigation';

export default function Portal() {
  const params = useParams();
  useEffect(() => {
    // NextJS 14+ router compatibility fix: Allow ApePortal to detect hash changes
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  }, [params]);

  return <ApePortal />;
}
```

### Bridging funds to a different wallet

In some cases, it may be desirable to bridge, swap or onramp funds to a wallet other than the connected wallet.

To use this feature, pass a valid wallet address to `ApeConfig` property `destinationAddress`.

If the bridge component is configured with a `destinationAddress`, a warning will be shown in the UI that funds will be sent to `destinationAddress` wallet rather than the connected wallet.

### Bridge/Swap token synchronization

When Ape Portal is used with both Bridge and Swap components, the portal will automatically synchronize the selected tokens between the two components:

- If a user selects a source token in the Bridge component, the Swap component will automatically select the same token/chain, and then pre-select another token on that chain.
- If the destination token has a chain different from the source, we stash the token to reuse when users come back to the Bridge.

---

## 🎨 Styling

**Ape Portal** uses Tailwind CSS for styling, but with the prefix `aw-` to prevent conflicts with other apps.  
You can override these classes to fit your app's design.

---
