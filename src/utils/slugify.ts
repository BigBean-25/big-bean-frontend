export const slugify = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/café/g, 'cafe')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

export const outletSlugify = (value: string): string =>
  slugify(
    value
      .replace(/big bean café/gi, '')
      .replace(/big bean cafe/gi, '')
      .replace(/coffee roasters/gi, '')
  )

export const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export const validateSlug = (slug: string): string | null => {
  if (!slug.trim()) return 'Slug is required.'
  if (!SLUG_REGEX.test(slug))
    return 'Slug can only contain lowercase letters, numbers and hyphens.'
  return null
}
