import { Suspense } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { AccountLink } from "@/components/account-link";

const DESKTOP_LINK_CLASS =
  "border-r border-white/15 pr-4 font-display text-sm font-bold uppercase tracking-wide text-white no-underline opacity-90 hover:opacity-100 hover:text-liciba-amber";
const MOBILE_LINK_CLASS =
  "mt-3.5 border-t border-white/8 pt-3.5 font-mono text-sm font-semibold text-[#C9D1CC] no-underline";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader
        desktopAccountLink={
          <Suspense fallback={<span className={DESKTOP_LINK_CLASS}>Iniciar sesión</span>}>
            <AccountLink className={DESKTOP_LINK_CLASS} />
          </Suspense>
        }
        mobileAccountLink={
          <Suspense fallback={<span className={MOBILE_LINK_CLASS}>Iniciar sesión</span>}>
            <AccountLink className={MOBILE_LINK_CLASS} />
          </Suspense>
        }
      />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </>
  );
}
