import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../services/authService";

export default function Login() {
  // useState stores form values and UI states
  // think of them as instance variables that trigger re-render when changed
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // useNavigate lets us redirect to another page programmatically
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    // prevents the browser from refreshing the page on form submit
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      // calls authService.login which hits POST /api/auth/login
      // saves the JWT token to localStorage automatically
      await login(email, password);
      // redirect to dashboard on success
      navigate("/dashboard");
    } catch (err) {
      // show specific message if email is not verified yet
      if (err.response?.status === 403) {
        setError(
          "Please verify your email before logging in. Check your inbox.",
        );
      } else {
        setError("Invalid email or password");
      }
    } finally {
      // always stop the loading spinner whether success or failure
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl flex rounded-2xl overflow-hidden shadow-lg">
        {/* Left side — only visible on medium screens and above (hidden on mobile) */}
        <div className="hidden md:flex flex-col justify-center bg-purple-500 p-10 w-1/2">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-6">
            <svg
              className="w-6 h-6 text-purple-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-medium text-white mb-3">
            Know where your money goes
          </h1>
          <p className="text-purple-200 text-sm leading-relaxed mb-8">
            Simple, fast expense tracking for anyone who wants to stay on top of
            their finances.
          </p>

          {/* Feature list — mapped from an array to avoid repeating JSX */}
          <div className="flex flex-col gap-3">
            {[
              "Track by category and merchant",
              "Upload receipts",
              "Your data, private and secure",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-3.5 h-3.5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <p className="text-purple-100 text-sm">{item}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right side — login form */}
        <div className="flex flex-col justify-center bg-white p-10 w-full md:w-1/2">
          <h2 className="text-xl font-medium text-purple-900 mb-1">
            Welcome back
          </h2>
          <p className="text-gray-400 text-sm mb-7">Sign in to your account</p>

          {/* only renders if error state is not empty */}
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600 block mb-1.5">
                Email
              </label>
              {/* value and onChange keep the input in sync with state — controlled input */}
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-purple-400"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 block mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-purple-400"
              />
            </div>
            {/* disabled while loading to prevent double submission */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-500 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-purple-600 disabled:opacity-50 mt-2"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          {/* Link from react-router-dom — navigates without page refresh */}
          <p className="text-center text-gray-400 text-sm mt-5">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-purple-600 font-medium hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
