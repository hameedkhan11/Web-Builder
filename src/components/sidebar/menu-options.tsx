"use client";

import {
  Agency,
  AgencySidebarOption,
  SubAccount,
  SubAccountSidebarOption,
} from "@prisma/client";
import React, { useEffect, useMemo, useState } from "react";
import { Sheet, SheetClose, SheetContent, SheetTrigger } from "../ui/sheet";
import { Button } from "../ui/button";
import {
  ChevronsUp,
  ChevronsUpDown,
  Compass,
  Menu,
  PlusCircleIcon,
} from "lucide-react";
import clsx from "clsx";
import { AspectRatio } from "@radix-ui/react-aspect-ratio";
import Image from "next/image";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "../ui/command";
import Link from "next/link";
import { useModal } from "@/providers/modal-providers";
import CustomModal from "../global/custom-modal";
import SubAccountDetail from "../forms/subaccount-details";
import { SidebarSeparator } from "../ui/sidebar";
import { icons } from "@/lib/constants";

type Props = {
  defaultOpen?: boolean;
  subAccounts: SubAccount[];
  sidebarOpt: AgencySidebarOption[] | SubAccountSidebarOption[];
  sidebarLogo: string | undefined;
  details: any;
  user: any;
  id: string;
};
const MenuOptions = ({
  defaultOpen,
  details,
  id,
  user,
  subAccounts,
  sidebarOpt,
  sidebarLogo,
}: Props) => {
  const [isMounted, setIsMounted] = useState(false);
  console.log(sidebarLogo);
  console.log(id);
  useEffect(() => {
    setIsMounted(true);
  }, []);
  const openState = useMemo(
    () => (defaultOpen ? { open: true } : {}),
    [defaultOpen]
  );
  const { setOpen, setClose } = useModal();
  return (
    <Sheet modal={false} {...openState}>
      <SheetTrigger
        asChild
        className="absolute left-4 top-4 z-[100] md:!hidden flex"
      >
        <Button variant={"outline"} size={"icon"}>
          <Menu />
        </Button>
      </SheetTrigger>

      <SheetContent
        showX={!defaultOpen}
        side={"left"}
        className={clsx(
          "bg-background/80 backdrop-blur-xl fixed top-0 border-r-[1px] p-6",
          {
            "hidden md:inline-block z-0 w-[300px]": defaultOpen,
            "inline-block md:hidden z-[100] w-full": !defaultOpen,
          }
        )}
      >
        <div>
          <AspectRatio ratio={16 / 5}>
            <Image
              src={sidebarLogo || "/assets/plura-logo.svg"}
              alt="Sidebar Logo"
              fill
              className="rounded-md object-contain"
            />
          </AspectRatio>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                className="w-full my-4 flex items-center justify-between py-8"
                variant="ghost"
              >
                <div className="flex items-center text-left gap-2">
                  <Compass />
                  <div className="flex flex-col">
                    {details.name}
                    <span>{details.address}</span>
                  </div>
                </div>
                <div>
                  <ChevronsUpDown size={16} className="text-muted-foreground" />
                </div>
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <Command className="rounded-lg">
                <CommandInput placeholder="Search Accounts..." />
                <CommandList className="rounded-lg">
                  <CommandEmpty>No results found.</CommandEmpty>
                  {(user?.role === "AGENCY_OWNER" ||
                    user?.role === "AGENCY_ADMIN") &&
                    user?.Agency && (
                      <CommandGroup heading="Agency">
                        <CommandItem className="!bg-transparent my-2 text-primary border-[1px] border-border p-2 rounded-md hover:!bg-muted cursor-pointer transition-all">
                          {defaultOpen ? (
                            <Link
                              href={`/agency/${user?.Agency?.id}`}
                              className="flex gap-4 w-full h-full"
                            >
                              <div className="relative w-16">
                                <Image
                                  src={user?.Agency?.agencyLogo}
                                  alt="Agency Logo"
                                  fill
                                  className="rounded-md object-contain"
                                />
                              </div>
                              <div className="flex flex-col flex-1">
                                {user?.Agency?.name}
                                <span className="text-muted-foreground">
                                  {user?.Agency?.address}
                                </span>
                              </div>
                            </Link>
                          ) : (
                            <SheetClose asChild>
                              <Link
                                href={`/agency/${user?.Agency?.id}`}
                                className="flex gap-4 w-full h-full"
                              >
                                <div>
                                  <Image
                                    src={user?.Agency?.agencyLogo}
                                    alt="Agency Logo"
                                    fill
                                    className="rounded-md object-contain"
                                  />
                                </div>
                                <div>{user?.Agency?.address}</div>
                                <span className="text-muted-foreground">
                                  {user?.Agency?.name}
                                </span>
                              </Link>
                            </SheetClose>
                          )}
                        </CommandItem>
                      </CommandGroup>
                    )}
                  <CommandGroup heading="Sub Accounts">
                    {!!subAccounts
                      ? subAccounts.map((subaccount) => (
                          <CommandItem key={subaccount.id}>
                            {defaultOpen ? (
                              <Link
                                href={`/subaccount/${subaccount.id}`}
                                className={`flex gap-4 w-full h-full`}
                              >
                                <div className="relative w-16">
                                  <Image
                                    src={subaccount.subAccountLogo}
                                    alt="Sub Account Logo"
                                    fill
                                    className="rounded-md object-contain"
                                  />
                                </div>
                                <div className="flex flex-col flex-1">
                                  {subaccount.name}
                                  <span className="text-muted-foreground">
                                    {subaccount.address}
                                  </span>
                                </div>
                              </Link>
                            ) : (
                              <SheetClose asChild>
                                <Link
                                  href={`/subaccount/${subaccount.id}`}
                                  className={`flex gap-4 w-full h-full`}
                                >
                                  <div>
                                    <Image
                                      src={subaccount.subAccountLogo}
                                      alt="Sub Account Logo"
                                      fill
                                      className="rounded-md object-contain"
                                    />
                                  </div>
                                  <div>{subaccount.address}</div>
                                  <span className="text-muted-foreground">
                                    {subaccount.name}
                                  </span>
                                </Link>
                              </SheetClose>
                            )}
                          </CommandItem>
                        ))
                      : "No Accounts Found"}
                  </CommandGroup>
                </CommandList>
                {(user?.role === "AGENCY_OWNER" ||
                  user?.role === "AGENCY_ADMIN") && (
                  <SheetClose asChild>
                    <Button
                      className="w-full flex gap-2"
                      onClick={() => {
                        setOpen(
                          <CustomModal
                            title="Create Sub Account"
                            subheading="You can switch between your agency account and sub account from the sidebar"
                          >
                            <SubAccountDetail
                              agencyDetails={user?.Agency as Agency}
                              userId={user?.id as string}
                              username={user?.name}
                            />
                          </CustomModal>
                        );
                      }}
                    >
                      <PlusCircleIcon size={16} />
                      Create Sub Account
                    </Button>
                  </SheetClose>
                )}
              </Command>
            </PopoverContent>
          </Popover>
          <p className="text-muted-foreground text-xs mb-2">MENU LINKS</p>
          <SidebarSeparator className="mb-4" />
          <nav className="relative">
            <Command className="rounded-lg overflow-visible bg-transparent">
              <CommandList className="py-4 overflow-visible">
                <CommandInput placeholder="Search..." />
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup className="overflow-visible">
                  {sidebarOpt &&
                    sidebarOpt.map((opt) => {
                      let val;
                      const result = icons.find(
                        (icon) => icon.value === opt.icon
                      );
                      if (result) val = <result.path />;

                      return (
                        <CommandItem key={opt.id} className="md:w-[320px] w-full">
                          <Link href={opt.link} className="flex items-center gap-2 hover:bg-transparent rounded-md transition-all md:w-full w-[320px]">
                          {val}
                          <span>{opt.name}</span>
                          </Link>
                        </CommandItem>
                      );
                    })}
                </CommandGroup>
              </CommandList>
            </Command>
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MenuOptions;
