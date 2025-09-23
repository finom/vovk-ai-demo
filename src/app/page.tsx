import { ExpandableChatDemo } from "@/components/ExpandableChatDemo";
import UserList from "@/components/UserList";
import UserController from "@/modules/user/UserController";
import UserKanban from "@/components/UserKanban";
import RealTimeDemo from "@/components/RealTimeDemo";
import TaskController from "@/modules/task/TaskController";
import { TaskModelType, UserModelType } from "../../prisma/generated/schemas";
export const runtime = "nodejs";

export const revalidate = 0;

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
