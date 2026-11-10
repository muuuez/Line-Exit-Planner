import { TextScribble } from "@/components/ui/text-scribble";

/** Optional component preview; not mounted on the calculator or any route. */
export default function TextScribbleDemo() {
  return <div className="flex min-h-screen flex-col items-center justify-center gap-8">
    <p>This is a <TextScribble type="scribble">hand-drawn scribble</TextScribble>.</p>
    <p>This text has an <TextScribble type="underline">animated underline</TextScribble>.</p>
    <p>This word is <TextScribble type="strike-through">struck through</TextScribble>.</p>
  </div>;
}
