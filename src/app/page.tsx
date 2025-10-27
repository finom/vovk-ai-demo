import { ExpandableChatDemo } from "@/components/ExpandableChatDemo";
import UserList from "@/components/UserList";
import UserController from "@/modules/user/UserController";
import UserKanban from "@/components/UserKanban";
import RealTimeDemo from "@/components/RealTimeDemo";
import TaskController from "@/modules/task/TaskController";
import { UserType } from "../../prisma/generated/schemas/models/User.schema";
import { TaskType } from "../../prisma/generated/schemas/models/Task.schema";
import { verifySession } from "@/lib/dal";

export const runtime = "nodejs";

export const revalidate = 0;

export default async function Home() {
  await verifySession();
  const [usersInitialData, tasksInitialData] = await Promise.all([
    UserController.getUsers.fn<UserType[]>(),
    TaskController.getTasks.fn<TaskType[]>(),
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
