"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"

interface PatientIntakeFormProps {
  onSuccess?: () => void
}

export function PatientIntakeForm({ onSuccess }: PatientIntakeFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "male",
    phone: "",
    email: "",
    insuranceId: "",
    chiefComplaint: "",
    description: "",
    temperature: "",
    heartRate: "",
    bloodPressureSys: "",
    bloodPressureDia: "",
    oxygenSaturation: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Create patient
      const { data: patientData, error: patientError } = await supabase
        .from("patients")
        .insert({
          first_name: formData.firstName,
          last_name: formData.lastName,
          date_of_birth: formData.dateOfBirth,
          gender: formData.gender,
          phone: formData.phone || null,
          email: formData.email || null,
          insurance_id: formData.insuranceId || null,
        })
        .select()
        .single()

      if (patientError) throw patientError

      // Create visit
      const { data: visitData, error: visitError } = await supabase
        .from("patient_visits")
        .insert({
          patient_id: patientData.id,
          chief_complaint: formData.chiefComplaint,
          description: formData.description,
          status: "waiting",
        })
        .select()
        .single()

      if (visitError) throw visitError

      // Create vital signs if provided
      if (formData.temperature || formData.heartRate || formData.bloodPressureSys || formData.oxygenSaturation) {
        const { error: vitalsError } = await supabase.from("vital_signs").insert({
          visit_id: visitData.id,
          temperature: formData.temperature ? Number.parseFloat(formData.temperature) : null,
          heart_rate: formData.heartRate ? Number.parseInt(formData.heartRate) : null,
          blood_pressure_sys: formData.bloodPressureSys ? Number.parseInt(formData.bloodPressureSys) : null,
          blood_pressure_dia: formData.bloodPressureDia ? Number.parseInt(formData.bloodPressureDia) : null,
          oxygen_saturation: formData.oxygenSaturation ? Number.parseFloat(formData.oxygenSaturation) : null,
        })

        if (vitalsError) throw vitalsError
      }

      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        dateOfBirth: "",
        gender: "male",
        phone: "",
        email: "",
        insuranceId: "",
        chiefComplaint: "",
        description: "",
        temperature: "",
        heartRate: "",
        bloodPressureSys: "",
        bloodPressureDia: "",
        oxygenSaturation: "",
      })

      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      console.error("Error submitting intake form:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Patient Intake</CardTitle>
        <CardDescription>Register a new patient for emergency care</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name *</Label>
              <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name *</Label>
              <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="dateOfBirth">Date of Birth *</Label>
              <Input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="gender">Gender</Label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-input rounded-lg bg-background"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="insuranceId">Insurance ID</Label>
              <Input id="insuranceId" name="insuranceId" value={formData.insuranceId} onChange={handleChange} />
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-4">Chief Complaint</h3>
            <div>
              <Label htmlFor="chiefComplaint">Chief Complaint *</Label>
              <Input
                id="chiefComplaint"
                name="chiefComplaint"
                value={formData.chiefComplaint}
                onChange={handleChange}
                placeholder="e.g., Chest pain, Shortness of breath"
                required
              />
            </div>
            <div className="mt-4">
              <Label htmlFor="description">Description of Symptoms</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Provide detailed description of symptoms..."
                rows={3}
              />
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-4">Vital Signs</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <Label htmlFor="temperature">Temperature (°C)</Label>
                <Input
                  id="temperature"
                  name="temperature"
                  type="number"
                  step="0.1"
                  value={formData.temperature}
                  onChange={handleChange}
                  placeholder="36.5"
                />
              </div>
              <div>
                <Label htmlFor="heartRate">Heart Rate (bpm)</Label>
                <Input
                  id="heartRate"
                  name="heartRate"
                  type="number"
                  value={formData.heartRate}
                  onChange={handleChange}
                  placeholder="72"
                />
              </div>
              <div>
                <Label htmlFor="bloodPressureSys">BP Systolic (mmHg)</Label>
                <Input
                  id="bloodPressureSys"
                  name="bloodPressureSys"
                  type="number"
                  value={formData.bloodPressureSys}
                  onChange={handleChange}
                  placeholder="120"
                />
              </div>
              <div>
                <Label htmlFor="bloodPressureDia">BP Diastolic (mmHg)</Label>
                <Input
                  id="bloodPressureDia"
                  name="bloodPressureDia"
                  type="number"
                  value={formData.bloodPressureDia}
                  onChange={handleChange}
                  placeholder="80"
                />
              </div>
              <div>
                <Label htmlFor="oxygenSaturation">O₂ Saturation (%)</Label>
                <Input
                  id="oxygenSaturation"
                  name="oxygenSaturation"
                  type="number"
                  step="0.1"
                  value={formData.oxygenSaturation}
                  onChange={handleChange}
                  placeholder="98"
                />
              </div>
            </div>
          </div>

          {error && <div className="text-destructive text-sm bg-destructive/10 p-3 rounded">{error}</div>}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Submitting..." : "Submit Patient"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
