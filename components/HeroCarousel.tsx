"use client";

import { useEffect, useState } from "react";

const images = [
  "https://www.indidha.com/cdn/shop/articles/how-to-care-for-chanderi-sarees-expert-tips-for-longevity-4654969.webp?v=1752553151",
  "https://media.istockphoto.com/id/1493548307/photo/beautiful-hindu-indian-young-women-lightening-diya.jpg?s=612x612&w=0&k=20&c=lGTsG1Q8YBkZMqM4n9oredvNHas5NStEq4tDcPC0pIk=",
  "https://vasumatis.com/cdn/shop/articles/116-types-of-sarees-in-india-with-names-and-images-5519351.webp?v=1753445955&width=1200",
  "https://media.istockphoto.com/id/1045833086/photo/beauty-in-saree.jpg?s=612x612&w=0&k=20&c=xfpCm9pNDcJ3RWx9YMOFEZujYU1nJpCZdVaq5eo-1Q4=",
  "https://media.istockphoto.com/id/1270784869/photo/pretty-indian-young-hindu-bride-in-studio-shot.jpg?s=612x612&w=0&k=20&c=NbpI14qro1pgA0Kuq6ZmgEA9pD-1M6Si_bNSGzjZP2Q=",
];

export default function HeroCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="absolute inset-0 h-full w-full overflow-hidden">
      {images.map((src, index) => (
        <img
          key={src}
          src={src}
          alt={`Hero background ${index + 1}`}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
            index === activeIndex ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
    </div>
  );
}
