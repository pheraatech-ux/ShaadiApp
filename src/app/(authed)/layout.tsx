import { ReactNode } from "react";

type AuthedLayoutProps = {
  children: ReactNode;
};

export default function AuthedLayout({ children }: AuthedLayoutProps) {
  return <>{children}</>;
}
