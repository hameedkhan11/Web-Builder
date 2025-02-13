
const Page = async ({
  params
}: {
  params: { agencyId: string };
}) => {
  

  const { agencyId } = await params

  return (
    <div className="flex justify-center items-center min-h-screen py-8">
      {/* {agencyId} */}
    </div>
  );
};

export default Page;