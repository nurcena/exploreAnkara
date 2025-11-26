import { useState } from "react";
import { Link } from "react-router-dom";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login Data:", formData);
    // Burada form verilerini API'ye veya istediğiniz yere gönderebilirsiniz.
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-gradient-to-r from-teal-400 to-blue-500 p-4">
      {/* Üst kısımda boşluk bırakmak için flex-1 kullanılmadı, 
          ancak isterseniz içerik ortalansın diye flex-1 ekleyebilirsiniz */}
      <div className="flex flex-1 items-center justify-center">
        <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-sm sm:max-w-md md:max-w-lg">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 text-center mb-4">
            Welcome Back!
          </h2>
          <p className="text-sm text-gray-600 text-center mb-8">
            Don't have an account?{" "}
            <Link to="/signup" className="text-blue-600 hover:underline font-semibold">
              Sign Up
            </Link>
          </p>
          <form onSubmit={handleSubmit} className="space-y-6">
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            />
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            />
            <div className="text-right">
              <a href="#" className="text-sm text-blue-600 hover:underline">
                Forgot Password?
              </a>
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition duration-200"
            >
              LOGIN
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
