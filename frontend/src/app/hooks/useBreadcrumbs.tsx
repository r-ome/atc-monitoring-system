import { useCallback, useEffect, useState } from "react";
import { usePageLayoutProps, BreadcrumbsType } from "@layouts";
import useSession from "./useSession";

const useBreadcrumbs = () => {
  const { pageBreadcrumbs, setPageBreadCrumbs } = usePageLayoutProps();
  const [breadcrumbsSession, setBreadcrumbsSession] = useSession<
    BreadcrumbsType[]
  >("breadcrumbs", pageBreadcrumbs);

  const [queuedBreadcrumb, setQueuedBreadcrumb] =
    useState<BreadcrumbsType | null>(null);

  useEffect(() => {
    if (breadcrumbsSession) {
      setPageBreadCrumbs(breadcrumbsSession);
    }
  }, [breadcrumbsSession, setPageBreadCrumbs]);

  const setBreadcrumb = useCallback((breadcrumbItem: BreadcrumbsType) => {
    setQueuedBreadcrumb(breadcrumbItem);
  }, []);

  useEffect(() => {
    if (!queuedBreadcrumb) return;

    setPageBreadCrumbs((prevBreadcrumbs) => {
      const filteredBreadcrumbs = prevBreadcrumbs.filter(
        (item) => item.level! < queuedBreadcrumb.level!
      );
      return [...filteredBreadcrumbs, queuedBreadcrumb];
    });

    setBreadcrumbsSession((prevBreadcrumbs) => {
      const filteredBreadcrumbs = prevBreadcrumbs.filter(
        (item) => item.level! < queuedBreadcrumb.level!
      );
      return [...filteredBreadcrumbs, queuedBreadcrumb];
    });

    setQueuedBreadcrumb(null);
  }, [queuedBreadcrumb, setPageBreadCrumbs, setBreadcrumbsSession]);

  return { setBreadcrumb };
};

export default useBreadcrumbs;
