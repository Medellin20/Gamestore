import './globals.css';
import { ToastProvider } from '@/components/ui/Toast';
import { CartProvider } from '@/components/CartProvider';
import { SITE_URL } from '@/utils/format';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'GameStore — iPhone, PS5, consoles et accessoires', template: '%s | GameStore' },
  description: 'Achetez iPhone, PlayStation 5, consoles, manettes et accessoires gaming. Neuf et reconditionné, stock réel, livraison rapide.',
  openGraph: { type: 'website', siteName: 'GameStore', locale: 'fr_FR' },
};
export const viewport = { themeColor: '#0a0a12' };

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>
        <ToastProvider>
          <CartProvider>{children}</CartProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
