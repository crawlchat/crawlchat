import { Tooltip } from "~/components/ui/tooltip";
import type { Location } from "libs/prisma";
import { Image } from "@chakra-ui/react";

export function CountryFlag({ location }: { location: Location }) {
  if (!location.country) {
    return null;
  }

  return (
    <Tooltip
      content={[location.city, location.region, location.country]
        .filter(Boolean)
        .join(", ")}
      positioning={{ placement: "top" }}
      showArrow
    >
      <Image
        src={`https://purecatamphetamine.github.io/country-flag-icons/3x2/${location.country.toUpperCase()}.svg`}
        alt={location.country}
        h={3}
        aspectRatio={"3/2"}
      />
    </Tooltip>
  );
}
