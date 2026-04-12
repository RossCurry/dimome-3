export const UNCATEGORISED_CATEGORY_NAME = "Uncategorised";

/** Max UTF-8 length accepted for CSV body (multipart upload). */
export const MAX_CSV_UTF8_BYTES = 2 * 1024 * 1024;

/** Max data rows stored on the job after parse (Mongo 16MB doc budget). */
export const MAX_CSV_ROWS = 5000;
