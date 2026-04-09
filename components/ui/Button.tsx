import * as React from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

function cx(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

export function Button({ variant = "primary", className, ...props }: Props) {
  const base = "btn";
  const variants: Record<ButtonVariant, string> = {
    primary: "btn-primary",
    secondary: "btn-outline",
    ghost: "btn-ghost",
  };

  return <button className={cx(base, variants[variant], className)} {...props} />;
}

