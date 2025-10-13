import type { VovkBody, VovkParams } from "vovk";
import type TaskController from "./TaskController";
import DatabaseService from "../database/DatabaseService";

export default class TaskService {
  static getTasks = () => DatabaseService.prisma.task.findMany();

  static findTasks = (search: string) =>
    DatabaseService.prisma.task.findMany({
      where: {
        OR: [
          { id: search },
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      },
    });

  static createTask = (data: VovkBody<typeof TaskController.createTask>) =>
    DatabaseService.prisma.task.create({
      data,
    });

  static updateTask = (
    id: VovkParams<typeof TaskController.updateTask>["id"],
    data: VovkBody<typeof TaskController.updateTask>,
  ) =>
    DatabaseService.prisma.task.update({
      where: { id },
      data,
    });

  static deleteTask = (
    id: VovkParams<typeof TaskController.deleteTask>["id"],
  ) => DatabaseService.prisma.task.delete({ where: { id } });
}
