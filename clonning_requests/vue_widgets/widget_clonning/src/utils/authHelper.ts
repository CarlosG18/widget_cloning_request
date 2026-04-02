export function getBasicAuthHeader(user: string, pass: string) {
  const token = btoa(`${user}:${pass}`);
  return { Authorization: `Basic ${token}` };
}
