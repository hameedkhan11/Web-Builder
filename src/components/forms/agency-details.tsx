// app/(main)/agency/page.tsx
"use client";
import { Agency } from "@prisma/client";
import React, { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { NumberInput } from "@tremor/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { useToast } from "@/hooks/use-toast";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import FileUpload from "../global/file-upload";
import { Input } from "../ui/input";
import { Switch } from "../ui/switch";
import { Button } from "../ui/button";
import {
  deleteAgency,
  initUser,
  saveActivityLogsNotifications,
  updateAgencyDetails,
  upsertAgency,
} from "@/lib/queries";
import Loading from "../global/loading";
import { v4 } from "uuid";

type Props = {
  data?: Partial<Agency>;
};

const FormSchema = z.object({
  name: z.string().min(2, {
    message: "Agency name must be at least 2 characters long",
  }),
  companyEmail: z.string().email({ message: "Invalid email address" }),
  companyPhone: z.string().min(10, { message: "Invalid phone number" }),
  whiteLabel: z.boolean().default(false),
  address: z.string().min(1, { message: "Address is required" }),
  city: z.string().min(1, { message: "City is required" }),
  zipCode: z.string().min(1, { message: "Zip code is required" }),
  state: z.string().min(1, { message: "State is required" }),
  country: z.string().min(1, { message: "Country is required" }),
  agencyLogo: z.string().min(1),
});

const AgencyDetails = ({ data }: Props) => {
  const { toast } = useToast();
  const router = useRouter();
  const [deletingAgency, setDeletingAgency] = useState(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    mode: "onChange",
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: data?.name ?? "",
      companyEmail: data?.companyEmail ?? "",
      companyPhone: data?.companyPhone ?? "",
      whiteLabel: data?.whiteLabel ?? false,
      address: data?.address ?? "",
      city: data?.city ?? "",
      zipCode: data?.zipCode ?? "",
      state: data?.state ?? "",
      country: data?.country ?? "",
      agencyLogo: data?.agencyLogo,
    },
    reValidateMode: "onChange",
  });

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = form;

  const watchLogo = form.watch("agencyLogo");
  useEffect(() => {
    console.log("watchLogo", watchLogo);
  }, [watchLogo]);
  const handleSubmitForm = async (values: z.infer<typeof FormSchema>) => {
    try {
      let newUserData;
      let custId;
      const agencyId = data?.id ? data.id : v4(); // Generate or use existing ID
  
      if (!data?.id) {
        const bodyData = {
          email: values.companyEmail,
          name: values.name,
          shipping: {
            address: {
              city: values.city,
              country: values.country,
              line1: values.address,
              postal_code: values.zipCode,
              state: values.state,
            },
            name: values.name,
          },
          address: {
            city: values.city,
            country: values.country,
            line1: values.address,
            postal_code: values.zipCode,
            state: values.state,
          },
        };
      }
  
      newUserData = await initUser({ role: "AGENCY_OWNER" });
      
      const response = await upsertAgency({
        id: agencyId,
        customerId: data?.customerId || custId || "",
        address: values.address,
        agencyLogo: values.agencyLogo,
        city: values.city,
        companyPhone: values.companyPhone,
        country: values.country,
        name: values.name,
        state: values.state,
        whiteLabel: values.whiteLabel,
        zipCode: values.zipCode,
        createdAt: new Date(),
        updatedAt: new Date(),
        companyEmail: values.companyEmail,
        connectAccountId: "",
        goal: 5,
      });
  
      if (response) {
        toast({
          title: "Created Agency",
          description: "Your agency has been created successfully",
        });
        
        // Make sure to use the correct ID for redirect
        router.push(`/agency/${agencyId}`);
      } else {
        throw new Error('Failed to create agency');
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Oops! Something went wrong",
        variant: "destructive",
        description: "Failed to create agency",
      });
    }
  };
  const handleDeleteAgency = async () => {
    if (!data?.id) return;
    // TODO Discontinue the subscription
    try {
      const response = await deleteAgency(data?.id);
      toast({
        title: "Agency Deleted",
        description: "Your agency has been deleted",
      });
      router.refresh();
    } catch (error) {
      console.log(error);
      toast({
        title: "Oops! Something went wrong",
        variant: "destructive",
        description: "Failed to delete agency",
      });
    }
    setDeletingAgency(false);
  };
  return (
    <AlertDialog>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Agency Details</CardTitle>
          <CardDescription>
            Lets create an agency for you to manage your clients. You can edit
            agency settings later from the agency settings tab.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={handleSubmit(handleSubmitForm)}>
              <Controller
                control={control}
                name="agencyLogo"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Agency Logo</FormLabel>
                    <FormControl>
                      <FileUpload
                        apiEndpoint="agencyLogo"
                        onChange={(url) => {
                          console.log("FileUpload onChange:", url);
                          if (url) {
                            field.onChange(url);
                            form.setValue("agencyLogo", url, {
                              shouldValidate: true,
                            });
                          }
                        }}
                        value={field.value}
                      />
                    </FormControl>
                    {fieldState.error && (
                      <FormMessage>{fieldState.error.message}</FormMessage>
                    )}
                  </FormItem>
                )}
              />

              <div className="flex md:flex-row gap-4">
                <Controller
                  control={control}
                  name="name"
                  render={({ field, fieldState }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Agency Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Your agency name"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      {fieldState.error && (
                        <FormMessage>{fieldState.error.message}</FormMessage>
                      )}
                    </FormItem>
                  )}
                />

                <Controller
                  control={control}
                  name="companyEmail"
                  render={({ field, fieldState }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Agency Email</FormLabel>
                      <FormControl>
                        <Input readOnly placeholder="Email" {...field} />
                      </FormControl>
                      {fieldState.error && (
                        <FormMessage>{fieldState.error.message}</FormMessage>
                      )}
                    </FormItem>
                  )}
                />
              </div>
              <Controller
                control={control}
                name="companyPhone"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Agency Phone Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Phone Number"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    {fieldState.error && (
                      <FormMessage>{fieldState.error.message}</FormMessage>
                    )}
                  </FormItem>
                )}
              />
              <Controller
                control={control}
                name="whiteLabel"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border gap-4 p-4">
                    <div>
                      <FormLabel>Whitelabel Agency</FormLabel>
                      <FormDescription>
                        Turning on whilelabel mode will show your agency logo to
                        all sub accounts by default. You can overwrite this
                        functionality through sub account settings.
                      </FormDescription>
                    </div>

                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Controller
                control={control}
                name="address"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Address"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    {fieldState.error && (
                      <FormMessage>{fieldState.error.message}</FormMessage>
                    )}
                  </FormItem>
                )}
              />
              <div className="flex md:flex-row gap-4">
                <Controller
                  control={control}
                  name="city"
                  render={({ field, fieldState }) => (
                    <FormItem className="flex-1">
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="City"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      {fieldState.error && (
                        <FormMessage>{fieldState.error.message}</FormMessage>
                      )}
                    </FormItem>
                  )}
                />
                <Controller
                  control={control}
                  name="state"
                  render={({ field, fieldState }) => (
                    <FormItem className="flex-1">
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="State"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      {fieldState.error && (
                        <FormMessage>{fieldState.error.message}</FormMessage>
                      )}
                    </FormItem>
                  )}
                />
                <Controller
                  control={control}
                  name="zipCode"
                  render={({ field, fieldState }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Zipcode</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Zipcode"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      {fieldState.error && (
                        <FormMessage>{fieldState.error.message}</FormMessage>
                      )}
                    </FormItem>
                  )}
                />
              </div>
              <Controller
                control={control}
                name="country"
                render={({ field, fieldState }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Country"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    {fieldState.error && (
                      <FormMessage>{fieldState.error.message}</FormMessage>
                    )}
                  </FormItem>
                )}
              />
              {data?.id && (
                <div className="flex flex-col gap-2 mt-4">
                  <FormLabel>Create A Goal</FormLabel>
                  <FormDescription>
                    ✨ Create a goal for your agency. As your business grows
                    your goals grow too so dont forget to set the bar higher!
                  </FormDescription>
                  <NumberInput
                    className="bg-background !border !border-input "
                    placeholder="Sub Account Goal"
                    min={1}
                    defaultValue={data?.goal}
                    onValueChange={async (value) => {
                      if (!data?.id) return;
                      await updateAgencyDetails(data?.id, { goal: value });
                      await saveActivityLogsNotifications({
                        agencyId: data.id,
                        description: `Agency goal was updated to ${value} sub Account`,
                        subaccountId: undefined,
                      });
                      router.refresh();
                    }}
                  />
                </div>
              )}
              <Button type="submit" disabled={isSubmitting} className="mt-4">
                {isSubmitting ? <Loading /> : "Save Agency Details"}
              </Button>
            </form>
          </Form>

          <div className="flex flex-row items-center justify-between rounded-lg border border-destructive gap-4 p-4 mt-4">
            <div>Danger Zone</div>
            <p className="text-muted-foreground">
              Deleting your agency cannot be undone. This will also delete all
              sub accounts and all data related to your sub accounts. Sub
              accounts will no longer have access to funnels, contacts etc.
            </p>
            <AlertDialogTrigger
              disabled={isSubmitting || deletingAgency}
              className="text-red-600 p-2 text-center mt-2 rounded-md hover:bg-red-600 hover:text-white whitespace-nowrap"
            >
              {deletingAgency ? "Deleting..." : "Delete Agency"}
            </AlertDialogTrigger>
          </div>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-left">
                Are you absolutely sure?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-left">
                This action cannot be undone. This will permanently delete the
                Agency account and all related sub accounts.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex items-center">
              <AlertDialogCancel className="mb-2">Cancel</AlertDialogCancel>
              <AlertDialogAction
                disabled={deletingAgency}
                className="bg-destructive hover:bg-red-600"
                onClick={handleDeleteAgency}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </CardContent>
      </Card>
    </AlertDialog>
  );
};

export default AgencyDetails;
