import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const galleryImages = [
  { src: '/images/Atakule.jpg', alt: 'Atakule' },
  { src: '/images/Anıtkabir.jpg', alt: 'Anıtkabir' },
  { src: '/images/AnkaraKalesi.jpg', alt: 'Ankara Kalesi' },
  { src: '/images/RahmiKoç.jpg', alt: 'Rahmi Koç Müzesi' },
  { src: '/images/Cumhurbaşkanlığı.jpg', alt: 'Cumhurbaşkanlığı Senfoni Orkestrası - CSO' },
  { src: '/images/ResimHeykel.jpg', alt: 'Resim Heykel Müzesi' },
  { src: '/images/ankara millet kütüphanesi.jpg', alt: 'Millet Kütüphanesi' },
  { src: '/images/lunapark.jpg', alt: 'Gençlik Parkı' },
  { src: '/images/eymir gölü.jpg', alt: 'Eymir Gölü' },
];

const Gallery: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen font-sans bg-white">
      <Navbar />

      <section className="py-16 px-6 bg-gradient-to-b from-cyan-50 to-white">
        <h1 className="text-5xl font-bold text-center text-gray-800 mb-12">Ankara Fotoğraf Galerisi</h1>
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {galleryImages.map((image, index) => (
            <div key={index} className="rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
              />
              <div className="p-4 bg-white">
                <p className="text-lg font-semibold text-gray-700 text-center">{image.alt}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Gallery;
