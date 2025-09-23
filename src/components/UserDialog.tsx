import { Button } from "@/components/ui/button";
import { ErrorMessage } from "@hookform/error-message";
import { omit } from "lodash";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRegistry } from "@/registry";
import { UserRPC } from "vovk-client";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useShallow } from "zustand/shallow";
import { BASE_KEYS } from "@/constants";
import { UserType } from "../../prisma/generated/schemas/models/User.schema";

interface Props {
  userId: UserType["id"] | null;
  children?: React.ReactNode;
}

const UserDialog = ({ userId, children }: Props) => {
  const user = useRegistry(
    useShallow((state) =>
      userId ? omit(state.user[userId], BASE_KEYS) : null,
    ),
  );
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: user ?? {},
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    reset(user ?? {});
  }, [user, reset]);

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form
          onSubmit={handleSubmit(
            async (body) => {
              setIsLoading(true);

              try {
                if (userId) {
                  await UserRPC.updateUser({ body, params: { id: userId } });
                } else {
                  await UserRPC.createUser({ body });
                }
              } catch (error) {
                console.error(error);
              }

              setIsLoading(false);
            },
            (e) => {
              console.error("Form submission error:", e);
              setIsLoading(false);
            },
          )}
        >
          <DialogHeader>
            <DialogTitle>{user ? "Edit" : "Create"} User</DialogTitle>
            <DialogDescription hidden>
              Make changes to the profile here. Click save when you&apos;re
              done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 mt-4">
            <div className="grid gap-3">
              <Label htmlFor="name-1">Name</Label>
              <Input
                id="name-1"
                defaultValue={user?.fullName}
                {...register("fullName")}
              />
              <ErrorMessage errors={errors} name="fullName" />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="email-1">Email</Label>
              <Input
                id="email-1"
                defaultValue={user?.email}
                {...register("email")}
              />
              <ErrorMessage errors={errors} name="email" />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              type="submit"
              className={cn(
                isLoading && "overflow-hidden",
                "flex items-center relative",
              )}
            >
              {isLoading && <Loader2 className="absolute z-10 animate-spin" />}
              <span className={cn(isLoading && "opacity-0")}>Save changes</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
export default UserDialog;
