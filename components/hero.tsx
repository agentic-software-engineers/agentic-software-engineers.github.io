export function Hero() {
  return (
    <section className="relative aspect-video w-full bg-background md:aspect-auto md:h-[calc(100svh-3.5rem)]">
      <h1 className="sr-only">
        Agentic Software Engineers. Fail fast. Fix faster. Ship fastest. Secure.
      </h1>
      <video
        className="absolute inset-0 size-full object-cover motion-reduce:hidden"
        src="/hero.mp4"
        poster="/hero-poster.jpg"
        autoPlay
        muted
        loop
        playsInline
        aria-hidden="true"
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="absolute inset-0 hidden size-full object-cover motion-reduce:block"
        src="/hero-poster.jpg"
        alt=""
      />
    </section>
  )
}
