import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, Filter, Grid, List, ChevronDown, Loader2 } from 'lucide-react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import type { Product } from '@/context/CartContext';
import * as SliderPrimitive from '@radix-ui/react-slider';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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
import Seo from '@/components/Seo';
import { productService, type CategoryNode } from '@/services/product';

/** Products fetched per infinite-scroll batch. */
const PAGE_SIZE = 12;

// Price slider: fixed ₹100–₹5,000 range, debounced before it triggers a query.
const PRICE_MIN = 100;
const PRICE_MAX = 5000;
const PRICE_STEP = 100;
const PRICE_DEBOUNCE_MS = 700; // wait after the user stops dragging before querying

const formatINR = (value: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);

/** Two-handle price range slider (built on the Radix primitive so it can render both thumbs). */
const PriceRangeSlider = ({
  value,
  min,
  max,
  step,
  onValueChange,
}: {
  value: [number, number];
  min: number;
  max: number;
  step: number;
  onValueChange: (value: [number, number]) => void;
}) => (
  <SliderPrimitive.Root
    className="relative flex w-full touch-none select-none items-center"
    value={value}
    min={min}
    max={max}
    step={step}
    minStepsBetweenThumbs={1}
    onValueChange={(vals) => onValueChange([vals[0], vals[1]])}
    aria-label="Price range"
  >
    <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
      <SliderPrimitive.Range className="absolute h-full bg-primary" />
    </SliderPrimitive.Track>
    {value.map((_, i) => (
      <SliderPrimitive.Thumb
        key={i}
        className={cn(
          'block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        )}
      />
    ))}
  </SliderPrimitive.Root>
);

/**
 * Price filter that owns the live drag state locally, so dragging the slider re-renders ONLY this
 * small component (not the whole Shop page / product grid). It commits the value upward debounced.
 */
const PriceRangeFilter = ({
  value,
  onChange,
}: {
  value: [number, number] | null;
  onChange: (value: [number, number] | null) => void;
}) => {
  const [live, setLive] = useState<[number, number]>(value ?? [PRICE_MIN, PRICE_MAX]);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  // Re-sync when the committed value changes externally (preset chosen, "Clear all", etc.).
  useEffect(() => {
    setLive(value ?? [PRICE_MIN, PRICE_MAX]);
  }, [value]);

  // Clear any pending timer on unmount.
  useEffect(() => () => clearTimeout(timerRef.current), []);

  const handleChange = (next: [number, number]) => {
    setLive(next); // instant, local-only re-render → smooth dragging
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onChange(next), PRICE_DEBOUNCE_MS);
  };

  return (
    <div className="mb-5">
      <PriceRangeSlider value={live} min={PRICE_MIN} max={PRICE_MAX} step={PRICE_STEP} onValueChange={handleChange} />
      <div className="flex items-center justify-between mt-3 text-sm">
        <span className="font-medium">{formatINR(live[0])}</span>
        <span className="font-medium">
          {formatINR(live[1])}{live[1] >= PRICE_MAX ? '+' : ''}
        </span>
      </div>
    </div>
  );
};

const Shop = () => {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const DEFAULT_FILTER_CONFIG = {
    hiddenCategories: [] as string[],
    metals: ['Silver', 'Gold 22K'],
    priceRanges: [
      { label: 'Under ₹500', value: '0-500' },
      { label: '₹500 - ₹1,000', value: '500-1000' },
      { label: '₹1,000 - ₹2,000', value: '1000-2000' },
      { label: 'Above ₹5,000', value: '5000+' },
    ],
  };

  const [filterConfig] = useState(() => {
    try {
      const stored = localStorage.getItem('kv-filter-config');
      return stored ? { ...DEFAULT_FILTER_CONFIG, ...JSON.parse(stored) } : DEFAULT_FILTER_CONFIG;
    } catch {
      return DEFAULT_FILTER_CONFIG;
    }
  });

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState('');
  // Committed slider range (after debounce, inside PriceRangeFilter). null ⇒ no slider filter.
  const [priceFilter, setPriceFilter] = useState<[number, number] | null>(null);
  const [selectedMetals, setSelectedMetals] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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

  // The slider (when active) overrides the preset buckets. Handles at the extremes mean "no cap"
  // on that end, so products below ₹100 / above ₹5,000 stay included.
  const { minPrice, maxPrice } = priceFilter
    ? {
        minPrice: priceFilter[0] > PRICE_MIN ? priceFilter[0] : undefined,
        maxPrice: priceFilter[1] < PRICE_MAX ? priceFilter[1] : undefined,
      }
    : getPriceBounds(selectedPriceRange);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const search = params.get('search') || '';
    const category = params.get('category');
    
    setSearchQuery((prev) => (prev === search ? prev : search));
    
    if (category) {
      setSelectedCategories([category]);
      setSelectedMetals([]);
      setSelectedPriceRange('');
      setPriceFilter(null);
    }
  }, [location.search]);

  const {
    data: productPages,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['products', selectedCategories, selectedSubcategories, selectedTags, selectedPriceRange, priceFilter, selectedMetals, searchQuery, sortBy],
    queryFn: ({ pageParam }) => productService.getProducts({
      category: selectedCategories.length > 0 ? selectedCategories.join(',') : undefined,
      subcategory: selectedSubcategories.length > 0 ? selectedSubcategories.join(',') : undefined,
      tags: selectedTags.length > 0 ? selectedTags.join(',') : undefined,
      metal: selectedMetals.length > 0 ? selectedMetals.join(',') : undefined,
      minPrice,
      maxPrice,
      search: searchQuery || undefined,
      sortBy: sortBy === 'price-low' ? 'price_asc' : sortBy === 'price-high' ? 'price_desc' : 'newest',
      page: pageParam,
      limit: PAGE_SIZE,
    }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      // Stop when the page is empty, partial (last page), or larger than requested (a backend that
      // doesn't paginate yet returned everything — show it once, don't keep refetching).
      if (lastPage.length === 0 || lastPage.length < PAGE_SIZE || lastPage.length > PAGE_SIZE) {
        return undefined;
      }
      // Guard against a non-paginating backend repeating the same full page forever.
      const seenIds = new Set(allPages.slice(0, -1).flat().map((p) => p.id));
      if (lastPage.every((p) => seenIds.has(p.id))) return undefined;
      return allPages.length + 1;
    },
  });

  // Flatten pages and de-duplicate by id (defensive against an unpaginated backend).
  const products = useMemo(() => {
    const seen = new Set<string>();
    const out: Product[] = [];
    (productPages?.pages ?? []).flat().forEach((p) => {
      if (!seen.has(p.id)) {
        seen.add(p.id);
        out.push(p);
      }
    });
    return out;
  }, [productPages]);

  const { data: categoriesData = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: productService.getCategories,
  });

  const { data: tagsData = [] } = useQuery({
    queryKey: ['tags'],
    queryFn: productService.getTags,
  });

  const categories: CategoryNode[] = Array.isArray(categoriesData) ? categoriesData : [];
  const visibleCategories = categories.filter(c => !filterConfig.hiddenCategories.includes(c.name));
  const tags = Array.isArray(tagsData) ? tagsData : [];

  // Auto-load the next page when the sentinel near the bottom scrolls into view.
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el || !hasNextPage) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: '400px' }, // prefetch a bit before the user reaches the end
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const toggleCategory = (category: string) => {
    setSearchQuery(''); // clear search when filtering
    setSelectedCategories(prev =>
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
    // Deselecting a category also drops any of its subcategories that are still selected.
    const subs = categories.find(c => c.name === category)?.subcategories ?? [];
    if (subs.length) {
      setSelectedSubcategories(prev => prev.filter(s => !subs.includes(s)));
    }
  };

  const toggleSubcategory = (subcategory: string) => {
    setSearchQuery('');
    setSelectedSubcategories(prev =>
      prev.includes(subcategory) ? prev.filter(s => s !== subcategory) : [...prev, subcategory]
    );
  };

  const toggleTag = (tag: string) => {
    setSearchQuery('');
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const togglePriceRange = (range: string) => {
    setSearchQuery('');
    setPriceFilter(null); // preset overrides any custom slider range
    setSelectedPriceRange(prev => prev === range ? '' : range);
  };

  const handlePriceCommit = (value: [number, number] | null) => {
    setSearchQuery('');
    setSelectedPriceRange(''); // custom range overrides preset buckets
    setPriceFilter(value);
  };

  const toggleMetal = (metal: string) => {
    setSearchQuery(''); // clear search when filtering
    setSelectedMetals(prev =>
      prev.includes(metal) ? prev.filter(m => m !== metal) : [...prev, metal]
    );
  };

  const handleSearchChange = (value: string) => {
    // clear all filters when typing a search
    setSelectedCategories([]);
    setSelectedSubcategories([]);
    setSelectedTags([]);
    setSelectedPriceRange('');
    setPriceFilter(null);
    setSelectedMetals([]);
    setSearchQuery(value);
  };

  const FilterSidebar = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="font-serif text-lg font-semibold mb-4">Categories</h3>
        <div className="space-y-3">
          {visibleCategories.map((category) => (
            <div key={category.name}>
              <label className="flex items-center justify-between cursor-pointer group">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={selectedCategories.includes(category.name)}
                    onCheckedChange={() => toggleCategory(category.name)}
                  />
                  <span className="text-sm group-hover:text-primary transition-colors">
                    {category.name}
                  </span>
                </div>
              </label>
              {category.subcategories.length > 0 && (
                <div className="mt-2 ml-6 space-y-2">
                  {category.subcategories.map((sub) => (
                    <label key={sub} className="flex items-center gap-3 cursor-pointer group">
                      <Checkbox
                        checked={selectedSubcategories.includes(sub)}
                        onCheckedChange={() => toggleSubcategory(sub)}
                      />
                      <span className="text-sm text-muted-foreground group-hover:text-primary transition-colors">
                        {sub}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-serif text-lg font-semibold mb-4">Price Range</h3>

        {/* Custom slider — self-contained so dragging doesn't re-render the page */}
        <PriceRangeFilter value={priceFilter} onChange={handlePriceCommit} />

        <p className="text-xs text-muted-foreground mb-3">Or pick a range</p>
        <RadioGroup
          value={selectedPriceRange}
          onValueChange={(val) => {
            setSearchQuery('');
            setSelectedPriceRange(val === selectedPriceRange ? '' : val);
          }}
          className="space-y-3"
        >
          {filterConfig.priceRanges.map((range) => (
            <label
              key={range.value}
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => {
                if (selectedPriceRange === range.value) {
                  setSearchQuery('');
                  setSelectedPriceRange('');
                }
              }}
            >
              <RadioGroupItem value={range.value} id={`price-${range.value}`} />
              <span className="text-sm group-hover:text-primary transition-colors">
                {range.label}
              </span>
            </label>
          ))}
        </RadioGroup>
      </div>

      {/* Metal */}
      <div>
        <h3 className="font-serif text-lg font-semibold mb-4">Metal</h3>
        <div className="space-y-3">
          {filterConfig.metals.map((metal) => (
            <label key={metal} className="flex items-center gap-3 cursor-pointer group">
              <Checkbox
                checked={selectedMetals.includes(metal)}
                onCheckedChange={() => toggleMetal(metal)}
              />
              <span className="text-sm group-hover:text-primary transition-colors">
                {metal}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div>
          <h3 className="font-serif text-lg font-semibold mb-4">Tags</h3>
          <div className="space-y-3">
            {tags.map((tag) => (
              <label key={tag} className="flex items-center gap-3 cursor-pointer group">
                <Checkbox
                  checked={selectedTags.includes(tag)}
                  onCheckedChange={() => toggleTag(tag)}
                />
                <span className="text-sm group-hover:text-primary transition-colors">
                  {tag}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Clear Filters */}
      <Button
        variant="outline"
        className="w-full"
        onClick={() => {
          setSelectedCategories([]);
          setSelectedSubcategories([]);
          setSelectedTags([]);
          setSelectedPriceRange('');
          setPriceFilter(null);
          setSelectedMetals([]);
          setSearchQuery('');
        }}
      >
        Clear All Filters
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen pt-24 pb-16">
      <Seo
        title="Shop Silver"
        description="Browse our full silver collection — necklaces, rings, coins and more. Filter by category, metal and price at KV Silver Zone."
      />
      {/* Header */}
      <div className="relative bg-secondary/40 border-b border-border py-14 overflow-hidden">
        <div className="rule-metallic absolute bottom-0 inset-x-0" />
        <div className="container mx-auto px-4">
          <span className="eyebrow mb-3 block">The Collection</span>
          <h1 className="font-serif text-4xl md:text-5xl font-medium text-primary mb-2">
            Shop Silver
          </h1>
          <p className="text-muted-foreground font-light">
            Explore our exquisite collection of handcrafted silver jewellery
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
                  onChange={(e) => handleSearchChange(e.target.value)}
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
              Showing {products.length} product{products.length !== 1 ? 's' : ''}{hasNextPage ? '+' : ''}
            </p>

            {/* Products Grid */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
                <p className="text-muted-foreground animate-pulse">Loading products...</p>
              </div>
            ) : products.length > 0 ? (
              <>
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

                {/* Infinite-scroll sentinel + loading indicator */}
                {hasNextPage && (
                  <div ref={loadMoreRef} className="flex justify-center py-10">
                    {isFetchingNextPage && <Loader2 className="h-6 w-6 text-primary animate-spin" />}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <p className="text-muted-foreground">No products found matching your criteria.</p>
                <Button
                  variant="link"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategories([]);
                    setSelectedPriceRange('');
                    setPriceFilter(null);
                    setSelectedMetals([]);
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
