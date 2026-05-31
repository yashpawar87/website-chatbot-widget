import ChatUI from "@/components/ChatUI";

export default function WidgetIframePage() {
  return (
    <main className="h-screen w-full bg-transparent overflow-hidden">
      <ChatUI isWidget={true} />
    </main>
  );
}
