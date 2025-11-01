// Priority Queue implementation for patient management
export interface QueuePatient {
  id: string
  firstName: string
  lastName: string
  arrivalTime: Date
  chiefComplaint: string
  priorityScore: number
  priorityLevel: "critical" | "urgent" | "moderate" | "low"
  status: "waiting" | "in-progress" | "discharged"
  vitalSigns?: {
    temperature?: number
    bloodPressureSys?: number
    bloodPressureDia?: number
    heartRate?: number
    respiratoryRate?: number
    oxygenSaturation?: number
  }
}

export function calculatePriorityScore(
  temperature?: number,
  heartRate?: number,
  bloodPressureSys?: number,
  oxygenSaturation?: number,
): number {
  let score = 0

  // Temperature scoring (normal: 36.5-37.5°C)
  if (temperature !== undefined) {
    if (temperature > 39 || temperature < 36) score += 20
    else if (temperature > 38.5 || temperature < 36.5) score += 10
  }

  // Heart rate scoring (normal: 60-100 bpm)
  if (heartRate !== undefined) {
    if (heartRate > 120 || heartRate < 40) score += 25
    else if (heartRate > 100 || heartRate < 50) score += 15
  }

  // Blood pressure scoring (normal systolic: 90-120)
  if (bloodPressureSys !== undefined) {
    if (bloodPressureSys > 160 || bloodPressureSys < 80) score += 25
    else if (bloodPressureSys > 140 || bloodPressureSys < 90) score += 15
  }

  // Oxygen saturation scoring (normal: >95%)
  if (oxygenSaturation !== undefined) {
    if (oxygenSaturation < 90) score += 30
    else if (oxygenSaturation < 94) score += 20
  }

  return score
}

export function getPriorityLevel(score: number): "critical" | "urgent" | "moderate" | "low" {
  if (score >= 70) return "critical"
  if (score >= 45) return "urgent"
  if (score >= 20) return "moderate"
  return "low"
}

export function getPriorityColor(level: "critical" | "urgent" | "moderate" | "low"): string {
  switch (level) {
    case "critical":
      return "bg-destructive text-destructive-foreground"
    case "urgent":
      return "bg-warning text-warning-foreground"
    case "moderate":
      return "bg-accent text-accent-foreground"
    case "low":
      return "bg-secondary text-secondary-foreground"
  }
}

export class PriorityQueue {
  private queue: QueuePatient[] = []

  enqueue(patient: QueuePatient): void {
    this.queue.push(patient)
    this.queue.sort((a, b) => b.priorityScore - a.priorityScore)
  }

  dequeue(): QueuePatient | undefined {
    return this.queue.shift()
  }

  peek(): QueuePatient | undefined {
    return this.queue[0]
  }

  getQueue(): QueuePatient[] {
    return this.queue
  }

  updatePatient(patientId: string, updates: Partial<QueuePatient>): void {
    const index = this.queue.findIndex((p) => p.id === patientId)
    if (index !== -1) {
      this.queue[index] = { ...this.queue[index], ...updates }
      this.queue.sort((a, b) => b.priorityScore - a.priorityScore)
    }
  }

  removePatient(patientId: string): void {
    this.queue = this.queue.filter((p) => p.id !== patientId)
  }

  getSize(): number {
    return this.queue.length
  }

  isEmpty(): boolean {
    return this.queue.length === 0
  }
}
