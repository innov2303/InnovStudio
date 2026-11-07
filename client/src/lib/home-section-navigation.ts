export type SectionViewportBounds = {
  id: string;
  top: number;
  bottom: number;
};

export function getSectionAtPosition(
  sections: SectionViewportBounds[],
  position: number,
): string | undefined {
  const containingSection = sections.find(({ top, bottom }) => position >= top && position < bottom);
  if (containingSection) return containingSection.id;

  let closestSection: SectionViewportBounds | undefined;
  let closestDistance = Number.POSITIVE_INFINITY;

  for (const section of sections) {
    const distance = position < section.top
      ? section.top - position
      : position - section.bottom;

    if (distance < closestDistance) {
      closestSection = section;
      closestDistance = distance;
    }
  }

  return closestSection?.id;
}
