import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faq: { question: string; answer: React.ReactNode }[] = [
  {
    question: "What is the goal of “Agentic Software Engineers”?",
    answer: "Guiding the transformation to the next era of software.",
  },
  {
    question: "What is an agentic software engineer?",
    answer: "Someone who lets agents write the code and with engineering discipline stands behind every line that ships.",
  },
  {
    question: "What does the future look like?",
    answer: "A golden era for agentic software engineers pushing the boundaries of the problems we can solve.",
  },
  {
    question: "Are vibe coders the same?",
    answer: "No.",
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
