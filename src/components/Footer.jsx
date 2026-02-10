import { motion } from "framer-motion";

const Footer = () => {
  return (
    <footer className="bg-base-200 border-t border-primary/20 py-5 px-6 mt-auto">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Logo and Brand Text */}
        <div className="flex items-center gap-3">
          <div className="avatar">
            <div className="w-8 rounded-lg ring ring-primary ring-offset-base-100 ring-offset-2">
              <img src="/DevNet F1.png" alt="DevNet Logo" />
            </div>
          </div>

          <motion.span
            whileHover={{ scale: 1.05 }}
            className="text-sm text-base-content/70"
          >
            © {new Date().getFullYear()} DevNet. All rights reserved.
          </motion.span>
        </div>

        {/* Social Icons */}
        <div className="flex gap-3 flex-wrap justify-center">
          <a href="#" className="btn btn-circle btn-ghost btn-sm" aria-label="X">
            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 512 512" className="w-5 h-5">
              <path d="M461.2 53.1h-70.6L296.4 217.3 157.4 53.1H24.7l188.7 224.7L18.2 458.9h70.6l112.6-144.5 149.7 144.5h132.8L292.8 286.8 461.2 53.1z" />
            </svg>
          </a>

          <a href="#" className="btn btn-circle btn-ghost btn-sm" aria-label="YouTube">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" fill="currentColor" className="w-5 h-5">
              <path d="M549.7 124.1c-6.3-23.7-24.9-42.3-48.6-48.6C458.7 64 288 64 288 64S117.3 64 74.9 75.5c-23.7 6.3-42.3 24.9-48.6 48.6C15.9 166.5 15.9 256 15.9 256s0 89.5 10.4 131.9c6.3 23.7 24.9 42.3 48.6 48.6C117.3 448 288 448 288 448s170.7 0 213.1-11.5c23.7-6.3 42.3-24.9 48.6-48.6 10.4-42.4 10.4-131.9 10.4-131.9s0-89.5-10.4-131.9zM232 338.8V173.2l142.8 82.8-142.8 82.8z" />
            </svg>
          </a>

          <a href="#" className="btn btn-circle btn-ghost btn-sm" aria-label="Facebook">
            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 320 512" className="w-5 h-5">
              <path d="M279.14 288l14.22-92.66h-88.91V127.5c0-25.35 12.42-50.06 52.24-50.06H293V6.26S259.5 0 225.36 0c-73.5 0-121.14 44.38-121.14 124.72V195.3H22.89V288h81.33v224h100.17V288z" />
            </svg>
          </a>

          <a href="#" className="btn btn-circle btn-ghost btn-sm" aria-label="LinkedIn">
            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 448 512" className="w-5 h-5">
              <path d="M100.28 448H7.4V148.9h92.88zm-46.44-340c-31.5 0-57-25.5-57-57S22.34 0 53.84 0s57 25.5 57 57-25.5 57-57 57zM447.9 448h-92.6V302.4c0-34.7-12.4-58.4-43.4-58.4-23.6 0-37.6 15.8-43.8 31.1-2.3 5.5-2.9 13.1-2.9 20.7V448h-92.6s1.2-269.2 0-297h92.6v42.1c12.3-19 34.4-46 83.6-46 61 0 106.6 39.8 106.6 125.3V448z" />
            </svg>
          </a>

          <a href="#" className="btn btn-circle btn-ghost btn-sm" aria-label="Instagram">
            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 448 512" className="w-5 h-5">
              <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9 114.9-51.3 114.9-114.9-51.3-114.9-114.9-114.9zm0 190.7c-41.9 0-75.8-33.9-75.8-75.8s33.9-75.8 75.8-75.8 75.8 33.9 75.8 75.8-33.9 75.8-75.8 75.8zm146.4-194.3c0 14.9-12 26.9-26.9 26.9s-26.9-12-26.9-26.9 12-26.9 26.9-26.9 26.9 12 26.9 26.9zM398.8 388c-7.8 19.6-23 35.4-42.6 43.2-29.5 11.7-99.5 9-132.2 9s-102.7 2.6-132.2-9c-19.6-7.8-34.8-23.6-42.6-43.2-11.7-29.5-9-99.5-9-132.2s-2.6-102.7 9-132.2c7.8-19.6 23-35.4 42.6-43.2 29.5-11.7 99.5-9 132.2-9s102.7-2.6 132.2 9c19.6 7.8 34.8 23.6 42.6 43.2 11.7 29.5 9 99.5 9 132.2s2.7 102.7-9 132.2z" />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;