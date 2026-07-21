import FeaturedProducts from "@/components/FeaturedProducts";
import HeroCarousel from "@/components/HeroCarousel";

export default function Home() {
  return (
    <main className="scroll-smooth">
      {/* HOME SECTION */}
      <section id="home" className="relative w-full h-80 sm:h-screen flex items-center justify-center mt-0 overflow-hidden">
        <HeroCarousel />
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative text-center text-white px-4 sm:px-6 z-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            Mazhai Boutique
          </h1>
          
          <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed">
            Elegance in Every Thread. Discover beautiful Sarees, Kurtas, Lehengas and Designer Collections for every occasion.
          </p>
          
          <div className="flex items-center justify-center">
            <a href="#featured" className="inline-block bg-rose-700 hover:bg-rose-800 text-white font-bold px-6 sm:px-8 py-2 sm:py-3 rounded-full text-sm sm:text-base lg:text-lg cursor-pointer transition-colors">
              Explore Collection
            </a>
          </div>
        </div>
      </section>

      <section id="featured" className="mx-auto max-w-7xl px-4 sm:px-6 pb-12 sm:pb-20 pt-8 sm:pt-12 scroll-mt-40">
        <FeaturedProducts />
      </section>

      {/* ABOUT SECTION */}
      <section id="about" className="bg-gray-50 py-12 sm:py-20 scroll-mt-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-rose-700 mb-8 sm:mb-12" style={{ fontFamily: 'Cormorant, serif', fontStyle: 'italic' }}>
            About Mazhai Boutique
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-12 mb-8 sm:mb-12">
            <div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-rose-700 mb-4" style={{ fontFamily: 'Cormorant, serif', fontStyle: 'italic' }}>Our Story</h3>
              <p className="text-gray-700 text-sm sm:text-base md:text-lg leading-relaxed mb-4">
                Mazhai Boutique is dedicated to bringing you the finest selection of traditional and contemporary women&apos;s fashion. With over a decade of experience, we curate each piece to ensure quality, elegance, and authenticity.
              </p>
              <p className="text-gray-700 text-sm sm:text-base md:text-lg leading-relaxed">
                From luxurious sarees to modern dresses, every item in our collection is handpicked to celebrate the beauty and grace of women.
              </p>
            </div>

            <div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-rose-700 mb-4" style={{ fontFamily: 'Cormorant, serif', fontStyle: 'italic' }}>Our Mission</h3>
              <p className="text-gray-700 text-sm sm:text-base md:text-lg leading-relaxed mb-4">
                Our mission is to make premium, elegant fashion accessible to every woman. We believe that fashion is a form of self-expression and confidence.
              </p>
              <p className="text-gray-700 text-sm sm:text-base md:text-lg leading-relaxed">
                We are committed to delivering exceptional customer service, sustainable practices, and collections that celebrate Indian heritage and contemporary style.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-rose-700 mb-6 sm:mb-8 text-center" style={{ fontFamily: 'Cormorant, serif', fontStyle: 'italic' }}>Why Choose Mazhai Boutique?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              <div className="text-center">
                <h4 className="text-base sm:text-lg md:text-xl font-bold text-rose-700 mb-3" style={{ fontFamily: 'Cormorant, serif', fontStyle: 'italic' }}>Premium Quality</h4>
                <p className="text-gray-700 text-sm sm:text-base">
                  We offer only the finest fabrics and handcrafted pieces that stand the test of time.
                </p>
              </div>
              <div className="text-center">
                <h4 className="text-base sm:text-lg md:text-xl font-bold text-rose-700 mb-3" style={{ fontFamily: 'Cormorant, serif', fontStyle: 'italic' }}>Authentic Designs</h4>
                <p className="text-gray-700 text-sm sm:text-base">
                  Each collection celebrates traditional craftsmanship with modern sensibility.
                </p>
              </div>
              <div className="text-center">
                <h4 className="text-base sm:text-lg md:text-xl font-bold text-rose-700 mb-3" style={{ fontFamily: 'Cormorant, serif', fontStyle: 'italic' }}>Customer Care</h4>
                <p className="text-gray-700 text-sm sm:text-base">
                  Your satisfaction is our priority with dedicated support and care.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>


    </main>
  );
}


