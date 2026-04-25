import React from "react";
import { createPortal } from "react-dom";
import Lottie from "lottie-react";
import loadingAnim from "../../public/lottie/loading.json";

const LoadingScreen = ({
  message = "Mohon Tunggu...",
  description = "Proses sedang berjalan, jangan tutup halaman ini.",
}) => {
  const overlay = (
    <div
      className="fixed inset-0 z-120000 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <div className="flex flex-col items-center gap-4">
        <div className="h-50 w-50 sm:h-52 sm:w-52">
          <Lottie animationData={loadingAnim} loop autoplay />
        </div>
        <div className="text-center px-6 max-w-md">
          <p className="text-white font-bold text-lg drop-shadow-lg mb-2">
            {message}
          </p>
          <p className="text-white/90 text-sm drop-shadow-lg leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </div>
  );

  if (typeof document !== "undefined") {
    return createPortal(overlay, document.body);
  }

  return overlay;
};

export default LoadingScreen;