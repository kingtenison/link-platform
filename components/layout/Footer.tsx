import Link from 'next/link'
import { FiGithub, FiTwitter, FiLinkedin } from 'react-icons/fi'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative z-10 w-full border-t border-white/10 mt-auto" role="contentinfo">
      <div className="w-full px-8 sm:px-12 lg:px-16 xl:px-20 2xl:px-24 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 group mb-4">
              <div className="w-9 h-9 bg-white rounded-xl shadow-md shadow-black/10 ring-1 ring-black/5 flex items-center justify-center">
                <span className="text-lg font-bold bg-gradient-to-br from-teal-500 to-cyan-600 bg-clip-text text-transparent">
                  L
                </span>
              </div>
              <span className="text-base font-bold text-white">LinkPlatform</span>
            </Link>
            <p className="text-white/50 text-sm leading-relaxed">
              Free URL shortener with real-time analytics, QR codes, and link protection.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4">Product</h3>
            <ul className="space-y-2.5">
              <li><Link href="/#features" className="text-white/50 hover:text-white text-sm transition-colors">Features</Link></li>
              <li><Link href="/#how" className="text-white/50 hover:text-white text-sm transition-colors">How It Works</Link></li>
              <li><Link href="/#faq" className="text-white/50 hover:text-white text-sm transition-colors">FAQ</Link></li>
              <li><Link href="/register" className="text-white/50 hover:text-white text-sm transition-colors">Get Started</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4">Legal</h3>
            <ul className="space-y-2.5">
              <li><span className="text-white/50 text-sm">Privacy Policy</span></li>
              <li><span className="text-white/50 text-sm">Terms of Service</span></li>
              <li><span className="text-white/50 text-sm">Cookie Policy</span></li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4">Connect</h3>
            <div className="flex items-center gap-3">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/15 transition-colors"
                aria-label="Follow us on X (Twitter)"
              >
                <FiTwitter className="w-4 h-4" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/15 transition-colors"
                aria-label="View our GitHub"
              >
                <FiGithub className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/15 transition-colors"
                aria-label="Connect on LinkedIn"
              >
                <FiLinkedin className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-sm">
            &copy; {currentYear} LinkPlatform. All rights reserved.
          </p>
          <p className="text-white/40 text-xs">
            Built with care for speed, privacy, and simplicity.
          </p>
        </div>
      </div>
    </footer>
  )
}
