'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { TrendingUp, TrendingDown, MapPin, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

// Mock data
const trendData = [
  { date: 'May 1', potholes: 45, resolved: 38 },
  { date: 'May 2', potholes: 52, resolved: 41 },
  { date: 'May 3', potholes: 48, resolved: 45 },
  { date: 'May 4', potholes: 61, resolved: 42 },
  { date: 'May 5', potholes: 55, resolved: 48 },
  { date: 'May 6', potholes: 67, resolved: 52 },
  { date: 'May 7', potholes: 72, resolved: 58 },
]

const severityData = [
  { name: 'Critical', value: 45, color: '#dc2626' },
  { name: 'High', value: 187, color: '#ea580c' },
  { name: 'Medium', value: 423, color: '#ca8a04' },
  { name: 'Low', value: 592, color: '#65a30d' },
]

const jurisdictionData = [
  { name: 'Central Zone', total: 234, resolved: 189, rate: 80.8 },
  { name: 'North Zone', total: 198, resolved: 145, rate: 73.2 },
  { name: 'South Zone', total: 276, resolved: 234, rate: 84.8 },
  { name: 'East Zone', total: 167, resolved: 112, rate: 67.1 },
  { name: 'West Zone', total: 312, resolved: 267, rate: 85.6 },
]

const monthlyTrend = [
  { month: 'Jan', detections: 1245, resolution: 892, rate: 71.6 },
  { month: 'Feb', detections: 1356, resolution: 987, rate: 72.7 },
  { month: 'Mar', detections: 1423, resolution: 1067, rate: 75.0 },
  { month: 'Apr', detections: 1534, resolution: 1189, rate: 77.5 },
  { month: 'May', detections: 1489, resolution: 1198, rate: 80.5 },
]

const weeklyKPIs = {
  newDetections: 356,
  newDetectionsChange: 12.3,
  resolutionRate: 82.5,
  resolutionRateChange: 5.2,
  avgResolutionTime: 6.8,
  avgResolutionTimeChange: -15.2,
  slaCompliance: 94.2,
  slaComplianceChange: 2.1,
}

const performanceMetrics = [
  { label: 'Under 3 days', value: 456, percentage: 38, color: 'bg-severity-low' },
  { label: '3-7 days', value: 523, percentage: 43, color: 'bg-severity-medium' },
  { label: '7-14 days', value: 156, percentage: 13, color: 'bg-severity-high' },
  { label: 'Over 14 days', value: 63, percentage: 5, color: 'bg-severity-critical' },
]

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('week')

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Comprehensive road health insights and trends</p>
        </div>
        <Tabs value={period} onValueChange={(v) => setPeriod(v as typeof period)}>
          <TabsList>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="year">Year</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="New Detections"
          value={weeklyKPIs.newDetections}
          change={weeklyKPIs.newDetectionsChange}
          icon={MapPin}
        />
        <KPICard
          label="Resolution Rate"
          value={`${weeklyKPIs.resolutionRate}%`}
          change={weeklyKPIs.resolutionRateChange}
          icon={CheckCircle}
          positive
        />
        <KPICard
          label="Avg Resolution Time"
          value={`${weeklyKPIs.avgResolutionTime} days`}
          change={weeklyKPIs.avgResolutionTimeChange}
          icon={Clock}
          positive
        />
        <KPICard
          label="SLA Compliance"
          value={`${weeklyKPIs.slaCompliance}%`}
          change={weeklyKPIs.slaComplianceChange}
          icon={AlertTriangle}
          positive
        />
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Detection Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Detection vs Resolution Trend</CardTitle>
            <CardDescription>Daily comparison over the past week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.5rem'
                    }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="potholes" stroke="#3366ff" fill="#3366ff" fillOpacity={0.2} name="Detected" />
                  <Area type="monotone" dataKey="resolved" stroke="#65a30d" fill="#65a30d" fillOpacity={0.2} name="Resolved" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Severity Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Severity Distribution</CardTitle>
            <CardDescription>Breakdown by severity level</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-8">
              <div className="h-[250px] w-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={severityData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {severityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3">
                {severityData.map((item) => (
                  <div key={item.name} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm font-medium">{item.name}</span>
                    <Badge variant="outline">{item.value}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Jurisdiction Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Performance by Jurisdiction</CardTitle>
            <CardDescription>Resolution rates across different zones</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={jurisdictionData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} unit="%" />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={100} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.5rem'
                    }}
                    formatter={(value: number) => [`${value}%`, 'Resolution Rate']}
                  />
                  <Bar dataKey="rate" fill="#3366ff" radius={[0, 4, 4, 0]} name="Resolution Rate" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Resolution Time Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Resolution Time Distribution</CardTitle>
            <CardDescription>How quickly potholes are being fixed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {performanceMetrics.map((metric) => (
                <div key={metric.label} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{metric.label}</span>
                    <span className="font-medium">{metric.value} ({metric.percentage}%)</span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all', metric.color)}
                      style={{ width: `${metric.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Performance Trend</CardTitle>
          <CardDescription>Long-term view of detections, resolutions, and success rate</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="right" orientation="right" domain={[60, 90]} tick={{ fontSize: 12 }} unit="%" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.5rem'
                  }}
                />
                <Legend />
                <Area yAxisId="left" type="monotone" dataKey="detections" stroke="#3366ff" fill="#3366ff" fillOpacity={0.2} name="Total Detections" />
                <Area yAxisId="left" type="monotone" dataKey="resolution" stroke="#65a30d" fill="#65a30d" fillOpacity={0.2} name="Resolutions" />
                <Area yAxisId="right" type="monotone" dataKey="rate" stroke="#9333ea" fill="#9333ea" fillOpacity={0.2} name="Success Rate" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function KPICard({
  label,
  value,
  change,
  icon: Icon,
  positive
}: {
  label: string
  value: string | number
  change: number
  icon: React.ElementType
  positive?: boolean
}) {
  const isPositive = positive ? change > 0 : change < 0
  const TrendIcon = change > 0 ? TrendingUp : TrendingDown

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <Icon className="h-5 w-5 text-muted-foreground" />
          <div className={cn('flex items-center gap-1 text-xs font-medium', isPositive ? 'text-severity-low' : 'text-severity-critical')}>
            <TrendIcon className="h-3 w-3" />
            {Math.abs(change)}%
          </div>
        </div>
        <p className="text-2xl font-bold mt-2">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  )
}
