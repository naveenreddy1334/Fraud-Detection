'use client'

import React, { useState, useEffect } from 'react'
import { AlertCircle, CheckCircle, Activity, DollarSign, AlertTriangle, Search, MapPin, Clock } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

// TypeScript interfaces
interface Transaction {
  id: number
  timestamp: string
  amount: number
  location: string
  merchant: string
  deviceType: string
  riskScore: number
  isAnomaly: boolean
  ipAddress: string
  velocity: number
  userAgent: string
}

interface Stats {
  totalTransactions: number
  fraudulentTransactions: number
  totalAmount: number
  riskScore: number
}

export default function FraudDetection() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [timeRange, setTimeRange] = useState('24h')
  const [locationFilter, setLocationFilter] = useState('all')
  const [stats, setStats] = useState<Stats>({
    totalTransactions: 0,
    fraudulentTransactions: 0,
    totalAmount: 0,
    riskScore: 0
  })
  const [loading, setLoading] = useState(true)

  const generateTransaction = (): Transaction => {
    const merchants = ['Amazon', 'Walmart', 'Best Buy', 'Apple Store', 'Target', 'Gas Station', 'Unknown Merchant']
    const locations = ['New York', 'London', 'Tokyo', 'Sydney', 'Paris', 'Unknown Location']
    const deviceTypes = ['Mobile', 'Desktop', 'Tablet', 'Unknown Device']

    const amount = Math.random() * (Math.random() < 0.1 ? 10000 : 1000)
    const location = locations[Math.floor(Math.random() * locations.length)]
    const merchant = merchants[Math.floor(Math.random() * merchants.length)]
    const deviceType = deviceTypes[Math.floor(Math.random() * deviceTypes.length)]

    const amountRisk = amount > 5000 ? 40 : amount > 1000 ? 20 : 0
    const locationRisk = location === 'Unknown Location' ? 30 : 0
    const merchantRisk = merchant === 'Unknown Merchant' ? 25 : 0
    const deviceRisk = deviceType === 'Unknown Device' ? 20 : 0
    const timeRisk = new Date().getHours() < 4 ? 15 : 0

    const riskScore = Math.min(100, amountRisk + locationRisk + merchantRisk + deviceRisk + timeRisk + Math.random() * 10)

    return {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      amount,
      location,
      merchant,
      deviceType,
      riskScore,
      isAnomaly: riskScore > 70,
      ipAddress: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      velocity: Math.floor(Math.random() * 10),
      userAgent: deviceType === 'Mobile' ? 'Mobile Safari' : 'Chrome Desktop'
    }
  }

  useEffect(() => {
    let mounted = true
    
    const initialTransactions = Array.from({ length: 10 }, generateTransaction)
    if (mounted) {
      setTransactions(initialTransactions)
      setLoading(false)
    }

    const interval = setInterval(() => {
      if (!mounted) return
      
      const newTransaction = generateTransaction()
      setTransactions(prev => {
        const updated = [newTransaction, ...prev].slice(0, 50)
        
        const fraudulent = updated.filter(t => t.isAnomaly).length
        const total = updated.reduce((sum, t) => sum + t.amount, 0)
        const avgRisk = updated.reduce((sum, t) => sum + t.riskScore, 0) / updated.length
        
        setStats({
          totalTransactions: updated.length,
          fraudulentTransactions: fraudulent,
          totalAmount: total,
          riskScore: avgRisk
        })
        
        return updated
      })
    }, 3000)

    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [])

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = 
      transaction.merchant.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesLocation = locationFilter === 'all' || transaction.location === locationFilter
    return matchesSearch && matchesLocation
  })

  const riskTrendData = transactions.slice(0, 20).map(t => ({
    time: new Date(t.timestamp).toLocaleTimeString(),
    risk: t.riskScore
  })).reverse()

  const locationData = Object.entries(
    transactions.reduce<Record<string, number>>((acc, t) => ({
      ...acc,
      [t.location]: (acc[t.location] || 0) + 1
    }), {})
  ).map(([name, value]) => ({ name, value }))

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-xl font-semibold">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Fraud Detection Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500">Total Transactions</p>
                <h3 className="text-2xl font-bold">{stats.totalTransactions}</h3>
              </div>
              <Activity className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500">Fraudulent Transactions</p>
                <h3 className="text-2xl font-bold text-red-500">{stats.fraudulentTransactions}</h3>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500">Total Amount</p>
                <h3 className="text-2xl font-bold">${stats.totalAmount.toFixed(2)}</h3>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500">Average Risk Score</p>
                <h3 className="text-2xl font-bold">{stats.riskScore.toFixed(1)}</h3>
              </div>
              <Activity className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  className="pl-10 pr-4 py-2 w-full border rounded-lg"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <select
              className="border rounded-lg px-4 py-2"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
            >
              <option value="all">All Locations</option>
              <option value="New York">New York</option>
              <option value="London">London</option>
              <option value="Tokyo">Tokyo</option>
              <option value="Sydney">Sydney</option>
              <option value="Paris">Paris</option>
            </select>
            
            <select
              className="border rounded-lg px-4 py-2"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Risk Score Trend</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={riskTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="risk" stroke="#3b82f6" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Transaction Locations</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={locationData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({name, value}) => `${name}: ${value}`}
                  >
                    {locationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
            <div className="space-y-4">
              {filteredTransactions.map(transaction => (
                <div 
                  key={transaction.id}
                  className={`bg-white rounded-lg border p-4 ${
                    transaction.isAnomaly ? 'border-red-500' : 'border-green-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        {transaction.isAnomaly ? 
                          <AlertCircle className="text-red-500 w-5 h-5" /> : 
                          <CheckCircle className="text-green-500 w-5 h-5" />
                        }
                        <span className="font-medium">
                          ${transaction.amount.toFixed(2)} at {transaction.merchant}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 space-x-4">
                        <span><MapPin className="inline w-4 h-4 mr-1" />{transaction.location}</span>
                        <span><Clock className="inline w-4 h-4 mr-1" />{new Date(transaction.timestamp).toLocaleString()}</span>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        Device: {transaction.deviceType} • IP: {transaction.ipAddress}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold ${
                        transaction.riskScore > 70 ? 'text-red-500' : 'text-green-500'
                      }`}>
                        Risk Score: {transaction.riskScore.toFixed(1)}
                      </div>
                      <div className="text-sm text-gray-500">
                        Velocity: {transaction.velocity} txn/hour
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}