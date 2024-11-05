import { forwardRef } from 'react';
export const WarningIcon = forwardRef<
  SVGSVGElement,
  {
    size?: number;
    isError?: boolean;
    className?: string;
  }
>(({ size = 24, isError = false, ...props }, ref) => {
  return (
    <svg
      ref={ref}
      role="img"
      width={size}
      height={size}
      viewBox="0 0 53 46"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={props.className}
    >
      <title>Warning</title>
      <path
        d="M0 46L26.5 0L53 46H0ZM8.31136 41.1579H44.6886L26.5 9.68421L8.31136 41.1579ZM26.5 38.7368C27.1826 38.7368 27.7547 38.5048 28.2165 38.0408C28.6782 37.5768 28.9091 37.0018 28.9091 36.3158C28.9091 35.6298 28.6782 35.0548 28.2165 34.5908C27.7547 34.1268 27.1826 33.8947 26.5 33.8947C25.8174 33.8947 25.2453 34.1268 24.7835 34.5908C24.3218 35.0548 24.0909 35.6298 24.0909 36.3158C24.0909 37.0018 24.3218 37.5768 24.7835 38.0408C25.2453 38.5048 25.8174 38.7368 26.5 38.7368ZM24.0909 31.4737H28.9091V19.3684H24.0909V31.4737Z"
        shapeRendering={'auto'}
        fill={isError ? '#FF5555' : '#FFB155'}
      />
    </svg>
  );
});
