import type { ValueOf } from "@/types/values-of";

const COLOR = {
  GREEN: "#3cc83e",
  RED: "#ff0000",
} as const;

export function Pin({ color }: { color: ValueOf<typeof COLOR> }) {
  return (
    <svg display="block" height="41px" width="27px" viewBox="0 0 27 41">
      <defs>
        <radialGradient id="shadowGradient">
          <stop offset="10%" stopOpacity="0.4"></stop>
          <stop offset="100%" stopOpacity="0.05"></stop>
        </radialGradient>
      </defs>
      <ellipse cx="13.5" cy="34.8" rx="10.5" ry="5.25" fill="url(#shadowGradient)"></ellipse>
      <path
        fill={color}
        d="M27,13.5C27,19.07 20.25,27 14.75,34.5C14.02,35.5 12.98,35.5 12.25,34.5C6.75,27 0,19.22 0,13.5C0,6.04 6.04,0 13.5,0C20.96,0 27,6.04 27,13.5Z"
      ></path>
      <path
        opacity="0.25"
        d="M13.5,0C6.04,0 0,6.04 0,13.5C0,19.22 6.75,27 12.25,34.5C13,35.52 14.02,35.5 14.75,34.5C20.25,27 27,19.07 27,13.5C27,6.04 20.96,0 13.5,0ZM13.5,1C20.42,1 26,6.58 26,13.5C26,15.9 24.5,19.18 22.22,22.74C19.95,26.3 16.71,30.14 13.94,33.91C13.74,34.18 13.61,34.32 13.5,34.44C13.39,34.32 13.26,34.18 13.06,33.91C10.28,30.13 7.41,26.31 5.02,22.77C2.62,19.23 1,15.95 1,13.5C1,6.58 6.58,1 13.5,1Z"
      ></path>
      <path
        fill="#fff"
        transform="translate(6 6)"
        d="m7.5 1c-.3 0-.4.2-.6.4l-5.8 9.5c-.1.1-.1.3-.1.4 0 .5.4.7.7.7h11.6c.4 0 .7-.2.7-.7 0-.2 0-.2-.1-.4l-5.7-9.5c-.2-.2-.4-.4-.7-.4zm0 1.5 3.3 5.5h-.8l-1.5-1.5-1 1.5-1-1.5-1.5 1.5h-.9z"
      ></path>
    </svg>
  );
}

Pin.COLOR = COLOR;
