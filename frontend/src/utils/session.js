export function getOrCreateSessionId() {
  let id = localStorage.getItem('session_id')
  if (!id) {
    id = 'guest-' + Math.random().toString(36).substring(2) + Date.now().toString(36)
    localStorage.setItem('session_id', id)
  }
  return id
}
