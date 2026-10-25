import { Fragment, type CSSProperties } from "react";

/**
 * Splits text into words that rise from behind a mask, one after another. Used inside a
 * heading; the words stay real text, so screen readers and search engines read it normally.
 */
export function Words({ text, start = 0 }: { text: string; start?: number }) {
  const words = text.split(" ");
  return (
    <>
      {words.map((w, i) => (
        <Fragment key={i}>
          <span className="word">
            <span style={{ "--i": i + start } as CSSProperties}>{w}</span>
          </span>
          {i < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </>
  );
}
