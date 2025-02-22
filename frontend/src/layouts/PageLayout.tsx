import { useCallback, useState, useMemo } from "react";
import { Outlet, useOutletContext, Link } from "react-router-dom";
import { Breadcrumb, Card, notification } from "antd";

export type BreadcrumbsType = {
  title: string;
  path?: string;
  key?: string | number;
  level?: number;
};

type NotificationType = "success" | "info" | "warning" | "error";

export type PageLayoutPropsContextType = {
  pageBreadcrumbs: BreadcrumbsType[];
  setPageBreadCrumbs: React.Dispatch<React.SetStateAction<BreadcrumbsType[]>>;
  openNotification: (
    description: string,
    type?: NotificationType,
    message?: string
  ) => void;
};

interface PageLayoutProps {
  title: string;
  breadcrumbs: BreadcrumbsType[];
}

const PageLayout: React.FC<PageLayoutProps> = ({ title, breadcrumbs }) => {
  const [api, contextHolder] = notification.useNotification();
  const memoizedBreadcrumbs = useMemo(() => breadcrumbs, [breadcrumbs]);
  const [pageBreadcrumbs, setPageBreadCrumbs] =
    useState<BreadcrumbsType[]>(memoizedBreadcrumbs);

  const openNotification = useCallback(
    (
      description: string,
      type: NotificationType = "success",
      message: string = "Success!"
    ) =>
      api[type]({
        message,
        description,
        placement: "topRight",
      }),
    [api]
  );

  const contextValue = useMemo(
    () => ({
      pageBreadcrumbs,
      setPageBreadCrumbs,
      openNotification,
    }),
    [pageBreadcrumbs, openNotification, setPageBreadCrumbs]
  );

  const renderBreadcrumbs = (
    currentRoute: any,
    params: any,
    items: any,
    paths: any
  ) => {
    const isLast = currentRoute?.path === items[items.length - 1]?.path;

    return isLast ? (
      <span>{currentRoute.title}</span>
    ) : (
      <Link to={`/${paths.join("/")}`}>{currentRoute.title}</Link>
    );
  };

  return (
    <div>
      {contextHolder}
      <Card>
        <h1 className="text-3xl mb-2 font-bold">{title}</h1>
        <Breadcrumb itemRender={renderBreadcrumbs} items={pageBreadcrumbs} />
      </Card>

      <div className="mt-2">
        <Outlet context={contextValue} />
      </div>
    </div>
  );
};

export const usePageLayoutProps = (): PageLayoutPropsContextType => {
  return useOutletContext<PageLayoutPropsContextType>();
};

export default PageLayout;
