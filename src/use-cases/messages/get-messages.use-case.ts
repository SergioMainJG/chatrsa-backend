import { GetMessageDto } from "../../dtos/get-message.dto.ts";
import { Messages } from "../../models/messages.ts";
import { MessageRepository } from "../../repositories/message/message.repository.ts";
import { Result } from "../../utils/patterns/result.pattern.ts";

export interface GetMessageUseCase {
  execute(dto: GetMessageDto): Promise<Result<Messages[], Error>>
}

export class GetMessage implements GetMessageUseCase {

  constructor(
    private readonly repositories: MessageRepository[]
  ) { }

  private async getMessagesOfUserFromRepositories(
    { userId }: { userId: number }
  ): Promise<Result<Messages[], Error>[]> {
    const promiseQueries = this.repositories.map(
      (repository) => repository.getMessagesByUserId({ userId })
    );
    return await Promise.all(promiseQueries);
  }

  async execute(getMessageDto: GetMessageDto): Promise<Result<Messages[], Error>> {
    const resultQueries = (await this.getMessagesOfUserFromRepositories(getMessageDto));
    const largestArray = resultQueries
      .filter(result => result.isSuccess && result.value)
      .map(result => result.value!)
      .reduce((largestSoFar, currentArray) => {
        return currentArray.length > largestSoFar.length ? currentArray : largestSoFar;
      }, []);
    return Result.Success<Messages[], Error>(largestArray);
  }
}