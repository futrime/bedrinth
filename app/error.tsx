"use client";

import { useEffect } from "react";

export default function Error({ error }: { error: Error; reset: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.reload();
    }, 3000);

    return () => clearTimeout(timer);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-red-100 text-red-700 p-4">
      <Helmet>
        <title>
          Bedrinth - Error
        </title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <h2 className="text-2xl mb-4">Something went wrong!</h2>
      <p className="text-lg mb-6">The page will refresh automatically.</p>
    </div>
  );
}
