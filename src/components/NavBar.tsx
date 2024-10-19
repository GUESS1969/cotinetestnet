"use client";
import React, { useState } from "react";
// import WalletConnect from "./WalletConnect";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDiscord, faGithub } from "@fortawesome/free-brands-svg-icons";
import { faBars, faTimes } from "@fortawesome/free-solid-svg-icons";
import dynamic from "next/dynamic";
const WalletConnect = dynamic(() => import("./WalletConnect"), {
  ssr: false,
});



export default function NavBar() {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white text-gray-800 py-4 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center px-6">
        
        {/* Logo or Title */}
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          <a href="/" className="hover:text-accent transition duration-200">
            Cotine
          </a>
        </h1>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden text-gray-800 text-2xl focus:outline-none"
          onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
        >
          <FontAwesomeIcon icon={isMobileMenuOpen ? faTimes : faBars} />
        </button>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center space-x-8">
          <a href="#features" className="text-lg hover:text-accent transition duration-200 text-gray-700">
            Gouvernance
          </a>
          <a href="#documentation" className="text-lg hover:text-accent transition duration-200 text-gray-700">
            Documentation
          </a>
          <a href="#compliance" className="text-lg hover:text-accent transition duration-200 text-gray-700">
            Compliance
          </a>
          <a href="#about" className="block text-lg py-2 hover:text-accent transition duration-200 text-gray-700">
            About
          </a>
        </div>

        {/* Discord & GitHub Icons */}
        <div className="hidden lg:flex items-center space-x-4">
          <a href="https://discord.gg/yourdiscordlink" target="_blank" rel="noopener noreferrer">
            <FontAwesomeIcon icon={faDiscord} className="text-gray-700 hover:text-accent text-xl transition duration-200" />
          </a>
          <a href="https://github.com/EBURNIELABS" target="_blank" rel="noopener noreferrer">
            <FontAwesomeIcon icon={faGithub} className="text-gray-700 hover:text-accent text-xl transition duration-200" />
          </a>

          {/* Wallet Connect Button */}
          <WalletConnect />
        </div>
      </div>

      {/* Mobile Menu Links */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white px-6 py-4 shadow-md">
          <a href="#gouvernance" className="block text-lg py-2 hover:text-accent transition duration-200 text-gray-700">
            Gouvernance
          </a>
          <a href="#documentation" className="block text-lg py-2 hover:text-accent transition duration-200 text-gray-700">
            Documentation
          </a>
          <a href="#compliance" className="block text-lg py-2 hover:text-accent transition duration-200 text-gray-700">
            Compliance
          </a>

          <a href="#about" className="block text-lg py-2 hover:text-accent transition duration-200 text-gray-700">
            About
          </a>

          <div className="mt-4 flex justify-start space-x-4">
            <a href="https://discord.gg/yourdiscordlink" target="_blank" rel="noopener noreferrer">
              <FontAwesomeIcon icon={faDiscord} className="text-gray-700 hover:text-accent text-xl transition duration-200" />
            </a>
            <a href="https://github.com/docybo/Tontino_3.0" target="_blank" rel="noopener noreferrer">
              <FontAwesomeIcon icon={faGithub} className="text-gray-700 hover:text-accent text-xl transition duration-200" />
            </a>

            {/* Wallet Connect Button */}
            <WalletConnect />
          </div>
        </div>
      )}
    </nav>
  );
}
