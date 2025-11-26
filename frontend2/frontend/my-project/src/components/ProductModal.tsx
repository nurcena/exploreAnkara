import React from "react";

interface Product {
    id: number;
    name: string;
    price: number;
    image: string;
    description: string;
}

interface ModalProps {
    product: Product;
    onClose: () => void;
    onAddToCart: () => void;
}

const ProductModal: React.FC<ModalProps> = ({ product, onClose, onAddToCart }) => {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full relative animate-fade-in">
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-gray-500 hover:text-black text-xl"
                >
                    ✕
                </button>
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                />
                <h2 className="text-2xl font-bold">{product.name}</h2>
                <p className="text-gray-700 my-4">{product.description}</p>
                <p className="text-lg font-semibold mb-4">{product.price}₺</p>
                <button
                    onClick={() => {
                        onAddToCart();
                        onClose();
                    }}
                    className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 px-4 rounded-lg transition w-full"
                >
                    Sepete Ekle
                </button>
            </div>
        </div>
    );
};

export default ProductModal;
