import type { CSSProperties, ReactNode } from "react";
import { scopedStyles } from "../lib";

/**
 * Possible values for an Action:
 * - "submit"
 * - string with a URL to make a link
 * - { newWindow: string } to make a link that opens in a new window
 * - { download: string, url: string } to make a link that downloads a file with a given filename
 * - () => void to make a click handler
 * - { mousedown: () => void } to make a mousedown handler, but the click handler above is preferred for UX
 * - "disabled", but avoid it, as inactive UI elements are not preferred for UX
 */
export type Action =
  | "submit"
  | string
  | { newWindow: string }
  | { download: string; url: string }
  | (() => void)
  | { mousedown: () => void }
  | "disabled";

type Props = {
  action: Action;
  children: ReactNode;
  className?: string;
  currentPath?: string;
  title?: string;
  style?: CSSProperties;
};

const baseStyles = scopedStyles("ActionArea-base", {
  background: "none",
  border: "none",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: "inherit",
  fontSize: "inherit",
  margin: 0,
  padding: 0,
  color: "inherit",
  fontWeight: "inherit",
  textDecoration: "none",
});

const disabledStyles = scopedStyles("ActionArea-disabled", {
  pointerEvents: "none" as const,
  // Must explicitly change the cursor to default. Otherwise, when "pointer-events: none"
  // is applied on click, the cursor will not return to default until the mouse is moved.
  cursor: "default",
});

export function ActionArea(props: Props) {
  const { action, children, title, style } = props;
  const className = props.className || "";

  const button = function (opts: {
    onClick?: () => void;
    onMouseDown?: () => void;
    type?: "submit";
  }) {
    const { onClick, onMouseDown, type } = opts;
    return (
      <button
        className={`${baseStyles} ${className}`}
        onClick={onClick}
        onMouseDown={onMouseDown}
        type={type || "button"}
        title={title}
        style={style}
      >
        {children}
      </button>
    );
  };

  const span = function (extraClassName = "") {
    return (
      <span
        className={`${baseStyles} ${disabledStyles} ${className} ${extraClassName}`}
        title={title}
        style={style}
      >
        {children}
      </span>
    );
  };

  const link = function (
    url: string,
    opts: { download?: string; newWindow?: boolean } = {}
  ) {
    const currentPath =
      props.currentPath ||
      (typeof location !== "undefined" ? location.pathname : "");
    const { download, newWindow } = opts;

    if (url === currentPath && !download) return span("current");

    return (
      <a
        className={`${baseStyles} ${className}`}
        download={download}
        href={url}
        rel={newWindow ? "noopener" : undefined}
        target={newWindow ? "_blank" : undefined}
        title={title}
        style={style}
      >
        {children}
      </a>
    );
  };

  if (action === "disabled") return span();
  if (action === "submit") return button({ type: "submit" });

  if (typeof action === "function") return button({ onClick: action });
  if (typeof action === "string") return link(action);

  if ("download" in action)
    return link(action.url, { download: action.download });
  if ("mousedown" in action) return button({ onMouseDown: action.mousedown });
  if ("newWindow" in action) return link(action.newWindow, { newWindow: true });

  throw new Error("Unexpected action");
}
