import { prefix, get, put, post, del, openapi } from "vovk";
import { withZod } from "vovk-zod/v3";
import TaskService from "./TaskService";
import { TaskModel } from "@/zod";
import { z } from "zod/v3";
import { BASE_FIELDS } from "@/constants";
import mcp from "@/decorators/mcp";

@prefix("tasks")
export default class TaskController {
  @openapi({
    summary: "Get all tasks",
    description: "Retrieves a list of all tasks.",
  })
  @get()
  @mcp({
    successMessage: "Tasks retrieved successfully",
  })
  static getTasks = withZod({ handle: TaskService.getTasks });

  @openapi({
    summary: "Find tasks by ID, title or description",
    description:
      "Retrieves tasks that match the provided ID, title, or description. Used to search the tasks when they need to be updated or deleted.",
  })
  @get("find")
  @mcp({
    successMessage: "Tasks found successfully",
  })
  static findTasks = withZod({
    query: z.object({ search: z.string() }),
    handle: async (req) => TaskService.findTasks(req.vovk.query().search),
  });
  @openapi({
    summary: "Create task",
    description: "Creates a new task with the provided details.",
  })
  @post()
  @mcp({
    successMessage: "Task created successfully",
  })
  static createTask = withZod({
    body: TaskModel.omit(BASE_FIELDS),
    handle: async (req) => TaskService.createTask(await req.vovk.body()),
  });
  @openapi({
    summary: "Update task",
    description:
      "Updates an existing task with the provided details, such as its title or description.",
  })
  @put("{id}")
  @mcp({
    successMessage: "Task updated successfully",
  })
  static updateTask = withZod({
    body: TaskModel.omit(BASE_FIELDS).partial(),
    params: TaskModel.pick({ id: true }),
    handle: async (req) =>
      TaskService.updateTask(req.vovk.params().id, await req.vovk.body()),
  });
  @openapi({
    summary: "Delete task",
    description: "Deletes a task by ID.",
  })
  @del("{id}")
  @mcp({
    successMessage: "Task deleted successfully",
  })
  static deleteTask = withZod({
    params: TaskModel.pick({ id: true }),
    handle: (req) => TaskService.deleteTask(req.vovk.params().id),
  });
}
