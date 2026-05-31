import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CheckoutClient from "./CheckoutClient";
import styles from "./checkout.module.css";
import { getPerPaxPrice, getTotalPackagePrice } from "@/lib/pricing";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Checkout — Trekking Mount Rinjani",
};

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const user = await getUser();

  const unresolvedSearchParams = await searchParams;
  const package_id = unresolvedSearchParams.package_id;
  const date = unresolvedSearchParams.date;
  const pax = Number(unresolvedSearchParams.pax) || 1;
  const price_type = unresolvedSearchParams.price_type || "standard";
  const price_mode = unresolvedSearchParams.price_mode || "per_pax";
  const total_days = Number(unresolvedSearchParams.total_days) || 2;

  const qs = new URLSearchParams(unresolvedSearchParams as Record<string, string>).toString();
  const currentUrl = `/checkout?${qs}`;

  if (!user) {
    redirect(`/login?callbackUrl=${encodeURIComponent(currentUrl)}`);
  }

  let pkgData = null;
  let summaryPrice = 0;

  if (package_id) {
    const pkg = await prisma.package.findUnique({ where: { id: package_id } });
    if (pkg) {
      pkgData = pkg;
      if (price_mode === "total_package") {
        const selectedTotalPrice = getTotalPackagePrice(pkg as any, price_type as any, total_days as any);
        summaryPrice = (selectedTotalPrice || 0) * pax;
      } else {
        const perPaxPrice = getPerPaxPrice(pkg as any, price_type as any, pax);
        summaryPrice = (perPaxPrice || 0) * pax;
      }
    }
  }

  if (!pkgData) {
    return (
      <><Navbar /><main className={styles.page}><div className="container"><h1 className={styles.title}>Error</h1><p>Invalid package or session expired.</p></div></main><Footer /></>
    );
  }

  return (
    <><Navbar /><main className={styles.page}><div className="container">
      <h1 className={styles.title}>Secure Checkout</h1>
      <p className={styles.subtitle}>Please complete your booking details below.</p>
      <CheckoutClient 
        packageId={pkgData.id} 
        packageTitle={pkgData.title} 
        date={date || ""} 
        pax={pax} 
        priceType={price_type} 
        priceMode={price_mode} 
        totalDays={total_days} 
        totalPrice={summaryPrice} 
        userEmail={user.email} 
        userRole={user.role} 
        isDirectPromo={pkgData.is_direct_promo}
        packagePromoCode={pkgData.promo_code}
        discountPercentage={pkgData.discount_percentage}
        discountAmount={pkgData.discount_amount}
      />
    </div></main><Footer /></>
  );
}
