"use client"

import { useState } from "react"
import { PatientIntakeForm } from "@/components/patient-intake-form"
import { PatientQueue } from "@/components/patient-queue"
import { ERDashboard } from "@/components/er-dashboard"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0)

  const handleIntakeSuccess = () => {
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-2">🏥 Hospital ER Simulator</h1>
          <p className="text-lg text-muted-foreground">Priority Queue Based Patient Management System</p>
        </header>

        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="queue">Queue</TabsTrigger>
            <TabsTrigger value="intake">Patient Intake</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6">
            <ERDashboard key={refreshKey} />
          </TabsContent>

          <TabsContent value="queue" className="mt-6">
            <PatientQueue key={refreshKey} />
          </TabsContent>

          <TabsContent value="intake" className="mt-6">
            <div className="max-w-2xl mx-auto">
              <PatientIntakeForm onSuccess={handleIntakeSuccess} />
            </div>
          </TabsContent>
        </Tabs>

        <footer className="mt-12 text-center text-sm text-muted-foreground">
          <p>Hospital ER Simulator • Real-time Priority Queue Management</p>
        </footer>
      </div>
    </main>
  )
}
