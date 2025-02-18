import { useEffect } from "react";
import moment from "moment";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { RHFInput, RHFSelect, RHFDatePicker, RHFRadioGroup } from "@components";
import { useBranches, useContainers } from "@context";
import { CreateContainerPayload } from "@types";
import RenderServerError from "../ServerCrashComponent";
import { Button, Card, Spin, Typography } from "antd";
import { usePageLayoutProps, BreadcrumbsType } from "@layouts/PageLayout";
import { useSession } from "app/hooks";

const CreateContainer = () => {
  const navigate = useNavigate();
  const params = useParams();
  const methods = useForm<CreateContainerPayload>();
  const { pageBreadcrumbs, setPageBreadCrumbs, openNotification } =
    usePageLayoutProps();
  const [breadcrumbsSession, setBreadcrumbsSession] = useSession<
    BreadcrumbsType[]
  >("breadcrumbs", pageBreadcrumbs);
  const {
    container: SuccessResponse,
    isLoading,
    createContainer,
    error: ContainerErrorResponse,
  } = useContainers();
  const {
    branches,
    isLoading: isFetchingBranches,
    fetchBranches,
  } = useBranches();

  useEffect(() => {
    if (!breadcrumbsSession) return;
    if (breadcrumbsSession) {
      setPageBreadCrumbs(breadcrumbsSession);
    }
  }, [breadcrumbsSession, setPageBreadCrumbs]);

  useEffect(() => {
    setPageBreadCrumbs((prevBreadcrumbs) => {
      const newBreadcrumb = {
        title: "Create Container",
        path: `containers/create`,
      };

      const doesExist = prevBreadcrumbs.find(
        (item) => item.title === newBreadcrumb.title
      );
      if (doesExist) {
        return prevBreadcrumbs;
      }

      const updatedBreadcrumbs = [...prevBreadcrumbs, newBreadcrumb];
      setBreadcrumbsSession(updatedBreadcrumbs);
      return updatedBreadcrumbs;
    });
  }, [pageBreadcrumbs, setPageBreadCrumbs, setBreadcrumbsSession]);

  useEffect(() => {
    const fetchInitialData = async () => {
      await fetchBranches();
    };
    fetchInitialData();
  }, [fetchBranches]);

  useEffect(() => {
    if (ContainerErrorResponse) {
      openNotification("Please double check your inputs", "error", "Error");
    }

    if (!ContainerErrorResponse && !isLoading && SuccessResponse) {
      methods.reset();
      openNotification("Successfully Added Container");
      navigate(
        `/suppliers/${SuccessResponse.supplier.id}/containers/${SuccessResponse.container_id}`
      );
    }
  }, [
    ContainerErrorResponse,
    isLoading,
    methods,
    SuccessResponse,
    navigate,
    openNotification,
  ]);

  const formatDate = (date: string) =>
    moment(new Date(date)).format("YYYY-MM-DD HH:mm:ss");

  const handleSubmitCreateContainer = methods.handleSubmit(async (data) => {
    const { supplier_id: supplierId } = params;
    if (supplierId) {
      const body = Object.assign({}, data);
      for (let [key, value] of Object.entries(data)) {
        if (
          key.includes("date") ||
          key.includes("telegraphic") ||
          key.includes("eta_to_ph")
        ) {
          /* @ts-ignore */
          body[key] = formatDate(value);
        }
      }

      await createContainer(supplierId, body);
    }
  });

  if (ContainerErrorResponse?.httpStatus === 500) {
    return <RenderServerError {...ContainerErrorResponse} />;
  }

  return (
    <>
      <Card
        className="py-4"
        title={<h1 className="text-3xl">Create Container</h1>}
      >
        <form id="create_container" className="flex flex-col gap-4 w-full">
          <div className="flex">
            <div className="flex gap-4 w-full">
              <div className="w-1/2 flex flex-col gap-2">
                <div className="flex gap-2">
                  <div className="w-4/6">
                    <Typography.Title level={5}>Branches:</Typography.Title>
                    <Spin spinning={isFetchingBranches}>
                      <RHFSelect
                        showSearch
                        control={methods.control}
                        name="branch_id"
                        placeholder="Select a Branch"
                        filterOption={(input: string, option: any) =>
                          (option?.label ?? "")
                            .toLowerCase()
                            .includes(input.toLowerCase())
                        }
                        options={branches.map((branch) => ({
                          label: branch.name,
                          value: branch.branch_id,
                        }))}
                        rules={{ required: "This field is required!" }}
                      />
                    </Spin>
                  </div>

                  <div className="w-2/6">
                    <Typography.Title level={5}>
                      Container Number:
                    </Typography.Title>
                    <RHFInput
                      control={methods.control}
                      name="container_num"
                      disabled={isLoading}
                      placeholder="Container Number:"
                      type="number"
                      rules={{
                        required: "Container Number is required!",
                        pattern: {
                          value: /^[0-9]+$/,
                          message: "Invalid characters!",
                        },
                      }}
                    />
                  </div>
                </div>

                <div>
                  <Typography.Title level={5}>
                    Bill of Lading Number:
                  </Typography.Title>
                  <RHFInput
                    control={methods.control}
                    name="bill_of_lading_number"
                    disabled={isLoading}
                    placeholder="Bill of Lading Number:"
                    rules={{ required: "This field is required!" }}
                  />
                </div>

                <div>
                  <Typography.Title level={5}>
                    Port of Landing:
                  </Typography.Title>
                  <RHFInput
                    control={methods.control}
                    name="port_of_landing"
                    disabled={isLoading}
                    placeholder="Port of Landing:"
                    rules={{ required: "This field is required!" }}
                  />
                </div>

                <div>
                  <Typography.Title level={5}>Carrier:</Typography.Title>
                  <RHFInput
                    control={methods.control}
                    name="carrier"
                    disabled={isLoading}
                    placeholder="Carrier:"
                    rules={{ required: "This field is required!" }}
                  />
                </div>

                <div>
                  <Typography.Title level={5}>Vessel:</Typography.Title>
                  <RHFInput
                    control={methods.control}
                    name="vessel"
                    disabled={isLoading}
                    placeholder="Vessel:"
                    rules={{ required: "This field is required!" }}
                  />
                </div>

                <div>
                  <Typography.Title level={5}>Invoice Number:</Typography.Title>
                  <RHFInput
                    control={methods.control}
                    name="invoice_num"
                    disabled={isLoading}
                    placeholder="Invoice Number:"
                    rules={{ required: "This field is required!" }}
                  />
                </div>

                <div>
                  <Typography.Title level={5}>Gross Weight:</Typography.Title>
                  <RHFInput
                    control={methods.control}
                    name="gross_weight"
                    disabled={isLoading}
                    placeholder="Gross Weight:"
                    rules={{ required: "This field is required!" }}
                  />
                </div>

                <div>
                  <Typography.Title level={5}>
                    Auction Or Sell:
                  </Typography.Title>
                  <RHFRadioGroup
                    control={methods.control}
                    name="auction_or_sell"
                    disabled={isLoading}
                    options={[
                      { value: "SELL", label: "SELL" },
                      { value: "AUCTION", label: "AUCTION" },
                    ]}
                    rules={{ required: "This field is required!" }}
                  ></RHFRadioGroup>
                </div>
              </div>

              <div className="w-1/2 flex flex-col gap-2">
                <div>
                  <Typography.Title level={5}>
                    Departure Date from Japan:
                  </Typography.Title>
                  <RHFDatePicker
                    control={methods.control}
                    name="departure_date_from_japan"
                    disabled={isLoading}
                    placeholder="Departure Date from Japan:"
                    rules={{ required: "This field is required!" }}
                  />
                </div>

                <div>
                  <Typography.Title level={5}>ETA to PH:</Typography.Title>
                  <RHFDatePicker
                    control={methods.control}
                    name="eta_to_ph"
                    disabled={isLoading}
                    placeholder="ETA to PH:"
                    rules={{ required: "This field is required!" }}
                  />
                </div>

                <div>
                  <Typography.Title level={5}>
                    Arrival Date in PH Warehouse:
                  </Typography.Title>
                  <RHFDatePicker
                    control={methods.control}
                    name="arrival_date_warehouse_ph"
                    disabled={isLoading}
                    placeholder="Arrival Date in PH Warehouse:"
                    rules={{ required: "This field is required!" }}
                  />
                </div>

                <div>
                  <Typography.Title level={5}>Sorting Date:</Typography.Title>
                  <RHFDatePicker
                    control={methods.control}
                    name="sorting_date"
                    disabled={isLoading}
                    placeholder="Sorting Date:"
                    rules={{ required: "This field is required!" }}
                  />
                </div>

                <div>
                  <Typography.Title level={5}>Auction Date:</Typography.Title>
                  <RHFDatePicker
                    control={methods.control}
                    name="auction_date"
                    disabled={isLoading}
                    placeholder="Auction Date:"
                    rules={{ required: "This field is required!" }}
                  />
                </div>

                <div>
                  <Typography.Title level={5}>Payment Date:</Typography.Title>
                  <RHFDatePicker
                    control={methods.control}
                    name="payment_date"
                    disabled={isLoading}
                    placeholder="Payment Date:"
                    rules={{ required: "This field is required!" }}
                  />
                </div>

                <div>
                  <Typography.Title level={5}>Vanning Date:</Typography.Title>
                  <RHFDatePicker
                    control={methods.control}
                    name="vanning_date"
                    disabled={isLoading}
                    placeholder="Vanning Date:"
                    rules={{ required: "This field is required!" }}
                  />
                </div>

                <div>
                  <Typography.Title level={5}>Devanning Date:</Typography.Title>
                  <RHFDatePicker
                    control={methods.control}
                    name="devanning_date"
                    disabled={isLoading}
                    placeholder="Devanning Date:"
                    rules={{ required: "This field is required!" }}
                  />
                </div>

                <div>
                  <Typography.Title level={5}>
                    Telegraphic transferred:
                  </Typography.Title>
                  <RHFDatePicker
                    control={methods.control}
                    name="telegraphic_transferred"
                    disabled={isLoading}
                    placeholder="Telegraphic transferred:"
                    rules={{ required: "This field is required!" }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex  gap-2 w-full justify-end">
            <Button
              onClick={() => navigate(`/suppliers/${params.supplier_id}`)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitCreateContainer}
              type="primary"
              loading={isLoading}
            >
              Save
            </Button>
          </div>
        </form>
      </Card>
    </>
  );
};

export default CreateContainer;
