"use client";
import { useShallow } from "zustand/shallow";
import { UserRPC } from "vovk-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import UserDialog from "./UserDialog";
import { useRegistry, type UserModelType } from "@/registry";
import { Button } from "./ui/button";
import { Pencil } from "lucide-react";
import { useEffect } from "react";

interface Props {
  initialData: UserModelType[];
}

const UserList = ({ initialData }: Props) => {
  UserRPC.getUsers.useQuery();
  const users = useRegistry(useShallow((state) => Object.values(state.users)));
  useEffect(() => {
    useRegistry.getState().parse(initialData);
  }, [initialData]);
  return (
    <div className="space-y-4 p-6 max-w-7xl mx-auto">
      <h2 className="text-lg font-semibold text-foreground flex gap-4 items-center">
        Team Members
        <UserDialog userId={null}>
          <Button variant="outline">+ Add a team member</Button>
        </UserDialog>
      </h2>
      <div className="flex flex-wrap gap-4">
        {users.map((user) => (
          <div key={user.id} className="flex items-center gap-2">
            <UserDialog userId={user.id}>
              <div className="h-8 w-8 relative cursor-pointer">
                <div className="w-full h-full absolute z-10 inset-0 bg-violet-500 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <Pencil className="h-4 w-4 text-white" />
                </div>
                <Avatar className="h-8 w-8">
                  {user.imageUrl && (
                    <AvatarImage src={user.imageUrl} alt={user.fullName} />
                  )}
                  <AvatarFallback className="text-xs">
                    {user.fullName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
            </UserDialog>

            <span className="text-sm font-medium text-foreground flex flex-col">
              {user.fullName}{" "}
              <span className="text-xs text-muted-foreground">
                {user.email}
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserList;
