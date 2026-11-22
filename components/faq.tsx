import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faq: { question: string; answer: React.ReactNode }[] = [
  {
    question: "What does ASE stand for?",
    answer: "Agentic Software Engineers. Participating in the transformation to the next era of software with expertise and the conviction that users are not beta testers.",
  },
  {
    question: "What is an agentic software engineer?",
    answer: "A professional who lets agents write the code through engineering discipline and stands behind every line that ships.",
  },
  {
    question: "What does the future look like?",
    answer: "A golden era for agentic software engineers pushing the boundaries of the problems we can solve.",
  },
  {
    question: "What is the difference from a vibe coder?",
    answer: "The level of risk it can carry. Vibe coding fits work without consequences, like hobby projects, prototypes and experiments. As soon as users, data or money are involved, engineering discipline is required.",
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
