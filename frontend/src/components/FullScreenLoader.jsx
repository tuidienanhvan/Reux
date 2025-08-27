import React, { useState, useEffect, useRef } from 'react';
import { Loader } from 'lucide-react';

// Component hiển thị loader toàn màn hình với hiệu ứng màu động
export default function FullScreenLoader({ timeout, timeoutMessage }) {
  const [timedOut, setTimedOut] = useState(false);
  const loaderRef = useRef(null);
  const textRef = useRef(null);

  // Thay đổi màu cho loader và text mỗi 0.5 giây
  useEffect(() => {
    const colors = [
      'text-primary', // #BCA88D
      'text-secondary', // #7D8D86
      'text-warning', // #D9A05B
      'text-base-100', // #3E3F29
      'text-base-200', // #2A2B1E
      'text-base-300', // #1F2016
    ];
    const loader = loaderRef.current;
    const text = textRef.current;
    let colorIndex = 0;

    const colorInterval = setInterval(() => {
      if (loader && text) {
        // Xóa màu cũ
        colors.forEach((color) => {
          loader.classList.remove(color);
          text.classList.remove(color);
        });
        // Thêm màu mới
        loader.classList.add(colors[colorIndex]);
        text.classList.add(colors[colorIndex]);
        colorIndex = (colorIndex + 1) % colors.length;
      }
    }, 500);

    return () => clearInterval(colorInterval);
  }, []); // Không cần phụ thuộc colors vì nó được định nghĩa trong useEffect

  // Xử lý timeout
  useEffect(() => {
    if (timeout) {
      const timer = setTimeout(() => setTimedOut(true), timeout);
      return () => clearTimeout(timer);
    }
  }, [timeout]);

  // Hiển thị thông báo lỗi nếu timeout
  if (timedOut && timeoutMessage) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-base-100 z-50">
        <p className="text-error font-kurohe text-lg">{timeoutMessage}</p>
      </div>
    );
  }

  // Tách văn bản thành mảng các chữ cái
  const text = 'Loading...'.split('');

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center gap-4 bg-base-200 z-50">
      <Loader
        ref={loaderRef}
        className="animate-spin text-primary"
        size={48}
        strokeWidth={2}
      />
      <span
        ref={textRef}
        className="text-base-content font-kurohe text-lg flex items-center gap-1 loading-text"
      >
        {text.map((char, index) => (
          <span
            key={index}
            className="inline-block letter"
            style={{ animationDelay: `${index * 0.2}s` }}
          >
            {char}
          </span>
        ))}
      </span>
      <style>{`
        .loading-text {
          display: inline-flex;
          align-items: center;
          animation: fadeOut 3s infinite;
        }
        .letter {
          display: inline-block;
          opacity: 0;
          animation: revealLetter 3s infinite;
        }
        @keyframes revealLetter {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          20% {
            opacity: 1;
            transform: translateY(0);
          }
          60% {
            opacity: 1;
            transform: translateY(0);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeOut {
          0% {
            opacity: 1;
          }
          60% {
            opacity: 1;
          }
          80% {
            opacity: 0;
          }
          100% {
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}