import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const categories = [
  {
    title: 'Tarihi Dönüm Noktaları',
    images: [
      { src: '/images/ANITKABİR.jpg', alt: 'Anıtkabir' },
      { src: '/images/ANKARAKALESİ.png', alt: 'Ankara Kalesi' },
      { src: '/images/hamamönü.jpg', alt: 'Hamamönü' },
      { src: '/images/HACIBAYRAMVELİ.png', alt: 'Hacı Bayram Veli Camii' },
    ]
  },
  {
    title: 'Görülmesi Gereken Yerler',
    images: [
      { src: '/images/Altın Park.png', alt: 'Altın Park' },
      { src: '/images/CSOO.jpg', alt: 'Cumhurbaşkanlığı Senfoni Orkestrası' },
      { src: '/images/lunapark.jpg', alt: 'Gençlik Parkı' },
      { src: '/images/harikalar diyarı.png', alt: 'Harikalar Diyarı' },
    ]
  },
  {
    title: 'Türk Mutfağı',
    images: [
      { src: '/images/ASPAVA.jpeg', alt: 'ASPAVA' },
      { src: '/images/düveroğlu.jpg', alt: 'DÜVEROĞLU' },
      { src: '/images/masabaşı.png', alt: 'Masabaşı Kebapçısı' },
      { src: '/images/GÖKSU.png', alt: 'Göksü Kebapçısı' },
    ]
  },
  {
    title: 'Benzersiz Hoteller',
    images: [
      { src: '/images/divan.png', alt: 'Divan Ankara' },
      { src: '/images/sheraton otel.jpg', alt: 'Sheraton Ankara' },
      { src: '/images/metro politan otel.jpg', alt: 'Metropolitan Hotel' },
      { src: '/images/newpark.png', alt: 'Newpark Hotel' },
    ]
  },
  {
    title: 'Açık Hava Aktiviteleri',
    images: [
      { src: '/images/kuğulu park.jpg', alt: 'Kuğulu Park' },
      { src: '/images/göksu.jpg', alt: 'Göksü Parkı' },
      { src: '/images/botanik park.jpg', alt: 'Botanik Bahçesi' },
      { src: '/images/eymir gölü.jpg', alt: 'Eymir Gölü' },
    ]
  },
  {
    title: 'Alışveriş Merkezleri',
    images: [
      { src: '/images/armada.jpg', alt: 'Armada AVM' },
      { src: '/images/ankamall.jpg', alt: 'ANKAmall AVM' },
      { src: '/images/karum.jpg', alt: 'Karum AVM' },
      { src: '/images/nata vega.jpg', alt: 'Nata Vega AVM' },
    ]
  },
  {
    title: 'Museums',
    images: [
      { src: '/images/MTA.jpg', alt: 'MTA Natural History Museum' },
      { src: '/images/kelime müzesi.jpg', alt: 'Word Museum' },
      { src: '/images/anadolu medeniyetleri.png', alt: 'Museum of Anatolian Civilizations' },
      { src: '/images/ankara resim heykel.jpg', alt: 'The State Art and Sculpture Museum' },
    ]
  },
];

const TopPlaces: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-white font-sans">
      <Navbar />
      <main className="px-6 py-12 bg-gradient-to-b from-cyan-50 to-white">
        <h1 className="text-5xl font-bold text-center text-gray-800 mb-16">Top Places in Ankara</h1>
        {categories.map((category, idx) => (
          <section key={idx} className="mb-20">
            <h2 className="text-3xl font-semibold text-gray-800 mb-6 border-l-4 border-blue-400 pl-4">
              {category.title}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {category.images.map((image, i) => (
                <div key={i} className="rounded-xl overflow-hidden shadow hover:shadow-lg transition-shadow duration-300">
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                  />
                  <p className="text-center p-2 text-gray-700 font-medium">{image.alt}</p>
                </div>
              ))}
            </div>
          </section>
        ))}
      </main>
      <Footer />
    </div>
  );
};

export default TopPlaces;