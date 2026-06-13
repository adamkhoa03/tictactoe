import React from 'react';

export const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-2xl text-center space-y-6">
        <div className="inline-flex p-3 bg-blue-500/10 text-blue-400 rounded-lg">
          <svg
            className="w-8 h-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold tracking-tight">TicTacToe Online</h1>
        <p className="text-slate-400 text-sm">
          Cấu trúc dự án ReactJS chuẩn **Clean Architecture** đã được thiết lập thành công.
        </p>
        
        <div className="bg-slate-950 rounded-lg p-4 text-left font-mono text-xs border border-slate-800 text-slate-300">
          <div>🚀 Sẵn sàng khởi chạy:</div>
          <div className="mt-2 text-blue-400">cd frontend</div>
          <div className="text-blue-400">npm install</div>
          <div className="text-blue-400">npm run dev</div>
        </div>

        <div className="text-xs text-slate-500">
          Công nghệ sử dụng: React 18, Vite, TS, Redux Toolkit, Tailwind, Shadcn UI
        </div>
      </div>
    </div>
  );
};

export default App;
