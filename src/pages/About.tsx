import { Award, Users, History, Target } from 'lucide-react';
import { Card } from '@/components/ui/card';
import aboutBanner from '@/assets/about_banner.png';

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
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-6 text-white">
            Celebrating the Timeless Elegance of Silver
          </h1>
          <p className="text-lg opacity-80 max-w-3xl mx-auto font-light leading-relaxed">
            At KV SILVER ZONE, we celebrate the timeless elegance and beauty of silver.
            Established with a passion for exquisite craftsmanship and exceptional quality,
            we are a premier destination for both wholesale and retail silver articles.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <img
                src={aboutBanner}
                alt="Silver Craftsmanship"
                className="rounded-lg shadow-xl w-full h-[400px] object-cover"
              />
            </div>
            <div className="order-1 md:order-2 space-y-6">
              <h2 className="font-serif text-3xl md:text-4xl text-primary">
                A Legacy of Quality
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Our journey began with a vision to offer discerning individuals pieces that not only reflect their unique style but also endure as cherished heirlooms. Each item in our collection is carefully curated to ensure it meets our exacting standards for craftsmanship, design, and durability.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Beyond our commitment to exquisite silver pieces, we prioritize customer satisfaction above all else. Our dedicated team is here to assist you every step of the way in finding the perfect piece.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Products & Services */}
      <section className="bg-secondary/30 py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-serif text-3xl md:text-4xl text-primary mb-12">
            Our Collection & Services
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              "Traditional Kutthuvilakku (Lamp)", "Kudam & Puja Items", "Plates, Tumblers & Dinner Sets",
              "Jug Sets & Bowls with Trays", "Silver Gift Articles", "Customized Silver Products",
              "Intricate Kovil Work", "God Kavasam", "Silver Coins"
            ].map((item, i) => (
              <div key={i} className="bg-background p-6 rounded-lg shadow-sm border border-border/50 hover:shadow-md transition-shadow">
                <p className="text-primary font-medium tracking-wide">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 text-center">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="font-serif text-3xl font-medium text-primary">
              Visit Us Today
            </h2>
            <p className="text-xl text-muted-foreground font-light italic">
              "Thank you for visiting KV SILVER ZONE. We invite you to explore our collection and discover the perfect silver piece that speaks to you."
            </p>
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
                  <value.icon className="h-8 w-8 text-primary" />
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
