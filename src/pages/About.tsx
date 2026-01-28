import { Award, Users, History, Target } from 'lucide-react';
import { Card } from '@/components/ui/card';

const About = () => {
  const stats = [
    { value: '25+', label: 'Years of Excellence' },
    { value: '50K+', label: 'Happy Customers' },
    { value: '10K+', label: 'Products Sold' },
    { value: '100%', label: 'BIS Certified' },
  ];

  const values = [
    {
      icon: Award,
      title: 'Quality Assurance',
      description: 'Every piece is BIS hallmarked and certified for purity',
    },
    {
      icon: Users,
      title: 'Customer First',
      description: 'Dedicated to providing exceptional service and support',
    },
    {
      icon: History,
      title: 'Heritage Craftsmanship',
      description: 'Traditional techniques passed down through generations',
    },
    {
      icon: Target,
      title: 'Fair Pricing',
      description: 'Transparent pricing with no hidden charges',
    },
  ];

  return (
    <div className="min-h-screen pt-24">
      {/* Hero */}
      <section className="bg-primary text-primary-foreground py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-6">
            Our Story
          </h1>
          <p className="text-lg opacity-80 max-w-2xl mx-auto">
            For over two decades, KV Silver Zone has been crafting exquisite silver jewelry 
            that celebrates tradition while embracing modern elegance.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="font-serif text-4xl md:text-5xl font-bold text-accent mb-2">
                  {stat.value}
                </div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="font-serif text-3xl font-bold text-foreground mb-6">
                  A Legacy of Trust
                </h2>
                <p className="text-muted-foreground mb-4">
                  Founded in 1998, KV Silver Zone began as a small family-owned shop with a 
                  passion for silver craftsmanship. Our founder, Mr. K. Venkatesh, started 
                  with a vision to make pure silver jewelry accessible to everyone.
                </p>
                <p className="text-muted-foreground mb-4">
                  Today, we have grown into one of the most trusted names in silver jewelry, 
                  serving customers across India with our extensive collection of traditional 
                  and contemporary designs.
                </p>
                <p className="text-muted-foreground">
                  Our commitment to quality, authenticity, and customer satisfaction remains 
                  the cornerstone of our business. Every piece that leaves our store carries 
                  our guarantee of purity and craftsmanship.
                </p>
              </div>
              <div className="bg-muted rounded-2xl aspect-square flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="w-24 h-24 mx-auto rounded-full bg-primary flex items-center justify-center mb-4">
                    <span className="text-primary-foreground font-serif font-bold text-4xl">KV</span>
                  </div>
                  <p className="font-serif text-xl font-semibold text-foreground">Est. 1998</p>
                  <p className="text-muted-foreground">Chennai, India</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-serif text-4xl font-bold text-foreground">
              Our Values
            </h2>
            <p className="text-muted-foreground mt-2">
              The principles that guide everything we do
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {values.map((value, index) => (
              <Card key={index} className="p-6 text-center card-hover">
                <div className="w-16 h-16 mx-auto rounded-full bg-accent/10 flex items-center justify-center mb-4">
                  <value.icon className="h-8 w-8 text-accent" />
                </div>
                <h3 className="font-serif text-xl font-semibold mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-serif text-4xl font-bold text-foreground mb-6">
              Our Mission
            </h2>
            <p className="text-xl text-muted-foreground">
              "To bring the timeless beauty of pure silver into every home, 
              crafted with love, certified for quality, and priced for accessibility. 
              We believe everyone deserves to own a piece of silver that they can 
              cherish and pass down through generations."
            </p>
            <p className="mt-6 font-serif text-lg text-foreground">
              — The KV Silver Zone Family
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
