import slug from 'slug'

export function removeArticles(text) {
    return text.replace(/\b(a|an|the|and|or|for)\b\s*/gi, '').trim();
}

export function createSearchTerms(str: string): string[] {
    const slugName = slug(str, { lower: true, replacement: ' ' }); // Convert to slug
    return removeArticles(slugName).split(' '); // Split recipe_name into words array
        
}