"use client"

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface OrderItem {
  product: string | {
    _id: string;
    name: string;
    images?: string[];
  };
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

interface Order {
  _id: string;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled' | 'completed';
  createdAt: string;
  user: {
    name: string;
  };
  products: OrderItem[];
  totalAmount: number;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalOrders: number;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/orders?dashboard=true&page=${currentPage}&limit=10`);
        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }
        const data = await response.json();
        setOrders(data.orders); // Use the 'orders' property from the response
        setPagination(data.pagination); // Store pagination info
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [currentPage]);

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    if (pagination) {
      setCurrentPage((prev) => Math.min(prev + 1, pagination.totalPages));
    }
  };

  if (loading && orders.length === 0) {
    return <div className="text-center p-8">Loading orders...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">Error: {error}</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Orders</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Products</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length > 0 ? (
              orders.map((order) => (
                <TableRow key={order._id}>
                  <TableCell className="font-medium">
                    <div className="flex flex-col gap-1">
                      <span className="truncate max-w-[200px]">
                        {order.products?.length > 0
                          ? order.products.map((p: any) => p.name).join(", ")
                          : `Order #${order._id.slice(-6).toUpperCase()}`}
                      </span>
                      <div className="flex -space-x-2 overflow-hidden">
                        {order.products?.slice(0, 3).map((p, pIdx) => (
                          <div key={`${order._id}-p-${pIdx}`} className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-gray-100 overflow-hidden">
                            <img src={p.image || "/placeholder.svg"} alt="" className="h-full w-full object-cover" />
                          </div>
                        ))}
                        {order.products?.length > 3 && (
                          <div className="flex items-center justify-center h-6 w-6 rounded-full ring-2 ring-white bg-gray-200 text-[10px] font-bold">
                            +{order.products.length - 3}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>{order.user?.name || "Guest"}</TableCell>
                  <TableCell>
                    {(() => {
                      let variant: "default" | "secondary" | "destructive" | "outline" | null = "secondary";
                      if (order.status === 'Delivered' || order.status === 'completed') variant = "default";
                      else if (order.status === 'Cancelled') variant = "destructive";
                      return <Badge variant={variant}>{order.status}</Badge>;
                    })()}
                  </TableCell>
                  <TableCell className="text-right font-bold">₹{order.totalAmount?.toLocaleString() || "0"}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center">No orders found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Page {pagination.currentPage} of {pagination.totalPages}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevPage}
                disabled={pagination.currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={pagination.currentPage === pagination.totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}