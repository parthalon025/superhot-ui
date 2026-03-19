import { useState, useEffect } from "preact/hooks";

export function ShMantra({ text, active, class: className, children, ...rest }) {
  const texts = Array.isArray(text) ? text : [text];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (texts.length <= 1 || !active) return;
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % texts.length);
    }, 3000);
    return () => clearInterval(id);
  }, [texts.length, active]);

  const currentText = texts[index];

  const attrs = {};
  if (active && currentText) {
    attrs["data-sh-mantra"] = currentText;
  }

  return (
    <div class={className} {...attrs} {...rest}>
      {children}
    </div>
  );
}
