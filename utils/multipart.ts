/** Reads one text field from a multipart/form-data request body (as returned by request.postData()). */
export function getMultipartField(body: string | null, name: string): string | undefined {
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = body?.match(new RegExp(`name="${escapedName}"\\r\\n\\r\\n([\\s\\S]*?)\\r\\n--`));
  return match?.[1];
}
