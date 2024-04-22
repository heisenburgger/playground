type Wrap<T extends string, D> = {
  [Key in T]: D
}

type PromiseWrap<T extends string, D> = Promise<Wrap<T, D>>

export async function fetchWrapper<K extends string, D>(url: string, options: RequestInit = {}): PromiseWrap<K, D> {
  options.headers = {
    'Content-Type': 'application/json',
  }
  const token = localStorage.getItem('token')
  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`
  }
  try {
    const resp = await fetch(url, options)
    const data = await resp.json()
    if (!resp.ok) {
      throw new Error(data.error)
    }
    return data
  } catch (err) {
    throw err
  }
}
