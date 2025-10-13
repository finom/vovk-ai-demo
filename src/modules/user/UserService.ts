import type { VovkBody, VovkParams } from "vovk";
import type UserController from "./UserController";
import DatabaseService from "../database/DatabaseService";
import EmbeddingService from "../embedding/EmbeddingService";
import { UserType } from "../../../prisma/generated/schemas/models/User.schema";
import { EntityType } from "@prisma/client";

export default class UserService {
  static getUsers = () => DatabaseService.prisma.user.findMany();

  static findUsers = (search: string) =>
    EmbeddingService.searchBySemantic<UserType>(EntityType.user, search);
  /* DatabaseService.prisma.user.findMany({
      where: {
        OR: [
          { id: search },
          { fullName: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      },
    }); */

  static createUser = async (
    data: VovkBody<typeof UserController.createUser>,
  ) => {
    const user = await DatabaseService.prisma.user.create({
      data: {
        ...data,
        imageUrl: `https://i.pravatar.cc/300?u=${data.email}`,
      },
    });

    await EmbeddingService.generateEntityEmbedding(
      user.entityType,
      user.id as UserType["id"],
    );
    return user;
  };

  static updateUser = async (
    id: VovkParams<typeof UserController.updateUser>["id"],
    data: VovkBody<typeof UserController.updateUser>,
  ) => {
    const user = await DatabaseService.prisma.user.update({
      where: { id },
      data,
    });

    await EmbeddingService.generateEntityEmbedding(user.entityType, id);

    return user;
  };

  static deleteUser = async (
    id: VovkParams<typeof UserController.updateUser>["id"],
  ) => {
    // even though we have `ON DELETE CASCADE`, we need to delete tasks explicitly to trigger DB events
    const tasksToDelete = await DatabaseService.prisma.task.findMany({
      where: { userId: id },
    });
    for (const task of tasksToDelete) {
      await DatabaseService.prisma.task.delete({ where: { id: task.id } });
    }
    return DatabaseService.prisma.user.delete({ where: { id } });
  };
}
