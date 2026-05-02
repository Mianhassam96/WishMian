import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-white font-bold text-lg">
              Wish<span className="text-violet-400">Mian</span>
            </span>
          </Link>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm text-white/40">
            {["Privacy", "Terms", "Contact", "Blog"].map((item) => (
              <Link
                key={item}
                href={`/${item.toLowerCase()}`}
                className="hover:text-white transition-colors"
              >
                {item}
              </Link>
            ))}
          </div>

          {/* Copyright */}
          <p className="text-white/20 text-sm">
            © 2025 WishMian. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
