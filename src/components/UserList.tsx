"use client";
import { useShallow } from "zustand/shallow";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import UserDialog from "./UserDialog";
import { useRegistry } from "@/registry";
import { Button } from "./ui/button";
import { Pencil, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { UserRPC, DatabasePollRPC } from "vovk-client";
import { useQuery } from "@tanstack/react-query";
import { UserType } from "../../prisma/generated/schemas/models/User.schema";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";

interface Props {
  initialData: UserType[];
}

const UserList = ({ initialData }: Props) => {
  const users = useRegistry(
    useShallow((state) => state.values({ user: initialData }).user),
  );
  useEffect(() => {
    useRegistry.getState().sync({ user: initialData });
  }, [initialData]);

  useQuery({
    queryKey: UserRPC.getUsers.queryKey(),
    queryFn: () => UserRPC.getUsers(),
  });

  const [isPollingEnabled, setIsPollingEnabled] = useState(false);
  const pollingAbortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const isEnabled = localStorage.getItem("isPollingEnabled");
    setIsPollingEnabled(isEnabled === "true");
  }, []);

  useEffect(() => {
    localStorage.setItem("isPollingEnabled", isPollingEnabled.toString());
    async function poll(retries = 0) {
      if (!isPollingEnabled) {
        pollingAbortControllerRef.current?.abort();
        return;
      }
      try {
        while (true) {
          console.log("START POLLING");
          const iterable = await DatabasePollRPC.poll();
          pollingAbortControllerRef.current = iterable.abortController;

          for await (const iteration of iterable) {
            console.log("New DB update:", iteration);
          }
        }
      } catch (error) {
        if (
          retries < 5 &&
          (error as Error & { cause?: Error }).cause?.name !== "AbortError"
        ) {
          console.error("Polling failed, retrying...", error);
          await new Promise((resolve) => setTimeout(resolve, 2000));
          return poll(retries + 1);
        }
      }
    }

    void poll();

    return () => {
      pollingAbortControllerRef.current?.abort();
    };
  }, [isPollingEnabled]);

  return (
    <div className="space-y-4 p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-12">
        <h2 className="text-lg font-semibold text-foreground flex gap-4 items-center">
          Team Members
          <UserDialog userId={null}>
            <Button variant="outline">
              <Plus className="h-4 w-4" />
              Add a Team Member
            </Button>
          </UserDialog>
        </h2>
        <div className="flex items-center space-x-2">
          <Switch
            id="poll-mode"
            checked={isPollingEnabled}
            onCheckedChange={setIsPollingEnabled}
          />
          <Label htmlFor="poll-mode">Database Polling</Label>
        </div>
      </div>
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
                    {user.fullName?.slice(0, 2).toUpperCase()}
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
