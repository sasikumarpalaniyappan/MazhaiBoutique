"use client";

export default function Footer() {
  return (
    <footer id="contact" className="bg-pink-800 text-white py-12 mt-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Left Section - Contact Info */}
          <div>
            <h2 className="text-3xl font-bold mb-8">Mazhai Boutique</h2>

            {/* Address */}
            <div className="mb-6">
              <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                📍 Address
              </h3>
              <p className="text-gray-100">
                6/1017 - A Mullai Valagam,
                <br />
                EB Colony,
                <br />
                Paramathi Road,
                <br />
                Namakkal - 637001
              </p>
            </div>

            {/* Phone */}
            <div className="mb-6">
              <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                📱 Phone
              </h3>
              <a
                href="tel:+919566914912"
                className="text-gray-100 hover:text-white underline"
              >
                +91 95669 14912
              </a>
            </div>

            {/* Google Maps */}
            <div className="mb-6">
              <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                📌 Google Maps
              </h3>
              <a
                href="https://maps.google.com/?q=6/1017+Mullai+Valagam+EB+Colony+Paramathi+Road+Namakkal+637001"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-100 hover:text-white underline"
              >
                Open Location
              </a>
            </div>

            {/* Instagram */}
            <div>
              <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                📷 Instagram
              </h3>
              <a
                href="https://instagram.com/mazhai_boutique"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-100 hover:text-white underline"
              >
                @mazhai_boutique
              </a>
            </div>
          </div>

          {/* Right Section - Follow us */}
          <div className="flex flex-col items-center justify-start">
            <h2 className="text-2xl font-bold mb-6">Follow us on Instagram</h2>
            <div className="bg-white p-4 rounded-lg">
              <img
                src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Crect fill='%23ffffff' x='0' y='0' width='200' height='200'/%3E%3Cg fill='%23000000'%3E%3Crect x='21' y='21' width='15' height='15'/%3E%3Crect x='42' y='21' width='15' height='15'/%3E%3Crect x='63' y='21' width='15' height='15'/%3E%3Crect x='84' y='21' width='15' height='15'/%3E%3Crect x='105' y='21' width='15' height='15'/%3E%3Crect x='126' y='21' width='15' height='15'/%3E%3Crect x='147' y='21' width='15' height='15'/%3E%3Crect x='168' y='21' width='15' height='15'/%3E%3Crect x='21' y='42' width='15' height='15'/%3E%3Crect x='168' y='42' width='15' height='15'/%3E%3Crect x='21' y='63' width='15' height='15'/%3E%3Crect x='42' y='63' width='15' height='15'/%3E%3Crect x='63' y='63' width='15' height='15'/%3E%3Crect x='84' y='63' width='15' height='15'/%3E%3Crect x='105' y='63' width='15' height='15'/%3E%3Crect x='126' y='63' width='15' height='15'/%3E%3Crect x='147' y='63' width='15' height='15'/%3E%3Crect x='168' y='63' width='15' height='15'/%3E%3Crect x='21' y='84' width='15' height='15'/%3E%3Crect x='42' y='84' width='15' height='15'/%3E%3Crect x='63' y='84' width='15' height='15'/%3E%3Crect x='84' y='84' width='15' height='15'/%3E%3Crect x='105' y='84' width='15' height='15'/%3E%3Crect x='126' y='84' width='15' height='15'/%3E%3Crect x='147' y='84' width='15' height='15'/%3E%3Crect x='168' y='84' width='15' height='15'/%3E%3Crect x='21' y='105' width='15' height='15'/%3E%3Crect x='168' y='105' width='15' height='15'/%3E%3Crect x='21' y='126' width='15' height='15'/%3E%3Crect x='42' y='126' width='15' height='15'/%3E%3Crect x='63' y='126' width='15' height='15'/%3E%3Crect x='84' y='126' width='15' height='15'/%3E%3Crect x='105' y='126' width='15' height='15'/%3E%3Crect x='126' y='126' width='15' height='15'/%3E%3Crect x='147' y='126' width='15' height='15'/%3E%3Crect x='168' y='126' width='15' height='15'/%3E%3Crect x='21' y='147' width='15' height='15'/%3E%3Crect x='168' y='147' width='15' height='15'/%3E%3Crect x='21' y='168' width='15' height='15'/%3E%3Crect x='42' y='168' width='15' height='15'/%3E%3Crect x='63' y='168' width='15' height='15'/%3E%3Crect x='84' y='168' width='15' height='15'/%3E%3Crect x='105' y='168' width='15' height='15'/%3E%3Crect x='126' y='168' width='15' height='15'/%3E%3Crect x='147' y='168' width='15' height='15'/%3E%3Crect x='168' y='168' width='15' height='15'/%3E%3C/g%3E%3C/svg%3E"
                alt="Instagram QR Code"
                className="w-40 h-40"
              />
            </div>
            <p className="mt-4 text-center text-gray-100">Scan to Follow</p>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-pink-700 mt-12 pt-8 text-center text-gray-100">
          <p>© 2026 Mazhai Boutique. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
