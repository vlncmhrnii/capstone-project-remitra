import { ImageResponse } from "next/og";

export const size = {
  width: 64,
  height: 64,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
          background: "transparent",
        }}
      >
        <div
          style={{
            display: "flex",
            width: 52,
            height: 52,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 14,
            background: "#f97316",
          }}
        >
          <svg
            width="30"
            height="30"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M14.5 2H8C6.89543 2 6 2.89543 6 4V20C6 21.1046 6.89543 22 8 22H16C17.1046 22 18 21.1046 18 20V5.5L14.5 2Z"
              fill="white"
            />
            <path d="M14 2.5V6H17.5L14 2.5Z" fill="#f97316" />
            <path
              d="M9 10.25H15"
              stroke="#f97316"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              d="M9 13H15"
              stroke="#f97316"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              d="M9 15.75H13.5"
              stroke="#f97316"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
    ),
    size,
  );
}
