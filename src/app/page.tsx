"use server";
import { ExpandableChatDemo } from "@/components/ExpandableChatDemo";
import UserList from "@/components/UserList";
import UserController from "@/modules/user/UserController";
import type { TaskModelType, UserModelType } from "@/registry";
import UserKanban from "@/components/UserKanban";
import TaskController from "@/modules/task/TaskController";

export default async function Home() {
  const usersInitialData = await UserController.getUsers.fn<UserModelType[]>();
  const tasksInitialData = await TaskController.getTasks.fn<TaskModelType[]>();

  return (
    <>
      <UserList initialData={usersInitialData} />
      <UserKanban initialData={tasksInitialData} />
      <ExpandableChatDemo />
    </>
  );
}
