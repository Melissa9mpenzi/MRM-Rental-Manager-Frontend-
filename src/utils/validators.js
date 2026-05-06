export function isValidUgPhone(phone) {
  return /^(?:\+256|0)(?:7\d{8})$/.test(String(phone ?? '').trim())
}

