import CategorySection from "@/components/CategorySection";
import FeaturedProducts from "@/components/FeaturedProducts";

export default function Home() {
  return (
    <main className="scroll-smooth">
      {/* HOME SECTION */}
      <section id="home" className="relative w-full h-screen flex items-center justify-center mt-0 overflow-hidden">
        <img
          src="https://t3.ftcdn.net/jpg/09/91/16/18/360_F_991161810_AeIxqvAI9O0N1PvGhye99Xz923LEosqZ.jpg"
          alt="Hero Background"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative text-center text-white px-6 z-10">
          <h1 className="text-6xl font-bold mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            Mazhai Boutique
          </h1>
          
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Elegance in Every Thread. Discover beautiful Sarees, Kurtas, Lehengas and Designer Collections for every occasion.
          </p>
          
          <div className="flex items-center justify-center">
            <a href="#collections" className="inline-block bg-pink-600 hover:bg-pink-700 text-white font-bold px-8 py-3 rounded-full text-lg cursor-pointer">
              Explore Collection
            </a>
          </div>
        </div>
      </section>

      {/* COLLECTIONS SECTION */}
      <section id="collections" className="max-w-7xl mx-auto px-6 py-20 scroll-mt-40">
        <h2 className="text-4xl font-bold text-center text-pink-600 mb-12" style={{ fontFamily: 'Cormorant, serif', fontStyle: 'italic' }}>
          Our Collections
        </h2>
        <CategorySection />
        <div id="featured" className="mt-16 scroll-mt-40">
          <FeaturedProducts />
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section id="about" className="bg-gray-50 py-20 scroll-mt-40">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-pink-600 mb-12" style={{ fontFamily: 'Cormorant, serif', fontStyle: 'italic' }}>
            About Mazhai Boutique
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
            <div>
              <h3 className="text-2xl font-bold text-pink-600 mb-4" style={{ fontFamily: 'Cormorant, serif', fontStyle: 'italic' }}>Our Story</h3>
              <p className="text-gray-700 text-lg leading-relaxed mb-4">
                Mazhai Boutique is dedicated to bringing you the finest selection of traditional and contemporary women&apos;s fashion. With over a decade of experience, we curate each piece to ensure quality, elegance, and authenticity.
              </p>
              <p className="text-gray-700 text-lg leading-relaxed">
                From luxurious sarees to modern dresses, every item in our collection is handpicked to celebrate the beauty and grace of women.
              </p>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-pink-600 mb-4" style={{ fontFamily: 'Cormorant, serif', fontStyle: 'italic' }}>Our Mission</h3>
              <p className="text-gray-700 text-lg leading-relaxed mb-4">
                Our mission is to make premium, elegant fashion accessible to every woman. We believe that fashion is a form of self-expression and confidence.
              </p>
              <p className="text-gray-700 text-lg leading-relaxed">
                We are committed to delivering exceptional customer service, sustainable practices, and collections that celebrate Indian heritage and contemporary style.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <h3 className="text-2xl font-bold text-pink-600 mb-8 text-center" style={{ fontFamily: 'Cormorant, serif', fontStyle: 'italic' }}>Why Choose Mazhai Boutique?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <h4 className="text-xl font-bold text-pink-600 mb-3" style={{ fontFamily: 'Cormorant, serif', fontStyle: 'italic' }}>Premium Quality</h4>
                <p className="text-gray-700">
                  We offer only the finest fabrics and handcrafted pieces that stand the test of time.
                </p>
              </div>
              <div className="text-center">
                <h4 className="text-xl font-bold text-pink-600 mb-3" style={{ fontFamily: 'Cormorant, serif', fontStyle: 'italic' }}>Authentic Designs</h4>
                <p className="text-gray-700">
                  Each collection celebrates traditional craftsmanship with modern sensibility.
                </p>
              </div>
              <div className="text-center">
                <h4 className="text-xl font-bold text-pink-600 mb-3" style={{ fontFamily: 'Cormorant, serif', fontStyle: 'italic' }}>Customer Care</h4>
                <p className="text-gray-700">
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
