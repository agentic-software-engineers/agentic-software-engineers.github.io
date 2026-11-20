import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { site } from "@/lib/site"

const faq: { question: string; answer: React.ReactNode }[] = [
  {
    question: "What is Agentic Software Engineers?",
    answer:
      "An open-source group building the tools we use ourselves to work with AI agents, without trading security for productivity.",
  },
  {
    question: "What does “agentic software engineer” mean?",
    answer:
      "An engineer who lets agents write the code and still stands behind every line that ships. AI will not be the death of good engineering. It is the golden era of agentic software engineers.",
  },
  {
    question: "What does “Fail fast. Fix faster. Ship fastest. Secure.” stand for?",
    answer:
      "Agents see every repository at once and run the whole stack in a safe environment, so they can break it and bring it back without touching anything real. Speed comes from that freedom, and security comes from deterministic enforcement rather than trust.",
  },
  {
    question: "Why security first?",
    answer:
      "Because the environment, the hosts your agents reach and the secrets they can read should stay yours to decide, whether you review every line by hand or none at all.",
  },
  {
    question: "Who is behind ASE?",
    answer: "Pioneers of agentic software engineering, working for the community.",
  },
  {
    question: "Is everything open source?",
    answer: "Yes. Everything we publish is MIT licensed on GitHub.",
  },
  {
    question: "Can I contribute?",
    answer:
      "Yes, contributions are welcome. Open an issue or a pull request on any of our repositories.",
  },
  {
    question: "How can I get in touch?",
    answer: (
      <>
        Open an issue on{" "}
        <a href={site.links.github} target="_blank" rel="noreferrer" className="underline underline-offset-4">
          GitHub
        </a>{" "}
        or reach out on{" "}
        <a href={site.links.linkedin} target="_blank" rel="noreferrer" className="underline underline-offset-4">
          LinkedIn
        </a>
        .
      </>
    ),
  },
]

export function Faq() {
  return (
    <section id="faq" className="mx-auto max-w-5xl scroll-mt-14 px-6 py-24">
      <h2 className="text-3xl font-semibold tracking-tight">FAQ</h2>
      <Accordion type="single" collapsible className="mt-8 max-w-3xl">
        {faq.map((item, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger className="text-base">{item.question}</AccordionTrigger>
            <AccordionContent className="text-base text-muted-foreground">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  )
}
