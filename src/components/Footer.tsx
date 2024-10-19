import React from 'react';
import SocialMediaLinks from '@/components/SocialMediaLinks';
import dynamic from "next/dynamic";

function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-10">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
        
        {/* Left Section - Brand and Slogan */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <h2 className="text-xl font-semibold">Cotine</h2>
          <p className="text-sm text-gray-400 mt-2">Built with Lucid-Evolution.</p>
        </div>
        
        {/* Middle Section - Links */}
        <div className="flex flex-wrap justify-center md:justify-start space-x-4 md:space-x-6 text-sm">
          <a href="https://github.com/tontine-dapp" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
            GitHub
          </a>
          <a href="https://twitter.com/tontine" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
            Twitter
          </a>
          <a href="/docs" className="text-gray-400 hover:text-white">
            Docs
          </a>
          <a href="/contact" className="text-gray-400 hover:text-white">
            Contact Us
          </a>
          <a href="/terms" className="text-gray-400 hover:text-white">
            Terms & Conditions
          </a>
          <a href="/compliance" className="text-gray-400 hover:text-white">
            Compliance
          </a>
          <a href="/governance" className="text-gray-400 hover:text-white">
            Governance
          </a>
        </div>

        {/* Right Section - Social Icons */}
        <div className="flex justify-center md:justify-end">
          <SocialMediaLinks /> {/* Use the social media links here */}
        </div>
      </div>
      
      {/* Footer bottom text */}
      <div className="container mx-auto px-4 text-center text-gray-500 text-sm mt-6">
        © {new Date().getFullYear()} Cotine - Built with Lucid-Evolution on Cardano Blockchain by Eburnie Labs.
      </div>
    </footer>
  );
}

export default dynamic(() => Promise.resolve(Footer), { ssr: false });
