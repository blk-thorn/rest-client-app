"use rest";

import Link from "next/link";
import { ROUTES } from "@/constants/routes";

export default function Logo() {
  return (
    <Link href={ROUTES.HOME} className="font-bold text-lg hover:opacity-80 transition">
      <svg
        width="40"
        height="40"
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="hover:opacity-80 transition"
      >
        <rect width="40" height="40" rx="10" fill="#0c964a" />
        <path d="M12.5 20H27.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M20 12.5V27.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
        <path
          d="M23.75 16.25L16.25 23.75"
          stroke="#a1e0bd"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M16.25 16.25L23.75 23.75"
          stroke="#a1e0bd"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    </Link>
  );
}
