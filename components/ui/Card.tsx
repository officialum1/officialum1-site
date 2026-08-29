import * as React from "react";

type Props = React.HTMLAttributes<HTMLDivElement> & {
  as?: React.ElementType;
};

function cx(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

export function Card({ as: Component = "div", className, ...props }: Props) {
  const Tag = Component as any;
  return <Tag className={cx("card", "p-8", className)} {...props} />;
}

