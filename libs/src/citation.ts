import { MessageSourceLink } from "@prisma/client";

export function extractCitations(
  content: string,
  links: MessageSourceLink[],
  { cleanCitations }: { cleanCitations?: boolean } = {}
) {
  function getLinkIndex(fetchUniqueId: string) {
    return links.findIndex((l) => l.fetchUniqueId === fetchUniqueId);
  }

  const cited = content.match(/!!([0-9]+)!!/g);
  let cleanedContent = content;
  const citedLinks: Record<number, MessageSourceLink> = {};
  if (cited) {
    const keys = cited
      .map((c) => c.replace(/!/g, ""))
      .filter((v, i, arr) => arr.indexOf(v) === i);
    for (let i = 0; i < keys.length; i++) {
      cleanedContent = cleanedContent.replace(
        new RegExp(`!!${keys[i]}!!`, "g"),
        `!!${i}!!`
      );
      citedLinks[i] = links[getLinkIndex(keys[i])];
    }
  }

  if (cleanCitations) {
    cleanedContent = cleanedContent.replace(/!!([0-9]+)!!/g, "");
  }

  return { content: cleanedContent, citedLinks };
}
