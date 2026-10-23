import Image from 'next/image';

const PLACEHOLDER_IMAGES = [
  { match: /iphone|smartphone|téléphone|telephone|mobile|samsung/i, src: '/placeholders/phone.svg' },
  { match: /ps5|playstation/i, src: '/placeholders/console.svg' },
  { match: /xbox|nintendo|switch|console/i, src: '/placeholders/console.svg' },
  { match: /manette|controller|gaming|jeu/i, src: '/placeholders/controller.svg' },
  { match: /casque|écouteur|ecouteur|audio/i, src: '/placeholders/headphones.svg' },
];
const DEFAULT_PLACEHOLDER = '/placeholders/accessory.svg';

export default function ProductImage({ src, alt, sizes = '(max-width:768px) 50vw, 25vw', priority = false, className = '' }) {
  const placeholder = PLACEHOLDER_IMAGES.find(({ match }) => match.test(alt || ''))?.src || DEFAULT_PLACEHOLDER;
  return <Image src={src || placeholder} alt={alt} fill sizes={sizes} priority={priority} className={`object-cover ${className}`} />;
}
