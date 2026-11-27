import assert from "node:assert/strict";
import { test } from "node:test";
import { parse } from "@babel/parser";
import type { EditorElement } from "@webbuilder/site-runtime/types/global.type";
import { collectShadcnBindings } from "../apps/editor/src/features/editor/lib/code/normalize/shadcnLowering";
import { parseCode } from "../apps/editor/src/features/editor/lib/code/parseCode";

const PAGE = "page_norm";

function childrenOf(el: EditorElement | undefined): EditorElement[] {
  if (!el || !("elements" in el) || !Array.isArray(el.elements)) return [];
  return el.elements;
}

function codePropsOf(el: EditorElement | undefined): readonly string[] | undefined {
  if (!el?.settings || !("codeProps" in el.settings)) return undefined;
  const raw = el.settings.codeProps;
  return Array.isArray(raw) ? raw.filter((v): v is string => typeof v === "string") : undefined;
}

test("static const .map(), cn(), nested fragments, and shadcn Card/Button/Badge compile cleanly", () => {
  const code = `
    import React from 'react';
    import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
    import { Button } from '@/components/ui/button';
    import { Badge } from '@/components/ui/badge';
    import { Separator } from '@/components/ui/separator';

    const plans = [
      { name: 'Starter', desc: 'For individuals', url: '/starter' },
      { name: 'Team', desc: 'For startups', url: '/team' },
    ];

    export default function PricingPage() {
      return (
        <section className={cn('py-12', true && 'px-6', false && 'hidden')}>
          <>
            <h2 className="text-2xl font-bold">Plans</h2>
            <>
              <Separator className="my-4" />
            </>
          </>
          <div className="grid grid-cols-2 gap-6">
            {plans.map((plan, idx) => (
              <Card key={plan.name} className="p-2">
                <CardHeader>
                  <Badge variant="secondary">Tier {idx + 1}</Badge>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.desc}</CardDescription>
                </CardHeader>
                <CardContent>
                  <a href={plan.url}>Link</a>
                  <Button variant="outline" size="sm" className={cn('mt-2', true && 'w-full')}>
                    Choose {plan.name}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      );
    }
  `;

  const res = parseCode(code, [], PAGE);
  assert.ok(
    res.ok,
    res.ok ? "" : `${res.diagnostic.message} @${res.diagnostic.line}:${res.diagnostic.column}`,
  );
  if (!res.ok) return;

  assert.equal(res.preamble.imports, "", "lowered @/components/ui/* imports are omitted");
  assert.equal(res.preamble.top, "", "purely static unrolled data is removed from preamble");

  const section = res.elements[0];
  assert.ok(section);
  assert.equal(section.tailwindStyles, "py-12 px-6");

  const sectionKids = childrenOf(section);
  assert.equal(sectionKids[0]?.type, "Heading");
  assert.equal(sectionKids[1]?.type, "Separator");
  assert.match(sectionKids[1]?.tailwindStyles ?? "", /my-4/);

  const grid = sectionKids[2];
  const cards = childrenOf(grid);
  assert.equal(cards.length, 2);

  const firstCard = cards[0];
  assert.equal(firstCard?.type, "Frame");
  assert.match(firstCard?.tailwindStyles ?? "", /rounded-xl/);
  assert.match(firstCard?.tailwindStyles ?? "", /\bp-2\b/);
  assert.equal(codePropsOf(firstCard), undefined, "key must be stripped");

  const cardParts = childrenOf(firstCard);
  const cardHeader = cardParts[0];
  const cardContent = cardParts[1];
  const headerKids = childrenOf(cardHeader);
  assert.equal(headerKids[0]?.type, "Span");
  assert.equal(headerKids[0]?.content, "Tier 1");
  assert.match(headerKids[0]?.tailwindStyles ?? "", /bg-secondary/);

  assert.equal(headerKids[1]?.type, "Heading");
  assert.equal(headerKids[1]?.content, "Starter");
  assert.equal(
    headerKids[1]?.settings && "level" in headerKids[1].settings ? headerKids[1].settings.level : undefined,
    3,
  );

  assert.equal(headerKids[2]?.type, "Text");
  assert.equal(headerKids[2]?.content, "For individuals");

  const contentKids = childrenOf(cardContent);
  assert.equal(contentKids[0]?.type, "Link");
  assert.equal(contentKids[0]?.href, "/starter");

  const btn = contentKids[1];
  assert.equal(btn?.type, "Button");
  assert.equal(btn?.content, "Choose Starter");
  assert.match(btn?.tailwindStyles ?? "", /border/);
  assert.match(btn?.tailwindStyles ?? "", /h-8/);
  assert.match(btn?.tailwindStyles ?? "", /mt-2/);
  assert.match(btn?.tailwindStyles ?? "", /w-full/);
  assert.equal(codePropsOf(btn), undefined, "variant and size must be stripped");

  const secondCard = cards[1];
  const secondHeaderKids = childrenOf(childrenOf(secondCard)[0]);
  assert.equal(secondHeaderKids[0]?.content, "Tier 2");
  assert.equal(secondHeaderKids[1]?.content, "Team");
});

test("static .map() supports destructuring params, block bodies, and component-local const pruning", () => {
  const code = `
    export default function Page() {
      const items = [
        ['Alpha', '/a'],
        ['Beta', '/b'],
      ];
      const cards = [
        { title: 'One', body: 'First' },
        { title: 'Two', body: 'Second' },
      ];
      return (
        <section>
          {items.map(([label, href], i) => {
            return (
              <a key={i} href={href}>
                {label}
              </a>
            );
          })}
          {cards.map(({ title, body }) => (
            <Alert key={title}>
              <AlertTitle>{title}</AlertTitle>
              <AlertDescription>{body}</AlertDescription>
            </Alert>
          ))}
        </section>
      );
    }
  `;
  const res = parseCode(code, [], PAGE);
  assert.ok(
    res.ok,
    res.ok ? "" : `${res.diagnostic.message} @${res.diagnostic.line}:${res.diagnostic.column}`,
  );
  if (!res.ok) return;

  assert.equal(res.preamble.body, "");
  const kids = childrenOf(res.elements[0]);
  assert.equal(kids.length, 4);
  assert.equal(kids[0]?.type, "Link");
  assert.equal(kids[0]?.href, "/a");
  assert.equal(kids[0]?.content, "Alpha");
  assert.equal(codePropsOf(kids[0]), undefined);

  assert.equal(kids[1]?.type, "Link");
  assert.equal(kids[1]?.href, "/b");
  assert.equal(kids[1]?.content, "Beta");

  assert.equal(kids[2]?.type, "Frame");
  const alertKids = childrenOf(kids[2]);
  assert.equal(alertKids[0]?.type, "Heading");
  assert.equal(alertKids[0]?.content, "One");
  assert.equal(
    alertKids[0]?.settings && "level" in alertKids[0].settings ? alertKids[0].settings.level : undefined,
    5,
  );
  assert.equal(alertKids[1]?.type, "Text");
  assert.equal(alertKids[1]?.content, "First");
});

test("static const referenced in runtime code or preamble is retained in preamble", () => {
  const code = `
    import React, { useState } from 'react';
    const items = ['One', 'Two'];
    export default function Page() {
      const [count] = useState(items.length);
      return (
        <section>
          <span>Count: {count}</span>
          {items.map((item) => <p key={item}>{item}</p>)}
        </section>
      );
    }
  `;
  const res = parseCode(code, [], PAGE);
  assert.ok(res.ok, res.ok ? "" : res.diagnostic.message);
  if (!res.ok) return;
  assert.match(res.preamble.top, /const items =/);
  assert.equal(childrenOf(res.elements[0]).length, 3);
});

test("static .map() exceeding MAX_UNROLLED_ITEMS (100) returns a diagnostic", () => {
  const items = JSON.stringify(Array.from({ length: 101 }, (_, i) => i));
  const code = `const nums = ${items};\nexport default () => <section>{nums.map((n) => <span>{n}</span>)}</section>;`;
  const res = parseCode(code, [], PAGE);
  assert.equal(res.ok, false);
  if (!res.ok) assert.match(res.diagnostic.message, /100/);
});

test("collectShadcnBindings excludes project imports, lucide icons, local declarations, and Carousel", () => {
  const ast = parse(
    `
      import { Button } from '@/components/Button';
      import { Badge } from 'lucide-react';
      import { Card } from '@/components/ui/card';
      import { Carousel } from '@/components/ui/carousel';
      function Input() { return null; }
      const Label = () => null;
      export default function Page() {
        const AlertTitle = () => null;
        return null;
      }
    `,
    { sourceType: "module", plugins: ["jsx", "typescript"] },
  );
  const bindings = collectShadcnBindings(ast.program, new Set(["Button", "CustomCard"]));
  assert.equal(bindings.has("Button"), false);
  assert.equal(bindings.has("Badge"), false);
  assert.equal(bindings.has("Input"), false);
  assert.equal(bindings.has("Label"), false);
  assert.equal(bindings.has("AlertTitle"), false);
  assert.equal(bindings.has("Carousel"), false);
  assert.equal(bindings.has("Card"), true);
  assert.equal(bindings.has("Alert"), true);
});

test("shadcn Checkbox, Progress, Input, Textarea, Label, and Table lower cleanly", () => {
  const code = `
    export default function FormAndTable() {
      return (
        <section>
          <Label htmlFor="email">Email</Label>
          <Input id="email" placeholder="you@example.com" />
          <Textarea placeholder="Bio" />
          <Checkbox defaultChecked />
          <Progress value={60} />
          <Table>
            <TableCaption>Users</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Ada</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </section>
      );
    }
  `;
  const res = parseCode(code, [], PAGE);
  assert.ok(res.ok, res.ok ? "" : res.diagnostic.message);
  if (!res.ok) return;
  const kids = childrenOf(res.elements[0]);
  assert.deepEqual(
    kids.map((el) => el.type),
    ["Label", "Input", "Textarea", "Checkbox", "Progress", "Table"],
  );
});

test("shadcn ui imports referenced by kept preamble helpers are retained in preamble.imports", () => {
  const code = `
    import { Badge } from '@/components/ui/badge';
    import { Button } from '@/components/ui/button';

    const renderTag = () => <Badge>Tag</Badge>;
    const ButtonRef = Button;

    export default function Page() {
      return (
        <section>
          <Button>Save</Button>
          <span>{typeof ButtonRef}</span>
        </section>
      );
    }
  `;
  const res = parseCode(code, [], PAGE);
  assert.ok(res.ok, res.ok ? "" : res.diagnostic.message);
  if (!res.ok) return;

  assert.match(res.preamble.imports, /@\/components\/ui\/badge/);
  assert.match(res.preamble.imports, /@\/components\/ui\/button/);
});
