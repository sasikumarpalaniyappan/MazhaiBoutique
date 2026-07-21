"use client";

type Props = {
  className?: string;
  size?: number;
  filled?: boolean;
  strokeClass?: string;
  fillClass?: string;
};

export default function HeartIcon({
  className = "",
  size = 18,
  filled = true,
  strokeClass = "stroke-rose-700",
  fillClass = "fill-rose-100",
}: Props) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"
        className={`${strokeClass} ${filled ? fillClass : "fill-none"}`}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}


