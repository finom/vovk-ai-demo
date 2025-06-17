"use server";
import Board from "@/components/Board";
import { ExpandableChatDemo } from "@/components/ExpandableChatDemo";
import UserList from "@/components/UserList";
import { UserModelType } from "@/registry";
import { UserRPC } from "vovk-client";

export default async function Home() {
  const initialData = await UserRPC.getUsers<UserModelType[]>();

  return (
    <>
      <UserList initialData={initialData} />
      <Board />
      <ExpandableChatDemo />
    </>
  );
}
