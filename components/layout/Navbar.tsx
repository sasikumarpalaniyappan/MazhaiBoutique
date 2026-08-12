import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-white shadow-md fixed top-[72px] left-0 w-full z-40">
      <ul className="flex justify-center gap-12 py-4 font-medium text-gray-700">
        <li className="hover:text-rose-700 cursor-pointer transition">
          <Link href="/#home">Home</Link>
        </li>
        <li className="hover:text-rose-700 cursor-pointer transition">
          <Link href="/#featured">Collections</Link>
        </li>
        <li className="hover:text-rose-700 cursor-pointer transition">
          <Link href="/#featured">Featured</Link>
        </li>
        <li className="hover:text-rose-700 cursor-pointer transition">
          <Link href="/#about">About</Link>
        </li>
        <li className="hover:text-rose-700 cursor-pointer transition">
          <Link href="/#contact">Contact</Link>
        </li>
        <li className="hover:text-rose-700 cursor-pointer transition">
          <Link href="/admin">Admin</Link>
        </li>
      </ul>
    </nav>
  );
}
