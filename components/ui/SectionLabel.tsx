import * as React from "react";

type Props = React.HTMLAttributes<HTMLDivElement>;

function cx(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

export function SectionLabel({ className, ...props }: Props) {
  return <div className={cx("section-label", className)} {...props} />;
}

