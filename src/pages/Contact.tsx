import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: 'Message Sent!',
      description: 'Our team will get back to you within 24 hours.',
    });
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: 'Visit Us',
      details: ['123 Silver Street, Jewelry Market', 'Chennai, Tamil Nadu 600001'],
    },
    {
      icon: Phone,
      title: 'Call Us',
      details: ['+91 98765 43210', '+91 44 2345 6789'],
    },
    {
      icon: Mail,
      title: 'Email Us',
      details: ['info@kvsilverzone.com', 'support@kvsilverzone.com'],
    },
    {
      icon: Clock,
      title: 'Working Hours',
      details: ['Mon - Sat: 10:00 AM - 8:00 PM', 'Sunday: 11:00 AM - 6:00 PM'],
    },
  ];

  return (
    <div className="min-h-screen pt-24">
      {/* Hero */}
      <section className="bg-primary text-primary-foreground py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-6">
            Contact Support
          </h1>
          <p className="text-lg opacity-80 max-w-2xl mx-auto">
            Have questions? We're here to help. Reach out to our friendly support 
            team and we'll get back to you as soon as possible.
          </p>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info, index) => (
              <Card key={index} className="p-6 text-center card-hover">
                <div className="w-14 h-14 mx-auto rounded-full bg-accent/10 flex items-center justify-center mb-4">
                  <info.icon className="h-7 w-7 text-accent" />
                </div>
                <h3 className="font-serif text-lg font-semibold mb-2">{info.title}</h3>
                {info.details.map((detail, i) => (
                  <p key={i} className="text-sm text-muted-foreground">{detail}</p>
                ))}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
              {/* Form */}
              <div className="lg:col-span-3">
                <h2 className="font-serif text-3xl font-bold text-foreground mb-6">
                  Send Us a Message
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Your name"
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="your@email.com"
                        required
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="subject">Subject</Label>
                      <Select
                        value={formData.subject}
                        onValueChange={(value) => setFormData({ ...formData, subject: value })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select a topic" />
                        </SelectTrigger>
                        <SelectContent className="bg-card">
                          <SelectItem value="order">Order Inquiry</SelectItem>
                          <SelectItem value="product">Product Question</SelectItem>
                          <SelectItem value="savings">Savings Scheme</SelectItem>
                          <SelectItem value="return">Returns & Exchange</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Tell us how we can help..."
                      rows={5}
                      required
                      className="mt-1"
                    />
                  </div>
                  <Button type="submit" size="lg" className="btn-shine">
                    Send Message
                    <Send className="ml-2 h-5 w-5" />
                  </Button>
                </form>
              </div>

              {/* Quick Help */}
              <div className="lg:col-span-2">
                <h2 className="font-serif text-3xl font-bold text-foreground mb-6">
                  Quick Help
                </h2>
                <Card className="p-6 bg-muted/50">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Order Tracking</h3>
                      <p className="text-sm text-muted-foreground">
                        Track your order status in real-time through your account dashboard.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Returns & Exchange</h3>
                      <p className="text-sm text-muted-foreground">
                        Easy 15-day returns and lifetime exchange on all jewelry.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Savings Scheme Help</h3>
                      <p className="text-sm text-muted-foreground">
                        Questions about your monthly savings? We're here to help!
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 mt-6 bg-accent text-accent-foreground">
                  <div className="flex items-center gap-4">
                    <MessageCircle className="h-10 w-10" />
                    <div>
                      <h3 className="font-semibold">Live Chat</h3>
                      <p className="text-sm opacity-80">Available 10AM - 8PM</p>
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    className="w-full mt-4"
                    onClick={() => toast({ title: 'Chat', description: 'Live chat coming soon!' })}
                  >
                    Start Chat
                  </Button>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Placeholder */}
      <section className="h-96 bg-muted flex items-center justify-center">
        <div className="text-center">
          <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Interactive map will be displayed here</p>
          <p className="text-sm text-muted-foreground">123 Silver Street, Chennai</p>
        </div>
      </section>
    </div>
  );
};

export default Contact;
