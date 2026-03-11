import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { User, Package, Heart, CreditCard, LogOut, Loader2, RotateCcw, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { orderService } from '@/services/order';
import { savingsService } from '@/services/savings';
import { returnsService } from '@/services/returns';

const Profile = () => {
  const { user, isAuthenticated, updateProfile, logout } = useAuth();
  const { toast } = useToast();
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: orderService.getMyOrders,
    enabled: !!isAuthenticated,
  });

  const { data: savings = [], isLoading: savingsLoading } = useQuery({
    queryKey: ['my-savings'],
    queryFn: savingsService.getMySchemes,
    enabled: !!isAuthenticated,
  });

  const { data: myReturns = [], isLoading: returnsLoading } = useQuery({
    queryKey: ['my-returns'],
    queryFn: returnsService.getMyReturns,
    enabled: !!isAuthenticated,
  });

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  const handleUpdateProfile = async () => {
    const success = await updateProfile(profileData);
    if (success) {
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully.',
      });
    } else {
      toast({
        title: 'Update Failed',
        description: 'Failed to update profile information.',
        variant: 'destructive',
      });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <h1 className="font-serif text-4xl font-bold text-foreground mb-8">
          My Account
        </h1>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-2">
              <Package className="h-4 w-4" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="wishlist" className="gap-2">
              <Heart className="h-4 w-4" />
              Wishlist
            </TabsTrigger>
            <TabsTrigger value="savings" className="gap-2">
              <CreditCard className="h-4 w-4" />
              Savings Scheme
            </TabsTrigger>
            <TabsTrigger value="returns" className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Returns
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card className="p-6">
              <h2 className="font-serif text-xl font-semibold mb-6">Profile Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    className="mt-1"
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={profileData.address}
                    onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                    className="mt-1"
                    placeholder="Your delivery address"
                  />
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <Button onClick={handleUpdateProfile} className="btn-shine">
                  Save Changes
                </Button>
                <Button variant="outline" onClick={logout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card className="p-6">
              <h2 className="font-serif text-xl font-semibold mb-6">Order History</h2>
              {ordersLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-accent" />
                </div>
              ) : orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg"
                    >
                      <div>
                        <p className="font-semibold">#{order.id.slice(-6)}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString()} • {order.items.length} item(s)
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-semibold text-accent">{formatPrice(order.totalAmount)}</p>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              order.status === 'Delivered'
                                ? 'bg-green-100 text-green-700'
                                : order.status === 'Cancelled'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}
                          >
                            {order.status}
                          </span>
                        </div>
                        <Button variant="ghost" size="icon" asChild>
                          <Link to={`/order/${order.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No orders yet. Start shopping!
                </p>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="wishlist">
            <Card className="p-6">
              <h2 className="font-serif text-xl font-semibold mb-6">My Wishlist</h2>
              <div className="text-center py-8 space-y-4">
                <p className="text-muted-foreground">
                  Manage your saved products in the dedicated wishlist page.
                </p>
                <Button asChild>
                  <Link to="/wishlist">Open Wishlist</Link>
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="savings">
            <Card className="p-6">
              <h2 className="font-serif text-xl font-semibold mb-6">Savings Scheme</h2>
              {savingsLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-accent" />
                </div>
              ) : savings.length > 0 ? (
                <div className="space-y-4">
                  {savings.map((scheme) => (
                    <div
                      key={scheme._id}
                      className="p-4 border border-border rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          scheme.status === 'Active' ? 'bg-green-100 text-green-700'
                            : scheme.status === 'Completed' ? 'bg-blue-100 text-blue-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {scheme.status}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          Started {new Date(scheme.startDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Monthly</p>
                          <p className="font-semibold">{formatPrice(scheme.monthlyAmount)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Duration</p>
                          <p className="font-semibold">{scheme.duration} months</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Paid</p>
                          <p className="font-semibold">{formatPrice(scheme.totalPaid)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Bonus</p>
                          <p className="font-semibold text-green-600">{formatPrice(scheme.bonusAmount)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-accent/10 rounded-lg p-6 text-center">
                  <h3 className="font-serif text-2xl font-bold text-accent mb-2">
                    Not Enrolled Yet
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Join our Monthly Savings Scheme and earn bonus silver!
                  </p>
                  <Button asChild>
                    <Link to="/savings-scheme">Enroll Now</Link>
                  </Button>
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="returns">
            <Card className="p-6">
              <h2 className="font-serif text-xl font-semibold mb-6">Return Requests</h2>
              {returnsLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-accent" />
                </div>
              ) : myReturns.length > 0 ? (
                <div className="space-y-4">
                  {myReturns.map((ret) => (
                    <div
                      key={ret.id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg"
                    >
                      <div>
                        <p className="font-semibold">Return #{ret.id.slice(-6)}</p>
                        <p className="text-sm text-muted-foreground">
                          Order #{ret.orderId.slice(-6)} • {ret.reason}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(ret.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatPrice(ret.refundAmount)}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          ret.status === 'Approved' ? 'bg-green-100 text-green-700'
                            : ret.status === 'Rejected' ? 'bg-red-100 text-red-700'
                            : ret.status === 'Completed' ? 'bg-blue-100 text-blue-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {ret.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No return requests. Hope you loved everything!
                </p>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
