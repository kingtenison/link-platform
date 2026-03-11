export class PerformanceMonitor {
  private marks: Map<string, number> = new Map()
  private measures: Map<string, number> = new Map()

  start(name: string) {
    this.marks.set(name, performance.now())
  }

  end(name: string) {
    const startTime = this.marks.get(name)
    if (startTime) {
      const duration = performance.now() - startTime
      this.measures.set(name, duration)
      this.marks.delete(name)
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`[PERF] ${name}: ${duration.toFixed(2)}ms`)
      }
      
      return duration
    }
    return null
  }

  getMeasure(name: string) {
    return this.measures.get(name)
  }

  getAllMeasures() {
    return Object.fromEntries(this.measures)
  }

  clear() {
    this.marks.clear()
    this.measures.clear()
  }
}

export const perfMonitor = new PerformanceMonitor()
