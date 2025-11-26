import React from "react";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaXTwitter, FaYoutube, FaTiktok } from "react-icons/fa6";

const Footer: React.FC = () => {
  return (
    <footer className="bg-white pt-8 pb-4 px-6 flex flex-col items-center animate-fade-in">
      
      {/* Üst Çizgi */}
      <div className="w-full border-t border-gray-300 mb-6"></div>

      {/* Üst Kısım */}
      <div className="flex flex-col md:flex-row items-center justify-between w-full max-w-7xl mx-auto space-y-8 md:space-y-0 md:space-x-8">

        {/* Sol Taraf - Keşfet Ankara */}
        <div className="text-center md:text-left">
          <h2 className="text-3xl font-extrabold text-blue-600">KEŞFET ANKARA</h2>
          <p className="text-sm font-semibold text-gray-700 mt-2 tracking-wider">OFFICIAL VISITOR GUIDE</p>
        </div>

        {/* Orta - Ankara Skyline */}
        <div className="flex justify-center">
          <img
            src="/images/anki.jpg"
            alt="Ankara Skyline"
            className="w-72 md:w-96 object-contain"
          />
        </div>

        {/* Sağ Taraf - Sosyal Medya */}
        <div className="flex flex-col items-center space-y-4">
          <div className="flex space-x-4">
            {[
              <FaTiktok />, <FaYoutube />, <FaInstagram />,
              <FaLinkedinIn />, <FaXTwitter />, <FaFacebookF />
            ].map((Icon, index) => (
              <a
                key={index}
                href="#"
                className="border-2 border-blue-400 rounded-full p-2 text-blue-400 hover:bg-gradient-to-r hover:from-blue-400 hover:to-cyan-400 hover:text-white transition transform hover:scale-110 duration-300"
              >
                {Icon}
              </a>
            ))}
          </div>

          {/* İkonların altına Legal Links */}
          <div className="flex space-x-6 mt-2">
            <a href="#" className="text-blue-500 text-sm relative group">
              Terms & Conditions
              <span className="block h-0.5 max-w-0 bg-blue-500 transition-all group-hover:max-w-full duration-300"></span>
            </a>
            <a href="#" className="text-blue-500 text-sm relative group">
              Privacy & Cookies
              <span className="block h-0.5 max-w-0 bg-blue-500 transition-all group-hover:max-w-full duration-300"></span>
            </a>
          </div>

        </div>
      </div>

      {/* Alt Çizgi */}
      <div className="w-full border-t border-gray-300 mt-8"></div>

      {/* Copyright */}
      <p className="text-xs font-bold text-gray-600 mt-2">
        © 2025 Keşfet Ankara. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;
