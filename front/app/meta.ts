export function makeMeta({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  const meta = [
    {
      title,
    },
    {
      name: "og:title",
      content: title,
    },
  ];

  if (description) {
    meta.push({
      name: "description",
      content: description,
    });
  }

  return meta;
}
