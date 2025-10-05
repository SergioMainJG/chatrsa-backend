import { GetMessageDto } from "../../dtos/get-message.dto.ts";
import { Messages } from "../../models/messages.ts";
import { MessageRepository } from "../../repositories/message.repository.ts";
import { Result } from "../../utils/patterns/result.pattern.ts";

export interface GetMessageUseCase{
  execute( dto: GetMessageDto ): Promise<Result<Messages[], Error>>
}

export class GetMessage implements GetMessageUseCase{
  
  constructor(
    private readonly repository: MessageRepository
  ){}

  execute(dto: GetMessageDto): Promise<Result<Messages[], Error>> {
    return this.repository.getMessagesByUserId(dto);
  }
}