import { JSONLinesResponse, VovkIteration } from "vovk";
import type DatabasePollController from "./DatabasePollController";
import DatabaseEventsService, { DBChange } from "./DatabaseEventsService";
import DatabaseService from "./DatabaseService";
import { forEach, groupBy } from "lodash";

export default class PollService {
  static poll(
    resp: JSONLinesResponse<VovkIteration<typeof DatabasePollController.poll>>,
  ) {
    setTimeout(resp.close, 30_000);

    let asOldAs = new Date();
    DatabaseEventsService.emitter.on(
      DatabaseEventsService.DB_KEY,
      (changes) => {
        const deleted = changes.filter((change) => change.type === "delete");
        const createdOrUpdated = changes.filter(
          (change) => change.type === "create" || change.type === "update",
        );

        for (const deletedEntity of deleted) {
          resp.send({
            id: deletedEntity.id,
            entityType: deletedEntity.entityType,
            __isDeleted: true,
          });
        }
        // group by entityType and date, so the date is maximum date for the given entity: { entityType: string, date: string }[]
        forEach(groupBy(createdOrUpdated, "entityType"), (changes) => {
          const maxDateItem = changes.reduce(
            (max, change) => {
              const changeDate = new Date(change.date);
              return changeDate.getTime() > new Date(max.date).getTime()
                ? change
                : max;
            },
            { date: new Date(0) } as unknown as DBChange,
          );

          if (new Date(maxDateItem.date).getTime() > asOldAs.getTime()) {
            void DatabaseService.prisma[maxDateItem.entityType as "user"]
              .findMany({
                where: {
                  updatedAt: {
                    gt: asOldAs,
                  },
                },
              })
              .then((entities) => {
                for (const entity of entities) {
                  resp.send(entity);
                }
              });
            asOldAs = new Date(maxDateItem.date);
          }
        });
      },
    );
  }
}
