export default {
  async load(): Promise<{ version: string }> {
    try {
      const res = await fetch('https://registry.npmjs.org/@plop-next%2Fcli/latest')
      if (!res.ok) return { version: '0.1.0' }
      const json = await res.json() as { version?: string }
      return { version: json.version ?? '0.1.0' }
    } catch {
      return { version: '0.1.0' }
    }
  }
}
