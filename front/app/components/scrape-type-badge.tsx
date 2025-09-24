import { TbLock, TbWorld } from "react-icons/tb";
import { Link } from "react-router";

export function ScrapePrivacyBadge({
  private: _private,
}: {
  private: boolean;
}) {
  return (
    <div
      className="tooltip tooltip-left"
      data-tip={_private ? "Private collection" : "Public collection"}
    >
      <Link
        className="badge badge-error px-1 badge-soft"
        to={"/settings#visibility-type"}
      >
        {_private ? <TbLock /> : <TbWorld />}
      </Link>
    </div>
  );
}
