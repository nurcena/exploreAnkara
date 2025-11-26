import { useState, useEffect } from "react";
import { AiFillStar } from "react-icons/ai"; // Slay yıldız import edildi

const Favorites = () => {
  const [favorites, setFavorites] = useState<any[]>([]);

  useEffect(() => {
    const storedFavorites = localStorage.getItem("userFavorites");
    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites));
    }
  }, []);

  const removeFavorite = (id: string) => {
    const updatedFavorites = favorites.filter((fav) => fav.id !== id);
    setFavorites(updatedFavorites);
    localStorage.setItem("userFavorites", JSON.stringify(updatedFavorites));
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-r from-blue-100 to-cyan-100 p-8">
      
      {/* Başlık */}
      <h2 className="flex items-center justify-center text-4xl font-extrabold text-gray-800 mb-8 drop-shadow-md">
        Your Favorites
        <AiFillStar className="ml-3 text-yellow-400 text-5xl animate-pulse" />
      </h2>

      {favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-grow text-center">
          <p className="text-2xl font-semibold text-gray-500 drop-shadow-sm">
            Henüz favori planın bulunmuyor... 💭
          </p>
          <p className="text-md mt-2 text-gray-400">
            Beğendiğin aktiviteleri yıldızla ve burada biriktir! ✨
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {favorites.map((fav) => (
            <div key={fav.id} className="relative bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition">
              <img src={fav.img} alt={fav.title} className="w-full h-48 object-cover" />
              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-800">{fav.title}</h3>
              </div>

              {/* Remove Button */}
              <button
                onClick={() => removeFavorite(fav.id)}
                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white text-xs px-2 py-1 rounded-full"
              >
                Sil
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
