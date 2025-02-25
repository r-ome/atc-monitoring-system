import { useCallback, useState, useMemo, useEffect } from "react";
import { Outlet, useOutletContext, Link } from "react-router-dom";
import { Breadcrumb, Card, notification, Typography } from "antd";
import moment from "moment";

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
  const [currentTime, setCurrentTime] = useState(moment().format("HH:mm:ss a"));

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(moment().format("hh : mm : ss a"));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

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
    const breadcrumbTitle = (
      <Typography.Title
        level={5}
        className={`${
          !isLast ? "hover:text-blue-500 hover:bg-transparent" : ""
        }`}
      >
        {currentRoute.title}
      </Typography.Title>
    );

    return isLast ? (
      breadcrumbTitle
    ) : (
      <Link to={`/${paths.join("/")}`}>{breadcrumbTitle}</Link>
    );
  };

  return (
    <div>
      {contextHolder}

      <Card>
        <div className="flex justify-between">
          <div>
            <Typography.Title className="font-bold" level={1}>
              {title}
            </Typography.Title>
            <Breadcrumb
              itemRender={renderBreadcrumbs}
              items={pageBreadcrumbs}
            />
          </div>

          <div className="flex flex-col items-end justify-center text-3xl">
            <div>{moment().format("dddd, MMMM DD, YYYY").toLocaleString()}</div>
            <div>{currentTime}</div>
          </div>
        </div>
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
