"use client";

type Props = {
  className?: string;
  size?: number;
};

export default function CartIcon({ className = "", size = 20 }: Props) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M3 3h2l1.68 9.39A2 2 0 0 0 8.65 14h8.7a2 2 0 0 0 1.97-1.61L21 6H6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="10" cy="20" r="1.5" fill="currentColor" />
      <circle cx="18" cy="20" r="1.5" fill="currentColor" />
    </svg>
  );
}
