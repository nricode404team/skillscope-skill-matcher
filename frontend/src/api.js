import axios from 'axios'

// When running in the Orchids cloud preview, the Vite proxy doesn't apply
// (browser hits the cloud URL directly). Detect and use the backend cloud URL.
function getBaseURL() {
  const hostname = window.location.hostname
  // Orchids cloud pattern: <port>-<id>.orchids.cloud
  const match = hostname.match(/^\d+-(.+\.orchids\.cloud)$/)
  if (match) {
    return `https://8000-${match[1]}`
  }
  return '' // localhost: use Vite proxy (relative /api paths)
}

const api = axios.create({
  baseURL: getBaseURL(),
})

export default api
