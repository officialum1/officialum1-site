import * as React from "react";

type Props = React.HTMLAttributes<HTMLDivElement> & {
  as?: React.ElementType;
};

function cx(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

export function Card({ as: Tag = "div", className, ...props }: Props) {
  return <Tag className={cx("card", "p-8", className)} {...props} />;
}

