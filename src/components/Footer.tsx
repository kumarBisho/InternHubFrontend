export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'Product',
      links: [
        { label: 'Features', href: '#features' },
        { label: 'Pricing', href: '#pricing' },
        { label: 'Roadmap', href: '#roadmap' },
      ],
    },
    {
      title: 'Support',
      links: [
        { label: 'Contact Us', href: '#contact' },
        { label: 'Help Center', href: '#help' },
        { label: 'Documentation', href: '#docs' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Terms of Service', href: '#terms' },
        { label: 'Privacy Policy', href: '#privacy' },
        { label: 'Cookie Policy', href: '#cookies' },
      ],
    },
    {
      title: 'Connect',
      links: [
        { label: 'Twitter', href: '#twitter' },
        { label: 'LinkedIn', href: 'https://www.linkedin.com/company/andor-tech/posts/?feedView=all' },
        { label: 'GitHub', href: '#github' },
      ],
    },
  ];

  return (
    <footer className="bg-neutral-900 text-neutral-300 mt-16">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Top Section - Brand & Description */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-gradient-to-br from-primary-600 to-accent-600 rounded-lg p-2">
                <span className="text-white font-bold text-lg">IH</span>
              </div>
              <span className="font-bold text-heading-sm text-white">InternHub</span>
            </div>
            <p className="text-body-sm text-neutral-400 leading-relaxed">
              Streamline internship management with our comprehensive project and task management platform.
            </p>
          </div>

          {/* Footer Links Sections */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="text-white font-semibold text-body-md mb-4">
                {section.title}
              </h4>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target={link.href.startsWith('http') ? '_blank' : undefined}
                      rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="text-neutral-400 hover:text-primary-400 text-body-sm transition-colors duration-200"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-neutral-800 my-8"></div>

        {/* Bottom Section - Copyright & Social */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-neutral-400 text-body-sm">
            © {currentYear} InternHub. All rights reserved. 
          </p>

          {/* Social Links */}
          <div className="flex items-center gap-6">
            <a
              href="#twitter"
              className="text-neutral-400 hover:text-primary-400 transition-colors duration-200 text-body-sm font-medium"
              aria-label="Twitter"
            >
              Twitter
            </a>
            <div className="w-px h-4 bg-neutral-700"></div>
            <a
              href="https://www.linkedin.com/company/andor-tech/posts/?feedView=all"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-400 hover:text-primary-400 transition-colors duration-200 text-body-sm font-medium"
              aria-label="LinkedIn"
            >
              LinkedIn
            </a>
            <div className="w-px h-4 bg-neutral-700"></div>
            <a
              href="#github"
              className="text-neutral-400 hover:text-primary-400 transition-colors duration-200 text-body-sm font-medium"
              aria-label="GitHub"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
