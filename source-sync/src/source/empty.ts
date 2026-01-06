import {
  GroupForSource,
  UpdateGroupReponse,
  ItemForSource,
  UpdateItemResponse,
  Source,
} from "./interface";
import { GroupData, ItemData } from "./queue";

export class EmptySource implements Source {
  getDelay(): number {
    return 0;
  }

  async updateGroup(
    jobData: GroupData,
    group: GroupForSource,
  ): Promise<UpdateGroupReponse> {
    throw new Error("Not implemented");
  }

  async updateItem(
    jobData: ItemData,
    group: GroupForSource,
  ): Promise<UpdateItemResponse> {
    throw new Error("Not implemented");
  }
}
