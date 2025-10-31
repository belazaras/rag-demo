import * as React from "react";

type Props = { children: React.ReactNode; size?: number };

export default function AvatarRing({ children, size = 208 }: Props) {
  return (
    <div
      style={{ width: size, height: size }}
      className="rounded-full p-[3px] border border-transparent [background:linear-gradient(#0B0B0C,#0B0B0C)_padding-box,linear-gradient(to_right,var(--color-accent-purple),var(--color-accent-blue))_border-box]"
    >
      <div className="h-full w-full overflow-hidden rounded-full">
        {children}
      </div>
    </div>
  );
}
