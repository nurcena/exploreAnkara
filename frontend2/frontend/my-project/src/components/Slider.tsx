import React, { useState, useEffect } from "react";

interface Image {
    src: string;
    alt: string;
    caption?: string;
}

interface SliderProps {
    images: Image[];
}

const Slider: React.FC<SliderProps> = ({ images }) => {
    const [index, setIndex] = useState(0);

    const prevSlide = () => {
        setIndex(index === 0 ? images.length - 1 : index - 1);
    };

    const nextSlide = () => {
        setIndex(index === images.length - 1 ? 0 : index + 1);
    };


    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
        }, 5000); 

        
        return () => clearInterval(interval);
    }, [images.length]);

    return (
        <div className="relative w-full h-[90vh] overflow-hidden shadow-xl mt-0">
            <img
                src={images[index].src}
                alt={images[index].alt}
                className="w-full h-full object-cover transition-all duration-700 ease-in-out"
            />

            {/* Caption */}
            <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-4 py-2 rounded-md text-lg z-10">
                {images[index].caption}
            </div>

            {/* Prev Button */}
            <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white bg-black bg-opacity-40 p-3 rounded-full hover:bg-opacity-70 z-10"
            >
                ‹
            </button>

            {/* Next Button */}
            <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white bg-black bg-opacity-40 p-3 rounded-full hover:bg-opacity-70 z-10"
            >
                ›
            </button>
        </div>
    );
};

export default Slider;
