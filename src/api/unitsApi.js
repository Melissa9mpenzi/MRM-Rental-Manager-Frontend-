import { apiClient } from './client'

export async function getByProperty(propertyId) {
  const { data } = await apiClient.get(`/properties/${propertyId}/units`)
  return data
}

export async function create(payload) {
  const { data } = await apiClient.post('/units', payload)
  return data
}

export async function updateStatus(id, status) {
  const { data } = await apiClient.put(`/units/${id}/status`, { status })
  return data
}

