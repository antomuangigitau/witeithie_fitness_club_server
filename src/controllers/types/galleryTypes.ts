// Gallery image input for creating new items
export interface GalleryImageInput {
  imageUrl: string;
  caption?: string;
}

// Gallery item as stored in database (snake_case)
export interface GalleryItem {
  id: string;
  event_id: string;
  image_url: string;
  caption?: string;
  position: number;
  created_at?: Date;
}

// Gallery item with event title (from JOIN query)
export interface GalleryItemWithEvent extends GalleryItem {
  title: string;
}

// Convert database row to camelCase for API response
export const toCamelCase = (item: GalleryItemWithEvent) => ({
  id: item.id,
  eventId: item.event_id,
  imageUrl: item.image_url,
  caption: item.caption,
  position: item.position,
  title: item.title,
});
