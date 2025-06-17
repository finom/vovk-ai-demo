"use server";
import Board from "@/components/Board";
import { ExpandableChatDemo } from "@/components/ExpandableChatDemo";
import UserList from "@/components/UserList";
import UserController from "@/modules/user/UserController";
import type{ UserModelType } from "@/registry";

export default async function Home() {
  const initialData = await UserController.getUsers.fn<UserModelType[]>();

  return (
    <>
      <UserList initialData={initialData} />
      <Board />
      <ExpandableChatDemo />
    </>
  );
}
