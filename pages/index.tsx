import Head from "next/head";
import React, { useState } from "react";
import styles from "../styles/Home.module.css";

export default function Home() {
  const [url, setUrl] = useState("");

  const onSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    fetch(`/api/measure?url=${encodeURIComponent(url)}`)
      .then((result) => result.json())
      .then((result) => console.log(url, result))
      .catch((e) => console.error("oops...", e));
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Compression checker</title>
        <meta
          name="description"
          content="Check how much a file could be compressed using brotli, gzip or deflate"
        />
      </Head>

      <main className={styles.main}>
        <h1>How much could you save by using compression?</h1>
        <form className={styles.form} onSubmit={onSubmit}>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className={styles.input}
            placeholder="Enter the URL of an asset to check..."
          ></input>
          <button className={styles.submitBtn} type="submit">
            Crunch the numbers!
          </button>
        </form>
      </main>
    </div>
  );
}
