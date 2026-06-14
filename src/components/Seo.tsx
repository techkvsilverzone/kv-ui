import { Helmet } from 'react-helmet-async';

interface SeoProps {
  title: string;
  description?: string;
  /** Absolute or site-relative image for social cards. */
  image?: string;
  /** og:type — 'website' (default) or 'product' for PDPs. */
  type?: 'website' | 'product';
  /** Set on pages that should not be indexed (auth, checkout, account). */
  noindex?: boolean;
}

const SITE_NAME = 'KV Silver Zone';
const DEFAULT_DESCRIPTION =
  'Premium BIS-hallmarked silver jewellery, coins and gifts. Live silver rates, savings schemes and insured delivery across India.';

/**
 * Per-route document head (title, description, Open Graph, Twitter, canonical).
 * Wrap the app in <HelmetProvider> (done in App.tsx) and drop <Seo .../> at the top of each page.
 */
const Seo = ({ title, description, image, type = 'website', noindex = false }: SeoProps) => {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const desc = description ?? DEFAULT_DESCRIPTION;
  const url = typeof window !== 'undefined' ? window.location.href : undefined;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {url && <link rel="canonical" href={url} />}

      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:type" content={type} />
      {url && <meta property="og:url" content={url} />}
      {image && <meta property="og:image" content={image} />}

      <meta name="twitter:card" content={image ? 'summary_large_image' : 'summary'} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      {image && <meta name="twitter:image" content={image} />}
    </Helmet>
  );
};

export default Seo;
