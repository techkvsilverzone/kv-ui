import { useEffect, useState } from 'react';
import { Search, Filter, Grid, List, ChevronDown, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import ProductCard from '@/components/ProductCard';
import { productService } from '@/services/product';

const Shop = () => {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const priceRanges = [
    { label: 'Under ₹500', value: '0-500' },
    { label: '₹500 - ₹1,000', value: '500-1000' },
    { label: '₹1,000 - ₹2,000', value: '1000-2000' },
    { label: 'Above ₹5,000', value: '5000+' },
  ];

  const getPriceBounds = (range: string): { minPrice?: number; maxPrice?: number } => {
    if (!range) return {};
    if (range.endsWith('+')) {
      const min = Number(range.replace('+', ''));
      return Number.isFinite(min) ? { minPrice: min } : {};
    }

    const [minRaw, maxRaw] = range.split('-');
    const min = Number(minRaw);
    const max = Number(maxRaw);

    return {
      minPrice: Number.isFinite(min) ? min : undefined,
      maxPrice: Number.isFinite(max) ? max : undefined,
    };
  };

  const { minPrice, maxPrice } = getPriceBounds(selectedPriceRange);

  useEffect(() => {
    const query = new URLSearchParams(location.search).get('search') || '';
    setSearchQuery((prev) => (prev === query ? prev : query));
  }, [location.search]);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products', selectedCategory, selectedPriceRange, searchQuery, sortBy],
    queryFn: () => productService.getProducts({
      category: selectedCategory || undefined,
      minPrice,
      maxPrice,
      search: searchQuery || undefined,
      sortBy: (sortBy === 'price-low' ? 'price_asc' : sortBy === 'price-high' ? 'price_desc' : 'newest') as any
    }),
  });

  const { data: categoriesData = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: productService.getCategories,
  });

  const categories = Array.isArray(categoriesData) ? categoriesData : [];

  const toggleCategory = (category: string) => {
    setSelectedCategory(prev => prev === category ? '' : category);
  };

  const togglePriceRange = (range: string) => {
    setSelectedPriceRange((prev) => (prev === range ? '' : range));
  };

  const FilterSidebar = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="font-serif text-lg font-semibold mb-4">Categories</h3>
        <div className="space-y-3">
          {categories.map((category) => (
            <label
              key={category}
              className="flex items-center justify-between cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={selectedCategory === category}
                  onCheckedChange={() => toggleCategory(category)}
                />
                <span className="text-sm group-hover:text-accent transition-colors">
                  {category}
                </span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-serif text-lg font-semibold mb-4">Price Range</h3>
        <div className="space-y-3">
          {priceRanges.map((range) => (
            <label key={range.value} className="flex items-center gap-3 cursor-pointer group">
              <Checkbox
                checked={selectedPriceRange === range.value}
                onCheckedChange={() => togglePriceRange(range.value)}
              />
              <span className="text-sm group-hover:text-accent transition-colors">
                {range.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Metal */}
      <div>
        <h3 className="font-serif text-lg font-semibold mb-4">Metal</h3>
        <div className="space-y-3">
          {['Silver', 'Gold 22K'].map((metal) => (
            <label key={metal} className="flex items-center gap-3 cursor-pointer group">
              <Checkbox />
              <span className="text-sm group-hover:text-accent transition-colors">
                {metal}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Clear Filters */}
      <Button
        variant="outline"
        className="w-full"
        onClick={() => {
          setSelectedCategory('');
          setSelectedPriceRange('');
          setSearchQuery('');
        }}
      >
        Clear All Filters
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen pt-24 pb-16">
      {/* Header */}
      <div className="bg-muted/50 py-12">
        <div className="container mx-auto px-4">
          <h1 className="font-serif text-4xl font-bold text-foreground mb-2">
            Shop Silver
          </h1>
          <p className="text-muted-foreground">
            Explore our exquisite collection of handcrafted silver jewelry
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <FilterSidebar />
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex items-center gap-4">
                {/* Mobile Filter */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="lg:hidden">
                      <Filter className="h-4 w-4 mr-2" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80">
                    <SheetHeader>
                      <SheetTitle>Filters</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                      <FilterSidebar />
                    </div>
                  </SheetContent>
                </Sheet>

                {/* Sort */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent className="bg-card">
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                  </SelectContent>
                </Select>

                {/* View Toggle */}
                <div className="hidden md:flex items-center gap-1 border border-border rounded-lg p-1">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Results Count */}
            <p className="text-sm text-muted-foreground mb-6">
              Showing {products.length} products
            </p>

            {/* Products Grid */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-10 w-10 text-accent animate-spin mb-4" />
                <p className="text-muted-foreground animate-pulse">Loading products...</p>
              </div>
            ) : products.length > 0 ? (
              <div
                className={`grid gap-6 ${
                  viewMode === 'grid'
                    ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3'
                    : 'grid-cols-1'
                }`}
              >
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-muted-foreground">No products found matching your criteria.</p>
                <Button
                  variant="link"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('');
                    setSelectedPriceRange('');
                  }}
                >
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;
