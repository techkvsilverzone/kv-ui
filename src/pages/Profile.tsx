import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { User, Package, Heart, CreditCard, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

const Profile = () => {
  const { user, isAuthenticated, updateProfile, logout } = useAuth();
  const { toast } = useToast();
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  const handleUpdateProfile = () => {
    updateProfile(profileData);
    toast({
      title: 'Profile Updated',
      description: 'Your profile has been updated successfully.',
    });
  };

  const mockOrders = [
    {
      id: 'ORD001',
      date: '2025-01-15',
      status: 'Delivered',
      total: 15999,
      items: 2,
    },
    {
      id: 'ORD002',
      date: '2025-01-20',
      status: 'In Transit',
      total: 8999,
      items: 1,
    },
  ];

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
              {mockOrders.length > 0 ? (
                <div className="space-y-4">
                  {mockOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg"
                    >
                      <div>
                        <p className="font-semibold">{order.id}</p>
                        <p className="text-sm text-muted-foreground">
                          {order.date} • {order.items} item(s)
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-accent">{formatPrice(order.total)}</p>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            order.status === 'Delivered'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {order.status}
                        </span>
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
              <p className="text-muted-foreground text-center py-8">
                Your wishlist is empty. Browse our collection and save your favorites!
              </p>
            </Card>
          </TabsContent>

          <TabsContent value="savings">
            <Card className="p-6">
              <h2 className="font-serif text-xl font-semibold mb-6">Savings Scheme</h2>
              <div className="bg-accent/10 rounded-lg p-6 text-center">
                <h3 className="font-serif text-2xl font-bold text-accent mb-2">
                  Not Enrolled Yet
                </h3>
                <p className="text-muted-foreground mb-4">
                  Join our Monthly Savings Scheme and earn bonus silver!
                </p>
                <Button asChild>
                  <a href="/savings-scheme">Enroll Now</a>
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
