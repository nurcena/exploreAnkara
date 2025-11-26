import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Signup from './pages/Signup';
import Login from './pages/Login';

import Home from './pages/Home';

import Favorites from './pages/Favorites';

import Gallery from './pages/Gallery'; // 👈 GALERİYİ EKLEDİK
import TopPlaces from './pages/TopPlaces'; // 👈 TOP PLACES SAYFASINI EKLEDİK

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gray-100">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
         
          <Route path="/favorites" element={<Favorites />} />
         
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/top-places" element={<TopPlaces />} /> {/* 👈 TOP PLACES ROUTE’U EKLENDİ */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
