import * as React from "react";

type Props = React.HTMLAttributes<HTMLSpanElement>;

function cx(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

export function Badge({ className, ...props }: Props) {
  return <span className={cx("badge", className)} {...props} />;
}

