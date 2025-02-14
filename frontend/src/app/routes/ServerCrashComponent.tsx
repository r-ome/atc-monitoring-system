import React from "react";
import { APIError } from "@types";

const ServerCrashComponent: React.FC<APIError> = ({ error }) => {
  return (
    <div className="mt-8">
      <div className="border p-2 rounded border-red-500 mb-10">
        <h1 className="text-red-500 text-xl flex justify-center">
          Please take a look back later...
        </h1>
      </div>
    </div>
  );
};

export default ServerCrashComponent;
