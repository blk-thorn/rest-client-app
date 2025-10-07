import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gray-700 bg-gray-900 py-4">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between px-6 gap-2 text-sm text-gray-400">
        <a
          href="https://github.com/Belifegor/rest-client-app/tree/develop"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-white transition-colors"
        >
          GitHub
        </a>
        <span>{new Date().getFullYear()}</span>
        <Link
          href="https://rs.school/courses/reactjs"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:opacity-80 transition-opacity"
        >
          <Image
            src="/rsschool-logo.svg"
            alt="RS School Logo"
            width={100}
            height={0}
            className="h-6 w-auto"
          />
        </Link>
      </div>
    </footer>
  );
}
