import { useState } from "react";

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
}

const Home = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<Product[]>([]);

  const products: Product[] = [
    {
      id: 1,
      name: "White Snus",
      price: 150,
      image: "/images/snus1.jpg",
      description: "Buz gibi ferahlatıcı beyaz snus.",
    },
    {
      id: 2,
      name: "Strong Snus",
      price: 180,
      image: "/images/snus2.jpg",
      description: "Yüksek nikotinli güçlü snus.",
    },
    {
      id: 3,
      name: "Mint Snus",
      price: 170,
      image: "/images/snus3.jpg",
      description: "Nane aromalı ferahlatıcı snus.",
    },
  ];

  const handleAddToCart = (product: Product) => {
    setCart([...cart, product]);
    alert(`${product.name} sepete eklendi!`);
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <h1 className="text-4xl font-bold mb-6 text-center">Popüler Ürünler</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition flex flex-col justify-between"
          >
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
            <h2 className="text-xl font-bold mb-2">{product.name}</h2>
            <p className="text-gray-600 mb-2">{product.description}</p>
            <p className="text-lg font-semibold mb-4">{product.price}₺</p>
            <button
              onClick={() => handleAddToCart(product)}
              className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 px-4 rounded-lg transition"
            >
              Sepete Ekle
            </button>
          </div>
        ))}
      </div>

      <div className="mt-10 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Sepetim</h2>
        {cart.length === 0 ? (
          <p className="text-gray-500">Sepetiniz boş.</p>
        ) : (
          <ul className="space-y-2">
            {cart.map((item, index) => (
              <li key={index} className="flex justify-between">
                <span>{item.name}</span>
                <span>{item.price}₺</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Home;
