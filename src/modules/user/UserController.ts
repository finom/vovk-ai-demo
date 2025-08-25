import { prefix, get, put, post, del, openapi } from "vovk";
import { withZod } from "vovk-zod/v3";
import UserService from "./UserService";
import { UserModel } from "@/zod";
import { z } from "zod/v3";
import { BASE_FIELDS } from "@/constants";

@prefix("users")
export default class UserController {
  @openapi({
    summary: "Get all users",
    description: "Retrieves a list of all users.",
    "x-tool-successMessage": "Users retrieved successfully",
  })
  @get()
  static getUsers = withZod({ handle: UserService.getUsers });

  @openapi({
    summary: "Find users by ID, full name, or email",
    description:
      "Retrieves users that match the provided ID, full name, or email. Used to search the users when they need to be updated or deleted.",
    "x-tool-successMessage": "Users found successfully",
  })
  @get("find")
  static findUsers = withZod({
    query: z.object({ search: z.string() }),
    handle: ({ vovk }) => UserService.findUsers(vovk.query().search),
  });

  @openapi({
    summary: "Create user",
    description: "Creates a new user with the provided details.",
    "x-tool-successMessage": "User created successfully",
  })
  @post()
  static createUser = withZod({
    body: UserModel.omit(BASE_FIELDS),
    handle: async ({ vovk }) => UserService.createUser(await vovk.body()),
  });

  @openapi({
    summary: "Update user",
    description:
      "Updates an existing user with the provided details, such as their email or name.",
    "x-tool-successMessage": "User updated successfully",
  })
  @put("{id}")
  static updateUser = withZod({
    body: UserModel.omit(BASE_FIELDS),
    params: UserModel.pick({ id: true }),
    handle: async ({ vovk }) =>
      UserService.updateUser(vovk.params().id, await vovk.body()),
  });

  @openapi({
    summary: "Delete user",
    description: "Deletes a user by ID.",
    "x-tool-successMessage": "User deleted successfully",
  })
  @del("{id}")
  static deleteUser = withZod({
    params: UserModel.pick({ id: true }),
    handle: async ({ vovk }) => UserService.deleteUser(vovk.params().id),
  });
}
