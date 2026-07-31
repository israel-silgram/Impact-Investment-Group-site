import * as React from "react";
import { Minus, Plus } from "lucide-react";
import * as Accordion from "@radix-ui/react-accordion";
import { cn } from "@/lib/utils";

export interface DisclosureItem {
  id: string;
  question: string;
  answer: React.ReactNode;
}

/** Accordion for FAQs and method sections. */
export function Disclosure({
  items,
  className,
}: {
  items: DisclosureItem[];
  className?: string;
}) {
  return (
    <Accordion.Root type="single" collapsible className={cn("w-full", className)}>
      {items.map((item) => (
        <Accordion.Item
          key={item.id}
          value={item.id}
          className="border-b border-navy-700 first:border-t"
        >
          <Accordion.Header className="m-0">
            <Accordion.Trigger className="group flex min-h-[56px] w-full cursor-pointer items-center justify-between gap-4 py-4 text-left font-heading text-base font-semibold text-white transition-colors duration-200 hover:text-mist">
              <span className="min-w-0">{item.question}</span>
              <span aria-hidden="true" className="relative grid size-6 shrink-0 place-items-center">
                <Plus className="size-5 text-teal-400 group-data-[state=open]:hidden" />
                <Minus className="hidden size-5 text-teal-400 group-data-[state=open]:block" />
              </span>
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
            <div className="measure pb-5 text-sm leading-relaxed text-mist">{item.answer}</div>
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}
