import moment from "moment";
import type { HTMLProps } from "react";

export function Timestamp({
  date,
  ...props
}: HTMLProps<HTMLSpanElement> & { date: Date }) {
  return <span {...props}>{moment(date).format("DD MMM YYYY h:mm A")}</span>;
}
