import { Injectable } from '@nestjs/common';
import { IAiService } from '../interfaces';

@Injectable()
export class AiService implements IAiService {
  async enhanceDescription(prompt: string): Promise<string> {
    return prompt;
  }
}
