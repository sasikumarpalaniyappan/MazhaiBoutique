export default function About() {
  return (
    <main className="max-w-7xl mx-auto px-6 py-10 pt-40">
      <section className="mb-12">
        <h1 className="text-5xl font-bold text-rose-700 mb-8 text-center">
          About Mazhai Boutique
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-bold text-rose-900 mb-4">
              Our Story
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed mb-4">
              Mazhai Boutique is dedicated to bringing you the finest selection of traditional and contemporary women's fashion. With over a decade of experience, we curate each piece to ensure quality, elegance, and authenticity.
            </p>
            <p className="text-gray-700 text-lg leading-relaxed">
              From luxurious sarees to modern dresses, every item in our collection is handpicked to celebrate the beauty and grace of women.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-rose-900 mb-4">
              Our Mission
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed mb-4">
              Our mission is to make premium, elegant fashion accessible to every woman. We believe that fashion is a form of self-expression and confidence.
            </p>
            <p className="text-gray-700 text-lg leading-relaxed">
              We are committed to delivering exceptional customer service, sustainable practices, and collections that celebrate Indian heritage and contemporary style.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-rose-50 rounded-lg p-8 mb-12">
        <h2 className="text-3xl font-bold text-rose-700 mb-6 text-center">
          Why Choose Mazhai Boutique?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <h3 className="text-xl font-bold text-rose-700 mb-3">Premium Quality</h3>
            <p className="text-gray-700">
              We offer only the finest fabrics and handcrafted pieces that stand the test of time.
            </p>
          </div>
          <div className="text-center">
            <h3 className="text-xl font-bold text-rose-700 mb-3">Authentic Designs</h3>
            <p className="text-gray-700">
              Each collection celebrates traditional craftsmanship with modern sensibility.
            </p>
          </div>
          <div className="text-center">
            <h3 className="text-xl font-bold text-rose-700 mb-3">Customer Care</h3>
            <p className="text-gray-700">
              Your satisfaction is our priority with dedicated support and care.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}


