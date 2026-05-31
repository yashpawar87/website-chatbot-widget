import ChatUI from "@/components/ChatUI";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-100 py-10">
      <div className="h-[85vh]">
        <ChatUI />
      </div>
    </main>
  );
}
