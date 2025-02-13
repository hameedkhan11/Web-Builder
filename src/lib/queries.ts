// src/lib/queries.ts
"use server";
import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { db } from "./db";
import { redirect } from "next/navigation";
import { Agency, Plan, SubAccount, User } from "@prisma/client";
import { v4 } from "uuid";

export const getAuthUserDetails = async () => {
  const user = await currentUser();
  if (!user) return null;

  const userData = await db.user.findUnique({
    where: {
      email: user.emailAddresses[0].emailAddress,
    },
    include: {
      Agency: {
        include: {
          SidebarOption: true,
          SubAccount: {
            include: {
              SidebarOption: true,
            },
          },
        },
      },
      Permissions: true,
    },
  });
  return userData;
};
interface ActivityLog {
  agencyId?: string;
  description: string;
  subaccountId?: string;
}
export const saveActivityLogsNotifications = async ({
  agencyId,
  description,
  subaccountId,
}: ActivityLog) => {
  const authUser = await currentUser();
  let userData;
  if (!authUser) {
    const response = await db.user.findFirst({
      where: {
        Agency: {
          SubAccount: {
            some: {
              id: subaccountId,
            },
          },
        },
      },
    });
    if (response) {
      userData = response;
    }
  } else {
    userData = await db.user.findUnique({
      where: {
        email: authUser.emailAddresses[0].emailAddress,
      },
    });
  }
  if (!userData) {
    console.log("user not found");
    return;
  }
  let foundAgencyId = agencyId;
  if (!foundAgencyId) {
    if (!subaccountId) {
      throw new Error("agencyId or subaccountId is required");
    }
    const subAccount = await db.subAccount.findUnique({
      where: {
        id: subaccountId,
      },
    });
    if (subAccount) foundAgencyId = subAccount.agencyId;

    if (subaccountId) {
      await db.notification.create({
        data: {
          notification: `${userData.name} ${description}`,
          User: {
            connect: {
              id: userData.id,
            },
          },
          Agency: {
            connect: {
              id: foundAgencyId,
            },
          },
          SubAccount: {
            connect: {
              id: subaccountId,
            },
          },
        },
      });
    } else {
      await db.notification.create({
        data: {
          notification: `${userData.name} ${description}`,
          User: {
            connect: {
              id: userData.id,
            },
          },
          Agency: {
            connect: {
              id: foundAgencyId,
            },
          },
        },
      });
    }
  }
};
export const createTeamUser = async (agencyId: string, user: User) => {
  if (user.role === "AGENCY_OWNER") return null;

  const teamUser = await db.user.create({
    data: { ...user },
  });
  return teamUser;
};
export const VerifyAndAcceptInvitation = async () => {
  const user = await currentUser();
  if (!user) return redirect("/sign-in");

  const invitationExist = await db.invitation.findUnique({
    where: {
      email: user.emailAddresses[0].emailAddress,
      status: "PENDING",
    },
  });
  if (invitationExist) {
    const userDetails = await createTeamUser(invitationExist.agencyId, {
      email: invitationExist.email,
      id: user.id,
      role: invitationExist.role,
      avatarUrl: user.imageUrl,
      agencyId: invitationExist.agencyId,
      name: `${user.firstName} ${user.lastName}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await saveActivityLogsNotifications({
      agencyId: invitationExist?.agencyId,
      description: `${user.fullName} has accepted the invitation`,
      subaccountId: undefined,
    });
    if (userDetails) {
      const client = await clerkClient();
      await client.users.updateUserMetadata(userDetails.id, {
        privateMetadata: {
          role: userDetails.role || "SUBACCOUNT_USER",
        },
      });
      await db.invitation.delete({
        where: {
          email: userDetails.email,
        },
      });
      return userDetails.agencyId;
    } else return null;
  } else {
    const agency = await db.user.findUnique({
      where: {
        email: user.emailAddresses[0].emailAddress,
      },
    });
    return agency ? agency.agencyId : null;
  }
};
export const updateAgencyDetails = async (
  agencyId: string,
  agencyDetails: Partial<Agency>
) => {
  const response = await db.agency.update({
    where: { id: agencyId },
    data: { ...agencyDetails },
  });
  return response;
};

export const deleteAgency = async (agencyId: string) => {
  const response = await db.agency.delete({
    where: {
      id: agencyId,
    },
  });
  return response;
};

export const initUser = async (newUser: Partial<User>) => {
  const user = await currentUser();
  if (!user) return null;

  const userData = await db.user.upsert({
    where: {
      email: user.emailAddresses[0].emailAddress,
    },
    update: newUser,
    create: {
      id: user.id,
      avatarUrl: user.imageUrl,
      email: user.emailAddresses[0].emailAddress,
      name: `${user.firstName} ${user.lastName}`,
      role: newUser.role || "SUBACCOUNT_USER",
    },
  });
  const client = await clerkClient();
  await client.users.updateUserMetadata(user.id, {
    privateMetadata: {
      role: newUser.role || "SUBACCOUNT_USER",
    },
  });
  return userData;
};

export const upsertAgency = async (agency: Agency, price?: Plan) => {
  if (!agency.companyEmail) return null;

  try {
    const agencyDetails = await db.agency.upsert({
      where: {
        id: agency.id,
      },
      update: agency,
      create: {
        users: {
          connect: {
            email: agency.companyEmail,
          },
        },
        ...agency,
        SidebarOption: {
          create: [
            {
              name: "Dashboard",
              icon: "category",
              link: `/agency/${agency.id}`,
            },
            {
              name: "Launchpad",
              icon: "clipboardIcon",
              link: `/agency/${agency.id}/launchpad`,
            },
            {
              name: "Settings",
              icon: "settings",
              link: `/agency/${agency.id}/settings`,
            },
            {
              name: "Sub Accounts",
              icon: "person",
              link: `/agency/${agency.id}/all-subaccounts`,
            },
            {
              name: "Team",
              icon: "shield",
              link: `/agency/${agency.id}/team`,
            },
          ],
        },
      },
    });
    return agencyDetails;
  } catch (error) {
    console.log(error);
  }
};

export const getNotificationAndUser = async (agencyId: string) => {
  try {
    const response = await db.notification.findMany({
      where: {
        agencyId,
      },
      include: {
        User: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return response;
  } catch (error) {
    console.log(error);
  }
};

export const upsertSubAccount = async (subAccount: SubAccount) => {
  if (!subAccount.companyEmail) return null;
  const agencyOwner = await db.user.findFirst({
    where: {
      Agency: {
        id: subAccount.agencyId,
      },
      role: "AGENCY_OWNER",
    },
  });
  if (!agencyOwner) return console.log("🔴Erorr could not create subaccount");

  const permissionId = v4();
  const response = await db.subAccount.upsert({
    where: { id: subAccount.id },
    update: subAccount,
    create: {
      ...subAccount,
      Permissions: {
        create: {
          access: true,
          email: agencyOwner.email,
          id: permissionId,
        },
      },
      Pipeline: {
        create: {
          name: "Lead Cycle",
        },
      },
      SidebarOption: {
        create: [
            {
                name: 'Launchpad',
                icon: 'clipboardIcon',
                link: `/subaccount/${subAccount.id}/launchpad`,
            },
            
            {
                name: 'Settings',
                icon: 'settings',
                link: `/subaccount/${subAccount.id}/settings`,
            },
            {
                name: 'Funnels',
                icon: 'pipelines',
                link: `/subaccount/${subAccount.id}/funnels`,
            },
            {
                name: 'Media',
                icon: 'database',
                link: `/subaccount/${subAccount.id}/media`,
            },
            {
                name: 'Automations',
                icon: 'chip',
                link: `/subaccount/${subAccount.id}/automations`,
            },
            {
                name: 'Pipelines',
                icon: 'flag',
                link: `/subaccount/${subAccount.id}/pipelines`,
            },
            {
                name: 'Contacts',
                icon: 'person',
                link: `/subaccount/${subAccount.id}/contacts`,
            },
            {
                name: 'Dashboard',
                icon: 'category',
                link: `/subaccount/${subAccount.id}`,
            },

        ]
      }
    },
  });
  return response;
};
