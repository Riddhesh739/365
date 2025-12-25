"use client";

import { supabase } from "../lib/supabaseClient";
import { useState } from "react";

export default function Home() {
  const [email, setEmail] = useState("");
  const signIn = async () => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
    });

    if (error) alert(error.message);
    else alert("Check your email for the login link");
  };

  return (
    <main style={{ padding: 40 }}>
      <h1>OG-365</h1>

      <input
        placeholder="Enter email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ padding: 8 }}
      />

      <button onClick={signIn} style={{ marginLeft: 8 }}>
        Login
      </button>
    </main>
  );
}
