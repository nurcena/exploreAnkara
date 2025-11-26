import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser } from 'react-icons/fa';
import { AiFillStar } from 'react-icons/ai'; // ⭐ Daha estetik yıldız import edildi

const Navbar: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const goToLogin = () => {
    navigate('/login');
    setIsDropdownOpen(false);
  };

  const goToSignup = () => {
    navigate('/signup');
    setIsDropdownOpen(false);
  };

  const goToFavorites = () => {
    navigate('/favorites');
  };

  const goToGallery = () => {
    navigate('/gallery');
  };

  const goToTopPlaces = () => {
    navigate('/top-places');
  };

  const goToHowItWorks = () => {
    navigate('/how-it-works');
  };

  return (
    <header className="flex justify-between items-center px-6 py-4 bg-white shadow-md relative">
      
      {/* Logo */}
      <div className="flex items-center">
        <img src="images/KesfetAnkara.jpg" alt="Logo" className="h-10" />
      </div>

      {/* Menu Items */}
      <nav className="hidden md:flex space-x-10 text-sm font-medium text-gray-700">
        <button onClick={goToTopPlaces} className="hover:text-blue-500 transition">Top Places</button>
        <button onClick={goToHowItWorks} className="hover:text-blue-500 transition">How It Works</button>
        <button onClick={goToGallery} className="hover:text-blue-500 transition">Gallery</button>
      </nav>

      {/* User and Favorites Icons */}
      <div className="flex items-center space-x-4 relative">
        
        {/* Yıldız İkonu */}
        <button 
          onClick={goToFavorites} 
          className="text-3xl text-yellow-400 hover:text-yellow-500 transition transform hover:scale-110 drop-shadow-md"
        >
          <AiFillStar />
        </button>

        {/* Kullanıcı İkonu */}
        <button 
          onClick={toggleDropdown} 
          className="text-2xl text-gray-600 hover:text-blue-500 transition"
        >
          <FaUser />
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute right-0 mt-12 w-40 bg-white border rounded-md shadow-md p-4 z-50 animate-fade-in flex flex-col space-y-2">
            <button
              onClick={goToLogin}
              className="text-gray-700 hover:text-blue-600 text-left transition"
            >
              Login
            </button>
            <button
              onClick={goToSignup}
              className="text-gray-700 hover:text-blue-600 text-left transition"
            >
              Sign Up
            </button>
          </div>
        )}

      </div>

    </header>
  );
};

export default Navbar;