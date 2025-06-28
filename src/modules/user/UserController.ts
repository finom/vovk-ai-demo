import { prefix, get, put, post, del, openapi } from "vovk";
import { withZod } from "vovk-zod/v3";
import UserService from "./UserService";
import { UserModel } from "@/zod";
import { z } from "zod/v3";
import { BASE_FIELDS } from "@/constants";
import mcp from "@/decorators/mcp";

@prefix("users")
export default class UserController {
  @openapi({
    summary: "Get all users",
    description: "Retrieves a list of all users.",
  })
  @get()
  @mcp({
    successMessage: "Users retrieved successfully",
  })
  static getUsers = withZod({ handle: UserService.getUsers });

  @openapi({
    summary: "Find users by ID, full name, or email",
    description:
      "Retrieves users that match the provided ID, full name, or email. Used to search the users when they need to be updated or deleted.",
  })
  @get("find")
  @mcp({
    successMessage: "Users found successfully",
  })
  static findUsers = withZod({
    query: z.object({ search: z.string() }),
    handle: (req) => UserService.findUsers(req.vovk.query().search),
  });

  @openapi({
    summary: "Create user",
    description: "Creates a new user with the provided details.",
  })
  @post()
  @mcp({
    successMessage: "User created successfully",
  })
  static createUser = withZod({
    body: UserModel.omit(BASE_FIELDS),
    handle: async (req) => (console.log(req.vovk.meta()), UserService.createUser(await req.vovk.body())),
  });

  @openapi({
    summary: "Update user",
    description:
      "Updates an existing user with the provided details, such as their email or name.",
  })
  @put("{id}")
  @mcp({
    successMessage: "User updated successfully",
  })
  static updateUser = withZod({
    body: UserModel.omit(BASE_FIELDS),
    params: UserModel.pick({ id: true }),
    handle: async (req) =>
      UserService.updateUser(req.vovk.params().id, await req.vovk.body()),
  });

  @openapi({
    summary: "Delete user",
    description: "Deletes a user by ID.",
  })
  @del("{id}")
  @mcp({
    successMessage: "User deleted successfully",
  })
  static deleteUser = withZod({
    params: UserModel.pick({ id: true }),
    handle: (req) => UserService.deleteUser(req.vovk.params().id),
  });
}
