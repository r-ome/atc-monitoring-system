import { useCallback, useState, useMemo } from "react";
import { Outlet, useOutletContext, Link } from "react-router-dom";
import { Breadcrumb, Card, notification } from "antd";

interface PageLayoutProps {
  title: string;
}

const PageLayout: React.FC<PageLayoutProps> = ({ title }) => {
  const [api, contextHolder] = notification.useNotification();

  return (
    <div>
      <div className="mt-2">
        <Outlet />
      </div>
    </div>
  );
};

export default PageLayout;
