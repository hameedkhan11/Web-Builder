import { getAuthUserDetails } from "@/lib/queries";
import React from "react";
import MenuOptions from "./menu-options";

type Props = {
  id: string;
  type: "agency" | "subaccount";
};

const Sidebar = async ({ id, type }: Props) => {
  const user = await getAuthUserDetails();
  if (!user) return null;

  const details =
    type === "agency"
      ? user.Agency
      : user.Agency?.SubAccount.find((subaccount) => subaccount.id === id);

  if (!details) return null;

  const isWhiteLabelAgency = user.Agency?.whiteLabel;
  
  // Handle sidebar logo with proper fallbacks
  const defaultLogo = "/assets/plura-logo.svg";
  let sidebarLogo = user.Agency?.agencyLogo || defaultLogo;

  if (!isWhiteLabelAgency && type === "subaccount") {
    const subAccount = user.Agency?.SubAccount.find(
      (subaccount) => subaccount.id === id
    );
    sidebarLogo = subAccount?.subAccountLogo || user.Agency?.agencyLogo || defaultLogo;
  }

  // Get sidebar options based on type
  const sidebarOpt =
    type === "agency"
      ? user.Agency?.SidebarOption || []
      : user.Agency?.SubAccount.find((subaccount) => subaccount.id === id)
          ?.SidebarOption || [];

  // Filter subaccounts based on permissions
  const subAccounts = user.Agency?.SubAccount.filter((subaccount) =>
    user.Permissions.some(
      (permission) =>
        permission.subAccountId === subaccount.id && permission.access
    )
  ) || [];

  return (
    <>
      {/* Desktop menu - always visible on md screens and up */}
      <MenuOptions
        defaultOpen={true}
        details={details}
        user={user}
        id={id}
        sidebarOpt={sidebarOpt}
        sidebarLogo={sidebarLogo}
        subAccounts={subAccounts}
      />
      
      {/* Mobile menu - only visible on smaller screens */}
      <MenuOptions
        details={details}
        user={user}
        id={id}
        sidebarOpt={sidebarOpt}
        sidebarLogo={sidebarLogo}
        subAccounts={subAccounts}
      />
    </>
  );
};

export default Sidebar;