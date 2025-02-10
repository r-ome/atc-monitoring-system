import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Button, Input, Table } from "../../../components";
import { useAuction } from "../../../context";
import { AUCTIONS_401 } from "../errors";

const EncodePage = () => {
  const [fileName, setFileName] = useState<string | null>(null);
  const { auction, manifestRecord, uploadManifest, errors, isLoading } =
    useAuction();
  const methods = useForm();

  const handleSubmitManifest = methods.handleSubmit(async (data) => {
    const [file] = data.file;
    const validFileTypes = [
      "application/x-iwork-numbers-sffnumbers",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];
    if (validFileTypes.includes(file.type)) {
      const formData = new FormData();
      formData.append("file", data.file[0]);
      await uploadManifest(auction.auction_id, formData);
    } else {
      methods.setError("file", {
        type: "string",
        message: "Invalid file! Please use only excel files!",
      });
    }
  });

  const handleChangeFileName = () => {
    const [file] = methods.getValues("file");
    setFileName(file?.name);
  };

  return (
    <>
      <div className="h-full">
        <div className="flex flex-col gap-2">
          <div className="w-full border p-4 h-full">
            <div className="flex align-middle items-center w-full p-2">
              <h1 className="text-3xl font-bold">Encode Manifests</h1>
              <a
                href="/MANIFEST.xlsx"
                download="MANIFEST.xlsx"
                className="text-blue-400 pt-1 pl-4"
              >
                (Download Manifest Here!)
              </a>
            </div>
            <div className="flex">
              <div className="w-2/6 p-2">
                {errors?.error === AUCTIONS_401 ? (
                  <div className="text-red-500 text-xl">
                    Please double check the sheet that you encoded!
                  </div>
                ) : null}
                <FormProvider {...methods}>
                  <form
                    id="create_bidder"
                    onSubmit={(e) => e.preventDefault()}
                    noValidate
                    autoComplete="off"
                  >
                    <div className="flex flex-col items-center justify-center mb-4 h-40 w-full border-2 border-dashed rounded shadow">
                      <label
                        htmlFor="manifest"
                        className="cursor-pointer border px-4 py-2 rounded-lg shadow bg-[#4E5BA6] text-white"
                      >
                        Browse Files Here
                      </label>

                      <div className="mt-4">{fileName}</div>
                      <Input
                        id="manifest"
                        name="file"
                        type="file"
                        className="hidden"
                        validations={{
                          required: {
                            value: true,
                            message: "Please select a file!",
                          },
                          onChange: handleChangeFileName,
                        }}
                      />
                    </div>
                    <div className="flex">
                      <Button
                        onClick={handleSubmitManifest}
                        buttonType="primary"
                        type="submit"
                        className="w-full h-12"
                      >
                        Upload File
                      </Button>
                    </div>
                  </form>
                </FormProvider>
              </div>
              <div className="w-4/6 p-2">
                <div className="text-3xl text-center">
                  {manifestRecord?.message}
                </div>
                <Table
                  data={manifestRecord?.manifest || []}
                  loading={isLoading}
                  hasCount
                  rowKeys={[
                    "barcode",
                    "control_number",
                    "description",
                    "bidder_number",
                    "qty",
                    "price",
                    "manifest_number",
                    "error_messages",
                  ]}
                  columnHeaders={[
                    "barcode",
                    "control",
                    "description",
                    "bidder",
                    "qty",
                    "price",
                    "manifest",
                    "error_messages",
                  ]}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EncodePage;
