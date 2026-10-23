import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getCategories, getSettings } from '@/services/products';

export const dynamic = 'force-dynamic';

export default async function ShopLayout({ children }) {
  const [settings, categories] = await Promise.all([getSettings(), getCategories()]);
  return (
    <>
      <Header storeName={settings.store_name} announcement={settings.announcement} categories={categories} />
      <main className="min-h-[60vh]">{children}</main>
      <Footer settings={settings} categories={categories} />
    </>
  );
}
