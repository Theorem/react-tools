import { ReactNode, useEffect, useState } from "react";

type Props = {
  children: ReactNode;
  butNotIf?: boolean;
};

export function OnlyClientSide(props: Props) {
  const [isClient, setClient] = useState(false);
  useEffect(() => setClient(true), []);
  return isClient && !props.butNotIf ? <>{props.children}</> : null;
}
