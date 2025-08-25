import { prefix, get, put, post, del, openapi } from "vovk";
import { withZod } from "vovk-zod/v3";
import TaskService from "./TaskService";
import { TaskModel } from "@/zod";
import { z } from "zod/v3";
import { BASE_FIELDS } from "@/constants";

@prefix("tasks")
export default class TaskController {
  @openapi({
    summary: "Get all tasks",
    description: "Retrieves a list of all tasks.",
    "x-tool-successMessage": "Tasks retrieved successfully",
  })
  @get()
  static getTasks = withZod({ handle: TaskService.getTasks });

  @openapi({
    summary: "Find tasks by ID, title or description",
    description:
      "Retrieves tasks that match the provided ID, title, or description. Used to search the tasks when they need to be updated or deleted.",
    "x-tool-successMessage": "Tasks found successfully",
  })
  @get("find")
  static findTasks = withZod({
    query: z.object({ search: z.string() }),
    handle: async ({ vovk }) => TaskService.findTasks(vovk.query().search),
  });
  @openapi({
    summary: "Create task",
    description: "Creates a new task with the provided details.",
    "x-tool-successMessage": "Task created successfully",
  })
  @post()
  static createTask = withZod({
    body: TaskModel.omit(BASE_FIELDS),
    handle: async ({ vovk }) => TaskService.createTask(await vovk.body()),
  });
  @openapi({
    summary: "Update task",
    description:
      "Updates an existing task with the provided details, such as its title or description.",
    "x-tool-successMessage": "Task updated successfully",
  })
  @put("{id}")
  static updateTask = withZod({
    body: TaskModel.omit(BASE_FIELDS).partial(),
    params: TaskModel.pick({ id: true }),
    handle: async ({ vovk }) =>
      TaskService.updateTask(vovk.params().id, await vovk.body()),
  });
  @openapi({
    summary: "Delete task",
    description: "Deletes a task by ID.",
    "x-tool-successMessage": "Task deleted successfully",
  })
  @del("{id}")
  static deleteTask = withZod({
    params: TaskModel.pick({ id: true }),
    handle: async ({ vovk }) => TaskService.deleteTask(vovk.params().id),
  });
}
