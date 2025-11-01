"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface DashboardStats {
  totalWaiting: number
  totalInProgress: number
  totalDischarged: number
  criticalCount: number
  urgentCount: number
  moderateCount: number
  lowCount: number
  avgWaitTime: string
}

export function ERDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalWaiting: 0,
    totalInProgress: 0,
    totalDischarged: 0,
    criticalCount: 0,
    urgentCount: 0,
    moderateCount: 0,
    lowCount: 0,
    avgWaitTime: "0 min",
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchStats = useCallback(async () => {
    try {
      const { data: visits, error } = await supabase
        .from("patient_visits")
        .select("status, priority_level, checked_in_at")

      if (error) throw error

      const waiting = visits?.filter((v) => v.status === "waiting").length || 0
      const inProgress = visits?.filter((v) => v.status === "in-progress").length || 0
      const discharged = visits?.filter((v) => v.status === "discharged").length || 0
      const critical = visits?.filter((v) => v.priority_level === "critical").length || 0
      const urgent = visits?.filter((v) => v.priority_level === "urgent").length || 0
      const moderate = visits?.filter((v) => v.priority_level === "moderate").length || 0
      const low = visits?.filter((v) => v.priority_level === "low").length || 0

      // Calculate average wait time
      const waitingPatients = visits?.filter((v) => v.status === "waiting") || []
      let avgWait = 0
      if (waitingPatients.length > 0) {
        const now = new Date().getTime()
        const totalWait = waitingPatients.reduce((sum, p) => {
          return sum + (now - new Date(p.checked_in_at).getTime())
        }, 0)
        avgWait = Math.round(totalWait / waitingPatients.length / 60000) // Convert to minutes
      }

      setStats({
        totalWaiting: waiting,
        totalInProgress: inProgress,
        totalDischarged: discharged,
        criticalCount: critical,
        urgentCount: urgent,
        moderateCount: moderate,
        lowCount: low,
        avgWaitTime: `${avgWait} min`,
      })
    } catch (error) {
      console.error("Error fetching stats:", error)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 5000) // Refresh every 5 seconds
    return () => clearInterval(interval)
  }, [fetchStats])

  if (loading) return <div className="text-center py-8">Loading dashboard...</div>

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Waiting</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalWaiting}</div>
          <p className="text-xs text-muted-foreground mt-1">patients in queue</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">In Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalInProgress}</div>
          <p className="text-xs text-muted-foreground mt-1">being treated</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Discharged</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalDischarged}</div>
          <p className="text-xs text-muted-foreground mt-1">today</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Avg Wait Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.avgWaitTime}</div>
          <p className="text-xs text-muted-foreground mt-1">for waiting patients</p>
        </CardContent>
      </Card>

      <Card className="md:col-span-4">
        <CardHeader>
          <CardTitle>Priority Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <Badge className="bg-destructive text-destructive-foreground text-base py-2 px-3">
                {stats.criticalCount}
              </Badge>
              <p className="text-xs text-muted-foreground mt-2">Critical</p>
            </div>
            <div className="text-center">
              <Badge className="bg-warning text-warning-foreground text-base py-2 px-3">{stats.urgentCount}</Badge>
              <p className="text-xs text-muted-foreground mt-2">Urgent</p>
            </div>
            <div className="text-center">
              <Badge className="bg-accent text-accent-foreground text-base py-2 px-3">{stats.moderateCount}</Badge>
              <p className="text-xs text-muted-foreground mt-2">Moderate</p>
            </div>
            <div className="text-center">
              <Badge className="bg-secondary text-secondary-foreground text-base py-2 px-3">{stats.lowCount}</Badge>
              <p className="text-xs text-muted-foreground mt-2">Low</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
