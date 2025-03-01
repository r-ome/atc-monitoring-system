import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuction } from "@context";
import { usePageLayoutProps, BreadcrumbsType } from "@layouts";
import { Button, Card, Table, Upload, UploadFile } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { AUCTIONS_401, AUCTIONS_501 } from "../errors";
import { useSession } from "app/hooks";

const EncodePage = () => {
  const params = useParams();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const { pageBreadcrumbs, setPageBreadCrumbs, openNotification } =
    usePageLayoutProps();
  const {
    manifestRecord: SuccessResponse,
    uploadManifest,
    error: ErrorResponse,
    isLoading,
  } = useAuction();
  const [breadcrumbsSession] = useSession<BreadcrumbsType[]>(
    "breadcrumbs",
    pageBreadcrumbs
  );

  useEffect(() => {
    if (!breadcrumbsSession) return;
    setPageBreadCrumbs([
      ...breadcrumbsSession,
      { title: "Encode Page", path: "/encode" },
    ]);
  }, [setPageBreadCrumbs, breadcrumbsSession]);

  useEffect(() => {
    if (ErrorResponse) {
      if (ErrorResponse.error === AUCTIONS_401) {
        openNotification("Please check your file!", "error", "Error");
      }

      if (ErrorResponse.error === AUCTIONS_501) {
        openNotification("Server Error!", "error", "Server Error");
      }
    }
  }, [ErrorResponse, openNotification]);

  const handleSubmitManifest = async () => {
    const { auction_id: auctionId } = params;
    const formData = new FormData();
    const [file] = fileList;
    formData.append("file", file as any);
    if (auctionId && file) {
      await uploadManifest(auctionId, formData);
    }
    setFileList([]);
  };

  return (
    <>
      <Card
        className="flex flex-col gap-2 w-full h-full"
        title={
          <div className="flex justify-center items-center p-2">
            <div>
              <h1 className="text-2xl">Encode Manifests</h1>
            </div>
            <a
              href="/MANIFEST.xlsx"
              download="MANIFEST.xlsx"
              className="text-blue-400 pt-1 pl-4 text-sm"
            >
              (Download Manifest Here)
            </a>
          </div>
        }
      >
        <div className="flex flex-col w-full">
          <form id="upload_manifest" className="w-2/5 flex flex-col gap-4">
            <Card>
              <Upload
                accept="application/x-iwork-numbers-sffnumbers,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                onRemove={() => setFileList([])}
                beforeUpload={(file) => {
                  setFileList([file]);
                  return false;
                }}
                fileList={fileList}
              >
                <Button icon={<UploadOutlined />}>Select File</Button>
              </Upload>
              <Button
                type="primary"
                className="mt-2"
                size="large"
                onClick={handleSubmitManifest}
                disabled={fileList.length === 0}
                loading={isLoading}
              >
                {isLoading ? "Uploading" : "Start Upload"}
              </Button>
            </Card>
          </form>

          <div className="w-full p-2">
            <div className="text-3xl text-center">
              {SuccessResponse?.message}
            </div>
            <Table
              rowKey={(rowKey) =>
                `${rowKey.barcode}-${rowKey.control}-${rowKey.manifest_number}-${rowKey.bidder_number}-${rowKey.description}`
              }
              dataSource={SuccessResponse?.manifest || []}
              loading={isLoading}
              scroll={{ y: 450 }}
              columns={[
                { title: "BARCODE", dataIndex: "barcode" },
                { title: "CONTROL", dataIndex: "control" },
                { title: "DESCRIPTION", dataIndex: "description" },
                { title: "BIDDER", dataIndex: "bidder_number" },
                { title: "QTY", dataIndex: "qty" },
                { title: "PRICE", dataIndex: "price" },
                { title: "MANIFEST", dataIndex: "manifest_number" },
                {
                  title: "Error Message",
                  dataIndex: "error_messages",
                  width: "20%",
                  filters: [{ text: "Invalid Rows", value: "invalid" }],
                  onFilter: (value, record) => {
                    return value === "invalid" && !!record.error_messages;
                  },
                  render: (text) => (
                    <span className={`${text ? "text-red-500" : ""}`}>
                      {text}
                    </span>
                  ),
                },
              ]}
            />
          </div>
        </div>
      </Card>
    </>
  );
};

export default EncodePage;
