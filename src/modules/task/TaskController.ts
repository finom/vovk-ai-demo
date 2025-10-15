import { prefix, get, put, post, del, operation } from "vovk";
import TaskService from "./TaskService";
import { z } from "zod";
import { BASE_FIELDS } from "@/constants";
import { TaskSchema, UserSchema } from "../../../prisma/generated/schemas";
import { withZod } from "@/lib/withZod";

@prefix("tasks")
export default class TaskController {
  @operation({
    summary: "Get all tasks",
    description: "Retrieves a list of all tasks.",
    "x-tool-disable": true, // Make it to be used as an endpoint only, excluding from the list of available tools
  })
  @get()
  static getTasks = withZod({ handle: TaskService.getTasks });

  @operation({
    summary: "Find tasks by ID, title or description",
    description:
      "Retrieves tasks that match the provided ID, title, or description. Used to search the tasks when they need to be updated or deleted.",
    "x-tool-successMessage": "Tasks found successfully",
  })
  @get("search")
  static findTasks = withZod({
    query: z.object({ search: z.string() }),
    handle: async ({ vovk }) => TaskService.findTasks(vovk.query().search),
  });

  @operation({
    summary: "Get tasks assigned to a specific user",
    description: "Retrieves all tasks associated with a specific user ID.",
    "x-tool-successMessage": "Tasks retrieved successfully",
  })
  @get("by-user/{userId}")
  static getTasksByUserId = withZod({
    params: z.object({ userId: UserSchema.shape.id }),
    handle: async ({ vovk }) =>
      TaskService.getTasksByUserId(vovk.params().userId),
  });

  @post()
  static createTask = withZod({
    body: TaskSchema.omit(BASE_FIELDS),
    handle: async ({ vovk }) => TaskService.createTask(await vovk.body()),
  });
  @operation({
    summary: "Update task",
    description:
      "Updates an existing task with the provided details, such as its title or description.",
    "x-tool-successMessage": "Task updated successfully",
  })
  @put("{id}")
  static updateTask = withZod({
    body: TaskSchema.omit(BASE_FIELDS).partial(),
    params: TaskSchema.pick({ id: true }),
    handle: async ({ vovk }) =>
      TaskService.updateTask(vovk.params().id, await vovk.body()),
  });
  @operation({
    summary: "Delete task",
    description: "Deletes a task by ID.",
    "x-tool-successMessage": "Task deleted successfully",
  })
  @del("{id}")
  static deleteTask = withZod({
    params: TaskSchema.pick({ id: true }),
    handle: async ({ vovk }) => TaskService.deleteTask(vovk.params().id),
  });
}
