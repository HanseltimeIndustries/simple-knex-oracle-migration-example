/**
 * This is a simple helper function to escape the inputs strings in a way that allows the user
 * to not worry about their use or quotes, etc.
 * 
 * @see https://livesql.oracle.com/apex/livesql/file/content_CIREYU9EA54EOKQ7LAMZKRF6P.html
 * @param inner 
 * @returns 
 */
export function escapedString(inner: string) {
    return `q'[${inner}]'`
}
