import Head from "next/head";
import React, { useCallback, useEffect, useRef, useState } from "react";
import styles from "../styles/Home.module.css";

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const workerRef = useRef<Worker>();
  useEffect(() => {
    workerRef.current = new Worker(new URL("../worker.js", import.meta.url));
    workerRef.current.onmessage = (evt) => {
      setLoading(false);
      console.log("WebWorker Response =>", evt);
    };
    return () => {
      workerRef.current.terminate();
    };
  }, []);

  const calcResults = useCallback(async (url) => {
    setLoading(true);
    workerRef.current.postMessage(url);
  }, []);

  const onSubmit: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    calcResults(url);
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Compression checker</title>
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <meta
          name="description"
          content="Check how much a file could be compressed using brotli, gzip or deflate"
        />
      </Head>

      <main className={styles.main}>
        <h1>How much could you save by using compression?</h1>
        <div style={{ fontSize: "6rem" }}>📦</div>
        <p>
          <em>
            (and why you should care -{" "}
            <a href="https://bit.ly/3g4sE1f">https://bit.ly/3g4sE1f</a>)
          </em>
        </p>
        <form className={styles.form} onSubmit={onSubmit}>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className={styles.input}
            placeholder="Enter the URL of an asset to check..."
          ></input>
          <button disabled={loading} className={styles.submitBtn} type="submit">
            Crunch the numbers!
          </button>
        </form>
      </main>
    </div>
  );
}
