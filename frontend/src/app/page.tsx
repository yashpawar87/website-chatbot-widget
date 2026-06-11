import ChatUI from "@/components/ChatUI";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-[400px] sm:max-w-md h-[85vh] sm:h-[800px] shadow-2xl shadow-slate-200/50 rounded-2xl overflow-hidden border border-slate-200/60 bg-white">
        <ChatUI />
      </div>
    </main>
  );
}
