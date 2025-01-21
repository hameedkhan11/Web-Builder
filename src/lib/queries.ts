import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { db } from "./db";
import { redirect } from "next/navigation";
import { User } from "@prisma/client";
import { connect } from "http2";

export const getAuthUserDetails = async () => {
    const user = await currentUser();
    if(!user) return null;

    const userData = await db.user.findUnique({
        where: {
            email: user.emailAddresses[0].emailAddress
        },
        include: {
            Agency: {
                include:{
                    SidebarOption: true,
                    SubAccount: {
                        include: {
                            SidebarOption: true
                        }
                    }
                }
            },
            Permissions: true
        },
        
    })
    return userData;
}
    export const saveActivityLogsNotifications = async (
        {
            agencyId,
            description,
            subaccountId
        }
       : {
            agencyId?: string,
            description: string,
            subaccountId?: string, 
        }
    ) =>{
        const authUser = await currentUser();
        let userData;
        if(!authUser){
            const response = await db.user.findFirst({
                where: {
                    Agency:{
                        SubAccount: {
                            some: {
                                id: subaccountId
                            }
                        }
                    }
                }  
            })
            if(response) {
                userData = response
        }
    }
    else {
        userData = await db.user.findUnique({
            where: {
                email: authUser.emailAddresses[0].emailAddress
            }
        })
    }
    if(!userData) {
        console.log('user not found');
        return;
    }
    let foundAgencyId = agencyId
    if(!foundAgencyId){
        if(!subaccountId){
            throw new Error('agencyId or subaccountId is required')
        }
        const subAccount = await db.subAccount.findUnique({
            where: {
                id: subaccountId
            }
        })
        if(subAccount) foundAgencyId = subAccount.agencyId

        if(subaccountId){
            await db.notification.create({
                data: {
                    notification: `${userData.name} ${description}`,
                    User: {
                        connect: {
                            id: userData.id
                        },
                    },
                    Agency: {
                        connect: {
                            id: foundAgencyId
                        }
                    },
                    SubAccount: {
                        connect: {
                            id: subaccountId
                        }
                    }
                }
            })
        }
        else{
            await db.notification.create({
                data: {
                    notification: `${userData.name} ${description}`,
                    User: {
                        connect: {
                            id: userData.id
                        }
                    },
                    Agency: {
                        connect: {
                            id: foundAgencyId
                        }
                    }
                }
            })
        }
    }
    }
export const createTeamUser = async (agencyId: string, user : User) =>{
    if (user.role === 'AGENCY_OWNER') return null;

    const teamUser = await db.user.create({
        data: {...user}
    })
    return teamUser
}
export const VerifyAndAcceptInvitation = async () =>{
    const user = await currentUser()
    if(!user) return redirect('/sign-in')
    
    const invitationExist = await db.invitation.findUnique({
        where:{
            email: user.emailAddresses[0].emailAddress,
            status: 'PENDING'
        }
    })
        if(invitationExist) {
            const userDetails = await createTeamUser(invitationExist.agencyId,{
                email: invitationExist.email,
                id: user.id,
                role: invitationExist.role,
                avatarUrl: user.imageUrl,
                agencyId: invitationExist.agencyId,
                name: `${user.firstName} ${user.lastName}`,
                createdAt: new Date(),
                updatedAt: new Date(),
            })
            await saveActivityLogsNotifications({
                agencyId : invitationExist?.agencyId,
                description: `${user.fullName} has accepted the invitation`,
                subaccountId: undefined,
            })
            if(userDetails){
                const client = await clerkClient()
                await client.users.updateUserMetadata(userDetails.id,{
                    privateMetadata: {
                        role: userDetails.role || "SUBACCOUNT_USER"
                    }
                })
                await db.invitation.delete({
                    where: {
                        email: userDetails.email
                    }
                })
                return userDetails.agencyId
            }else return null
        }else{
            const agency = await db.user.findUnique({
                where: {
                    email: user.emailAddresses[0].emailAddress
                }
            })
            return agency ? agency.agencyId : null
        }
}
