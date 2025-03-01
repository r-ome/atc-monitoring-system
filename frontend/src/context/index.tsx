import {
  SupplierProvider,
  useSuppliers,
} from "./SupplierProvider/SupplierContext";
import {
  ContainerProvider,
  useContainers,
} from "./ContainerProvider/ContainerContext";
import { BranchProvider, useBranches } from "./BranchProvider/BranchContext";
import {
  InventoryProvider,
  useInventories,
} from "./InventoryProvider/InventoryContext";
import { AuctionProvider, useAuction } from "./AuctionProvider/AuctionContext";
import { BidderProvider, useBidders } from "./BidderProvider/BidderContext";
import {
  BidderRequirementProvider,
  useBidderRequirement,
} from "./RequirementProvider/RequirementContext";
import { PaymentProvider, usePayments } from "./PaymentProvider/PaymentContext";
import { AuthProvider, useAuth } from "./AuthProvider/AuthContext";
import { UsersProvider, useUsers } from "./UserProvider/UsersContext";

export {
  useBranches,
  useContainers,
  useSuppliers,
  useInventories,
  useAuction,
  useBidders,
  useBidderRequirement,
  usePayments,
  useAuth,
  useUsers,
};

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthProvider>
      <UsersProvider>
        <SupplierProvider>
          <ContainerProvider>
            <BranchProvider>
              <InventoryProvider>
                <AuctionProvider>
                  <BidderProvider>
                    <BidderRequirementProvider>
                      <PaymentProvider>{children}</PaymentProvider>
                    </BidderRequirementProvider>
                  </BidderProvider>
                </AuctionProvider>
              </InventoryProvider>
            </BranchProvider>
          </ContainerProvider>
        </SupplierProvider>
      </UsersProvider>
    </AuthProvider>
  );
};

export default Providers;
