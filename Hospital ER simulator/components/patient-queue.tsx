"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getPriorityColor } from "@/lib/priority-queue"

interface PatientQueueItem {
  id: string
  visitId: string
  firstName: string
  lastName: string
  arrivalTime: string
  chiefComplaint: string
  priorityScore: number
  priorityLevel: string
  status: string
  temperature?: number
  heartRate?: number
  bloodPressureSys?: number
  oxygenSaturation?: number
}

export function PatientQueue() {
  const [patients, setPatients] = useState<PatientQueueItem[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchPatients = useCallback(async () => {
    try {
      const { data: visits, error: visitsError } = await supabase
        .from("patient_visits")
        .select(`
          id,
          chief_complaint,
          priority_score,
          priority_level,
          status,
          checked_in_at,
          patient_id,
          vital_signs (
            temperature,
            heart_rate,
            blood_pressure_sys,
            oxygen_saturation
          )
        `)
        .order("priority_score", { ascending: false })
        .order("checked_in_at", { ascending: true })

      if (visitsError) throw visitsError

      // Fetch patient details for each visit
      const patientsData = await Promise.all(
        visits.map(async (visit: any) => {
          const { data: patient } = await supabase
            .from("patients")
            .select("first_name, last_name")
            .eq("id", visit.patient_id)
            .single()

          const latestVitals = visit.vital_signs?.[0]

          return {
            id: visit.patient_id,
            visitId: visit.id,
            firstName: patient?.first_name || "Unknown",
            lastName: patient?.last_name || "",
            arrivalTime: new Date(visit.checked_in_at).toLocaleTimeString(),
            chiefComplaint: visit.chief_complaint,
            priorityScore: visit.priority_score,
            priorityLevel: visit.priority_level,
            status: visit.status,
            temperature: latestVitals?.temperature,
            heartRate: latestVitals?.heart_rate,
            bloodPressureSys: latestVitals?.blood_pressure_sys,
            oxygenSaturation: latestVitals?.oxygen_saturation,
          }
        }),
      )

      setPatients(patientsData)
    } catch (error) {
      console.error("Error fetching patients:", error)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchPatients()
    const interval = setInterval(fetchPatients, 5000) // Refresh every 5 seconds
    return () => clearInterval(interval)
  }, [fetchPatients])

  const handleUpdateStatus = async (visitId: string, newStatus: string) => {
    try {
      const { error } = await supabase.from("patient_visits").update({ status: newStatus }).eq("id", visitId)

      if (error) throw error
      fetchPatients()
    } catch (error) {
      console.error("Error updating status:", error)
    }
  }

  if (loading) return <div className="text-center py-8">Loading queue...</div>

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Emergency Queue</CardTitle>
        <CardDescription>{patients.length} patient(s) waiting</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {patients.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No patients in queue</p>
          ) : (
            patients.map((patient, index) => (
              <div
                key={patient.visitId}
                className="flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-muted/50 transition"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-muted-foreground">#{index + 1}</span>
                    <h4 className="font-semibold">
                      {patient.firstName} {patient.lastName}
                    </h4>
                    <Badge className={getPriorityColor(patient.priorityLevel as any)}>
                      {patient.priorityLevel?.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {patient.chiefComplaint} • Arrived: {patient.arrivalTime}
                  </p>
                  {(patient.temperature || patient.heartRate) && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {patient.temperature && `T: ${patient.temperature}°C`}
                      {patient.temperature && patient.heartRate && " | "}
                      {patient.heartRate && `HR: ${patient.heartRate} bpm`}
                      {(patient.temperature || patient.heartRate) && patient.oxygenSaturation && " | "}
                      {patient.oxygenSaturation && `O₂: ${patient.oxygenSaturation}%`}
                    </p>
                  )}
                </div>
                <div className="flex gap-1">
                  {patient.status === "waiting" && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateStatus(patient.visitId, "in-progress")}
                      >
                        Call
                      </Button>
                    </>
                  )}
                  {patient.status === "in-progress" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateStatus(patient.visitId, "discharged")}
                    >
                      Discharge
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
