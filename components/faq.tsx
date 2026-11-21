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
      "An open-source group building the tools we use ourselves to work with AI agents, secure and productive at once.",
  },
  {
    question: "What does “agentic software engineer” mean?",
    answer:
      "An engineer who lets agents write the code and still stands behind every line that ships. It is the golden era of agentic software engineers.",
  },
  {
    question: "What does “Fail fast. Fix faster. Ship fastest. Secure.” stand for?",
    answer:
      "Agents see every repository at once and run the whole stack in a safe environment of their own, where they break it and bring it back. Speed comes from that freedom, and security comes from deterministic enforcement.",
  },
  {
    question: "Why security first?",
    answer:
      "Because the environment, the hosts your agents reach and the secrets they can read stay yours to decide, however much of the code you review yourself.",
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
    <section id="faq" className="mx-auto max-w-[1200px] scroll-mt-14 px-6 py-24">
      <h2 className="text-3xl font-semibold tracking-tight">FAQ</h2>
      <Accordion type="single" collapsible className="mt-8">
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
