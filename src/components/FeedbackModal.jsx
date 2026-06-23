import { useState } from "react";
import emailjs from "@emailjs/browser";

export default function FeedbackModal({onClose}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("idle"); //idle | sending | success | error

  const handleSubmit = async () => {
    if (!name || !email || !message) return;
    setStatus("sending");

    try {
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        { name, email, message },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY


      );
      setStatus("success");
    } catch (err) {
      console.error("Failed to send feedback", err);
      setStatus("error");
    }
   };

   return (
     <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-medium text-gray-800">Send Feedback</h2>
                    <button
                      onClick={onClose}
                      className="text-gray-400 hover:text-gray-600 text-xl leading-none"
                     >
                      ×
                    </button>
                  </div>

                  {status === "success" ? (
                    <div className="text-center py-6">
                      <p className="text-green-600 font-medium">Thanks for your feedback!</p>
                      <p className="text-sm text-gray-400 mt-1">We'll get back to you soon.</p>
                      <button
                        onClick={onClose}
                        className="mt-4 text-sm bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600"
                      >
                        Close
                      </button>
                    </div>
                  ) : (
                    <> 
             <div className="flex flex-col gap-3">
                        <input
                          type="text"
                          placeholder="Your name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-400"
                        />
                        <input
                          type="email"
                          placeholder="Your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-400"
                        />
                        <textarea
                          placeholder="Your feedback..."
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          rows={4}
                          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-400 resize-none"
                        />
                      </div> 
    {status === "error" && (
              <p className="text-red-500 text-sm mt-2">
                Something went wrong. Please try again.
              </p>
            )}
 
<div className="flex justify-end gap-2 mt-4">
              <button
                onClick={onClose}
                className="text-sm px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:border-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={status === "sending" || !name || !email || !message}
                className="text-sm bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {status === "sending" ? "Sending..." : "Send"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
