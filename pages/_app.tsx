import "../styles/globals.css";
import type { AppProps } from "next/app";

function HeexApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default HeexApp;
