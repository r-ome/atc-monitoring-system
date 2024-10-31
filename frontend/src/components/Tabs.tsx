import React, { useState } from "react";

const Tab = ({
  tabs,
  tabContent,
  children,
}: {
  tabs: { label: string; page: string }[];
  tabContent?: ({ current }: { current: string }) => React.ReactNode;
  children?: React.ReactNode;
}) => {
  const [current, setCurrent] = useState<string>(tabs[0].page);

  const handleTabOpen = (tabCategory: string) => {
    setCurrent(tabCategory);
  };

  return (
    <>
      <section className="py-10 dark:bg-dark">
        <div className="container">
          <div className="-mx-4 flex flex-wrap">
            <div className="w-full px-4">
              <div className="mb-14 w-full">
                <div className="flex flex-col gap-2 flex-wrap rounded-lg border border-[#E4E4E4] px-4 py-3 dark:border-dark-3 sm:flex-row">
                  {tabs.length
                    ? tabs.map((item, i) => (
                        <a
                          key={i}
                          onClick={() => handleTabOpen(item.page)}
                          className={`cursor-pointer rounded-md px-4 py-3 text-sm font-medium md:text-base lg:px-6 ${
                            current === item.page
                              ? "bg-[#4E5BA6] text-white"
                              : "text-body-color hover:bg-[#4E5BA6] hover:text-white dark:text-dark-6 dark:hover:text-white"
                          }`}
                        >
                          {item.label}
                        </a>
                      ))
                    : null}
                </div>

                {/* Pass the current state to children or tabContent */}
                {tabContent ? tabContent({ current }) : children}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Tab;

export const TabContent = ({
  current,
  tabCategory,
  children,
}: {
  current: string;
  tabCategory: string;
  children: React.ReactNode;
}) => {
  return (
    <div>
      <div
        className={`text-base leading-relaxed text-body-color dark:text-dark-6 ${
          current === tabCategory ? "block" : "hidden"
        } `}
      >
        {children}
      </div>
    </div>
  );
};
