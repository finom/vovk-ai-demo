import type { VovkBody, VovkParams } from "vovk";
import type TaskController from "./TaskController";
import DatabaseService from "../database/DatabaseService";
import EmbeddingService from "../embedding/EmbeddingService";
import { TaskType } from "../../../prisma/generated/schemas/models/Task.schema";
import { EntityType } from "@prisma/client";

export default class TaskService {
  static getTasks = () => DatabaseService.prisma.task.findMany();

  static findTasks = (search: string) =>
    EmbeddingService.searchBySemantic<TaskType>(EntityType.task, search);
  /* DatabaseService.prisma.task.findMany({
      where: {
        OR: [
          { id: search },
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      },
    }); */

  static createTask = async (
    data: VovkBody<typeof TaskController.createTask>,
  ) => {
    const task = await DatabaseService.prisma.task.create({ data });

    await EmbeddingService.generateEntityEmbedding(
      task.entityType,
      task.id as TaskType["id"],
    );

    return task;
  };

  static updateTask = async (
    id: VovkParams<typeof TaskController.updateTask>["id"],
    data: VovkBody<typeof TaskController.updateTask>,
  ) => {
    const task = await DatabaseService.prisma.task.update({
      where: { id },
      data,
    });

    await EmbeddingService.generateEntityEmbedding(task.entityType, id);

    return task;
  };

  static deleteTask = (
    id: VovkParams<typeof TaskController.deleteTask>["id"],
  ) =>
    DatabaseService.prisma.task.delete({
      where: { id },
      select: { id: true, entityType: true },
    });
}
