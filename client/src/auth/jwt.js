// Decode the payload of a JWT without verifying its signature.
// We only need the claims to drive the UI; the server still enforces auth.
export function decodeJwt(token)
{
    if (!token) return null
    try {
        const payload = token.split('.')[1]
        const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
        return JSON.parse(json)
    } catch (_) {
        return null
    }
}
