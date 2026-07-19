import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User, Package, Heart, CreditCard, LogOut, Loader2, RotateCcw, Eye, MessageCircle, Video, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { orderService, type Order } from '@/services/order';
import { savingsService } from '@/services/savings';
import { returnsService, type ReturnFaultType, type CreateReturnResponse } from '@/services/returns';
import { validateForm, profileSchema } from '@/lib/validation';
import Seo from '@/components/Seo';

const Profile = () => {
  const { user, isAuthenticated, updateProfile, logout } = useAuth();
  const { toast } = useToast();
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    dateOfBirth: user?.dateOfBirth ? user.dateOfBirth.slice(0, 10) : '',
    anniversaryDate: user?.anniversaryDate ? user.anniversaryDate.slice(0, 10) : '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const { data: returnPolicy } = useQuery({
    queryKey: ['return-policy'],
    queryFn: returnsService.getReturnPolicy,
    staleTime: 10 * 60_000,
  });

  const queryClient = useQueryClient();
  const [returnDialogOrder, setReturnDialogOrder] = useState<Order | null>(null);
  const [returnFaultType, setReturnFaultType] = useState<ReturnFaultType>('kv_fault');
  const [returnReason, setReturnReason] = useState('');
  const [returnDescription, setReturnDescription] = useState('');
  const [selectedItems, setSelectedItems] = useState<Record<number, boolean>>({});
  const [submittedReturn, setSubmittedReturn] = useState<CreateReturnResponse | null>(null);

  const openReturnDialog = (order: Order) => {
    setReturnDialogOrder(order);
    setReturnFaultType('kv_fault');
    setReturnReason('');
    setReturnDescription('');
    setSelectedItems({});
    setSubmittedReturn(null);
  };

  const createReturnMutation = useMutation({
    mutationFn: returnsService.createReturn,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['my-returns'] });
      setSubmittedReturn(result);
    },
    onError: (error: unknown) => {
      toast({
        title: 'Could not submit return',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleSubmitReturn = () => {
    if (!returnDialogOrder) return;
    const items = returnDialogOrder.items
      .map((item, index) => ({ item, index }))
      .filter(({ index }) => selectedItems[index]);

    if (items.length === 0) {
      toast({ title: 'Select at least one item', variant: 'destructive' });
      return;
    }
    if (!returnReason.trim()) {
      toast({ title: 'Reason is required', variant: 'destructive' });
      return;
    }

    createReturnMutation.mutate({
      orderId: returnDialogOrder.id || returnDialogOrder._id,
      faultType: returnFaultType,
      reason: returnReason.trim(),
      description: returnDescription.trim(),
      items: items.map(({ item }) => ({
        product: item.product,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
    });
  };

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  const handleUpdateProfile = async () => {
    const result = validateForm(profileSchema, {
      name: profileData.name,
      email: profileData.email,
      phone: profileData.phone,
    });
    if (!result.success) {
      setErrors(result.errors);
      return;
    }
    setErrors({});
    // Omit blank date fields — an empty string is not a valid Date for the backend to cast.
    const { dateOfBirth, anniversaryDate, ...rest } = profileData;
    const success = await updateProfile({
      ...rest,
      ...(dateOfBirth ? { dateOfBirth } : {}),
      ...(anniversaryDate ? { anniversaryDate } : {}),
    });
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
      <Seo title="My Account" noindex />
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
                    aria-invalid={!!errors.name}
                  />
                  {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    className="mt-1"
                    aria-invalid={!!errors.email}
                  />
                  {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    className="mt-1"
                    placeholder="+91 98765 43210"
                    aria-invalid={!!errors.phone}
                  />
                  {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
                </div>
                <div>
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={profileData.dateOfBirth}
                    onChange={(e) => setProfileData({ ...profileData, dateOfBirth: e.target.value })}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">We'll send you a birthday wish 🎉</p>
                </div>
                <div>
                  <Label htmlFor="anniversaryDate">Wedding Anniversary</Label>
                  <Input
                    id="anniversaryDate"
                    type="date"
                    value={profileData.anniversaryDate}
                    onChange={(e) => setProfileData({ ...profileData, anniversaryDate: e.target.value })}
                    className="mt-1"
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
                <Button variant="outline" asChild>
                  <Link to="/change-password">Change Password</Link>
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
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
                          <p className="font-semibold text-primary">{formatPrice(order.totalAmount)}</p>
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
                        {order.status === 'Delivered' && (
                          <Button variant="outline" size="sm" onClick={() => openReturnDialog(order)}>
                            Request Return
                          </Button>
                        )}
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
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
                  <h3 className="font-serif text-2xl font-bold text-primary mb-2">
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
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : myReturns.length > 0 ? (
                <div className="space-y-4">
                  {myReturns.map((ret) => (
                    <div
                      key={ret.id}
                      className="p-4 border border-border rounded-lg"
                    >
                      <div className="flex items-center justify-between">
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
                      <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-border/60">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${ret.faultType === 'kv_fault' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                          {ret.faultType === 'kv_fault' ? 'KV Fault Claim' : 'Exchange / Store Credit'}
                        </span>
                        {ret.videoStatus === 'awaiting' && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 flex items-center gap-1">
                            <Video className="h-3 w-3" /> Video pending — send to WhatsApp with code {ret.videoReferenceCode}
                          </span>
                        )}
                        {ret.videoStatus === 'received' && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Video received
                          </span>
                        )}
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

      {/* Request Return dialog */}
      <Dialog open={!!returnDialogOrder} onOpenChange={(open) => !open && setReturnDialogOrder(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          {submittedReturn ? (
            <>
              <DialogHeader>
                <DialogTitle>Return Request Submitted</DialogTitle>
              </DialogHeader>
              {submittedReturn.videoInstructions ? (
                <div className="space-y-4">
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-3">
                    <p className="flex items-center gap-2 font-semibold text-primary">
                      <MessageCircle className="h-4 w-4" /> Send us your unboxing video
                    </p>
                    <p className="text-sm text-muted-foreground">
                      To process your KV-fault claim, WhatsApp your unboxing video (unedited, from before opening
                      the sealed parcel through the full reveal) to:
                    </p>
                    <p className="text-lg font-semibold">{submittedReturn.videoInstructions.whatsappNumber}</p>
                    <p className="text-sm text-muted-foreground">
                      Include this code as the video's caption so we can match it to your claim:
                    </p>
                    <p className="text-lg font-mono font-semibold tracking-wider">
                      {submittedReturn.videoInstructions.referenceCode}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Please send it within {submittedReturn.videoInstructions.windowHours} hours of delivery — claims
                      without a matching video cannot be processed.
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Since this isn't a KV-fault claim, it's eligible for exchange or store credit only (not a cash
                  refund) — our team will reach out to arrange the exchange.
                </p>
              )}
              <DialogFooter>
                <Button onClick={() => setReturnDialogOrder(null)}>Done</Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Request Return — Order #{returnDialogOrder?.id?.slice(-6)}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label className="mb-2 block">Which items?</Label>
                  <div className="space-y-2">
                    {returnDialogOrder?.items.map((item, index) => (
                      <label key={index} className="flex items-center gap-2 text-sm cursor-pointer">
                        <Checkbox
                          checked={!!selectedItems[index]}
                          onCheckedChange={(checked) =>
                            setSelectedItems((prev) => ({ ...prev, [index]: checked === true }))
                          }
                        />
                        {item.name} (Qty {item.quantity})
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="mb-2 block">Reason for return</Label>
                  <RadioGroup value={returnFaultType} onValueChange={(v) => setReturnFaultType(v as ReturnFaultType)}>
                    <label className="flex items-start gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/50">
                      <RadioGroupItem value="kv_fault" className="mt-0.5" />
                      <span>
                        <span className="block font-medium">Wrong, damaged, or defective item (KV's fault)</span>
                        <span className="block text-xs text-muted-foreground">Eligible for refund or replacement — requires an unboxing video sent via WhatsApp.</span>
                      </span>
                    </label>
                    <label className="flex items-start gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/50">
                      <RadioGroupItem value="customer_preference" className="mt-0.5" />
                      <span>
                        <span className="block font-medium">Changed my mind / other reason</span>
                        <span className="block text-xs text-muted-foreground">Eligible for exchange or store credit only — no video required.</span>
                      </span>
                    </label>
                  </RadioGroup>
                </div>

                <div>
                  <Label htmlFor="returnReason">Short reason</Label>
                  <Input
                    id="returnReason"
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    placeholder="e.g. Received a damaged bangle"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="returnDescription">Additional details (optional)</Label>
                  <Textarea
                    id="returnDescription"
                    value={returnDescription}
                    onChange={(e) => setReturnDescription(e.target.value)}
                    className="mt-1"
                    rows={3}
                  />
                </div>

                {returnPolicy && (
                  <p className="text-xs text-muted-foreground">
                    Returns must be filed within {returnPolicy.claimWindowHours} hours of delivery.
                  </p>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setReturnDialogOrder(null)}>Cancel</Button>
                <Button onClick={handleSubmitReturn} disabled={createReturnMutation.isPending}>
                  {createReturnMutation.isPending ? 'Submitting...' : 'Submit Return Request'}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;
