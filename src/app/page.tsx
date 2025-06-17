"use server";
import Board from "@/components/Board";
import { ExpandableChatDemo } from "@/components/ExpandableChatDemo";
import UserList from "@/components/UserList";;

export default async function Home() {
  const initialData = await [];

  return (
    <>
      <UserList initialData={initialData} />
      <Board />
      <ExpandableChatDemo />
    </>
  );
}
