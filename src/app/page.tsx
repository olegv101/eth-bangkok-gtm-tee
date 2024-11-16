// src/app/page.tsx
"use client";
import Image from "next/image";
import styles from "./page.module.css";
import React, { useState } from "react";
import "dotenv/config";
import FormData from "form-data";
import { supportedNetworks } from "./api/signTransaction/chains";

// function hexToUint8Array(hex: string) {
//   hex = hex.trim();
//   if (!hex) {
//     throw new Error("Invalid hex string");
//   }
//   if (hex.startsWith("0x")) {
//     hex = hex.substring(2);
//   }
//   if (hex.length % 2 !== 0) {
//     throw new Error("Invalid hex string");
//   }

//   const array = new Uint8Array(hex.length / 2);
//   for (let i = 0; i < hex.length; i += 2) {
//     const byte = parseInt(hex.slice(i, i + 2), 16);
//     if (isNaN(byte)) {
//       throw new Error("Invalid hex string");
//     }
//     array[i / 2] = byte;
//   }
//   return array;
// }

// async function uploadUint8Array(data: Uint8Array) {
//   const blob = new Blob([data], { type: "application/octet-stream" });
//   console.log(blob);
//   const file = new File([blob], "quote.bin", {
//     type: "application/octet-stream",
//   });
//   console.log(file);
//   const formData = new FormData();
//   formData.append("file", file);

//   const result = await fetch(
//     "https://dstack-sim-explorer.vercel.app/api/upload",
//     {
//       method: "POST",
//       // @ts-ignore
//       body: formData,
//       mode: "no-cors",
//     }
//   );
//   console.log(result);
//   return result;
// }

export default function Home() {
  const [result, setResult] = useState<string | null>(null);
  const [tweetId, setTweetId] = useState<string>("");
  const [chainId, setChainId] = useState<string>("");
  const [keyword, setKeyword] = useState<string>("");

  const handleClick = async (path: string) => {
    try {
      let response, data;
      if (path === "/api/signMessage") {
        const messageData = { message: "t/acc" };
        response = await fetch(path, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(messageData),
        });
        data = await response.json();
        console.log(JSON.stringify(data));
        setResult(JSON.stringify(data, null, 2)); // Pretty print JSON
      } else {
        if (path === "/api/signTransaction") {
          if (!tweetId.trim()) {
            setResult("Error: Tweet ID is required");
            return;
          }

          if (!chainId) {
            setResult("Error: Please select a chain");
            return;
          }

          if (!keyword.trim()) {
            setResult("Error: Keyword is required");
            return;
          }

          const match = tweetId.match(/status\/(\d+)/);
          const extractedTweetId = match ? match[1] : tweetId.trim();

          console.log("Tweet ID:", extractedTweetId);

          response = await fetch(
            `${path}?tweetId=${encodeURIComponent(
              extractedTweetId
            )}&chainId=${encodeURIComponent(chainId)}&keyword=${encodeURIComponent(keyword)}`,
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
        } else {
          response = await fetch(path);
        }
        data = await response.json();
        console.log(JSON.stringify(data));
        setResult(JSON.stringify(data, null, 2));
      }
    } catch (error) {
      console.error("Error:", error);
      setResult(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.ctas}>
          <input
            type="text"
            value={tweetId}
            onChange={(e) => setTweetId(e.target.value)}
            placeholder="Enter Tweet ID or URL"
            style={{
              padding: "12px",
              marginBottom: "15px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              width: "800px",
              fontSize: "16px",
            }}
          />
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Enter keyword to search for in tweet"
            style={{
              padding: "12px",
              marginBottom: "15px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              width: "800px",
              fontSize: "16px",
            }}
          />
          <select
            value={chainId}
            onChange={(e) => setChainId(e.target.value)}
            style={{
              padding: "12px",
              marginBottom: "15px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              width: "800px",
              fontSize: "16px",
            }}
          >
            <option value="">Select Chain</option>
            {supportedNetworks.map((chain: any) => (
              <option key={chain.id} value={chain.id}>
                {chain.name} ({chain.id})
              </option>
            ))}
          </select>
          <a
            className={styles.secondary}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => handleClick("/api/signTransaction")}
          >
            Verify Tweet
          </a>
        </div>
      </main>
      <div className={styles.resultBox}>
        <h3>Result:</h3>
        <pre>{result}</pre>
      </div>
    </div>
  );
}
