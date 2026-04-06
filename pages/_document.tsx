import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="ar" dir="rtl">
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap"
          rel="stylesheet"
        />
      </Head>
      <body className="antialiased bg-gray-50" style={{ fontFamily: "'Tajawal', sans-serif" }}>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
