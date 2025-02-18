import { useState } from 'react';
import { useConnectModal } from '@rainbow-me/rainbowkit';
// Bridge/Buy are commented out and re-enabled as needed during manual testing
import { ApePortal, ApeProvider } from '../lib';

const ThemeButton = ({ theme, setTheme }) => {
  const themeToColor = {
    ape: 'aw-bg-[#0246cd]',
    light: 'aw-bg-[#ffffff]',
    dark: 'aw-bg-[#262626]',
  };
  return (
    <button
      onClick={() => setTheme(theme)}
      className={'aw-flex aw-flex-col aw-gap-y-1 aw-drop-shadow-lg'}
    >
      <div
        className={`aw-size-8 aw-rounded-full aw-shadow-2xl ${themeToColor[theme]}`}
      />
      <p className={'aw-capitalize'}>{theme}</p>
    </button>
  );
};

export const ApePortalWrapper = () => {
  const [theme, setTheme] = useState<'dark' | 'light' | 'ape'>('ape');
  const { openConnectModal } = useConnectModal();
  const apeConfig = {
    openConnectModal: openConnectModal || (() => {}),
    useHashRouter: true,
    enableOnramp: true,
    enableSolanaRedirect: true,
    solanaRedirectUrl: 'https://apechain.com/solana-bridge',
    theme,
  };

  return (
    <div className={theme}>
      <ApeProvider config={apeConfig}>
        <ApePortal />
        {/* <Bridge showBranding={false} /> */}
        {/* <Buy showBranding={false} /> */}
      </ApeProvider>
      <div
        className={
          'aw-flex aw-flex-col aw-items-center aw-justify-center aw-pt-10'
        }
      >
        <div className={'aw-pb-4 aw-text-4xl aw-font-bold'}>
          Ape Portal Themes
        </div>
        <div className={'aw-flex aw-flex-row aw-gap-x-8'}>
          <ThemeButton theme={'ape'} setTheme={setTheme} />
          <ThemeButton theme={'dark'} setTheme={setTheme} />
          <ThemeButton theme={'light'} setTheme={setTheme} />
        </div>
      </div>
    </div>
  );
};
