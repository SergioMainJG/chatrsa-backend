import { CreateMessageDto } from "../../dtos/create-message.dto.ts";
import { Messages } from "../../models/messages.ts";
import { MessageRepository } from "../../repositories/message/message.repository.ts";
import { CustomError } from "../../utils/errors/custom-error.ts";
import { Result } from "../../utils/patterns/result.pattern.ts";

export interface CreateMessageUseCase {
  execute(dto: CreateMessageDto): Promise<Result<Messages, Error>>
}

export class CreateMessage implements CreateMessageUseCase {

  constructor(
    private readonly repositories: MessageRepository[]
  ) { }

  private async addMessageOfUserIntoRepositories(
    { senderUserId, receiverUserId, content }: { senderUserId: number; receiverUserId: number; content: string }
  ): Promise<Result<Messages, Error>[]> {
    const promiseQueries = this.repositories.map((repository) => repository.addMessageOfUser({ senderUserId, receiverUserId, content }));
    return await Promise.all(promiseQueries);
  }

  async execute(createMessageDto: CreateMessageDto): Promise<Result<Messages, Error>> {
    const resultsQueries = await this.addMessageOfUserIntoRepositories(createMessageDto);
    const anySuccess = resultsQueries.find(result => result.isSuccess);
    if (anySuccess && anySuccess.value)
      return Result.Success<Messages, Error>(anySuccess.value);
    const error = resultsQueries.find(result => !result.isSuccess)?.error;
    return Result.Failure<Messages, Error>(
      error ||
      CustomError.internalServer(`The message wasn't save correctly, contact the server to check the DB's status`)
    );
  }
}