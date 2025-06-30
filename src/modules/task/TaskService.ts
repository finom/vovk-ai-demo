import type { VovkBody, VovkParams } from "vovk";
import type TaskController from "./TaskController";
import DatabaseService from "../database/DatabaseService";

export default class TaskService {
  static getTasks = () => DatabaseService.client.task.findMany();

  static findTasks = async (search: string) =>
    DatabaseService.client.task.findMany({
      where: {
        OR: [
          { id: search }, // exact match (case-sensitive if string)
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      },
    });

  static createTask = (data: VovkBody<typeof TaskController.createTask>) =>
    DatabaseService.client.task.create({
      data,
    });

  static updateTask = async (
    id: VovkParams<typeof TaskController.updateTask>["id"],
    data: VovkBody<typeof TaskController.updateTask>,
  ) => {
    return DatabaseService.client.task.update({
      where: { id },
      data,
    });
  };

  static deleteTask = async (
    id: VovkParams<typeof TaskController.deleteTask>["id"],
  ) => {
    const d = Object.assign(
      await DatabaseService.client.task.delete({ where: { id } }),
      { __isDeleted: true },
    );
    console.log(d);
    return d;
  };
}
