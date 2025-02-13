// app/page.tsx (Server Component)
import AgencyDetails from "@/components/forms/agency-details";
import { getAuthUserDetails, VerifyAndAcceptInvitation } from "@/lib/queries";
import { currentUser } from "@clerk/nextjs/server";
import { Plan } from "@prisma/client";
import { redirect } from "next/navigation";

const Page = async ({
  searchParams,
}: {
  searchParams: { plan: Plan; state: string; code: string };
}) => {
  const user = await getAuthUserDetails();
  console.log(user);
  const agencyId = await VerifyAndAcceptInvitation();
  const searchParam = await searchParams;
  console.log(agencyId);

  // Get the user details

  if (agencyId) {
    if (user?.role === 'SUBACCOUNT_GUEST' || user?.role === 'SUBACCOUNT_USER') {
      return redirect('/subaccount')
    } else if (user?.role === 'AGENCY_OWNER' || user?.role === 'AGENCY_ADMIN') {
      if (searchParam.plan) {
        return redirect(`/agency/${agencyId}/billing?plan=${searchParam.plan}`)
      }
      if (searchParams.state) {
        const statePath = searchParam.state.split('___')[0]
        const stateAgencyId = searchParam.state.split('___')[1]
        if (!stateAgencyId) return <div>Not authorized</div>
        return redirect(
          `/agency/${stateAgencyId}/${statePath}?code=${searchParam.code}`
        )
      } else return redirect(`/agency/${agencyId}`)
    } else {
      return <div>Not authorized</div>
    }
  }

  const authUser = await currentUser();

  return (
    <div className="flex justify-center items-center min-h-screen py-8">
      <div className="max-w-[850px] border-[1px] p-4 rounded-xl">
        <h1 className="text-4xl font-bold left-4 text-center w-full">
          Create An Agency
        </h1>
        <AgencyDetails
          data={{
            companyEmail: authUser?.emailAddresses[0].emailAddress,
          }}
        />
      </div>
    </div>
  );
};

export default Page;