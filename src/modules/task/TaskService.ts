import type { VovkBody, VovkParams } from "vovk";
import type TaskController from "./TaskController";
import PrismaService from "../prisma/PrismaService";

export default class TaskService {
  static getTasks = () => PrismaService.client.task.findMany();

  static findTasks = async (search: string) =>
    PrismaService.client.task.findMany({
      where: {
        OR: [
          { id: search }, // exact match (case-sensitive if string)
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      },
    });

  static createTask = (data: VovkBody<typeof TaskController.createTask>) =>
    PrismaService.client.task.create({
      data,
    });

  static updateTask = async (
    id: VovkParams<typeof TaskController.updateTask>["id"],
    data: VovkBody<typeof TaskController.updateTask>,
  ) => {
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate delay
    return PrismaService.client.task.update({
      where: { id },
      data,
    });
  };

  static deleteTask = async (
    id: VovkParams<typeof TaskController.deleteTask>["id"],
  ) => {
    const d = Object.assign(
      await PrismaService.client.task.delete({ where: { id } }),
      { __isDeleted: true },
    );
    console.log(d);
    return d;
  };
}
