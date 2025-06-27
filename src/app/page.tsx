import { ExpandableChatDemo } from "@/components/ExpandableChatDemo";
import UserList from "@/components/UserList";
import UserController from "@/modules/user/UserController";
import type { TaskModelType, UserModelType } from "@/registry";
import UserKanban from "@/components/UserKanban";
import RealTimeDemo from "@/components/RealTimeDemo";
import TaskController from "@/modules/task/TaskController";

export const runtime = "nodejs";

export default async function Home() {
  const [usersInitialData, tasksInitialData] = await Promise.all([
    UserController.getUsers.fn<UserModelType[]>(),
    TaskController.getTasks.fn<TaskModelType[]>(),
  ]);

  return (
    <>
      <UserList initialData={usersInitialData} />
      <UserKanban initialData={tasksInitialData} />
      <ExpandableChatDemo />
      <RealTimeDemo />
    </>
  );
}
