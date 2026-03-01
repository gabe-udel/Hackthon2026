"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginSuccessPage() {
  const [name, setName] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const email = localStorage.getItem("user_email");
    if (!email) {
      // no user info, go back to login
      router.replace("/user");
      return;
    }
    // take part before @
    const parts = email.split("@");
    setName(parts[0] || "");
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("user_email");
    localStorage.removeItem("auth_token");
    router.push("/user");
  };

  return (
    <div className="max-w-md mx-auto mt-24 text-center">
      <h1 className="text-2xl font-bold mb-4">Login successful</h1>
      <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4" />
      {name && <p className="text-lg font-semibold mb-6">{name}</p>}
      <button
        onClick={handleLogout}
        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
      >
        Return
      </button>
    </div>
  );
}
