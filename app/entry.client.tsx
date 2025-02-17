import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { HydratedRouter } from "react-router/dom";
function lockBody() {
  const { body } = document;
  const scrollY = window.scrollY;

  // Store the current scroll position
  body.dataset.scrollLockTop = String(scrollY);

  // Get the current computed style of the body
  const bodyStyle = window.getComputedStyle(body);

  // Get the current `top` value of the body
  const top = bodyStyle.getPropertyValue("top");

  // Check if the `top` value is auto
  if (top && top === "auto") {
    body.style.top = "0px";
  }

  // Get the current `position` value of the body
  const position = bodyStyle.getPropertyValue("position");

  // Check if the `position` value is static
  if (position && position === "static") {
    body.style.position = "relative";
  }

  // Get the width of the scrollbar
  const scrollbarWidth =
    window.innerWidth - document.documentElement.clientWidth;

  // Apply the styles to the body
  body.style.setProperty("overflow", "hidden", "important");
  body.style.setProperty("overscroll-behavior", "contain", "important");
  body.style.setProperty("position", "fixed", "important");
  body.style.setProperty("width", "100%", "important");
  body.style.setProperty("top", `-${scrollY}px`, "important");

  // Check if the scrollbar has width
  if (scrollbarWidth) {
    body.style.setProperty("padding-right", `${scrollbarWidth}px`, "important");
  }
}

function unlockBody() {
  const { body } = document;

  // Get the stored scroll position
  const scrollY = body.dataset.scrollLockTop;

  // Remove the styles from the body
  body.style.removeProperty("overflow");
  body.style.removeProperty("overscroll-behavior");
  body.style.removeProperty("position");
  body.style.removeProperty("width");
  body.style.removeProperty("top");
  body.style.removeProperty("padding-right");

  // Restore the scroll position
  window.scrollTo(0, Number(scrollY));
}

if (typeof document.startViewTransition === "function") {
  window.addEventListener("popstate", (e) => {
    if (e.hasUAVisualTransition) {
      return;
    }
    lockBody();
    window.addEventListener(
      "startviewtransition",
      () => {
        unlockBody();
      },
      { once: true }
    );
  });

  const startViewTransition = (cb: () => Promise<void> | void) => {
    const transition = Document.prototype.startViewTransition.call(
      document,
      () => {
        window.dispatchEvent(new CustomEvent("startviewtransition"));
        return cb?.();
      }
    );
    return transition;
  };
  Object.assign(document, { startViewTransition });
}

window.addEventListener('popstate', (e) => {
  console.log({ e });
});
startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <HydratedRouter />
    </StrictMode>
  );
});
