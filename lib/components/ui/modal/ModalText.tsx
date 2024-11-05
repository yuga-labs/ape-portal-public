import { WarningIcon } from '../../icons/WarningIcon';

export default function ModalWarningText({
  isError,
  title,
  description,
}: {
  isError?: boolean;
  title: string;
  description: string;
}) {
  return (
    <>
      <WarningIcon
        size={53}
        isError={isError ?? false}
        className="aw-opacity-60"
      />
      <h2 className="aw-px-20 aw-text-center aw-font-dmsans aw-text-[30px] aw-leading-[38px] aw-text-white md:aw-px-32">
        {title}
      </h2>
      <p className="aw-max-h-[40%] aw-w-full aw-overflow-auto aw-px-6 aw-text-center aw-text-sm aw-leading-6 aw-tracking-wide aw-text-[#9FBFFE] md:aw-px-8">
        {description}
      </p>
    </>
  );
}
