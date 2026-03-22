'use client';

import { Accordion } from '@heroui/react/accordion';

export type FaqAccordionItem = {
  id: string;
  question: string;
  answer: string;
};

type Props = {
  items: FaqAccordionItem[];
  className?: string;
};

/**
 * HeroUI accordion wrapper — FAQ / collapsible lists (project rule: no raw compound usage in features).
 */
export function FaqAccordion(props: Props) {
  return (
    <Accordion.Root variant="surface" className={props.className}>
      {props.items.map(item => (
        <Accordion.Item key={item.id} id={item.id}>
          <Accordion.Heading>
            <Accordion.Trigger className="flex w-full items-center justify-between gap-3 py-3.5 text-left text-sm font-semibold text-foreground">
              <span className="min-w-0 flex-1">{item.question}</span>
              <Accordion.Indicator className="size-4 shrink-0 text-muted" />
            </Accordion.Trigger>
          </Accordion.Heading>
          <Accordion.Panel>
            <Accordion.Body className="pb-4 text-sm leading-relaxed text-muted">
              {item.answer}
            </Accordion.Body>
          </Accordion.Panel>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}
