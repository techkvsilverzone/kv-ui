import { useEffect, useState } from 'react';
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { cn } from '@/lib/utils';

interface ProductImageCarouselProps {
  images: string[];
  alt: string;
  /** Tailwind classes applied to each <img>. Should set the size/aspect (e.g. "w-full aspect-square object-cover"). */
  imageClassName?: string;
  /** When true, arrows/dots are always visible instead of only on hover (e.g. on the detail page). */
  alwaysShowControls?: boolean;
}

/** Stops a control click from triggering a surrounding <Link> navigation. */
const stopNav = (e: React.MouseEvent) => {
  e.preventDefault();
  e.stopPropagation();
};

const handleImgError = (e: React.SyntheticEvent<HTMLImageElement>) => {
  (e.currentTarget as HTMLImageElement).src = '/placeholder.svg';
};

/**
 * Sliding product image gallery (Amazon/Flipkart style): swipeable, with hover arrows and dot
 * indicators. Falls back to a plain <img> when there is only one image. Safe to nest inside a
 * <Link> — control clicks don't navigate.
 */
const ProductImageCarousel = ({ images, alt, imageClassName, alwaysShowControls }: ProductImageCarouselProps) => {
  const [api, setApi] = useState<CarouselApi>();
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    if (!api) return;
    const onSelect = () => setSelected(api.selectedScrollSnap());
    onSelect();
    api.on('select', onSelect);
    return () => {
      api.off('select', onSelect);
    };
  }, [api]);

  if (images.length <= 1) {
    return <img src={images[0] || '/placeholder.svg'} alt={alt} className={imageClassName} onError={handleImgError} />;
  }

  const controlVisibility = alwaysShowControls ? 'opacity-100' : 'opacity-0 group-hover:opacity-100';

  return (
    <Carousel setApi={setApi} opts={{ loop: true }} className="w-full">
      <CarouselContent className="ml-0">
        {images.map((src, i) => (
          <CarouselItem key={i} className="pl-0">
            <img src={src} alt={`${alt} — image ${i + 1}`} className={imageClassName} onError={handleImgError} />
          </CarouselItem>
        ))}
      </CarouselContent>

      <CarouselPrevious
        onClickCapture={stopNav}
        className={cn('left-2 h-7 w-7 border-none bg-white/80 text-black hover:bg-white transition-opacity z-20', controlVisibility)}
      />
      <CarouselNext
        onClickCapture={stopNav}
        className={cn('right-2 h-7 w-7 border-none bg-white/80 text-black hover:bg-white transition-opacity z-20', controlVisibility)}
      />

      {/* Dot indicators */}
      <div
        className={cn(
          'absolute bottom-2 inset-x-0 flex justify-center gap-1.5 z-20',
          alwaysShowControls ? '' : 'group-hover:opacity-0 transition-opacity',
        )}
      >
        {images.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Go to image ${i + 1}`}
            onClickCapture={(e) => {
              stopNav(e);
              api?.scrollTo(i);
            }}
            className={cn('h-1.5 rounded-full transition-all', selected === i ? 'w-4 bg-white' : 'w-1.5 bg-white/60')}
          />
        ))}
      </div>
    </Carousel>
  );
};

export default ProductImageCarousel;
