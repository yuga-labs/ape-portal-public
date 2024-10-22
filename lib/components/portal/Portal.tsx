import '../style.css';
import { useEffect } from 'react';
import {
  DefaultTabConfig,
  PortalType,
  TabConfig,
} from '../../utils/constants.ts';
import Granim from 'granim';
import { cn, createGranimConfig } from '../../utils/utils.ts';
import { ModalPortal } from '../ui/modal/ModalPortal.tsx';
import { TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import apePortalLogo from '../../assets/svg/ape-portal-logo.svg';
import { TabButton } from '../ui/buttons/TabButton.tsx';
import { TokenSwap } from '../ui/TokenSwap.tsx';
import { useApeContext } from '../../providers/ape/apeProvider.context.ts';
import { PortalProps } from '../ui/types.ts';
import { useTabManager } from '../../hooks/useTabManager.ts';
import { Buy } from '../buy/buy.tsx';
import { GradientCanvas } from '../ui/GradientCanvas.tsx';
import ErrorModal from '../ui/modal/ErrorModal.tsx';

export type ApePortalProps = Omit<PortalProps, 'showBranding'> & {
  tabConfig?: TabConfig;
};

export const ApePortal = ({
  tokenConfig,
  tabConfig = DefaultTabConfig,
  className,
}: ApePortalProps) => {
  const { enableOnramp } = useApeContext();
  useEffect(() => {
    new Granim(createGranimConfig('#aw-gradient-bg', 'diagonal'));
  }, []);
  const { tabs, selectedPortalType, selectedIndex, setPortalTypeWithSync } =
    useTabManager(tabConfig);

  return (
    <div className={cn('aw-overflow-y-hidden', className)}>
      <div className="aw-relative aw-z-50 aw-flex aw-max-w-[500px] aw-items-center aw-justify-center aw-text-clip aw-rounded-[10px] aw-p-1 md:aw-w-[550px]">
        <GradientCanvas id={'aw-gradient-bg'} />
        <ModalPortal />
        <ErrorModal />
        <TabGroup
          selectedIndex={selectedIndex}
          className="aw-relative aw-z-50 aw-flex aw-size-full aw-flex-col aw-text-clip"
        >
          <div className="aw-shadow-tab-header">
            <img
              src={apePortalLogo}
              alt={'Ape Portal'}
              className="aw-z-40 aw-h-[88px] aw-w-full aw-rounded-t-[5px] aw-bg-ape-portal-logo aw-py-4"
            />
            <TabList
              className={
                'aw-z-40 aw-flex aw-w-full aw-flex-row aw-gap-x-0.5 aw-border-b aw-border-b-apeAccent aw-bg-ape-blue-700 aw-px-0.5 aw-pt-0.5'
              }
            >
              {[...tabs].map((portalType: PortalType, index) => {
                return (
                  <TabButton
                    key={portalType}
                    selectedPortalType={selectedPortalType}
                    portalType={portalType}
                    setPortalTabState={setPortalTypeWithSync}
                    testId={`tab-${index}`}
                  />
                );
              })}
            </TabList>
          </div>
          <TabPanels
            /** TODO: restore aw-bg-apeBlue here after spotlight bg stuff is repaired */
            className={'aw-relative aw-z-50 aw-size-full aw-min-h-[470px]'}
          >
            <TabPanel unmount={false}>
              <TokenSwap
                portalType={selectedPortalType}
                tokenConfig={tokenConfig}
                isTabHosted
              />
            </TabPanel>
            {enableOnramp && (
              <TabPanel unmount={false}>
                <Buy portalType={selectedPortalType} isTabHosted />
              </TabPanel>
            )}
          </TabPanels>
        </TabGroup>
      </div>
    </div>
  );
};
