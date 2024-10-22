export const ArrowDown = ({ size = 24, ...props }) => {
  return (
    <svg
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      className={props.className}
      viewBox="0 0 24 24"
      fill="none"
    >
      <g id="arrow-down">
        <path
          id="Vector"
          d="M8 10L12 14L16 10"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
};
