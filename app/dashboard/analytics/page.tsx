"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs"
import {
  Download,
  Calendar,
  LineChart as LineChartIcon,
  BarChart3,
  PieChart as PieChartIcon,
  ArrowUpRight,
  ArrowDownRight,
  Globe,
  TrendingUp,
  ShoppingBag,
  MousePointerClick,
  Activity
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table"
import { Badge } from "../../../components/ui/badge"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts"

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("30days")
  const [activeTab, setActiveTab] = useState("overview")

  // Mock data for analytics
  const salesData = {
    thisMonth: 12580.45,
    lastMonth: 11250.80,
    percentageChange: 11.8,
    isPositive: true
  }

  const orderData = {
    thisMonth: 267,
    lastMonth: 232,
    percentageChange: 15.1,
    isPositive: true
  }

  const customerData = {
    thisMonth: 84,
    lastMonth: 93,
    percentageChange: 9.7,
    isPositive: false
  }

  const conversionData = {
    thisMonth: 3.7,
    lastMonth: 3.2,
    percentageChange: 15.6,
    isPositive: true
  }

  // Top products data
  const topProducts = [
    { name: "Organic Cotton T-Shirt", sales: 62, revenue: 1860.00 },
    { name: "Bamboo Water Bottle", sales: 48, revenue: 1152.00 },
    { name: "Recycled Paper Notebook", sales: 35, revenue: 525.00 },
    { name: "Hemp Tote Bag", sales: 29, revenue: 580.00 },
    { name: "Bamboo Toothbrush Set", sales: 23, revenue: 345.00 },
  ]

  // Traffic source data
  const trafficSources = [
    { source: "Direct", percentage: 35 },
    { source: "Organic Search", percentage: 25 },
    { source: "Social Media", percentage: 20 },
    { source: "Referrals", percentage: 15 },
    { source: "Email", percentage: 5 },
  ]

  // Sales trends data (for graphs)
  const salesTrendsData = {
    daily: [
      { date: "May 26", sales: 420 },
      { date: "May 27", sales: 380 },
      { date: "May 28", sales: 450 },
      { date: "May 29", sales: 520 },
      { date: "May 30", sales: 610 },
      { date: "May 31", sales: 580 },
      { date: "Jun 01", sales: 630 }
    ],
    weekly: [
      { date: "Week 1", sales: 2850 },
      { date: "Week 2", sales: 3100 },
      { date: "Week 3", sales: 2760 },
      { date: "Week 4", sales: 3420 }
    ],
    monthly: [
      { date: "Jan", sales: 8500 },
      { date: "Feb", sales: 7800 },
      { date: "Mar", sales: 9200 },
      { date: "Apr", sales: 10500 },
      { date: "May", sales: 11800 },
      { date: "Jun", sales: 6300 }
    ]
  }

  // Product performance data
  const productPerformanceData = {
    bestSelling: [
      { name: "Organic Cotton T-Shirt", sold: 124, revenue: 3720, conversion: 5.8 },
      { name: "Bamboo Water Bottle", sold: 98, revenue: 2352, conversion: 4.9 },
      { name: "Recycled Paper Notebook", sold: 87, revenue: 1305, conversion: 4.2 },
      { name: "Hemp Tote Bag", sold: 76, revenue: 1520, conversion: 3.8 },
      { name: "Bamboo Toothbrush Set", sold: 65, revenue: 975, conversion: 3.3 }
    ],
    lowConverting: [
      { name: "Solar-Powered Phone Charger", views: 520, sold: 12, conversion: 2.3 },
      { name: "Biodegradable Phone Case", views: 480, sold: 10, conversion: 2.1 },
      { name: "Eco-Friendly Yoga Mat", views: 390, sold: 7, conversion: 1.8 },
      { name: "Reusable Silicone Food Bags", views: 340, sold: 5, conversion: 1.5 },
      { name: "Sustainable Cutting Board", views: 290, sold: 4, conversion: 1.4 }
    ]
  }

  // Traffic analytics data
  const trafficAnalyticsData = {
    pageViews: [
      { page: "Homepage", views: 2450, bounceRate: 32, conversionRate: 4.2 },
      { page: "Product Listings", views: 1860, bounceRate: 28, conversionRate: 3.8 },
      { page: "Organic Cotton T-Shirt", views: 940, bounceRate: 24, conversionRate: 5.8 },
      { page: "Bamboo Water Bottle", views: 780, bounceRate: 26, conversionRate: 4.9 },
      { page: "Shopping Cart", views: 650, bounceRate: 38, conversionRate: 28.5 },
      { page: "Checkout", views: 520, bounceRate: 22, conversionRate: 72.0 }
    ]
  }

  // Order location data for heatmap
  const orderLocationData = [
    { region: "Maharashtra", orders: 87, revenue: 4350 },
    { region: "Karnataka", orders: 65, revenue: 3250 },
    { region: "Delhi", orders: 58, revenue: 2900 },
    { region: "Tamil Nadu", orders: 42, revenue: 2100 },
    { region: "Gujarat", orders: 38, revenue: 1900 },
    { region: "West Bengal", orders: 32, revenue: 1600 },
    { region: "Telangana", orders: 28, revenue: 1400 },
    { region: "Kerala", orders: 25, revenue: 1250 },
    { region: "Uttar Pradesh", orders: 22, revenue: 1100 },
    { region: "Rajasthan", orders: 18, revenue: 900 }
  ]

  const getChangeIndicator = (isPositive: boolean) => {
    return isPositive ?
      <div className="flex items-center text-green-600">
        <ArrowUpRight className="h-4 w-4 mr-1" />
      </div> :
      <div className="flex items-center text-red-600">
        <ArrowDownRight className="h-4 w-4 mr-1" />
      </div>
  }

  const getPercentageDisplay = (data: { percentageChange: number, isPositive: boolean }) => {
    const className = data.isPositive ? "text-green-600" : "text-red-600"
    return (
      <div className={`flex items-center ${className}`}>
        {getChangeIndicator(data.isPositive)}
        <span>{data.percentageChange}%</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold">Analytics & Reports</h1>
          <p className="text-gray-500">Monitor your store performance and sales trends</p>
        </div>
        <div className="mt-4 sm:mt-0 flex flex-wrap gap-2">
          <Select
            value={timeRange}
            onValueChange={setTimeRange}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            Custom Range
          </Button>

          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-4">
          <TabsTrigger value="overview" className="flex items-center gap-1">
            <Activity className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="sales" className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4" />
            Sales Trends
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center gap-1">
            <ShoppingBag className="h-4 w-4" />
            Product Performance
          </TabsTrigger>
          <TabsTrigger value="traffic" className="flex items-center gap-1">
            <MousePointerClick className="h-4 w-4" />
            Traffic Analytics
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-1">
            <Globe className="h-4 w-4" />
            Order Heatmap
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Key Metrics Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-baseline">
                  <div className="text-2xl font-bold">Rs {salesData.thisMonth.toFixed(2)}</div>
                  {getPercentageDisplay(salesData)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  vs. Rs {salesData.lastMonth.toFixed(2)} last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-baseline">
                  <div className="text-2xl font-bold">{orderData.thisMonth}</div>
                  {getPercentageDisplay(orderData)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  vs. {orderData.lastMonth} last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">New Customers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-baseline">
                  <div className="text-2xl font-bold">{customerData.thisMonth}</div>
                  {getPercentageDisplay(customerData)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  vs. {customerData.lastMonth} last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-baseline">
                  <div className="text-2xl font-bold">{conversionData.thisMonth}%</div>
                  {getPercentageDisplay(conversionData)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  vs. {conversionData.lastMonth}% last month
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {/* Sales Overview Chart Placeholder */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5" />
                  Sales Overview
                </CardTitle>
                <CardDescription>
                  Monthly revenue for the past 6 months
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={salesTrendsData.monthly}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip
                      formatter={(value) => [`Rs ${value}`, 'Revenue']}
                      contentStyle={{ backgroundColor: '#ffffff', borderRadius: '6px', boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)' }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="sales"
                      stroke="#16a34a"
                      strokeWidth={2}
                      dot={{ r: 4, fill: '#16a34a' }}
                      activeDot={{ r: 6, fill: '#16a34a' }}
                      name="Revenue"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Top Products */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Top Products
                </CardTitle>
                <CardDescription>
                  Best selling products by revenue
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-right">Units Sold</TableHead>
                      <TableHead className="text-right">Revenue</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topProducts.map((product, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell className="text-right">{product.sales}</TableCell>
                        <TableCell className="text-right">Rs {product.revenue.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Traffic Sources */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Traffic Sources
                </CardTitle>
                <CardDescription>
                  Where your customers are coming from
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={trafficSources}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="percentage"
                        nameKey="source"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {trafficSources.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={[
                              "#16a34a", // green-600
                              "#2563eb", // blue-600
                              "#d97706", // amber-600
                              "#9333ea", // purple-600
                              "#dc2626"  // red-600
                            ][index % 5]}
                          />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value}%`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* SALES TRENDS TAB */}
        <TabsContent value="sales" className="space-y-4">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-3 mb-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Daily Sales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={salesTrendsData.daily}
                      margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="date" stroke="#64748b" />
                      <YAxis stroke="#64748b" />
                      <Tooltip
                        formatter={(value) => [`Rs ${value}`, 'Sales']}
                        contentStyle={{ backgroundColor: '#ffffff', borderRadius: '6px' }}
                      />
                      <Area
                        type="monotone"
                        dataKey="sales"
                        stroke="#16a34a"
                        fill="#dcfce7"
                        name="Daily Sales"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Sales</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {salesTrendsData.daily.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.date}</TableCell>
                          <TableCell className="text-right">Rs {item.sales.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Weekly Sales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={salesTrendsData.weekly}
                      margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="date" stroke="#64748b" />
                      <YAxis stroke="#64748b" />
                      <Tooltip
                        formatter={(value) => [`Rs ${value}`, 'Sales']}
                        contentStyle={{ backgroundColor: '#ffffff', borderRadius: '6px' }}
                      />
                      <Bar
                        dataKey="sales"
                        fill="#16a34a"
                        name="Weekly Sales"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Week</TableHead>
                        <TableHead className="text-right">Sales</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {salesTrendsData.weekly.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.date}</TableCell>
                          <TableCell className="text-right">Rs {item.sales.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Monthly Sales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={salesTrendsData.monthly}
                      margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="date" stroke="#64748b" />
                      <YAxis stroke="#64748b" />
                      <Tooltip
                        formatter={(value) => [`Rs ${value}`, 'Sales']}
                        contentStyle={{ backgroundColor: '#ffffff', borderRadius: '6px' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="sales"
                        stroke="#16a34a"
                        strokeWidth={2}
                        dot={{ r: 3, fill: '#16a34a' }}
                        name="Monthly Sales"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Month</TableHead>
                        <TableHead className="text-right">Sales</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {salesTrendsData.monthly.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.date}</TableCell>
                          <TableCell className="text-right">Rs {item.sales.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* PRODUCT PERFORMANCE TAB */}
        <TabsContent value="products" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 mb-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Best-Selling Products
                </CardTitle>
                <CardDescription>
                  Top performing products by sales and conversion rate
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-right">Units Sold</TableHead>
                      <TableHead className="text-right">Revenue</TableHead>
                      <TableHead className="text-right">Conversion</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {productPerformanceData.bestSelling.map((product, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell className="text-right">{product.sold}</TableCell>
                        <TableCell className="text-right">Rs {product.revenue.toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
                            {product.conversion}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowDownRight className="h-5 w-5 text-red-600" />
                  Low-Converting Products
                </CardTitle>
                <CardDescription>
                  Products with poor conversion rates that need attention
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-right">Views</TableHead>
                      <TableHead className="text-right">Units Sold</TableHead>
                      <TableHead className="text-right">Conversion</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {productPerformanceData.lowConverting.map((product, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell className="text-right">{product.views}</TableCell>
                        <TableCell className="text-right">{product.sold}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50">
                            {product.conversion}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TRAFFIC ANALYTICS TAB */}
        <TabsContent value="traffic" className="space-y-4">
          <div className="grid gap-4 grid-cols-1 mb-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MousePointerClick className="h-5 w-5" />
                  Page Performance Metrics
                </CardTitle>
                <CardDescription>
                  Analysis of page views, bounce rates, and conversion rates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Page</TableHead>
                      <TableHead className="text-right">Page Views</TableHead>
                      <TableHead className="text-right">Bounce Rate</TableHead>
                      <TableHead className="text-right">Conversion Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {trafficAnalyticsData.pageViews.map((page, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{page.page}</TableCell>
                        <TableCell className="text-right">{page.views}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline" className={page.bounceRate > 35 ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}>
                            {page.bounceRate}%
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
                            {page.conversionRate}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Traffic Visualization
                </CardTitle>
                <CardDescription>
                  Visual representation of site traffic and user behavior
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={trafficAnalyticsData.pageViews}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis type="number" stroke="#64748b" />
                    <YAxis
                      type="category"
                      dataKey="page"
                      stroke="#64748b"
                      width={150}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip
                      formatter={(value, name) => [
                        name === 'views' ? value : `${value}%`,
                        name === 'views' ? 'Page Views' : name === 'bounceRate' ? 'Bounce Rate' : 'Conversion Rate'
                      ]}
                      contentStyle={{ backgroundColor: '#ffffff', borderRadius: '6px' }}
                    />
                    <Legend />
                    <Bar
                      dataKey="views"
                      fill="#16a34a"
                      name="Page Views"
                      radius={[0, 4, 4, 0]}
                    />
                    <Bar
                      dataKey="bounceRate"
                      fill="#dc2626"
                      name="Bounce Rate %"
                      radius={[0, 4, 4, 0]}
                    />
                    <Bar
                      dataKey="conversionRate"
                      fill="#2563eb"
                      name="Conversion Rate %"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ORDER HEATMAP TAB */}
        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Geographical Order Distribution
              </CardTitle>
              <CardDescription>
                Order volume and revenue by geographical regions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={orderLocationData}
                    layout="vertical"
                    margin={{ top: 10, right: 30, left: 80, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis type="number" stroke="#64748b" />
                    <YAxis
                      type="category"
                      dataKey="region"
                      stroke="#64748b"
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip
                      formatter={(value, name) => [
                        name === 'revenue' ? `₹${value}` : value,
                        name === 'revenue' ? 'Revenue' : 'Orders'
                      ]}
                      contentStyle={{ backgroundColor: '#ffffff', borderRadius: '6px' }}
                    />
                    <Legend />
                    <Bar
                      dataKey="orders"
                      name="Orders"
                      fill="#16a34a"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Region</TableHead>
                    <TableHead className="text-right">Orders</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead className="text-right">Density</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderLocationData.map((location, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{location.region}</TableCell>
                      <TableCell className="text-right">{location.orders}</TableCell>
                      <TableCell className="text-right">₹{location.revenue}</TableCell>
                      <TableCell className="text-right">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className="bg-green-600 h-2.5 rounded-full"
                            style={{ width: `${(location.orders / orderLocationData[0].orders) * 100}%` }}
                          ></div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
