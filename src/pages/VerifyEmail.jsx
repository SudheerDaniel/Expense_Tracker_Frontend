import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("verifying"); // verifying | success | error
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      return;
    }

    api
      .get(`/api/auth/verify?token=${token}`)
      .then(() => setStatus("success"))
      .catch(() => setStatus("error"));
  }, []);

  return (
    <div className="min-h-screen bg-purple-50 flex items-center justify-center">
      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center max-w-md w-full">
        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
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
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>

        {status === "verifying" && (
          <>
            <h2 className="text-lg font-medium text-gray-800 mb-2">
              Verifying your email...
            </h2>
            <p className="text-sm text-gray-400">Please wait a moment.</p>
          </>
        )}

        {status === "success" && (
          <>
            <h2 className="text-lg font-medium text-gray-800 mb-2">
              Email verified!
            </h2>
            <p className="text-sm text-gray-400 mb-6">
              Your account is ready. You can now log in.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="bg-purple-500 text-white text-sm px-6 py-2 rounded-lg hover:bg-purple-600"
            >
              Go to Login
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <h2 className="text-lg font-medium text-gray-800 mb-2">
              Verification failed
            </h2>
            <p className="text-sm text-gray-400 mb-6">
              The link is invalid or has already been used.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="bg-purple-500 text-white text-sm px-6 py-2 rounded-lg hover:bg-purple-600"
            >
              Go to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
}
