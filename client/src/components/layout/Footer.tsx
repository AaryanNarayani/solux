import { motion } from 'framer-motion';
import Logo from '../ui/Logo';

const Footer = () => {
  const footerLinks = [
    {
      title: 'Product',
      links: [
        { name: 'Explorer', href: '#' },
        { name: 'API', href: '#' },
        { name: 'Analytics', href: '#' },
        { name: 'Validators', href: '#' }
      ]
    },
    {
      title: 'Resources',
      links: [
        { name: 'Documentation', href: '#' },
        { name: 'Tutorials', href: '#' },
        { name: 'Blog', href: '#' },
        { name: 'Status', href: '#' }
      ]
    },
    {
      title: 'Community',
      links: [
        { name: 'Discord', href: '#' },
        { name: 'Twitter', href: '#' },
        { name: 'GitHub', href: '#' },
        { name: 'Forum', href: '#' }
      ]
    }
  ];

  return (
    <footer className="relative py-20 px-6 border-t border-white/10">
      <div className="max-w-7xl mx-auto">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Section */}
          <motion.div
            className="lg:col-span-1"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Logo size="lg" className="mb-4" />
            <p className="text-gray-400 leading-relaxed mb-6">
              The fastest and most intuitive Solana block explorer. 
              Built for developers, designed for everyone.
            </p>
            
            {/* Social Links */}
            <div className="flex items-center space-x-4">
              {[
                { name: 'Twitter', icon: '🐦', href: '#' },
                { name: 'Discord', icon: '💬', href: '#' },
                { name: 'GitHub', icon: '👨‍💻', href: '#' }
              ].map((social) => (
                <motion.a
                  key={social.name}
                  href={social.href}
                  className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-lg hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Links Sections */}
          {footerLinks.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <h3 className="text-white font-medium mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <motion.a
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors duration-300 cursor-pointer"
                      whileHover={{ x: 4 }}
                    >
                      {link.name}
                    </motion.a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Bottom Section */}
        <motion.div
          className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <div className="text-gray-400 text-sm">
            © 2024 Solux. All rights reserved.
          </div>
          
          <div className="flex items-center space-x-6 text-sm">
            <motion.a
              href="#"
              className="text-gray-400 hover:text-white transition-colors duration-300 cursor-pointer"
              whileHover={{ y: -1 }}
            >
              Privacy Policy
            </motion.a>
            <motion.a
              href="#"
              className="text-gray-400 hover:text-white transition-colors duration-300 cursor-pointer"
              whileHover={{ y: -1 }}
            >
              Terms of Service
            </motion.a>
            <motion.a
              href="#"
              className="text-gray-400 hover:text-white transition-colors duration-300 cursor-pointer"
              whileHover={{ y: -1 }}
            >
              Cookie Policy
            </motion.a>
          </div>
        </motion.div>

        {/* Network Status Indicator */}
        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center space-x-2 text-xs text-gray-500">
            <motion.div
              className="w-2 h-2 bg-green-400 rounded-full"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span>All systems operational</span>
            <span>•</span>
            <span>Last updated: just now</span>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer; 