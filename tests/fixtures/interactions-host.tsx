import React from "react";
import { createRoot } from "react-dom/client";
import { InteractionHost } from "../../src/features/interactions/components/InteractionHost";
import { useRunLogStore } from "../../src/features/interactions/runtime/run-log-store";

const interaction = (on: string, text: string, rest = {}) => ({
  on,
  do: [{ toast: text }],
  ...rest,
});
const elements = [
  {
    id: "outer",
    settings: {
      interactions: {
        ix_aaaaaaaa: interaction("focus", "outer focus"),
        ix_bbbbbbbb: interaction("click", "outer click"),
      },
    },
    elements: [
      {
        id: "form",
        settings: {
          interactions: { ix_cccccccc: interaction("submit", "submitted") },
        },
      },
      {
        id: "inner",
        settings: {
          interactions: {
            ix_dddddddd: interaction("click", "inner click", {
              stopPropagation: true,
            }),
          },
        },
      },
      {
        id: "broken",
        settings: {
          interactions: { ix_hhhhhhhh: interaction("error", "broken") },
        },
      },
      {
        id: "empty",
        settings: {
          interactions: { ix_iiiiiiii: interaction("error", "empty") },
        },
      },
      {
        id: "pending",
        settings: {
          interactions: { ix_jjjjjjjj: interaction("error", "pending") },
        },
      },
      {
        id: "visible",
        settings: {
          interactions: {
            ix_eeeeeeee: interaction("visible", "once"),
            ix_ffffffff: interaction("visible", "repeat", { once: false }),
          },
        },
      },
    ],
  },
] as any;
const platform = (
  _doc: Document,
  _host: Element,
  _allowed: (id: string) => boolean,
) =>
  ({
    byId: (id: string) =>
      _allowed(id) ? _host.querySelector(`[data-element-id="${id}"]`) : null,
    toast: (_kind: string, text: string) => {
      (window as any).events.push(text);
    },
  }) as any;
(window as any).events = [];
(window as any).logs = () => useRunLogStore.getState().entries;
class FakeObserver {
  callback: IntersectionObserverCallback;
  targets = new Set<Element>();
  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
    (window as any).observer = this;
  }
  observe(node: Element) {
    this.targets.add(node);
  }
  unobserve(node: Element) {
    this.targets.delete(node);
  }
  disconnect() {
    this.targets.clear();
  }
  fire() {
    this.callback(
      [...this.targets].map((target) => ({
        target,
        isIntersecting: true,
      })) as IntersectionObserverEntry[],
      this as any,
    );
  }
}
(window as any).IntersectionObserver = FakeObserver;
function App() {
  const [version, setVersion] = React.useState(0);
  const [shown, setShown] = React.useState(false);
  const [snapshot, setSnapshot] = React.useState(false);
  const [loadedDom, setLoadedDom] = React.useState(false);
  const page = snapshot
    ? [
        ...elements,
        {
          id: "late",
          settings: {
            interactions: { ix_gggggggg: interaction("load", "late load") },
          },
        },
      ]
    : elements;
  return (
    <>
      <button id="rerender" onClick={() => setVersion((v) => v + 1)}>
        Update
      </button>
      <button id="snapshot" onClick={() => setSnapshot(true)}>
        Snapshot
      </button>
      <button id="load-dom" onClick={() => setLoadedDom(true)}>
        Mount loaded element
      </button>
      <button id="show" onClick={() => setShown(true)}>
        Show
      </button>
      <InteractionHost
        elements={[...page]}
        enabled
        namespace="test"
        platform={platform}
      >
        <div data-element-id="outer" data-version={version}>
          <input id="unmarked" />
          <img
            data-element-id="broken"
            id="broken"
            src="data:image/png;base64,AAAA"
            ref={(el) => {
              if (el) {
                Object.defineProperty(el, "complete", {
                  value: true,
                  configurable: true,
                });
                Object.defineProperty(el, "naturalWidth", {
                  value: 0,
                  configurable: true,
                });
              }
            }}
          />
          <img
            data-element-id="empty"
            id="empty"
            ref={(el) => {
              if (el) {
                Object.defineProperty(el, "complete", {
                  value: true,
                  configurable: true,
                });
                Object.defineProperty(el, "naturalWidth", {
                  value: 0,
                  configurable: true,
                });
              }
            }}
          />
          <img
            data-element-id="pending"
            id="pending"
            src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="
            ref={(el) => {
              if (el) {
                Object.defineProperty(el, "complete", {
                  value: false,
                  configurable: true,
                });
                Object.defineProperty(el, "naturalWidth", {
                  value: 0,
                  configurable: true,
                });
              }
            }}
          />
          <form data-element-id="form" id="form">
            <button type="submit">Submit</button>
          </form>
          <button data-element-id="inner" id="inner">
            Click
          </button>
          {loadedDom && (
            <div id="late" data-element-id="late">
              Late
            </div>
          )}
          {shown && (
            <div data-element-id="visible" id="visible">
              Visible
            </div>
          )}
        </div>
      </InteractionHost>
    </>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
