export const CrossIcon = ({ size = 24, ...props }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 42 41"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={props.className}
    >
      <g id="icon-widgets">
        <path
          className={'aw-stroke-primary'}
          id="Vector 1"
          d="M27 15L15.3327 26.6673"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          className={'aw-stroke-primary'}
          id="Vector 2"
          d="M27 27L15.3327 15.3327"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
};
