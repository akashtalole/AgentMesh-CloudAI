import type { SVGProps } from "react";

export function AgentMeshLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      {...props}
    >
      <path fill="none" d="M0 0h256v256H0z" />
      <path
        fill="currentColor"
        d="M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24Zm-29.07 131.42a40 40 0 1 1 58.14 0l-25.51 40.81a8 8 0 0 1-13.84-8.62Z"
        opacity={0.2}
      />
      <path
        fill="currentColor"
        d="M208.3 51.93a112 112 0 1 0 0 152.14 112.12 112.12 0 0 0 0-152.14ZM128 216a88 88 0 1 1 88-88 88.1 88.1 0 0 1-88 88Z"
      />
      <path
        fill="currentColor"
        d="M138.39 175.71a48 48 0 1 1 42.47-75.09l.29-.09a47.58 47.58 0 0 1-28.28-32.22A48 48 0 0 1 128 72a47.48 47.48 0 0 1-3.32.25 48 48 0 0 1-42.2-60.07A87.89 87.89 0 0 1 128.18 40a88.13 88.13 0 0 1 83.21 54.79 88 88 0 0 1-83.39 121.21Z"
      />
    </svg>
  );
}
