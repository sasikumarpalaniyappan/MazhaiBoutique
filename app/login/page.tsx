import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white flex items-center justify-center px-4 sm:px-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 sm:p-10">
        <h1 className="text-3xl font-bold text-rose-700 mb-2 text-center" style={{ fontFamily: "Cormorant, serif", fontStyle: "italic" }}>
          Welcome Back
        </h1>
        <p className="text-center text-gray-600 mb-8">Sign in to your account</p>

        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full px-4 py-2 border border-rose-200 rounded-lg focus:ring-2 focus:ring-rose-600 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-rose-200 rounded-lg focus:ring-2 focus:ring-rose-600 focus:border-transparent outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold py-2 rounded-lg transition mt-6"
          >
            Sign In
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          Don't have an account?{" "}
          <Link href="/register" className="text-rose-600 hover:text-rose-700 font-semibold">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
