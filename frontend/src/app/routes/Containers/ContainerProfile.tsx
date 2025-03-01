import { useEffect } from "react";
import moment from "moment";
import { useParams } from "react-router-dom";
import { useContainers } from "@context";
import { usePageLayoutProps } from "@layouts/PageLayout";
import { Button, Card, Skeleton, Statistic, Tabs } from "antd";
import { useBreadcrumbs } from "app/hooks";
import {
  BuildOutlined,
  CalendarOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import InventoriesTable from "./InventoriesTable";
import ContainerDescriptions from "./ContainerDescriptions";

const ContainerProfile = () => {
  const params = useParams();
  const {
    container,
    fetchContainer,
    isLoading: isFetchingContainers,
    error: ContainerErrorResponse,
  } = useContainers();
  const { setBreadcrumb } = useBreadcrumbs();
  const { openNotification } = usePageLayoutProps();

  useEffect(() => {
    if (container) {
      setBreadcrumb({
        title: `${container.barcode}'s Profile`,
        path: `/${container.container_id}`,
        level: 2,
      });
    }
  }, [container, setBreadcrumb]);

  useEffect(() => {
    const { container_id: containerId } = params;
    if (containerId) {
      const fetchInitialData = async () => {
        await fetchContainer(containerId);
      };
      fetchInitialData();
    }
  }, [params, fetchContainer]);

  useEffect(() => {
    if (!isFetchingContainers) {
      if (ContainerErrorResponse) {
        if (ContainerErrorResponse.httpStatus === 500) {
          openNotification(
            "There might be problems in the server. Please contact your admin.",
            "error",
            "Server Error"
          );
        }
      }
    }
  }, [ContainerErrorResponse, isFetchingContainers, openNotification]);

  if (!container) return <Skeleton />;

  return (
    <>
      <div className="h-full">
        <div className="flex flex-col gap-2">
          <div className="flex w-full gap-2">
            {[
              {
                title: "Container",
                value: container.barcode,
                prefix: <BuildOutlined />,
                action: (
                  <div className="w-1/6 flex justify-end">
                    <Button
                      type="primary"
                      // onClick={() => setOpenEditModal(true)}
                    >
                      Edit Container
                    </Button>
                  </div>
                ),
              },
              {
                title: "Total Unsold or Rebid Items",
                value: `${container.unsold_items} UNSOLD or REBID item(s)`,
                prefix: <ShoppingCartOutlined />,
                action: (
                  <div className="w-1/6 flex justify-end">
                    <Button
                      type="primary"
                      // onClick={() => setOpenEditModal(true)}
                    >
                      Print
                    </Button>
                  </div>
                ),
              },
              {
                title: "Total Inventories",
                value: `${container.num_of_items} items`,
                prefix: <ShoppingCartOutlined />,
              },
              {
                title: "Date Created",
                value: moment(new Date(container.created_at)).format(
                  "MMMM DD, YYYY"
                ),
                prefix: <CalendarOutlined />,
              },
            ].map((item, i) => (
              <Card
                key={i}
                variant="borderless"
                className="flex-1"
                title={
                  <>
                    {item.prefix} {item.title}
                  </>
                }
                extra={<div className="flex justify-end">{item.action}</div>}
              >
                <div className="flex">
                  <div className="w-full">
                    <Statistic
                      className="flex justify-center"
                      value={item.value}
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
          <Card>
            <Tabs
              defaultActiveKey="1"
              items={[
                {
                  key: "1",
                  label: "Inventories",
                  children: <InventoriesTable />,
                },
                {
                  key: "2",
                  label: "Container Information",
                  children: <ContainerDescriptions container={container} />,
                },
              ]}
              tabPosition="left"
            />
          </Card>
        </div>
      </div>
    </>
  );
};

export default ContainerProfile;
