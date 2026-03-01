"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSoonToExpireItems } from "@/lib/supabase/interface";

interface Person {
  name: string;
  value: number;
}

function randomName() {
  const names = [
    "Alex",
    "Taylor",
    "Jordan",
    "Casey",
    "Morgan",
    "Riley",
    "Jamie",
    "Sam",
    "Robin",
    "Cameron",
  ];
  return names[Math.floor(Math.random() * names.length)];
}

function generateRandomValue(): number {
  const intPart = Math.floor(Math.random() * 200);
  const decimalEndings = [0.25, 0.49, 0.99];
  const decimalPart = decimalEndings[Math.floor(Math.random() * decimalEndings.length)];
  return parseFloat((intPart + decimalPart).toFixed(2));
}

function generateLeaderboard(currentUser?: string, ownValue?: number): Person[] {
  const list: Person[] = [];
  for (let i = 0; i < 10; i++) {
    list.push({ name: randomName(), value: generateRandomValue() });
  }
  if (currentUser) {
    // if ownValue provided use it, otherwise random
    list.push({ name: currentUser, value: ownValue ?? generateRandomValue() });
  }
  list.sort((a, b) => a.value - b.value);
  return list;
}

export default function NearbyPeopleLeaderPage() {
  const [user, setUser] = useState<string | null>(null);
  const [leaderboard, setLeaderboard] = useState<Person[]>([]);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    const email = localStorage.getItem("user_email");
    if (!token || !email) {
      // not logged in
      setUser(null);
      return;
    }
    const name = email.split("@")[0] || "";
    setUser(name);

    // compute current user's value by summing soon-to-expire items
    async function fetchOwnValue() {
      try {
        const items = await getSoonToExpireItems(3);
        const total = (items || []).reduce((acc, item) => acc + (item.price || 0), 0);
        return total;
      } catch (e) {
        console.error("Error fetching own soon items:", e);
        return undefined;
      }
    }

    fetchOwnValue().then((val) => {
      const data = generateLeaderboard(name, val);
      setLeaderboard(data);
    });
  }, []);

  if (!user) {
    return (
      <div className="max-w-md mx-auto mt-24 text-center">
        <p className="text-lg font-medium">Please log in to view this page.</p>
        <a
          href="/user"
          className="mt-4 inline-block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Go to login
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto mt-16">
      <h1 className="text-2xl font-bold mb-6 text-center">Nearby People</h1>
      <table className="w-full table-auto border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-4 py-2">Rank</th>
            <th className="border px-4 py-2">Name</th>
            <th className="border px-4 py-2">Total Value Expiring</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard.map((p, idx) => {
            const isCurrent = p.name === user;
            return (
              <tr
                key={idx}
                className={
                  "border " +
                  (isCurrent ? "bg-green-100 font-semibold" : "")
                }
              >
                <td className="px-4 py-2 text-center">{idx + 1}</td>
                <td className="px-4 py-2">{p.name}</td>
                <td className="px-4 py-2 text-right">{p.value}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
