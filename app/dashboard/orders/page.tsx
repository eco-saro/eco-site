"use client"

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface OrderItem {
  product: {
    _id: string;
    name: string;
  };
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled';
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
              <TableHead>Order ID</TableHead>
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
                  <TableCell className="font-medium">...{order._id.slice(-6)}</TableCell>
                  <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>{order.user.name}</TableCell>
                  <TableCell>
                    <Badge variant={order.status === 'delivered' ? 'default' : 'secondary'}>{order.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">₹{order.totalAmount?.toFixed(2) || "0.00"}</TableCell>
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