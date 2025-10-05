import { CreateMessageDto } from "../../dtos/create-message.dto.ts";
import { Messages } from "../../models/messages.ts";
import { MessageRepository } from "../../repositories/message/message.repository.ts";
import { Result } from "../../utils/patterns/result.pattern.ts";

export interface CreateMessageUseCase{
  execute( dto: CreateMessageDto ): Promise<Result<Messages, Error>>
}

export class CreateMessage implements CreateMessageUseCase{
  
  constructor(
    private readonly repository: MessageRepository
  ){}

  execute(dto: CreateMessageDto): Promise<Result<Messages, Error>> {
    return this.repository.addMessageOfUser(dto);
  }
}